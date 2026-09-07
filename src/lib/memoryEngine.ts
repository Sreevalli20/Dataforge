/**
 * Memory Simulation Engine: Fast Weights Plasticity vs. KV-Cache Baseline
 */

import {
  ExperimentConfig,
  ReadoutResult,
  TokenAssociation,
  CurvePoint,
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

export interface SimulationOutput {
  associations: TokenAssociation[];
  weightMatrix: Float64Array; // d x d
  frobenius: number;
  readout: ReadoutResult;
  fidelityCurve: CurvePoint[];
  matrixSnapshots: Float64Array[]; // Intermediate matrices for replay
  timeline: {
    tokenIndex: number;
    matrixState: Float64Array;
    retrievalResult: Float64Array;
    error: number;
    cosineSimilarity: number;
  }[];
}

export function runExperiment(config: ExperimentConfig): SimulationOutput {
  const {
    dimension: d,
    sequenceLength: N,
    correlationAngleDeg,
    algorithm,
    decay: lambda,
    learningRate: eta,
    probeIndex,
    seed,
  } = config;

  const rand = createLCG(seed);

  // 1. Generate basis sets for keys and values
  // We need at least max(N, 2) orthogonal vectors
  const basisCount = Math.max(N, 4);
  const keyBasis = generateOrthonormalBasis(d, Math.min(basisCount, d), rand);
  const valueBasis = generateOrthonormalBasis(d, Math.min(basisCount, d), rand);

  // Synthesize token associations
  const associations: TokenAssociation[] = [];

  for (let t = 0; t < N; t++) {
    let keyVec: Float64Array;
    let valVec: Float64Array;

    if (t === 0) {
      keyVec = keyBasis[0] || generateRandomUnitVector(d, rand);
      valVec = valueBasis[0] || generateRandomUnitVector(d, rand);
    } else if (t === 1) {
      // Key 2 is explicitly controlled by correlationAngleDeg relative to Key 1
      const u1 = keyBasis[0];
      const u2 = keyBasis[1] || generateRandomUnitVector(d, rand);
      keyVec = generateKeyWithAngle(u1, u2, correlationAngleDeg);
      valVec = valueBasis[1] || generateRandomUnitVector(d, rand);
    } else {
      // Subsequent keys: sample or use orthogonal basis if available
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

  // 2. Sequential Fast Weights Updates
  let M = createMatrix(d, d);
  const matrixSnapshots: Float64Array[] = [];
  const timeline: {
    tokenIndex: number;
    matrixState: Float64Array;
    retrievalResult: Float64Array;
    error: number;
    cosineSimilarity: number;
  }[] = [];

  for (let t = 0; t < N; t++) {
    const { keyVector: k_t, valueVector: v_t } = associations[t];

    // Decay prior state: M = lambda * M
    if (lambda < 1.0) {
      for (let i = 0; i < M.length; i++) {
        M[i] *= lambda;
      }
    }

    if (algorithm === 'hebbian') {
      // Pure outer product update: Delta M = eta * (v * k^T)
      const deltaM = outerProduct(v_t, k_t);
      for (let i = 0; i < M.length; i++) {
        M[i] += eta * deltaM[i];
      }
    } else if (algorithm === 'delta') {
      // Error-correcting Delta Rule:
      // prior prediction: v_hat = M * k
      const v_hat = matVecMul(M, k_t, d, d);
      // error: e = v - v_hat
      const errorVec = createVector(d);
      for (let j = 0; j < d; j++) {
        errorVec[j] = v_t[j] - v_hat[j];
      }
      // Delta M = eta * (e * k^T)
      const deltaM = outerProduct(errorVec, k_t);
      for (let i = 0; i < M.length; i++) {
        M[i] += eta * deltaM[i];
      }
    } else if (algorithm === 'bdh_sparse') {
      // BDH Sparse Dale Rule:
      // Non-negative rectified activations
      const k_rect = new Float64Array(d);
      const v_rect = new Float64Array(d);
      for (let j = 0; j < d; j++) {
        k_rect[j] = Math.max(0, k_t[j]);
        v_rect[j] = Math.max(0, v_t[j]);
      }
      const v_hat = matVecMul(M, k_rect, d, d);
      const errorVec = createVector(d);
      for (let j = 0; j < d; j++) {
        errorVec[j] = v_rect[j] - Math.max(0, v_hat[j]);
      }
      const deltaM = outerProduct(errorVec, k_rect);
      for (let i = 0; i < M.length; i++) {
        M[i] = Math.max(0, M[i] + eta * deltaM[i]); // Dale's non-negative clamp
      }
    }

    // Capture snapshot after each update
    const snapshot = new Float64Array(M.length);
    for (let i = 0; i < M.length; i++) {
      snapshot[i] = M[i];
    }
    matrixSnapshots.push(snapshot);

    // Capture timeline entry for current token
    const retrieval = normalize(matVecMul(M, k_t, d, d));
    const error = l2Distance(v_t, retrieval);
    const cosSim = cosineSimilarity(v_t, retrieval);
    timeline.push({
      tokenIndex: t,
      matrixState: snapshot,
      retrievalResult: retrieval,
      error,
      cosineSimilarity: cosSim,
    });
  }

  // 3. Probing the Memory System
  const safeProbeIndex = Math.min(Math.max(0, probeIndex), N - 1);
  const targetToken = associations[safeProbeIndex];
  const query = targetToken.keyVector;
  const groundTruth = targetToken.valueVector;

  // Fast Weights Readout: v_hat = M * q
  const rawFW = matVecMul(M, query, d, d);
  const fastWeightEstimate = normalize(rawFW);

  // KV-Cache Readout: Multi-Head Scaled Dot-Product Attention
  const scores = new Float64Array(N);
  const invSqrtD = 1.0 / Math.sqrt(d);
  for (let t = 0; t < N; t++) {
    scores[t] = dot(query, associations[t].keyVector) * invSqrtD;
  }
  // Softmax weights
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

  // Metrics
  const l2Error = l2Distance(groundTruth, fastWeightEstimate);
  const cosineSim = cosineSimilarity(groundTruth, fastWeightEstimate);
  const kvCosineSim = cosineSimilarity(groundTruth, kvCacheEstimate);
  const kvL2Err = l2Distance(groundTruth, kvCacheEstimate);

  // Nearest-neighbor classification match test
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

  // Memory calculation (bytes)
  // Fast weights: d * d * 8 bytes (Float64Array = 8 bytes per element)
  const fastWeightBytes = d * d * 8;
  // KV cache: 2 buffers * N tokens * d floats * 8 bytes (Float64Array)
  const kvCacheBytes = 2 * N * d * 8;

  // Crosstalk residual norm (unintended components)
  const crosstalkVec = createVector(d);
  for (let j = 0; j < d; j++) {
    crosstalkVec[j] = fastWeightEstimate[j] - groundTruth[j];
  }
  const crosstalkResidualNorm = l2Distance(groundTruth, fastWeightEstimate);

  const readout: ReadoutResult = {
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

  // 4. Generate Fidelity Curve over Angle theta in [0, 90]
  const fidelityCurve: CurvePoint[] = [];
  const u1 = keyBasis[0] || generateRandomUnitVector(d, rand);
  const u2 = keyBasis[1] || generateRandomUnitVector(d, rand);
  const v1 = valueBasis[0] || generateRandomUnitVector(d, rand);
  const v2 = valueBasis[1] || generateRandomUnitVector(d, rand);

  for (let deg = 0; deg <= 90; deg += 5) {
    const k2_test = generateKeyWithAngle(u1, u2, deg);
    // Matrix with 2 tokens: M = v1*u1^T + v2*k2^T
    const M_test = createMatrix(d, d);
    const op1 = outerProduct(v1, u1);
    const op2 = outerProduct(v2, k2_test);
    for (let i = 0; i < M_test.length; i++) {
      M_test[i] = op1[i] + op2[i];
    }
    const read = normalize(matVecMul(M_test, u1, d, d));
    const simFW = cosineSimilarity(v1, read);

    // Theory for Hebbian: cos(theta) crosstalk gives sim = 1 / sqrt(1 + cos^2(theta))
    const rad = (deg * Math.PI) / 180;
    const cosT = Math.cos(rad);
    const theoryCos = 1.0 / Math.sqrt(1.0 + cosT * cosT);

    // KV Cache baseline attention readout
    const s1 = (1.0) * invSqrtD;
    const s2 = (cosT) * invSqrtD;
    const w1 = Math.exp(s1) / (Math.exp(s1) + Math.exp(s2));
    const w2 = Math.exp(s2) / (Math.exp(s1) + Math.exp(s2));
    const kvVec = createVector(d);
    for (let j = 0; j < d; j++) {
      kvVec[j] = w1 * v1[j] + w2 * v2[j];
    }
    const simKV = cosineSimilarity(v1, normalize(kvVec));

    fidelityCurve.push({
      angleDeg: deg,
      theoryCosine: Math.max(0, theoryCos),
      fastWeightCosine: Math.max(0, simFW),
      kvCacheCosine: Math.max(0, simKV),
    });
  }

  return {
    associations,
    weightMatrix: M,
    frobenius: frobeniusNorm(M),
    readout,
    fidelityCurve,
    matrixSnapshots,
    timeline,
  };
}
