import React, { useRef, useEffect } from 'react';
import { Play, Pause, StepForward, RotateCcw, Activity } from 'lucide-react';
import { NeuralNetwork, TrainingSample } from '../lib/neuralNetwork';

interface DecisionBoundaryCanvasProps {
  network: NeuralNetwork;
  dataset: TrainingSample[];
  lossHistory: number[];
  isTraining: boolean;
  onToggleTraining: () => void;
  onStepTraining: () => void;
  onResetNetwork: () => void;
  onDatasetChange: (type: 'circles' | 'moons' | 'xor' | 'spiral') => void;
  selectedDataset: 'circles' | 'moons' | 'xor' | 'spiral';
  learningRate: number;
  onLearningRateChange: (lr: number) => void;
}

export const DecisionBoundaryCanvas: React.FC<DecisionBoundaryCanvasProps> = ({
  network,
  dataset,
  lossHistory,
  isTraining,
  onToggleTraining,
  onStepTraining,
  onResetNetwork,
  onDatasetChange,
  selectedDataset,
  learningRate,
  onLearningRateChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw 2D Decision Boundary and Data Points
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Grid resolution
    const resolution = 28;
    const cellW = width / resolution;
    const cellH = height / resolution;

    // Evaluate network on 2D grid [-1.5, 1.5]
    for (let r = 0; r < resolution; r++) {
      for (let c = 0; c < resolution; c++) {
        const x1 = -1.4 + (c / (resolution - 1)) * 2.8;
        const x2 = 1.4 - (r / (resolution - 1)) * 2.8;

        const pred = network.forward([x1, x2]);

        // Background color: Blue for class 0, Amber for class 1
        if (pred > 0.5) {
          const alpha = Math.min(0.7, (pred - 0.5) * 1.4);
          ctx.fillStyle = `rgba(245, 158, 11, ${alpha.toFixed(2)})`;
        } else {
          const alpha = Math.min(0.7, (0.5 - pred) * 1.4);
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha.toFixed(2)})`;
        }

        ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // Draw Data Points
    for (const sample of dataset) {
      const [x1, x2] = sample.x;
      // Map [-1.4, 1.4] to screen coords
      const px = ((x1 + 1.4) / 2.8) * width;
      const py = ((1.4 - x2) / 2.8) * height;

      ctx.beginPath();
      ctx.arc(px, py, 4, 0, 2 * Math.PI);
      if (sample.y === 1) {
        ctx.fillStyle = '#f59e0b'; // Amber
        ctx.strokeStyle = '#ffffff';
      } else {
        ctx.fillStyle = '#38bdf8'; // Sky Blue
        ctx.strokeStyle = '#ffffff';
      }
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    }
  }, [network, dataset, lossHistory.length]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Live 2D Decision Space & Loss
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>Current Loss:</span>
          <strong className="text-amber-400 font-bold">
            {(lossHistory[lossHistory.length - 1] || 0).toFixed(4)}
          </strong>
        </div>
      </div>

      {/* Dataset & Optimizer Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
        <div className="flex items-center gap-1">
          <span className="text-slate-400 mr-1">Data:</span>
          {(['circles', 'moons', 'xor', 'spiral'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onDatasetChange(type)}
              className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold cursor-pointer transition-all ${
                selectedDataset === type
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">LR:</span>
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={learningRate}
            onChange={(e) => onLearningRateChange(Number(e.target.value))}
            className="w-20 accent-amber-500 h-1 bg-slate-800 rounded"
          />
          <span className="text-amber-400 w-8">{learningRate.toFixed(2)}</span>
        </div>
      </div>

      {/* Canvas + Loss graph */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* 2D Canvas */}
        <div className="md:col-span-7 flex justify-center bg-slate-950 rounded-lg p-1 border border-slate-800">
          <canvas
            ref={canvasRef}
            width={240}
            height={220}
            className="rounded w-full max-w-[260px] aspect-square object-contain"
          />
        </div>

        {/* Loss Trajectory */}
        <div className="md:col-span-5 bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col justify-between h-[220px]">
          <div className="text-[10px] text-slate-400 font-mono mb-1 flex items-center justify-between">
            <span>Training Loss (Cross-Entropy)</span>
            <span>{lossHistory.length} Steps</span>
          </div>

          {/* SVG Loss Curve */}
          <div className="flex-1 flex items-center justify-center">
            <svg width={180} height={130} className="overflow-visible">
              <line x1={15} y1={115} x2={175} y2={115} stroke="#334155" />
              <line x1={15} y1={10} x2={15} y2={115} stroke="#334155" />

              {lossHistory.length > 1 && (
                <path
                  d={lossHistory
                    .slice(-60)
                    .map((l, i, arr) => {
                      const maxLoss = 2.0;
                      const x = 15 + (i / Math.max(1, arr.length - 1)) * 160;
                      const y = 115 - Math.max(0, Math.min(1, l / maxLoss)) * 100;
                      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              )}

              <text x={10} y={15} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">
                2.0
              </text>
              <text x={10} y={115} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">
                0.0
              </text>
            </svg>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
            <button
              onClick={onToggleTraining}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                isTraining
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isTraining ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isTraining ? 'Pause' : 'Train'}</span>
            </button>

            <button
              onClick={onStepTraining}
              disabled={isTraining}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 rounded text-xs font-mono transition-colors cursor-pointer"
              title="Train 1 Step"
            >
              <StepForward className="w-3 h-3" />
            </button>

            <button
              onClick={onResetNetwork}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono transition-colors cursor-pointer"
              title="Reset Weights"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
