import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface MatrixEvolutionProps {
  snapshots: Float64Array[];
  dimension: number;
  frobenius: number;
}

export const MatrixEvolution: React.FC<MatrixEvolutionProps> = ({
  snapshots,
  dimension: d,
  frobenius,
}) => {
  const [currentIndex, setCurrentIndex] = useState(snapshots.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isPlaying && currentIndex < snapshots.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentIndex >= snapshots.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIndex, snapshots.length]);

  const currentMatrix = snapshots[currentIndex] || snapshots[0];

  // Compute maximum absolute value for normalization
  let maxAbs = 0.05;
  for (let i = 0; i < currentMatrix.length; i++) {
    const abs = Math.abs(currentMatrix[i]);
    if (abs > maxAbs) maxAbs = abs;
  }

  const getCellColor = (val: number) => {
    const normVal = val / maxAbs;
    if (Math.abs(normVal) < 0.01) return '#0f172a';
    if (normVal > 0) {
      const alpha = Math.min(1, Math.max(0.15, normVal));
      return `rgba(245, 158, 11, ${alpha.toFixed(2)})`;
    } else {
      const alpha = Math.min(1, Math.max(0.15, -normVal));
      return `rgba(96, 165, 250, ${alpha.toFixed(2)})`;
    }
  };

  const cellSize = d === 8 ? 26 : d === 16 ? 15 : 8;

  const handleStepForward = () => {
    if (currentIndex < snapshots.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">Matrix Evolution</span>
          <span className="text-xs font-mono text-amber-400">
            Step {currentIndex + 1} / {snapshots.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors cursor-pointer"
            aria-label="Reset to first step"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleStepBack}
            disabled={currentIndex === 0}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-300 transition-colors cursor-pointer"
            aria-label="Step backward"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 bg-amber-600 hover:bg-amber-500 rounded text-white transition-colors cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleStepForward}
            disabled={currentIndex === snapshots.length - 1}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-300 transition-colors cursor-pointer"
            aria-label="Step forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center py-2 bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden">
        <div
          className="grid gap-[1px] bg-slate-950 p-2"
          style={{
            gridTemplateColumns: `repeat(${d}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: d }).map((_, r) =>
            Array.from({ length: d }).map((_, c) => {
              const idx = r * d + c;
              const val = currentMatrix[idx] || 0;
              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: getCellColor(val),
                  }}
                  className="rounded-[1px] transition-transform"
                  title={`M[${r},${c}] = ${val.toFixed(4)}`}
                />
              );
            })
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>‖M‖_F: {frobenius.toFixed(3)}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-blue-400">-W</span>
          <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-slate-900 to-amber-500 border border-slate-700" />
          <span className="text-[10px] text-amber-400">+W</span>
        </div>
      </div>
    </div>
  );
};
