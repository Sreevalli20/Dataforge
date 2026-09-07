/**
 * Live Execution Engine for Step-by-Step Experiment Visualization
 * Executes fast-weight updates token-by-token with real computation
 */

import {
  ExperimentConfig,
  ReadoutResult,
  TokenAssociation,
} from '../types';
import {
  createLCG,
  createMatrix,
  createVector,
  dot,
  frobeniusNorm,
  generateKeyWithAngle,
  generateOrthonormalBasis,
  generateRandomUnitVector,
  l2Distance,
  cosineSimilarity,
  matVecMul,
  normalize,
  outerProduct,
  softmax,
} from './linearAlgebra';

export interface LiveState {
  step: number;
  totalSteps: number;
  matrix: Float64Array;
  frobenius: number;
  currentToken: TokenAssociation | null;
  readout: ReadoutResult | null;
  isComplete: boolean;
}

export interface LiveExecutionEngine {
  config: ExperimentConfig;
  associations: TokenAssociation[];
  currentStep: number;
  matrix: Float64Array;
  isPaused: boolean;
  isComplete: boolean;
  speed: number;
  
  // Methods
  stepForward: () => LiveState;
  reset: () => void;
  setSpeed: (speed: number) => void;
  pause: () => void;
  resume: () => void;
  getCurrentState: () => LiveState;
  runToCompletion: (onStep: (state: LiveState) => void) => Promise<void>;
}

