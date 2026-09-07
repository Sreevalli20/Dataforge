import React from 'react';
import { Search, Zap, Activity, TrendingDown } from 'lucide-react';
import { ExperimentConfig } from '../types';
import { runExperiment } from '../lib/memoryEngine';

interface QuickExperimentsProps {
  config: ExperimentConfig;
  onResults: (results: any) => void;
}

export const QuickExperiments: React.FC<QuickExperimentsProps> = ({
  config,
  onResults,
}) => {
  const runCapacityExperiment = () => {
    const results = [];
    const baseConfig = { ...config, correlationAngleDeg: 90, algorithm: 'delta' as const };
    
    for (let N = 1; N <= 32; N++) {
      const testConfig = { ...baseConfig, sequenceLength: N };
      const sim = runExperiment(testConfig);
      results.push({
        N,
        cosineSimilarity: sim.readout.cosineSimilarity,
        l2Error: sim.readout.l2Error,
        memory: sim.readout.fastWeightBytes,
        crosstalk: sim.readout.crosstalkResidualNorm,
      });
    }
    
    onResults({ type: 'capacity', data: results });
  };

  const runCrosstalkExperiment = () => {
    const results = [];
    const baseConfig = { ...config, sequenceLength: 2, algorithm: 'hebbian' as const };
    
    for (let angle = 90; angle >= 0; angle -= 5) {
      const testConfig = { ...baseConfig, correlationAngleDeg: angle };
      const sim = runExperiment(testConfig);
      results.push({
        angle,
        cosineSimilarity: sim.readout.cosineSimilarity,
        l2Error: sim.readout.l2Error,
      });
    }
    
    onResults({ type: 'crosstalk', data: results });
  };

  const runLearningRateExperiment = () => {
    const results = [];
    const baseConfig = { ...config, sequenceLength: 4, correlationAngleDeg: 60, algorithm: 'delta' as const };
    
    for (let lr = 0.2; lr <= 1.8; lr += 0.1) {
      const testConfig = { ...baseConfig, learningRate: lr };
      const sim = runExperiment(testConfig);
      results.push({
        learningRate: lr,
        cosineSimilarity: sim.readout.cosineSimilarity,
        l2Error: sim.readout.l2Error,
        frobenius: sim.frobenius,
      });
    }
    
    onResults({ type: 'learningRate', data: results });
  };

  const runDecayExperiment = () => {
    const results = [];
    const baseConfig = { ...config, sequenceLength: 8, correlationAngleDeg: 90, algorithm: 'hebbian' as const };
    
    for (let decay = 0.7; decay <= 1.0; decay += 0.02) {
      const testConfig = { ...baseConfig, decay };
      const sim = runExperiment(testConfig);
      results.push({
        decay,
        cosineSimilarity: sim.readout.cosineSimilarity,
        l2Error: sim.readout.l2Error,
      });
    }
    
    onResults({ type: 'decay', data: results });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3">
        Quick Experiments
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={runCapacityExperiment}
          className="p-3 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 rounded-lg text-left transition-all cursor-pointer group"
          aria-label="Find capacity limit"
        >
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
            <span className="text-xs font-semibold text-slate-200">Find Capacity Limit</span>
          </div>
          <div className="text-[10px] text-slate-500">Sweep sequence length N</div>
        </button>

        <button
          onClick={runCrosstalkExperiment}
          className="p-3 bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800 rounded-lg text-left transition-all cursor-pointer group"
          aria-label="Run crosstalk stress test"
        >
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-rose-400 group-hover:text-rose-300" />
            <span className="text-xs font-semibold text-slate-200">Crosstalk Stress Test</span>
          </div>
          <div className="text-[10px] text-slate-500">Sweep angle θ 90°→0°</div>
        </button>

        <button
          onClick={runLearningRateExperiment}
          className="p-3 bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 rounded-lg text-left transition-all cursor-pointer group"
          aria-label="Run learning rate sweep"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
            <span className="text-xs font-semibold text-slate-200">Learning Rate Sweep</span>
          </div>
          <div className="text-[10px] text-slate-500">Test η stability</div>
        </button>

        <button
          onClick={runDecayExperiment}
          className="p-3 bg-slate-950/80 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-800 rounded-lg text-left transition-all cursor-pointer group"
          aria-label="Run retention experiment"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-violet-400 group-hover:text-violet-300" />
            <span className="text-xs font-semibold text-slate-200">Retention Experiment</span>
          </div>
          <div className="text-[10px] text-slate-500">Sweep decay λ</div>
        </button>
      </div>
    </div>
  );
};
