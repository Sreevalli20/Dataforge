/**
 * Neural Network Engine with Exact Real-Time Backpropagation
 * Pure in-memory TypeScript implementation.
 */

export type ActivationType = 'relu' | 'sigmoid' | 'tanh';

export interface LayerState {
  layerIndex: number;
  inputDim: number;
  outputDim: number;
  weights: Float64Array; // outputDim x inputDim
  biases: Float64Array; // outputDim
  gradWeights: Float64Array; // outputDim x inputDim
  gradBiases: Float64Array; // outputDim
  preActivations: Float64Array; // outputDim (z = W*a_prev + b)
  postActivations: Float64Array; // outputDim (a = f(z))
  deltas: Float64Array; // outputDim (dL/dz)
  gradNorm: number; // Frobenius norm of gradWeights
  weightNorm: number; // Frobenius norm of weights
}

export interface NetworkConfig {
  layerSizes: number[]; // e.g. [2, 8, 8, 8, 1]
  activation: ActivationType;
  learningRate: number;
  weightInitScale: number; // multiplier on standard He/Xavier initialization
}

export interface TrainingSample {
  x: [number, number];
  y: number; // 0 or 1
}

// Activation functions & their analytical derivatives
export function activate(z: number, type: ActivationType): number {
  switch (type) {
    case 'relu':
      return Math.max(0, z);
    case 'sigmoid':
      return 1 / (1 + Math.exp(-Math.max(-50, Math.min(50, z))));
    case 'tanh':
      return Math.tanh(z);
  }
}

export function activateDerivative(z: number, type: ActivationType): number {
  switch (type) {
    case 'relu':
      return z > 0 ? 1 : 0;
    case 'sigmoid': {
      const s = activate(z, 'sigmoid');
      return s * (1 - s);
    }
    case 'tanh': {
      const t = Math.tanh(z);
      return 1 - t * t;
    }
  }
}

export class NeuralNetwork {
  config: NetworkConfig;
  layers: LayerState[] = [];
  inputVector: Float64Array = new Float64Array(2);
  target: number = 0;
  loss: number = 0;

  constructor(config: NetworkConfig) {
    this.config = { ...config };
    this.initLayers();
  }

  public initLayers(): void {
    const { layerSizes, activation, weightInitScale } = this.config;
    this.layers = [];

    for (let l = 1; l < layerSizes.length; l++) {
      const inDim = layerSizes[l - 1];
      const outDim = layerSizes[l];

      // Xavier or He initialization base std
      const baseStd =
        activation === 'relu'
          ? Math.sqrt(2 / inDim) // He init
          : Math.sqrt(1 / inDim); // Xavier init

      const std = baseStd * weightInitScale;

      const weights = new Float64Array(outDim * inDim);
      const biases = new Float64Array(outDim);

      for (let i = 0; i < weights.length; i++) {
        // Box-Muller standard normal
        const u1 = Math.max(1e-15, Math.random());
        const u2 = Math.random();
        const randStd = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        weights[i] = randStd * std;
      }

      this.layers.push({
        layerIndex: l,
        inputDim: inDim,
        outputDim: outDim,
        weights,
        biases,
        gradWeights: new Float64Array(outDim * inDim),
        gradBiases: new Float64Array(outDim),
        preActivations: new Float64Array(outDim),
        postActivations: new Float64Array(outDim),
        deltas: new Float64Array(outDim),
        gradNorm: 0,
        weightNorm: 0,
      });
    }

    this.recomputeWeightNorms();
  }

  public recomputeWeightNorms(): void {
    for (const layer of this.layers) {
      let sumSq = 0;
      for (let i = 0; i < layer.weights.length; i++) {
        sumSq += layer.weights[i] * layer.weights[i];
      }
      layer.weightNorm = Math.sqrt(sumSq);
    }
  }

