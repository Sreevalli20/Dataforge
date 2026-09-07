import React, { useState } from 'react';
import { Layers, Crosshair, Sparkles } from 'lucide-react';
import { LayerState } from '../lib/neuralNetwork';

interface WeightMatrixInspectorProps {
  layer: LayerState;
  learningRate: number;
}

export const WeightMatrixInspector: React.FC<WeightMatrixInspectorProps> = ({
  layer,
  learningRate,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({
    row: 0,
    col: 0,
  });

  const { outputDim, inputDim, weights, gradWeights, biases, gradBiases, layerIndex } = layer;

  // Max absolute weight for normalization
  let maxWeight = 0.1;
  for (let i = 0; i < weights.length; i++) {
    const abs = Math.abs(weights[i]);
    if (abs > maxWeight) maxWeight = abs;
  }

  const getWeightColor = (w: number) => {
    const norm = w / maxWeight; // in [-1, 1]
    if (Math.abs(norm) < 0.02) return '#0f172a';
    if (norm > 0) {
      const alpha = Math.min(1, Math.max(0.18, norm));
      return `rgba(245, 158, 11, ${alpha.toFixed(2)})`; // Amber
    } else {
      const alpha = Math.min(1, Math.max(0.18, -norm));
      return `rgba(96, 165, 250, ${alpha.toFixed(2)})`; // Sky blue
    }
  };

  // Inspect selected weight details
  const activeRow = selectedCell?.row ?? 0;
  const activeCol = selectedCell?.col ?? 0;
  const cellIdx = activeRow * inputDim + activeCol;
  const activeWeight = weights[cellIdx] || 0;
  const activeGrad = gradWeights[cellIdx] || 0;
  const activeDelta = layer.deltas[activeRow] || 0;
  const activeBias = biases[activeRow] || 0;
  const activeGradBias = gradBiases[activeRow] || 0;
  const weightUpdate = -learningRate * activeGrad;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Weight Matrix <span className="font-mono text-amber-400">W_{layerIndex} ∈ ℝ^({outputDim}×{inputDim})</span>
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>‖W‖_F:</span>
          <span className="text-amber-300 font-bold">{layer.weightNorm.toFixed(3)}</span>
          <span className="text-slate-600">|</span>
          <span>‖∇W‖_F:</span>
          <span className="text-emerald-400 font-bold">{layer.gradNorm.toExponential(3)}</span>
        </div>
      </div>

      {/* Grid Layout: Weight Matrix + Biases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weight Matrix Heatmap */}
        <div className="md:col-span-2 bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col justify-center items-center overflow-x-auto">
          <div className="text-[10px] text-slate-400 font-mono mb-2 flex items-center justify-between w-full px-1">
            <span>Columns: Input Neurons (j = 0..{inputDim - 1})</span>
            <span>Rows: Output Neurons (i = 0..{outputDim - 1})</span>
          </div>

          <div
            className="grid gap-1 bg-slate-950 p-1.5 rounded"
            style={{
              gridTemplateColumns: `repeat(${inputDim}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: outputDim }).map((_, r) =>
              Array.from({ length: inputDim }).map((_, c) => {
                const idx = r * inputDim + c;
                const w = weights[idx] || 0;
                const isSelected = selectedCell?.row === r && selectedCell?.col === c;

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => setSelectedCell({ row: r, col: c })}
                    style={{
                      backgroundColor: getWeightColor(w),
                    }}
                    className={`w-9 h-9 rounded text-[10px] font-mono flex items-center justify-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'ring-2 ring-white scale-110 z-10 text-white font-bold shadow-lg'
                        : 'text-slate-300 hover:scale-105 hover:ring-1 hover:ring-amber-400/60'
                    }`}
                    title={`W[${r},${c}] = ${w.toFixed(4)} | ∇W = ${gradWeights[idx]?.toExponential(2)}`}
                  >
                    {w.toFixed(2)}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between w-full px-1">
            <span>Click any weight cell to trace its exact backpropagation components</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Negative
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block ml-1" /> Positive
            </div>
          </div>
        </div>

        {/* Selected Weight Inspector Card */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 font-mono">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              <span>Synapse W[{activeRow}, {activeCol}]</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
              Layer {layerIndex}
            </span>
          </div>

          {/* Detailed Quantities */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Value W:</span>
              <strong className="text-amber-400 font-bold text-sm">{activeWeight.toFixed(4)}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Gradient ∂L/∂W:</span>
              <strong
                className={`font-bold ${
                  Math.abs(activeGrad) < 1e-5
                    ? 'text-sky-400'
                    : Math.abs(activeGrad) > 10
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {activeGrad.toExponential(3)}
              </strong>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Downstream Error δ_{activeRow}:</span>
              <span className="text-slate-200">{activeDelta.toExponential(3)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Neuron Bias b_{activeRow}:</span>
              <span className="text-slate-300">{activeBias.toFixed(4)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Bias Gradient ∂L/∂b:</span>
              <span className="text-slate-300">{activeGradBias.toExponential(3)}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 bg-slate-900/60 p-1.5 rounded">
              <span className="text-slate-300 font-sans text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Step ΔW:
              </span>
              <strong className="text-emerald-400">{weightUpdate.toExponential(3)}</strong>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono leading-tight">
            Gradient rule: <span className="text-slate-300">∂L/∂W_ij = δ_i · a_j^(l-1)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