export function createLiveExecutionEngine(config: ExperimentConfig): LiveExecutionEngine {
  const {
    dimension: d,
    sequenceLength: N,
    correlationAngleDeg,
    algorithm,
    decay: lambda,
    learningRate: eta,
    seed,
  } = config;

  const rand = createLCG(seed);
  
  // Generate basis sets
  const basisCount = Math.max(N, 4);
  const keyBasis = generateOrthonormalBasis(d, Math.min(basisCount, d), rand);
  const valueBasis = generateOrthonormalBasis(d, Math.min(basisCount, d), rand);

  // Pre-generate all associations
  const associations: TokenAssociation[] = [];
  for (let t = 0; t < N; t++) {
    let keyVec: Float64Array;
    let valVec: Float64Array;

    if (t === 0) {
      keyVec = keyBasis[0] || generateRandomUnitVector(d, rand);
      valVec = valueBasis[0] || generateRandomUnitVector(d, rand);
    } else if (t === 1) {
      const u1 = keyBasis[0];
      const u2 = keyBasis[1] || generateRandomUnitVector(d, rand);
      keyVec = generateKeyWithAngle(u1, u2, correlationAngleDeg);
      valVec = valueBasis[1] || generateRandomUnitVector(d, rand);
    } else {
      if (t < keyBasis.length) {
        keyVec = keyBasis[t];
        valVec = valueBasis[t % valueBasis.length];
      } else {
        keyVec = generateRandomUnitVector(d, rand);
        valVec = generateRandomUnitVector(d, rand);
      }
    }

    associations.push({
      index: t,
      label: `Token #${t + 1}`,
      keyVector: keyVec,
      valueVector: valVec,
      retainedWeight: Math.pow(lambda, N - 1 - t),
    });
  }

  // Initialize matrix
  let matrix = createMatrix(d, d);
  let currentStep = 0;
  let isPaused = false;
  let isComplete = false;
  let speed = 500; // ms per step

  const computeReadout = (currentMatrix: Float64Array, probeIndex: number): ReadoutResult => {
    const safeProbeIndex = Math.min(Math.max(0, probeIndex), N - 1);
    const targetToken = associations[safeProbeIndex];
    const query = targetToken.keyVector;
    const groundTruth = targetToken.valueVector;

    // Fast Weights Readout
    const rawFW = matVecMul(currentMatrix, query, d, d);
    const fastWeightEstimate = normalize(rawFW);

    // KV-Cache Readout
    const scores = new Float64Array(N);
    const invSqrtD = 1.0 / Math.sqrt(d);
    for (let t = 0; t < N; t++) {
      scores[t] = dot(query, associations[t].keyVector) * invSqrtD;
    }
    const attnWeights = softmax(scores);
    const kvRaw = createVector(d);
    for (let t = 0; t < N; t++) {
      const w = attnWeights[t];
      const val = associations[t].valueVector;
      for (let j = 0; j < d; j++) {
        kvRaw[j] += w * val[j];
      }
    }
    const kvCacheEstimate = normalize(kvRaw);

    const l2Error = l2Distance(groundTruth, fastWeightEstimate);
    const cosineSim = cosineSimilarity(groundTruth, fastWeightEstimate);
    const kvCosineSim = cosineSimilarity(groundTruth, kvCacheEstimate);
    const kvL2Err = l2Distance(groundTruth, kvCacheEstimate);

    let bestIdx = -1;
    let maxDot = -Infinity;
    for (let t = 0; t < N; t++) {
      const s = dot(associations[t].valueVector, fastWeightEstimate);
      if (s > maxDot) {
        maxDot = s;
        bestIdx = t;
      }
    }
    const classificationMatch = bestIdx === safeProbeIndex;

    const fastWeightBytes = d * d * 8;
    const kvCacheBytes = 2 * N * d * 8;

    const crosstalkResidualNorm = l2Distance(groundTruth, fastWeightEstimate);

    return {
      groundTruth,
      fastWeightEstimate,
      kvCacheEstimate,
      l2Error,
      cosineSimilarity: cosineSim,
      kvCosineSimilarity: kvCosineSim,
      kvL2Error: kvL2Err,
      classificationMatch,
      fastWeightBytes,
      kvCacheBytes,
      crosstalkResidualNorm,
    };
  };

  const stepForward = (): LiveState => {
    if (currentStep >= N || isComplete) {
      isComplete = true;
      return {
        step: currentStep,
        totalSteps: N,
        matrix,
        frobenius: frobeniusNorm(matrix),
        currentToken: associations[currentStep - 1] || null,
        readout: computeReadout(matrix, Math.max(0, currentStep - 1)),
        isComplete: true,
      };
    }

    const { keyVector: k_t, valueVector: v_t } = associations[currentStep];

    // Decay prior state
    if (lambda < 1.0) {
      for (let i = 0; i < matrix.length; i++) {
        matrix[i] *= lambda;
      }
    }

    // Apply update based on algorithm
    if (algorithm === 'hebbian') {
      const deltaM = outerProduct(v_t, k_t);
      for (let i = 0; i < matrix.length; i++) {
        matrix[i] += eta * deltaM[i];
      }
    } else if (algorithm === 'delta') {
      const v_hat = matVecMul(matrix, k_t, d, d);
      const errorVec = createVector(d);
      for (let j = 0; j < d; j++) {
        errorVec[j] = v_t[j] - v_hat[j];
      }
      const deltaM = outerProduct(errorVec, k_t);
      for (let i = 0; i < matrix.length; i++) {
        matrix[i] += eta * deltaM[i];
      }
    } else if (algorithm === 'bdh_sparse') {
      const k_rect = new Float64Array(d);
      const v_rect = new Float64Array(d);
      for (let j = 0; j < d; j++) {
        k_rect[j] = Math.max(0, k_t[j]);
        v_rect[j] = Math.max(0, v_t[j]);
      }
      const v_hat = matVecMul(matrix, k_rect, d, d);
      const errorVec = createVector(d);
      for (let j = 0; j < d; j++) {
        errorVec[j] = v_rect[j] - Math.max(0, v_hat[j]);
      }
      const deltaM = outerProduct(errorVec, k_rect);
      for (let i = 0; i < matrix.length; i++) {
        matrix[i] = Math.max(0, matrix[i] + eta * deltaM[i]);
      }
    }

    currentStep++;

    const state: LiveState = {
      step: currentStep,
      totalSteps: N,
      matrix: new Float64Array(matrix),
      frobenius: frobeniusNorm(matrix),
      currentToken: associations[currentStep - 1],
      readout: computeReadout(matrix, currentStep - 1),
      isComplete: currentStep >= N,
    };

    if (currentStep >= N) {
      isComplete = true;
    }

    return state;
  };

  const reset = (): void => {
    matrix = createMatrix(d, d);
    currentStep = 0;
    isPaused = false;
    isComplete = false;
  };

  const setSpeed = (newSpeed: number): void => {
    speed = newSpeed;
  };

  const pause = (): void => {
    isPaused = true;
  };

  const resume = (): void => {
    isPaused = false;
  };

  const getCurrentState = (): LiveState => {
    return {
      step: currentStep,
      totalSteps: N,
      matrix: new Float64Array(matrix),
      frobenius: frobeniusNorm(matrix),
      currentToken: associations[Math.max(0, currentStep - 1)] || null,
      readout: currentStep > 0 ? computeReadout(matrix, currentStep - 1) : null,
      isComplete: isComplete || currentStep >= N,
    };
  };

  const runToCompletion = async (onStep: (state: LiveState) => void): Promise<void> => {
    while (!isComplete && !isPaused) {
      const state = stepForward();
      onStep(state);
      
      if (state.isComplete) break;
      
      await new Promise(resolve => setTimeout(resolve, speed));
    }
  };

  return {
    config,
    associations,
    currentStep,
    matrix,
    isPaused,
    isComplete,
    speed,
    stepForward,
    reset,
    setSpeed,
    pause,
    resume,
    getCurrentState,
    runToCompletion,
  };
}
