import { configToQueryString, queryStringToConfig } from './urlState';
import { ExperimentConfig } from '../types';

describe('URL State Management', () => {
  const testConfig: ExperimentConfig = {
    dimension: 16,
    sequenceLength: 8,
    correlationAngleDeg: 45,
    algorithm: 'delta',
    decay: 0.95,
    learningRate: 0.8,
    probeIndex: 0,
    seed: 12345,
  };

  describe('configToQueryString', () => {
    it('should convert config to query string', () => {
      const queryString = configToQueryString(testConfig);
      expect(queryString).toContain('d=16');
      expect(queryString).toContain('N=8');
      expect(queryString).toContain('theta=45');
      expect(queryString).toContain('algo=delta');
      expect(queryString).toContain('lambda=0.95');
      expect(queryString).toContain('eta=0.8');
      expect(queryString).toContain('seed=12345');
      expect(queryString).toContain('probe=0');
    });

    it('should handle all algorithm types', () => {
      const hebbianConfig = { ...testConfig, algorithm: 'hebbian' as const };
      const deltaConfig = { ...testConfig, algorithm: 'delta' as const };
      const bdhConfig = { ...testConfig, algorithm: 'bdh_sparse' as const };

      expect(configToQueryString(hebbianConfig)).toContain('algo=hebbian');
      expect(configToQueryString(deltaConfig)).toContain('algo=delta');
      expect(configToQueryString(bdhConfig)).toContain('algo=bdh_sparse');
    });
  });

  describe('queryStringToConfig', () => {
    it('should parse query string to config', () => {
      const queryString = configToQueryString(testConfig);
      const parsedConfig = queryStringToConfig(queryString);

      expect(parsedConfig.dimension).toBe(16);
      expect(parsedConfig.sequenceLength).toBe(8);
      expect(parsedConfig.correlationAngleDeg).toBe(45);
      expect(parsedConfig.algorithm).toBe('delta');
      expect(parsedConfig.decay).toBe(0.95);
      expect(parsedConfig.learningRate).toBe(0.8);
      expect(parsedConfig.seed).toBe(12345);
      expect(parsedConfig.probeIndex).toBe(0);
    });

    it('should handle invalid dimension values', () => {
      const queryString = 'd=10'; // Invalid dimension
      const parsedConfig = queryStringToConfig(queryString);
      expect(parsedConfig.dimension).toBeUndefined();
    });

    it('should handle invalid algorithm values', () => {
      const queryString = 'algo=invalid';
      const parsedConfig = queryStringToConfig(queryString);
      expect(parsedConfig.algorithm).toBeUndefined();
    });

    it('should handle out-of-range values', () => {
      const queryString = 'theta=150&N=50&lambda=0.5';
      const parsedConfig = queryStringToConfig(queryString);
      expect(parsedConfig.correlationAngleDeg).toBeUndefined();
      expect(parsedConfig.sequenceLength).toBeUndefined();
      expect(parsedConfig.decay).toBeUndefined();
    });

    it('should handle empty query string', () => {
      const parsedConfig = queryStringToConfig('');
      expect(Object.keys(parsedConfig).length).toBe(0);
    });

    it('should handle partial config', () => {
      const queryString = 'd=32&algo=hebbian';
      const parsedConfig = queryStringToConfig(queryString);
      expect(parsedConfig.dimension).toBe(32);
      expect(parsedConfig.algorithm).toBe('hebbian');
      expect(parsedConfig.sequenceLength).toBeUndefined();
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve config through round-trip conversion', () => {
      const queryString = configToQueryString(testConfig);
      const parsedConfig = queryStringToConfig(queryString);

      expect(parsedConfig.dimension).toBe(testConfig.dimension);
      expect(parsedConfig.sequenceLength).toBe(testConfig.sequenceLength);
      expect(parsedConfig.correlationAngleDeg).toBe(testConfig.correlationAngleDeg);
      expect(parsedConfig.algorithm).toBe(testConfig.algorithm);
      expect(parsedConfig.decay).toBe(testConfig.decay);
      expect(parsedConfig.learningRate).toBe(testConfig.learningRate);
      expect(parsedConfig.seed).toBe(testConfig.seed);
      expect(parsedConfig.probeIndex).toBe(testConfig.probeIndex);
    });
  });
});
