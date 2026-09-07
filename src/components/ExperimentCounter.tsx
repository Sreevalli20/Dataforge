import React from 'react';
import { Hash } from 'lucide-react';

interface ExperimentCounterProps {
  currentExperiment: number;
  totalExperiments: number;
  currentStep: number;
  totalSteps: number;
  currentParameter?: string;
  state: string;
}

export const ExperimentCounter: React.FC<ExperimentCounterProps> = ({
  currentExperiment,
  totalExperiments,
  currentStep,
  totalSteps,
  currentParameter,
  state,
}) => {
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-4 text-xs font-mono">
      <div className="flex items-center gap-2">
        <Hash className="w-4 h-4 text-amber-400" />
        <span className="text-slate-400">Experiment:</span>
        <span className="font-bold text-white">
          {currentExperiment} / {totalExperiments}
        </span>
      </div>

      <div className="w-px h-4 bg-slate-700" />

      <div className="flex items-center gap-2">
        <span className="text-slate-400">Step:</span>
        <span className="font-bold text-white">
          {currentStep} / {totalSteps}
        </span>
      </div>

      {currentParameter && (
        <>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Param:</span>
            <span className="font-bold text-cyan-400">{currentParameter}</span>
          </div>
        </>
      )}

      <div className="w-px h-4 bg-slate-700" />

      <span className={`font-bold uppercase ${
        state === 'RUNNING' ? 'text-cyan-400 animate-pulse' :
        state === 'COMPLETE' ? 'text-emerald-400' :
        state === 'PAUSED' ? 'text-amber-400' :
        'text-slate-400'
      }`}>
        {state}
      </span>
    </div>
  );
};
