/**
 * Core Linear Algebra Engine
 * Pure in-memory Float64 vector and matrix routines.
 * 100% deterministic, zero external dependencies.
 */

export function createLCG(seed: number = 42) {
  let state = (seed >>> 0) || 1;
  return function nextFloat(): number {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296; // in [0, 1)
  };
}

export function createVector(d: number): Float64Array {
  return new Float64Array(d);
}

export function createMatrix(rows: number, cols: number): Float64Array {
  return new Float64Array(rows * cols);
}

export function dot(u: Float64Array, v: Float64Array): number {
  let sum = 0;
  for (let i = 0; i < u.length; i++) {
    sum += u[i] * v[i];
  }
  return sum;
}

export function norm(v: Float64Array): number {
  return Math.sqrt(Math.max(0, dot(v, v)));
}

export function normalize(v: Float64Array, eps = 1e-7): Float64Array {
  const n = norm(v);
  const scale = 1 / (n > eps ? n : eps);
  const out = new Float64Array(v.length);
  for (let i = 0; i < v.length; i++) {
    out[i] = v[i] * scale;
  }
  return out;
}

export function l2Distance(u: Float64Array, v: Float64Array): number {
  let sum = 0;
  for (let i = 0; i < u.length; i++) {
    const diff = u[i] - v[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function cosineSimilarity(u: Float64Array, v: Float64Array, eps = 1e-7): number {
  const nu = norm(u);
  const nv = norm(v);
  const denom = (nu > eps ? nu : eps) * (nv > eps ? nv : eps);
  return dot(u, v) / denom;
}

export function outerProduct(u: Float64Array, v: Float64Array): Float64Array {
  const dU = u.length;
  const dV = v.length;
  const out = new Float64Array(dU * dV);
  for (let i = 0; i < dU; i++) {
    const rowOffset = i * dV;
    const ui = u[i];
    for (let j = 0; j < dV; j++) {
      out[rowOffset + j] = ui * v[j];
    }
  }
  return out;
}

export function matVecMul(M: Float64Array, v: Float64Array, rows: number, cols: number): Float64Array {
  const out = new Float64Array(rows);
  for (let i = 0; i < rows; i++) {
    const rowOffset = i * cols;
    let sum = 0;
    for (let j = 0; j < cols; j++) {
      sum += M[rowOffset + j] * v[j];
    }
    out[i] = sum;
  }
  return out;
}

export function frobeniusNorm(M: Float64Array): number {
  let sum = 0;
  for (let i = 0; i < M.length; i++) {
    sum += M[i] * M[i];
  }
  return Math.sqrt(sum);
}

/**
 * Generate standard normal sample using Box-Muller transform
 */
export function sampleGaussian(rand: () => number): number {
  let u1 = rand();
  let u2 = rand();
  while (u1 <= 1e-15) u1 = rand();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Generate a random unit vector on S^(d-1)
 */
export function generateRandomUnitVector(d: number, rand: () => number): Float64Array {
  const v = new Float64Array(d);
  for (let i = 0; i < d; i++) {
    v[i] = sampleGaussian(rand);
  }
  return normalize(v);
}

/**
 * Perform Gram-Schmidt orthogonalization to generate an orthonormal basis of k vectors in R^d
 */
export function generateOrthonormalBasis(d: number, count: number, rand: () => number): Float64Array[] {
  const basis: Float64Array[] = [];
  for (let i = 0; i < count; i++) {
    let v = generateRandomUnitVector(d, rand);
    // Project out previous basis vectors
    for (const b of basis) {
      const proj = dot(v, b);
      for (let j = 0; j < d; j++) {
        v[j] -= proj * b[j];
      }
    }
    v = normalize(v);
    basis.push(v);
  }
  return basis;
}

/**
 * Generate key2 with exact angle theta from key1
 * k1 = u1
 * k2 = cos(theta)*u1 + sin(theta)*u2 (where u1 _|_ u2)
 */
export function generateKeyWithAngle(u1: Float64Array, u2: Float64Array, angleDeg: number): Float64Array {
  const rad = (angleDeg * Math.PI) / 180;
  const cosT = Math.cos(rad);
  const sinT = Math.sin(rad);
  const d = u1.length;
  const k2 = new Float64Array(d);
  for (let i = 0; i < d; i++) {
    k2[i] = cosT * u1[i] + sinT * u2[i];
  }
  return normalize(k2);
}

/**
 * Numerically stable Softmax
 */
export function softmax(scores: Float64Array): Float64Array {
  let maxVal = -Infinity;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] > maxVal) maxVal = scores[i];
  }
  let sum = 0;
  const out = new Float64Array(scores.length);
  for (let i = 0; i < scores.length; i++) {
    const e = Math.exp(scores[i] - maxVal);
    out[i] = e;
    sum += e;
  }
  const invSum = 1 / (sum > 1e-12 ? sum : 1e-12);
  for (let i = 0; i < scores.length; i++) {
    out[i] *= invSum;
  }
  return out;
}
