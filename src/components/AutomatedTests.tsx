import React, { useState } from 'react';
import { Play, TrendingUp, Zap, Activity } from 'lucide-react';
import { ExperimentConfig } from '../types';
import { runExperiment } from '../lib/memoryEngine';

interface TestDataPoint {
  value: number;
  cosine: number;
  l2Error: number;
  ndRatio: number;
}

interface AutomatedTestsProps {
  config: ExperimentConfig;
  onConfigChange: (config: ExperimentConfig) => void;
}

export const AutomatedTests: React.FC<AutomatedTestsProps> = ({ config, onConfigChange }) => {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestDataPoint[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const runCapacityTest = async () => {
    setActiveTest('capacity');
    setTestData([]);
    setCurrentStep(0);

    const newData: TestDataPoint[] = [];
    const d = config.dimension;
    const sequenceLengths = Array.from({ length: Math.min(d * 2, 48) }, (_, i) => i + 1);

    for (let i = 0; i < sequenceLengths.length; i++) {
      const N = sequenceLengths[i];
      const testConfig = { ...config, sequenceLength: N, correlationAngleDeg: 90 };
      const result = runExperiment(testConfig);

      newData.push({
        value: N,
        cosine: result.readout.cosineSimilarity,
        l2Error: result.readout.l2Error,
        ndRatio: N / d,
      });

      setTestData([...newData]);
      setCurrentStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setActiveTest(null);
  };

  const runCrosstalkTest = async () => {
    setActiveTest('crosstalk');
    setTestData([]);
    setCurrentStep(0);

    const newData: TestDataPoint[] = [];
    const angles = [90, 75, 60, 45, 30, 15, 5, 0];

    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i];
      const testConfig = { ...config, correlationAngleDeg: angle, sequenceLength: 2 };
      const result = runExperiment(testConfig);

      newData.push({
        value: angle,
        cosine: result.readout.cosineSimilarity,
        l2Error: result.readout.l2Error,
        ndRatio: 0,
      });

      setTestData([...newData]);
      setCurrentStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    setActiveTest(null);
  };

  const runLearningRateTest = async () => {
    setActiveTest('learningRate');
    setTestData([]);
    setCurrentStep(0);

    const newData: TestDataPoint[] = [];
    const learningRates = [0.1, 0.3, 0.5, 0.7, 1.0, 1.3, 1.5, 2.0];

    for (let i = 0; i < learningRates.length; i++) {
      const lr = learningRates[i];
      const testConfig = { ...config, learningRate: lr, algorithm: 'delta' as const };
      const result = runExperiment(testConfig);

      newData.push({
        value: lr,
        cosine: result.readout.cosineSimilarity,
        l2Error: result.readout.l2Error,
        ndRatio: 0,
      });

      setTestData([...newData]);
      setCurrentStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    setActiveTest(null);
  };

  const runDecayTest = async () => {
    setActiveTest('decay');
    setTestData([]);
    setCurrentStep(0);

    const newData: TestDataPoint[] = [];
    const decays = [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.98, 1.0];

    for (let i = 0; i < decays.length; i++) {
      const decay = decays[i];
      const testConfig = { ...config, decay, sequenceLength: 8 };
      const result = runExperiment(testConfig);

      newData.push({
        value: decay,
        cosine: result.readout.cosineSimilarity,
        l2Error: result.readout.l2Error,
        ndRatio: 0,
      });

      setTestData([...newData]);
      setCurrentStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    setActiveTest(null);
  };

  const getStatusColor = (cosine: number) => {
    if (cosine >= 0.95) return 'text-emerald-400';
    if (cosine >= 0.8) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            AUTOMATED TESTS
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={runCapacityTest}
          disabled={activeTest !== null}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-slate-700"
        >
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          <span>Capacity</span>
        </button>
        <button
          onClick={runCrosstalkTest}
          disabled={activeTest !== null}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-slate-700"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Crosstalk</span>
        </button>
        <button
          onClick={runLearningRateTest}
          disabled={activeTest !== null}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-slate-700"
        >
          <Play className="w-3.5 h-3.5 text-cyan-400" />
          <span>Learning Rate</span>
        </button>
        <button
          onClick={runDecayTest}
          disabled={activeTest !== null}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-slate-700"
        >
          <Activity className="w-3.5 h-3.5 text-violet-400" />
          <span>Decay</span>
        </button>
      </div>

      {activeTest && (
        <div className="text-center py-4 text-xs font-mono text-cyan-400">
          Running {activeTest} test... {currentStep}/{testData.length}
        </div>
      )}

      {testData.length > 0 && !activeTest && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-500 border-b border-slate-800 pb-1">
            <div>Value</div>
            <div>Cosine</div>
            <div>L2 Error</div>
            <div>Status</div>
          </div>
          {testData.map((point, idx) => (
            <div
              key={idx}
              className="grid grid-cols-4 gap-2 text-[11px] font-mono hover:bg-slate-800/50 rounded px-2 py-1 cursor-pointer"
              onClick={() => {
                if (activeTest === 'capacity') {
                  onConfigChange({ ...config, sequenceLength: point.value });
                } else if (activeTest === 'crosstalk') {
                  onConfigChange({ ...config, correlationAngleDeg: point.value });
                } else if (activeTest === 'learningRate') {
                  onConfigChange({ ...config, learningRate: point.value });
                } else if (activeTest === 'decay') {
                  onConfigChange({ ...config, decay: point.value });
                }
              }}
            >
              <div className="text-slate-300">{point.value.toFixed(2)}</div>
              <div className={getStatusColor(point.cosine)}>{point.cosine.toFixed(4)}</div>
              <div className="text-slate-400">{point.l2Error.toFixed(4)}</div>
              <div className={getStatusColor(point.cosine)}>
                {point.cosine >= 0.95 ? '✓' : point.cosine >= 0.8 ? '~' : '✗'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
