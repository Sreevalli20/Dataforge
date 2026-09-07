import React, { useState } from 'react';
import { Zap, Settings, X } from 'lucide-react';
import { SweepConfig, SweepParameter } from '../types';

interface AutoRunPanelProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onRunSweep: (config: SweepConfig) => void;
  isRunning: boolean;
}

export const AutoRunPanel: React.FC<AutoRunPanelProps> = ({
  isEnabled,
  onToggle,
  onRunSweep,
  isRunning,
}) => {
  const [parameter, setParameter] = useState<SweepParameter>('correlationAngleDeg');
  const [start, setStart] = useState(90);
  const [end, setEnd] = useState(0);
  const [step, setStep] = useState(5);

  const parameterLabels: Record<SweepParameter, string> = {
    correlationAngleDeg: 'Correlation Angle (θ)',
    sequenceLength: 'Sequence Length (N)',
    learningRate: 'Learning Rate (η)',
    decay: 'Decay (λ)',
  };

  const handleRun = () => {
    onRunSweep({ parameter, start, end, step });
  };

  if (!isEnabled) {
    return (
      <button
        onClick={() => onToggle(true)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-all cursor-pointer"
        aria-label="Enable auto-run mode"
      >
        <Zap className="w-4 h-4 text-amber-400" />
        <span>AUTO RUN</span>
      </button>
    );
  }

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-amber-400 font-mono">AUTO RUN MODE</span>
        </div>
        <button
          onClick={() => onToggle(false)}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close auto-run panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-mono">Sweep Parameter</label>
        <select
          value={parameter}
          onChange={(e) => setParameter(e.target.value as SweepParameter)}
          className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
        >
          {Object.entries(parameterLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-slate-400 font-mono">Start</label>
          <input
            type="number"
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-mono">End</label>
          <input
            type="number"
            value={end}
            onChange={(e) => setEnd(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-mono">Step</label>
          <input
            type="number"
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={isRunning}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-xs font-bold font-mono transition-all cursor-pointer"
        aria-label="Run parameter sweep"
      >
        <Settings className="w-4 h-4" />
        <span>{isRunning ? 'RUNNING...' : 'RUN SWEEP'}</span>
      </button>
    </div>
  );
};
