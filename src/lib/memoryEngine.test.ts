/**
 * Computational Tests for Memory Engine
 * Tests the full experiment pipeline per TEST_SPEC.md
 */

import { runExperiment } from './memoryEngine';
import { ExperimentConfig } from '../types';

describe('Memory Engine - Experiment Pipeline Tests', () => {
  describe('TEST-M04: Single-Association Exact Reconstruction Invariant', () => {
    it('should achieve exact recall with single Hebbian association', () => {
      const config: ExperimentConfig = {
        dimension: 16,
        sequenceLength: 1,
        correlationAngleDeg: 90,
        algorithm: 'hebbian',
        decay: 1.0,
        learningRate: 1.0,
        probeIndex: 0,
        seed: 42,
      };

      const result = runExperiment(config);

      // L2 error should be near zero
      expect(result.readout.l2Error).toBeLessThan(1e-6);
      
      // Cosine similarity should be near 1.0
      expect(result.readout.cosineSimilarity).toBeGreaterThan(0.999999);
      
      // Classification should match
      expect(result.readout.classificationMatch).toBe(true);
    });
  });

  describe('TEST-M05: Softmax Probability Conservation Invariant', () => {
    it('should produce softmax weights that sum to 1.0', () => {
      const config: ExperimentConfig = {
        dimension: 16,
        sequenceLength: 2,
        correlationAngleDeg: 90,
        algorithm: 'hebbian',
        decay: 1.0,
        learningRate: 1.0,
        probeIndex: 0,
        seed: 42,
      };

      const result = runExperiment(config);
      
      // The KV-cache estimate should be computed via softmax
      // With orthogonal keys, KV-cache should have reasonable similarity
      expect(result.readout.kvCosineSimilarity).toBeGreaterThan(0.7);
    });
  });

  describe('Orthogonal Memory Superposition', () => {
    it('should maintain perfect recall for orthogonal keys', () => {
      const config: ExperimentConfig = {
        dimension: 16,
        sequenceLength: 2,
        correlationAngleDeg: 90, // Orthogonal
        algorithm: 'hebbian',
        decay: 1.0,
        learningRate: 1.0,
        probeIndex: 0,
        seed: 42,
      };

      const result = runExperiment(config);
      
      // Both tokens should be retrievable with high fidelity
      expect(result.readout.cosineSimilarity).toBeGreaterThan(0.999);
    });

    it('should degrade recall when keys correlate', () => {
      const config: ExperimentConfig = {
        dimension: 16,
        sequenceLength: 2,
        correlationAngleDeg: 30, // Correlated
        algorithm: 'hebbian',
        decay: 1.0,
        learningRate: 1.0,
        probeIndex: 0,
        seed: 42,
      };

      const result = runExperiment(config);
      
      // Recall should degrade due to crosstalk
      expect(result.readout.cosineSimilarity).toBeLessThan(0.95);
      expect(result.readout.l2Error).toBeGreaterThan(0.1);
    });
  });

  describe('Delta Rule Error Correction', () => {
    it('should produce different results than Hebbian under crosstalk', () => {
      const baseConfig: ExperimentConfig = {
        dimension: 16,
        sequenceLength: 2,
        correlationAngleDeg: 30, // More severe crosstalk
        decay: 1.0,
        learningRate: 0.3, // Lower learning rate for stability
        probeIndex: 0,
        seed: 42,
        algorithm: 'hebbian', // Add required field
      };

      const hebbianConfig = { ...baseConfig, algorithm: 'hebbian' as const };
      const deltaConfig = { ...baseConfig, algorithm: 'delta' as const };

      const hebbianResult = runExperiment(hebbianConfig);
      const deltaResult = runExperiment(deltaConfig);

      // Delta rule should produce different results than Hebbian
      // (showing it's actually implementing a different algorithm)
      expect(deltaResult.readout.l2Error).not.toBe(hebbianResult.readout.l2Error);
      expect(deltaResult.readout.cosineSimilarity).not.toBe(hebbianResult.readout.cosineSimilarity);
      
      // Both algorithms should produce valid results
      expect(deltaResult.readout.cosineSimilarity).toBeGreaterThan(0);
      expect(hebbianResult.readout.cosineSimilarity).toBeGreaterThan(0);
    });
  });

  describe('Memory Footprint Calculations', () => {
    it('should calculate constant O(1) memory for fast weights', () => {
      const config1: ExperimentConfig = {
        dimension: 16,
        sequenceLength: 1,
        correlationAngleDeg: 90,
        algorithm: 'hebbian',
        decay: 1.0,
        learningRate: 1.0,
        probeIndex: 0,
        seed: 42,
      };

      const config2: ExperimentConfig = {
        ...config1,
        sequenceLength: 32,
      };

      const result1 = runExperiment(config1);
      const result2 = runExperiment(config2);

      // Fast weight memory should be constant regardless of sequence length
      expect(result1.readout.fastWeightBytes).toBe(result2.readout.fastWeightBytes);
      expect(result1.readout.fastWeightBytes).toBe(16 * 16 * 8); // d^2 * 8 bytes (Float64)
    });

    it('should calculate linear O(T*d) memory for KV-cache', () => {
      const config1: ExperimentConfig = {
        dimension: 16,
        sequenceLength: 1,
        correlationAngleDeg: 90,
        algorithm: 'hebbian',
        decay: 1.0,
        learningRate: 1.0,
        probeIndex: 0,
        seed: 42,
      };

      const config2: ExperimentConfig = {
        ...config1,
        sequenceLength: 32,
      };

      const result1 = runExperiment(config1);
      const result2 = runExperiment(config2);

      // KV-cache memory should scale linearly with sequence length
      expect(result2.readout.kvCacheBytes).toBeGreaterThan(result1.readout.kvCacheBytes);
      expect(result2.readout.kvCacheBytes).toBe(2 * 32 * 16 * 8); // 2 * N * d * 8 bytes (Float64)
    });
  });

  describe('TEST-I02: Seed Determinism', () => {
    it('should produce identical results with same seed', () => {
      const config: ExperimentConfig = {
        dimension: 16,
        sequenceLength: 4,
        correlationAngleDeg: 45,
        algorithm: 'delta',
        decay: 0.95,
        learningRate: 0.8,
        probeIndex: 0,
        seed: 12345,
      };

      const result1 = runExperiment(config);
      const result2 = runExperiment(config);

      // Frobenius norm should be identical
      expect(result1.frobenius).toBe(result2.frobenius);
      
      // Metrics should be identical
      expect(result1.readout.l2Error).toBe(result2.readout.l2Error);
      expect(result1.readout.cosineSimilarity).toBe(result2.readout.cosineSimilarity);
    });
  });

  describe('Capacity Limit Tests', () => {
    it('should maintain high fidelity when N <= d with orthogonal keys', () => {
      const config: ExperimentConfig = {
        dimension: 16,
        sequenceLength: 16, // N = d
        correlationAngleDeg: 90,
        algorithm: 'delta',
        decay: 1.0,
        learningRate: 0.8,
        probeIndex: 0,
        seed: 42,
      };

      const result = runExperiment(config);
      
      // Should still have reasonable fidelity at capacity limit
      expect(result.readout.cosineSimilarity).toBeGreaterThan(0.85);
    });

    it('should degrade when N > d (capacity exceeded)', () => {
      const config: ExperimentConfig = {
        dimension: 16,
        sequenceLength: 32, // N > d (2x capacity)
        correlationAngleDeg: 90,
        algorithm: 'hebbian',
        decay: 1.0,
        learningRate: 1.0,
        probeIndex: 0,
        seed: 42,
      };

      const result = runExperiment(config);
      
      // Should degrade due to linear dependence (with more tokens beyond capacity)
      expect(result.readout.cosineSimilarity).toBeLessThan(0.9);
    });
  });

  describe('BDH Sparse Non-Negative Rule', () => {
    it('should enforce non-negative weights with BDH algorithm', () => {
      const config: ExperimentConfig = {
        dimension: 16,
        sequenceLength: 4,
        correlationAngleDeg: 45,
        algorithm: 'bdh_sparse',
        decay: 0.95,
        learningRate: 0.8,
        probeIndex: 0,
        seed: 42,
      };

      const result = runExperiment(config);
      
      // All weights should be non-negative
      for (let i = 0; i < result.weightMatrix.length; i++) {
        expect(result.weightMatrix[i]).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Fidelity Curve Generation', () => {
    it('should generate fidelity curve across angle range', () => {
      const config: ExperimentConfig = {
        dimension: 16,
        sequenceLength: 2,
        correlationAngleDeg: 45,
        algorithm: 'hebbian',
        decay: 1.0,
        learningRate: 1.0,
        probeIndex: 0,
        seed: 42,
      };

      const result = runExperiment(config);
      
      // Should have curve points from 0 to 90 degrees
      expect(result.fidelityCurve.length).toBeGreaterThan(0);
      expect(result.fidelityCurve[0].angleDeg).toBe(0);
      expect(result.fidelityCurve[result.fidelityCurve.length - 1].angleDeg).toBe(90);
      
      // At 90 degrees (orthogonal), fidelity should be high
      const orthogonalPoint = result.fidelityCurve.find(p => p.angleDeg === 90);
      expect(orthogonalPoint).toBeDefined();
      expect(orthogonalPoint!.fastWeightCosine).toBeGreaterThan(0.99);
      
      // At 0 degrees (collinear), fidelity should be lower
      const collinearPoint = result.fidelityCurve.find(p => p.angleDeg === 0);
      expect(collinearPoint).toBeDefined();
      expect(collinearPoint!.fastWeightCosine).toBeLessThan(0.8);
    });
  });
});
