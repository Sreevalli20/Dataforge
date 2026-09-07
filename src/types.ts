/**
 * Type definitions for Fast Weights vs KV-Cache Explorer
 * (Pathway Frontier AI Track / DataForge 2026)
 */

export type PlasticityAlgorithm = 'hebbian' | 'delta' | 'bdh_sparse';

export interface TokenAssociation {
  index: number;
  label: string;
  keyVector: Float64Array;
  valueVector: Float64Array;
  retainedWeight: number; // lambda^(T - index)
}

export interface ExperimentConfig {
  dimension: 8 | 16 | 32;
  sequenceLength: number; // N tokens stored
  correlationAngleDeg: number; // theta in degrees [0, 90]
  algorithm: PlasticityAlgorithm;
  decay: number; // lambda in [0.7, 1.0]
  learningRate: number; // eta in [0.1, 2.0]
  probeIndex: number; // 0-indexed query position
  seed: number;
}

export interface ReadoutResult {
  groundTruth: Float64Array;
  fastWeightEstimate: Float64Array;
  kvCacheEstimate: Float64Array;
  l2Error: number;
  cosineSimilarity: number;
  kvCosineSimilarity: number;
  kvL2Error: number;
  classificationMatch: boolean;
  fastWeightBytes: number;
  kvCacheBytes: number;
  crosstalkResidualNorm: number;
}

export interface CurvePoint {
  angleDeg: number;
  theoryCosine: number;
  fastWeightCosine: number;
  kvCacheCosine: number;
}

export interface GuidedStage {
  id: number;
  title: string;
  tagline: string;
  question: string;
  explanation: string;
  activeConfig: Partial<ExperimentConfig>;
  highlightedControls: string[];
  suggestedAction: string;
}
