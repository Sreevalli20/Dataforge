import React, { useState } from 'react';
import { Layers } from 'lucide-react';

interface SynapticHeatmapProps {
  matrix: Float64Array;
  dimension: number;
  frobenius: number;
}

export const SynapticHeatmap: React.FC<SynapticHeatmapProps> = ({
  matrix,
  dimension: d,
  frobenius,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
    val: number;
  } | null>(null);

  // Compute maximum absolute value for symmetric normalization
  let maxAbs = 0.05;
  for (let i = 0; i < matrix.length; i++) {
    const abs = Math.abs(matrix[i]);
    if (abs > maxAbs) maxAbs = abs;
  }

  // Get color for cell value: negative = indigo/blue, 0 = dark slate, positive = amber/orange
  const getCellColor = (val: number) => {
    const normVal = val / maxAbs; // in [-1, 1]
    if (Math.abs(normVal) < 0.01) return '#0f172a'; // slate-900 baseline
    if (normVal > 0) {
      // Orange/Amber intensity
      const alpha = Math.min(1, Math.max(0.15, normVal));
      return `rgba(245, 158, 11, ${alpha.toFixed(2)})`;
    } else {
      // Blue/Indigo intensity
      const alpha = Math.min(1, Math.max(0.15, -normVal));
      return `rgba(96, 165, 250, ${alpha.toFixed(2)})`;
    }
  };

  const cellSize = d === 8 ? 26 : d === 16 ? 15 : 8;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Synaptic Matrix <span className="font-mono text-xs text-amber-400">M ∈ ℝ^({d}×{d})</span>
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">‖M‖_F:</span>
          <span className="text-emerald-400 font-bold">{frobenius.toFixed(3)}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Synapses:</span>
          <span className="text-slate-300 font-bold">{d * d}</span>
        </div>
      </div>

      {/* Heatmap Grid */}
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
              const val = matrix[idx] || 0;
              const isHovered = hoveredCell?.row === r && hoveredCell?.col === c;

              return (
                <div
                  key={`${r}-${c}`}
                  onMouseEnter={() => setHoveredCell({ row: r, col: c, val })}
                  onMouseLeave={() => setHoveredCell(null)}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: getCellColor(val),
                  }}
                  className={`rounded-[1px] transition-transform cursor-crosshair relative ${
                    isHovered ? 'ring-2 ring-white scale-125 z-10' : ''
                  }`}
                  title={`M[${r},${c}] = ${val.toFixed(4)}`}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Dynamic Inspector & Legend */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-2 font-mono">
          {hoveredCell ? (
            <span className="text-amber-300">
              Synapse M[{hoveredCell.row}, {hoveredCell.col}]:{' '}
              <strong className="text-white font-bold">{hoveredCell.val.toFixed(4)}</strong>
            </span>
          ) : (
            <span className="text-slate-500">Hover any synapse cell to inspect weight</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-blue-400 font-mono">-W</span>
          <div className="w-16 h-2 rounded-full bg-gradient-to-r from-blue-500 via-slate-900 to-amber-500 border border-slate-700" />
          <span className="text-[10px] text-amber-400 font-mono">+W</span>
        </div>
      </div>
    </div>
  );
};
