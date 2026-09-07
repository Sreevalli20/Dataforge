/**
 * Computational Tests for Linear Algebra Engine
 * Tests mathematical invariants and correctness per TEST_SPEC.md
 */

import {
  createLCG,
  createVector,
  createMatrix,
  dot,
  norm,
  normalize,
  l2Distance,
  cosineSimilarity,
  outerProduct,
  matVecMul,
  frobeniusNorm,
  generateRandomUnitVector,
  generateOrthonormalBasis,
  generateKeyWithAngle,
  softmax,
} from './linearAlgebra';

describe('Linear Algebra Engine - Mathematical Invariants', () => {
  describe('TEST-M01: Vector Normalization Invariant', () => {
    it('should produce unit L2 norm for normalized vectors', () => {
      const rand = createLCG(42);
      const v = generateRandomUnitVector(16, rand);
      const n = norm(v);
      
      expect(Math.abs(n - 1.0)).toBeLessThan(1e-7);
    });

    it('should preserve unit norm after explicit normalization', () => {
      const v = createVector(16);
      for (let i = 0; i < 16; i++) v[i] = Math.random() * 10 - 5;
      
      const normalized = normalize(v);
      const n = norm(normalized);
      
      expect(Math.abs(n - 1.0)).toBeLessThan(1e-7);
    });
  });

  describe('TEST-M02: Controlled Key Orthogonality & Dot Product Invariant', () => {
    it('should generate key2 with exact dot product cos(theta) relative to key1', () => {
      const rand = createLCG(42);
      const basis = generateOrthonormalBasis(16, 2, rand);
      const u1 = basis[0];
      const u2 = basis[1];
      
      // Test multiple angles
      const angles = [0, 30, 45, 60, 90];
      for (const angleDeg of angles) {
        const k2 = generateKeyWithAngle(u1, u2, angleDeg);
        const actualDot = dot(u1, k2);
        const expectedDot = Math.cos((angleDeg * Math.PI) / 180);
        
        expect(Math.abs(actualDot - expectedDot)).toBeLessThan(1e-7);
      }
    });

    it('should maintain orthogonality at 90 degrees', () => {
      const rand = createLCG(42);
      const basis = generateOrthonormalBasis(16, 2, rand);
      const k2 = generateKeyWithAngle(basis[0], basis[1], 90);
      
      expect(Math.abs(dot(basis[0], k2))).toBeLessThan(1e-7);
    });

    it('should produce collinear vectors at 0 degrees', () => {
      const rand = createLCG(42);
      const basis = generateOrthonormalBasis(16, 2, rand);
      const k2 = generateKeyWithAngle(basis[0], basis[1], 0);
      
      expect(Math.abs(dot(basis[0], k2) - 1.0)).toBeLessThan(1e-7);
    });
  });

  describe('TEST-M03: Fast Weight Dimensional Invariance', () => {
    it('should maintain d x d dimensions regardless of sequence length', () => {
      for (const d of [8, 16, 32]) {
        const M = createMatrix(d, d);
        expect(M.length).toBe(d * d);
        expect(M.byteLength).toBe(d * d * 8); // Float64 = 8 bytes
      }
    });
  });

  describe('Gram-Schmidt Orthogonalization', () => {
    it('should generate orthonormal basis vectors', () => {
      const rand = createLCG(42);
      const basis = generateOrthonormalBasis(16, 4, rand);
      
      // Each vector should be normalized
      for (const v of basis) {
        expect(Math.abs(norm(v) - 1.0)).toBeLessThan(1e-7);
      }
      
      // Vectors should be mutually orthogonal
      for (let i = 0; i < basis.length; i++) {
        for (let j = i + 1; j < basis.length; j++) {
          expect(Math.abs(dot(basis[i], basis[j]))).toBeLessThan(1e-7);
        }
      }
    });
  });
});