  /**
   * Forward pass through all layers
   */
  public forward(input: [number, number]): number {
    this.inputVector[0] = input[0];
    this.inputVector[1] = input[1];

    let currentInput = this.inputVector;

    for (let l = 0; l < this.layers.length; l++) {
      const layer = this.layers[l];
      const isOutputLayer = l === this.layers.length - 1;

      for (let i = 0; i < layer.outputDim; i++) {
        let z = layer.biases[i];
        const rowOffset = i * layer.inputDim;
        for (let j = 0; j < layer.inputDim; j++) {
          z += layer.weights[rowOffset + j] * currentInput[j];
        }
        layer.preActivations[i] = z;

        // For binary classification, output layer typically uses sigmoid
        if (isOutputLayer) {
          layer.postActivations[i] = activate(z, 'sigmoid');
        } else {
          layer.postActivations[i] = activate(z, this.config.activation);
        }
      }

      currentInput = layer.postActivations;
    }

    return this.layers[this.layers.length - 1].postActivations[0];
  }

  /**
   * Backward pass (Exact Backpropagation)
   */
  public backward(target: number): void {
    this.target = target;
    const numLayers = this.layers.length;
    if (numLayers === 0) return;

    // 1. Output layer error delta: binary cross entropy + sigmoid output
    // dL/dz = a_out - target
    const outLayer = this.layers[numLayers - 1];
    const outAct = outLayer.postActivations[0];
    // Binary cross-entropy loss: -[y log a + (1-y) log (1-a)]
    const eps = 1e-12;
    const clampedAct = Math.max(eps, Math.min(1 - eps, outAct));
    this.loss = -(target * Math.log(clampedAct) + (1 - target) * Math.log(1 - clampedAct));

    outLayer.deltas[0] = outAct - target;

    // 2. Backpropagate deltas through hidden layers
    for (let l = numLayers - 2; l >= 0; l--) {
      const layer = this.layers[l];
      const nextLayer = this.layers[l + 1];

      for (let i = 0; i < layer.outputDim; i++) {
        let errorSum = 0;
        for (let k = 0; k < nextLayer.outputDim; k++) {
          // nextLayer.weights[k, i]
          const weightIdx = k * nextLayer.inputDim + i;
          errorSum += nextLayer.weights[weightIdx] * nextLayer.deltas[k];
        }
        const deriv = activateDerivative(layer.preActivations[i], this.config.activation);
        layer.deltas[i] = errorSum * deriv;
      }
    }

    // 3. Compute weight and bias gradients dL/dW_ij = delta_i * a_prev_j
    let prevActivations = this.inputVector;

    for (let l = 0; l < numLayers; l++) {
      const layer = this.layers[l];
      let gradSumSq = 0;

      for (let i = 0; i < layer.outputDim; i++) {
        const delta = layer.deltas[i];
        layer.gradBiases[i] = delta;

        const rowOffset = i * layer.inputDim;
        for (let j = 0; j < layer.inputDim; j++) {
          const grad = delta * prevActivations[j];
          const idx = rowOffset + j;
          layer.gradWeights[idx] = grad;
          gradSumSq += grad * grad;
        }
      }

      layer.gradNorm = Math.sqrt(gradSumSq);
      prevActivations = layer.postActivations;
    }
  }

  /**
   * Apply gradient descent step
   */
  public step(): void {
    const lr = this.config.learningRate;
    for (const layer of this.layers) {
      for (let i = 0; i < layer.weights.length; i++) {
        // Gradient clipping to avoid explosive non-finite numbers in failure mode
        const g = Math.max(-100, Math.min(100, layer.gradWeights[i]));
        layer.weights[i] -= lr * g;
      }
      for (let i = 0; i < layer.biases.length; i++) {
        const g = Math.max(-100, Math.min(100, layer.gradBiases[i]));
        layer.biases[i] -= lr * g;
      }
    }
    this.recomputeWeightNorms();
  }

