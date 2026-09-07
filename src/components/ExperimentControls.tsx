import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { ExperimentState } from '../types';

interface ExperimentControlsProps {
  state: ExperimentState;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onReplay: () => void;
  canReplay: boolean;
}

export const ExperimentControls: React.FC<ExperimentControlsProps> = ({
  state,
  onRun,
  onPause,
  onResume,
  onReset,
  onReplay,
  canReplay,
}) => {
  const getStateBadge = () => {
    switch (state) {
      case 'IDLE':
        return <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs font-mono font-semibold">IDLE</span>;
      case 'RUNNING':
        return <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 text-xs font-mono font-semibold animate-pulse">RUNNING</span>;
      case 'PAUSED':
        return <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 text-xs font-mono font-semibold">PAUSED</span>;
      case 'COMPLETE':
        return <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 text-xs font-mono font-semibold">COMPLETE</span>;
    }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-3">
      {getStateBadge()}
      
      <div className="w-px h-6 bg-slate-700" />

      {state === 'IDLE' || state === 'COMPLETE' ? (
        <button
          onClick={onRun}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
          aria-label="Run experiment"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Run</span>
        </button>
      ) : null}

      {state === 'RUNNING' ? (
        <button
          onClick={onPause}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
          aria-label="Pause experiment"
        >
          <Pause className="w-3.5 h-3.5" />
          <span>Pause</span>
        </button>
      ) : null}

      {state === 'PAUSED' ? (
        <button
          onClick={onResume}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
          aria-label="Resume experiment"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Resume</span>
        </button>
      ) : null}

      <button
        onClick={onReset}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
        aria-label="Reset experiment"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset</span>
      </button>

      {canReplay && state === 'COMPLETE' ? (
        <button
          onClick={onReplay}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
          aria-label="Replay experiment"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span>Replay</span>
        </button>
      ) : null}
    </div>
  );
};
