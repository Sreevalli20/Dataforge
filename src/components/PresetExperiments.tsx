import React from 'react';
import { Zap, AlertTriangle, Database, TrendingUp, Scale, Activity } from 'lucide-react';
import { ExperimentConfig, PresetExperiment } from '../types';

interface PresetExperimentsProps {
  onLoadPreset: (config: ExperimentConfig) => void;
}

const PRESETS: PresetExperiment[] = [
  {
    id: 'perfect-recall',
    name: 'Perfect Recall',
    description: 'Orthogonal keys, single association',
    config: {
      dimension: 16,
      sequenceLength: 1,
      correlationAngleDeg: 90,
      algorithm: 'hebbian',
      decay: 1.0,
      learningRate: 1.0,
      probeIndex: 0,
      seed: 42,
    },
  },
  {
    id: 'crosstalk-failure',
    name: 'Crosstalk Failure',
    description: 'Highly correlated keys causing interference',
    config: {
      dimension: 16,
      sequenceLength: 2,
      correlationAngleDeg: 15,
      algorithm: 'hebbian',
      decay: 1.0,
      learningRate: 1.0,
      probeIndex: 0,
      seed: 42,
    },
  },
  {
    id: 'capacity-limit',
    name: 'Capacity Limit',
    description: 'Sequence length exceeds dimension',
    config: {
      dimension: 16,
      sequenceLength: 24,
      correlationAngleDeg: 90,
      algorithm: 'delta',
      decay: 0.98,
      learningRate: 0.8,
      probeIndex: 0,
      seed: 42,
    },
  },
  {
    id: 'delta-correction',
    name: 'Delta Rule Correction',
    description: 'Error correction under crosstalk',
    config: {
      dimension: 16,
      sequenceLength: 2,
      correlationAngleDeg: 40,
      algorithm: 'delta',
      decay: 1.0,
      learningRate: 0.9,
      probeIndex: 0,
      seed: 42,
    },
  },
  {
    id: 'bdh-sparse',
    name: 'BDH Sparse Comparison',
    description: 'Non-negative Dale plasticity',
    config: {
      dimension: 16,
      sequenceLength: 8,
      correlationAngleDeg: 45,
      algorithm: 'bdh_sparse',
      decay: 0.95,
      learningRate: 0.8,
      probeIndex: 0,
      seed: 42,
    },
  },
  {
    id: 'high-learning-rate',
    name: 'High Learning Rate',
    description: 'Unstable high η behavior',
    config: {
      dimension: 16,
      sequenceLength: 4,
      correlationAngleDeg: 60,
      algorithm: 'delta',
      decay: 1.0,
      learningRate: 1.8,
      probeIndex: 0,
      seed: 42,
    },
  },
  {
    id: 'strong-decay',
    name: 'Strong Decay',
    description: 'Rapid memory forgetting',
    config: {
      dimension: 16,
      sequenceLength: 8,
      correlationAngleDeg: 90,
      algorithm: 'hebbian',
      decay: 0.75,
      learningRate: 1.0,
      probeIndex: 0,
      seed: 42,
    },
  },
];

const getIcon = (id: string) => {
  switch (id) {
    case 'perfect-recall': return Zap;
    case 'crosstalk-failure': return AlertTriangle;
    case 'capacity-limit': return Database;
    case 'delta-correction': return TrendingUp;
    case 'bdh-sparse': return Scale;
    case 'high-learning-rate': return Activity;
    case 'strong-decay': return Activity;
    default: return Zap;
  }
};

export const PresetExperiments: React.FC<PresetExperimentsProps> = ({ onLoadPreset }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3">
        Preset Experiments
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {PRESETS.map((preset) => {
          const Icon = getIcon(preset.id);
          return (
            <button
              key={preset.id}
              onClick={() => onLoadPreset(preset.config)}
              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 rounded-lg text-left transition-all cursor-pointer group"
              aria-label={`Load preset: ${preset.name}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
                <span className="text-xs font-semibold text-slate-200">{preset.name}</span>
              </div>
              <div className="text-[10px] text-slate-500">{preset.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