  /**
   * Train one full batch
   */
  public trainBatch(dataset: TrainingSample[]): { avgLoss: number; maxGrad: number; minGrad: number } {
    let totalLoss = 0;
    const numLayers = this.layers.length;

    // Accumulators for batch gradients
    const accGradWeights: Float64Array[] = this.layers.map(
      (l) => new Float64Array(l.gradWeights.length)
    );
    const accGradBiases: Float64Array[] = this.layers.map(
      (l) => new Float64Array(l.gradBiases.length)
    );

    for (const sample of dataset) {
      this.forward(sample.x);
      this.backward(sample.y);
      totalLoss += this.loss;

      for (let l = 0; l < numLayers; l++) {
        const layer = this.layers[l];
        for (let i = 0; i < layer.gradWeights.length; i++) {
          accGradWeights[l][i] += layer.gradWeights[i];
        }
        for (let i = 0; i < layer.gradBiases.length; i++) {
          accGradBiases[l][i] += layer.gradBiases[i];
        }
      }
    }

    const n = Math.max(1, dataset.length);
    let maxGrad = -Infinity;
    let minGrad = Infinity;

    for (let l = 0; l < numLayers; l++) {
      const layer = this.layers[l];
      let gradSumSq = 0;
      for (let i = 0; i < layer.gradWeights.length; i++) {
        const avgG = accGradWeights[l][i] / n;
        layer.gradWeights[i] = avgG;
        gradSumSq += avgG * avgG;
      }
      for (let i = 0; i < layer.gradBiases.length; i++) {
        layer.gradBiases[i] = accGradBiases[l][i] / n;
      }
      layer.gradNorm = Math.sqrt(gradSumSq);
      if (layer.gradNorm > maxGrad) maxGrad = layer.gradNorm;
      if (layer.gradNorm < minGrad) minGrad = layer.gradNorm;
    }

    this.step();

    return {
      avgLoss: totalLoss / n,
      maxGrad,
      minGrad,
    };
  }
}

/**
 * Synthetic 2D Datasets for live neural network training
 */
export function generateDataset(type: 'circles' | 'xor' | 'moons' | 'spiral', count = 120): TrainingSample[] {
  const samples: TrainingSample[] = [];

  for (let i = 0; i < count; i++) {
    if (type === 'circles') {
      const isInner = i < count / 2;
      const r = isInner ? Math.random() * 0.45 : 0.65 + Math.random() * 0.35;
      const theta = Math.random() * 2 * Math.PI;
      samples.push({
        x: [r * Math.cos(theta), r * Math.sin(theta)],
        y: isInner ? 1 : 0,
      });
    } else if (type === 'xor') {
      const x1 = (Math.random() - 0.5) * 1.8;
      const x2 = (Math.random() - 0.5) * 1.8;
      const y = (x1 > 0 && x2 > 0) || (x1 < 0 && x2 < 0) ? 1 : 0;
      samples.push({ x: [x1, x2], y });
    } else if (type === 'moons') {
      const isTop = i < count / 2;
      const theta = Math.random() * Math.PI;
      if (isTop) {
        samples.push({
          x: [Math.cos(theta) - 0.3, Math.sin(theta) - 0.2],
          y: 1,
        });
      } else {
        samples.push({
          x: [1.0 - Math.cos(theta) - 0.3, 0.4 - Math.sin(theta) - 0.2],
          y: 0,
        });
      }
    } else {
      // Spiral
      const isClass1 = i < count / 2;
      const r = (i / (count / 2)) * 0.9;
      const t = 1.75 * (i / (count / 2)) * 2 * Math.PI + (isClass1 ? 0 : Math.PI);
      samples.push({
        x: [r * Math.sin(t) + (Math.random() - 0.5) * 0.08, r * Math.cos(t) + (Math.random() - 0.5) * 0.08],
        y: isClass1 ? 1 : 0,
      });
    }
  }

  return samples;
}