describe('Computational Primitive Unit Tests', () => {
  describe('TEST-U01: Hebbian Rank-1 Accumulator', () => {
    it('should compute correct outer product', () => {
      const k = new Float64Array([1, 0]);
      const v = new Float64Array([0, 1]);
      const M = outerProduct(v, k);
      
      // outerProduct(v, k) where v is row and k is column
      // M[i,j] = v[i] * k[j]
      // Row-major: M[0] = v[0]*k[0], M[1] = v[0]*k[1], M[2] = v[1]*k[0], M[3] = v[1]*k[1]
      expect(M[0]).toBe(0); // v[0] * k[0] = 0 * 1 = 0
      expect(M[1]).toBe(0); // v[0] * k[1] = 0 * 0 = 0
      expect(M[2]).toBe(1); // v[1] * k[0] = 1 * 1 = 1
      expect(M[3]).toBe(0); // v[1] * k[1] = 1 * 0 = 0
      
      // Frobenius norm should be 1.0
      expect(Math.abs(frobeniusNorm(M) - 1.0)).toBeLessThan(1e-7);
    });
  });

  describe('Matrix-Vector Multiplication', () => {
    it('should correctly multiply matrix by vector', () => {
      // Identity matrix test
      const d = 4;
      const I = createMatrix(d, d);
      for (let i = 0; i < d; i++) I[i * d + i] = 1;
      
      const v = new Float64Array([1, 2, 3, 4]);
      const result = matVecMul(I, v, d, d);
      
      for (let i = 0; i < d; i++) {
        expect(Math.abs(result[i] - v[i])).toBeLessThan(1e-7);
      }
    });
  });

  describe('TEST-U02: Delta Rule Gradient Update', () => {
    it('should produce zero update when already memorized', () => {
      const d = 4;
      const k = new Float64Array([1, 0, 0, 0]);
      const v = new Float64Array([0, 1, 0, 0]);
      
      // Create matrix that already stores k -> v
      const M = outerProduct(v, k);
      
      // Prior prediction should be v
      const v_hat = matVecMul(M, k, d, d);
      
      // Error should be zero
      const error = new Float64Array(d);
      for (let i = 0; i < d; i++) error[i] = v[i] - v_hat[i];
      
      expect(l2Distance(error, new Float64Array(d))).toBeLessThan(1e-7);
    });
  });

  describe('TEST-U03: KV-Cache Attention Matching', () => {
    it('should compute softmax that sums to 1.0', () => {
      const scores = new Float64Array([1.0, 0.0, 0.5, -0.5]);
      const probs = softmax(scores);
      
      let sum = 0;
      for (const p of probs) sum += p;
      
      expect(Math.abs(sum - 1.0)).toBeLessThan(1e-6);
    });

    it('should assign highest probability to largest score', () => {
      const scores = new Float64Array([0.5, 2.0, 1.0, 0.3]);
      const probs = softmax(scores);
      
      let maxIdx = 0;
      let maxProb = probs[0];
      for (let i = 1; i < probs.length; i++) {
        if (probs[i] > maxProb) {
          maxProb = probs[i];
          maxIdx = i;
        }
      }
      
      expect(maxIdx).toBe(1); // Index of score 2.0
    });
  });
});

describe('Deterministic PRNG Tests', () => {
  describe('TEST-I02: Seed Determinism', () => {
    it('should produce identical sequences with same seed', () => {
      const rand1 = createLCG(12345);
      const rand2 = createLCG(12345);
      
      for (let i = 0; i < 100; i++) {
        const v1 = rand1();
        const v2 = rand2();
        expect(v1).toBe(v2);
      }
    });

    it('should produce different sequences with different seeds', () => {
      const rand1 = createLCG(12345);
      const rand2 = createLCG(54321);
      
      let allDifferent = true;
      for (let i = 0; i < 100; i++) {
        if (rand1() === rand2()) {
          allDifferent = false;
          break;
        }
      }
      
      expect(allDifferent).toBe(true);
    });
  });
});

describe('Cosine Similarity Tests', () => {
  it('should be 1.0 for identical vectors', () => {
    const v = new Float64Array([1, 2, 3, 4]);
    const sim = cosineSimilarity(v, v);
    expect(Math.abs(sim - 1.0)).toBeLessThan(1e-7);
  });

  it('should be 0.0 for orthogonal vectors', () => {
    const v1 = new Float64Array([1, 0, 0, 0]);
    const v2 = new Float64Array([0, 1, 0, 0]);
    const sim = cosineSimilarity(v1, v2);
    expect(Math.abs(sim)).toBeLessThan(1e-7);
  });

  it('should be -1.0 for opposite vectors', () => {
    const v1 = new Float64Array([1, 0, 0, 0]);
    const v2 = new Float64Array([-1, 0, 0, 0]);
    const sim = cosineSimilarity(v1, v2);
    expect(Math.abs(sim - (-1.0))).toBeLessThan(1e-7);
  });
});
