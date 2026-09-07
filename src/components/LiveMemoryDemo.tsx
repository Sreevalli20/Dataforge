import React, { useState } from 'react';
import { Play, BarChart3 } from 'lucide-react';
import { ExperimentConfig } from '../types';
import { runExperiment } from '../lib/memoryEngine';

interface MemoryDataPoint {
  sequenceLength: number;
  fastWeightBytes: number;
  kvCacheBytes: number;
  ratio: number;
}

interface LiveMemoryDemoProps {
  config: ExperimentConfig;
}

export const LiveMemoryDemo: React.FC<LiveMemoryDemoProps> = ({ config }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState<MemoryDataPoint[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const sequenceLengths = [8, 16, 32, 64, 128, 256];

  const runDemo = async () => {
    setIsRunning(true);
    setData([]);
    setCurrentStep(0);

    const newData: MemoryDataPoint[] = [];
    
    for (let i = 0; i < sequenceLengths.length; i++) {
      const N = sequenceLengths[i];
      const testConfig = { ...config, sequenceLength: N };
      const result = runExperiment(testConfig);
      
      newData.push({
        sequenceLength: N,
        fastWeightBytes: result.readout.fastWeightBytes,
        kvCacheBytes: result.readout.kvCacheBytes,
        ratio: result.readout.kvCacheBytes / result.readout.fastWeightBytes,
      });
      
      setData([...newData]);
      setCurrentStep(i + 1);
      
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    setIsRunning(false);
  };

  const maxKV = Math.max(...data.map(d => d.kvCacheBytes), 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            LIVE MEMORY DEMO
          </h3>
        </div>
        <button
          onClick={runDemo}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer border border-cyan-400/30"
          aria-label="Run memory demo"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{isRunning ? 'Running...' : 'Run Demo'}</span>
        </button>
      </div>

      {data.length > 0 && (
        <div className="space-y-3">
          {/* Progress */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Progress:</span>
            <span className="text-cyan-400 font-bold">{currentStep}/{sequenceLengths.length}</span>
          </div>

          {/* Visualization */}
          <div className="space-y-2">
            {data.map((point, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-16 text-xs font-mono text-slate-400 text-right">
                  N={point.sequenceLength}
                </div>
                
                {/* Fast Weight Bar (constant) */}
                <div className="flex-1">
                  <div className="h-6 bg-slate-950 rounded border border-indigo-900/40 relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-indigo-500/30 border-r border-indigo-400/50"
                      style={{ width: '20%' }}
                    />
                    <div className="absolute inset-0 flex items-center px-2 text-[10px] font-mono text-indigo-300">
                      FW: {point.fastWeightBytes} B
                    </div>
                  </div>
                </div>

                {/* KV Cache Bar (growing) */}
                <div className="flex-1">
                  <div className="h-6 bg-slate-950 rounded border border-sky-900/40 relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-sky-500/30 border-r border-sky-400/50 transition-all duration-300"
                      style={{ width: `${Math.min((point.kvCacheBytes / maxKV) * 100, 100)}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-2 text-[10px] font-mono text-sky-300">
                      KV: {point.kvCacheBytes.toLocaleString()} B
                    </div>
                  </div>
                </div>

                {/* Ratio */}
                <div className="w-20 text-xs font-mono text-amber-400 font-bold text-right">
                  {point.ratio.toFixed(1)}×
                </div>
              </div>
            ))}
          </div>

          {/* Conclusion */}
          {data.length === sequenceLengths.length && (
            <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-700/50 rounded-lg">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">RESULT:</span>
                <span className="text-slate-300">
                  Fast Weight: <span className="text-indigo-400 font-bold">O(1)</span> | 
                  KV Cache: <span className="text-sky-400 font-bold">O(T·d)</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {data.length === 0 && !isRunning && (
        <div className="text-center py-6 text-slate-500 text-xs">
          Click "Run Demo" to visualize memory scaling across sequence lengths
        </div>
      )}
    </div>
  );
};
