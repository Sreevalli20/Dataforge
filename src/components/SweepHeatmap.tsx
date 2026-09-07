import React, { memo } from 'react';
import { Grid3x3 } from 'lucide-react';
import { ExperimentConfig } from '../types';
import { runExperiment } from '../lib/memoryEngine';

interface SweepHeatmapProps {
  config: ExperimentConfig;
}

export const SweepHeatmap = memo<SweepHeatmapProps>(({ config }) => {
  const heatmapData = React.useMemo(() => {
    const data: { x: number; y: number; value: number }[] = [];
    const baseConfig = { ...config };
    
    // Sweep correlation angle (x-axis) vs sequence length (y-axis)
    for (let angle = 0; angle <= 90; angle += 10) {
      for (let N = 1; N <= Math.min(32, config.dimension * 2); N += 2) {
        const testConfig = { ...baseConfig, correlationAngleDeg: angle, sequenceLength: N };
        const sim = runExperiment(testConfig);
        data.push({
          x: angle,
          y: N,
          value: sim.readout.cosineSimilarity,
        });
      }
    }
    return data;
  }, [config]);

  const cellSize = 20;
  const cols = 10; // 0-90 degrees in steps of 10
  const rows = Math.min(16, Math.floor(config.dimension * 2 / 2)); // N values

  const getColor = (value: number) => {
    const alpha = Math.max(0.15, Math.min(1, value));
    if (value > 0.9) return `rgba(16, 185, 129, ${alpha.toFixed(2)})`; // emerald
    if (value > 0.7) return `rgba(245, 158, 11, ${alpha.toFixed(2)})`; // amber
    if (value > 0.5) return `rgba(234, 179, 8, ${alpha.toFixed(2)})`; // yellow
    return `rgba(239, 68, 68, ${alpha.toFixed(2)})`; // red
  };

  const getValueAt = (angle: number, N: number) => {
    return heatmapData.find(d => d.x === angle && d.y === N)?.value || 0;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Grid3x3 className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-slate-200">
          Parameter Sweep Heatmap
        </h3>
      </div>

      <div className="text-[10px] text-slate-400 mb-2 font-mono">
        X: Correlation Angle (θ) | Y: Sequence Length (N) | Color: Cosine Similarity
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <div className="text-[9px] text-slate-500 mb-1 font-mono">N</div>
          <div className="flex flex-col-reverse gap-[1px]">
            {Array.from({ length: rows }).map((_, i) => {
              const N = (i * 2) + 1;
              return (
                <div key={N} className="text-[9px] text-slate-500 font-mono w-6 text-right pr-1">
                  {N}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          <div
            className="grid gap-[1px] bg-slate-950 p-1 rounded border border-slate-800"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: rows }).map((_, row) =>
              Array.from({ length: cols }).map((_, col) => {
                const angle = col * 10;
                const N = (row * 2) + 1;
                const value = getValueAt(angle, N);
                
                return (
                  <div
                    key={`${angle}-${N}`}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      backgroundColor: getColor(value),
                    }}
                    className="rounded-sm transition-transform hover:scale-110 cursor-pointer"
                    title={`θ=${angle}°, N=${N}, cos=${value.toFixed(3)}`}
                  />
                );
              })
            )}
          </div>

          <div className="flex justify-between mt-1 text-[9px] text-slate-500 font-mono px-1">
            <span>0°</span>
            <span>45°</span>
            <span>90°</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="text-[9px] text-slate-500 font-mono">θ</div>
          <div className="flex flex-col gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500" title="> 0.9" />
            <div className="w-3 h-3 rounded bg-amber-500" title="> 0.7" />
            <div className="w-3 h-3 rounded bg-yellow-500" title="> 0.5" />
            <div className="w-3 h-3 rounded bg-red-500" title="< 0.5" />
          </div>
        </div>
      </div>
    </div>
  );
});
