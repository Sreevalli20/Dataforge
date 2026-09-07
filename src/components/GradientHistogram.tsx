import React, { useMemo, useState } from 'react';
import { BarChart3, Filter } from 'lucide-react';
import { LayerState } from '../lib/neuralNetwork';

interface GradientHistogramProps {
  layers: LayerState[];
  selectedLayerIndex: number;
}

export const GradientHistogram: React.FC<GradientHistogramProps> = ({
  layers,
  selectedLayerIndex,
}) => {
  const [viewScope, setViewScope] = useState<'all' | 'selected'>('all');

  // Collect gradients based on view scope
  const { bins, binLabels, stats, regime } = useMemo(() => {
    const values: number[] = [];

    const targetLayers =
      viewScope === 'selected' && layers[selectedLayerIndex]
        ? [layers[selectedLayerIndex]]
        : layers;

    for (const layer of targetLayers) {
      for (let i = 0; i < layer.gradWeights.length; i++) {
        const g = layer.gradWeights[i];
        if (!isNaN(g)) {
          values.push(g);
        }
      }
    }

    if (values.length === 0) {
      return {
        bins: [],
        binLabels: [],
        stats: { count: 0, mean: 0, std: 0, pctVanished: 0, pctExploding: 0 },
        regime: 'NORMAL',
      };
    }

    // Compute basic statistics
    let sum = 0;
    let sumSq = 0;
    let vanishedCount = 0;
    let explodingCount = 0;

    for (const v of values) {
      sum += v;
      sumSq += v * v;
      const absV = Math.abs(v);
      if (absV < 1e-4) vanishedCount++;
      if (absV > 10) explodingCount++;
    }

    const n = values.length;
    const mean = sum / n;
    const variance = Math.max(0, sumSq / n - mean * mean);
    const std = Math.sqrt(variance);

    const pctVanished = (vanishedCount / n) * 100;
    const pctExploding = (explodingCount / n) * 100;

    let regimeType: 'VANISHING' | 'EXPLODING' | 'HEALTHY' = 'HEALTHY';
    if (pctExploding > 5 || std > 20) {
      regimeType = 'EXPLODING';
    } else if (pctVanished > 65 || (std < 1e-4 && Math.abs(mean) < 1e-4)) {
      regimeType = 'VANISHING';
    }

    // Create 15 histogram bins centered around 0
    // Dynamic range based on std or fixed threshold
    const maxBound = Math.max(0.01, Math.min(2.0, std * 3.5 || 0.5));
    const numBins = 15;
    const binWidth = (2 * maxBound) / numBins;
    const binCounts = new Array(numBins).fill(0);
    const labels: string[] = [];

    for (let b = 0; b < numBins; b++) {
      const lower = -maxBound + b * binWidth;
      labels.push(lower.toFixed(2));
    }

    for (const v of values) {
      let bIdx = Math.floor((v + maxBound) / binWidth);
      if (bIdx < 0) bIdx = 0;
      if (bIdx >= numBins) bIdx = numBins - 1;
      binCounts[bIdx]++;
    }

    const maxBinCount = Math.max(1, ...binCounts);
    const normalizedBins = binCounts.map((count) => ({
      count,
      pct: (count / maxBinCount) * 100,
    }));

    return {
      bins: normalizedBins,
      binLabels: labels,
      stats: {
        count: n,
        mean,
        std,
        pctVanished,
        pctExploding,
      },
      regime: regimeType,
    };
  }, [layers, selectedLayerIndex, viewScope]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Weight Gradient Distribution Histogram
          </h3>
        </div>

        {/* View Scope Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px] font-mono">
            <button
              onClick={() => setViewScope('all')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                viewScope === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => setViewScope('selected')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                viewScope === 'selected'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Layer {selectedLayerIndex + 1} Only
            </button>
          </div>

          {/* Regime Badge */}
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              regime === 'VANISHING'
                ? 'bg-sky-950/80 text-sky-300 border-sky-700/60'
                : regime === 'EXPLODING'
                ? 'bg-rose-950/80 text-rose-300 border-rose-700/60 animate-pulse'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
            }`}
          >
            {regime === 'VANISHING'
              ? 'VANISHING REGIME'
              : regime === 'EXPLODING'
              ? 'EXPLODING REGIME'
              : 'HEALTHY FLOW'}
          </span>
        </div>
      </div>

      {/* Histogram Visualization */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mb-1.5">
          <span>Gradient Values (∂L/∂W)</span>
          <span>Sample Size: {stats.count.toLocaleString()} weights</span>
        </div>

        {/* Bars Container */}
        <div className="h-28 flex items-end gap-1 px-1 border-b border-slate-800">
          {bins.map((bin, i) => {
            const isCenter = i === Math.floor(bins.length / 2);
            return (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end items-center h-full group relative cursor-pointer"
                title={`Bin ${i + 1}: ${bin.count} weights (${((bin.count / Math.max(1, stats.count)) * 100).toFixed(1)}%)`}
              >
                <div
                  className={`w-full rounded-t-[2px] transition-all duration-200 ${
                    regime === 'VANISHING'
                      ? isCenter
                        ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                        : 'bg-sky-600/50'
                      : regime === 'EXPLODING'
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                      : isCenter
                      ? 'bg-emerald-400'
                      : 'bg-emerald-500/80 group-hover:bg-emerald-400'
                  }`}
                  style={{ height: `${Math.max(4, bin.pct)}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1 px-1">
          <span>-3σ</span>
          <span>Negative Gradients</span>
          <span className="text-slate-300 font-bold">0</span>
          <span>Positive Gradients</span>
          <span>+3σ</span>
        </div>
      </div>

      {/* Summary Statistics Strip */}
      <div className="grid grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
          <div className="text-[9px] text-slate-400 uppercase">Mean Gradient</div>
          <div className="font-bold text-slate-200">{stats.mean.toExponential(2)}</div>
        </div>

        <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
          <div className="text-[9px] text-slate-400 uppercase">Standard Dev (σ)</div>
          <div className="font-bold text-amber-400">{stats.std.toExponential(2)}</div>
        </div>

        <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
          <div className="text-[9px] text-slate-400 uppercase">% Vanished (|g| &lt; 10⁻⁴)</div>
          <div
            className={`font-bold ${
              stats.pctVanished > 50 ? 'text-sky-400' : 'text-slate-200'
            }`}
          >
            {stats.pctVanished.toFixed(1)}%
          </div>
        </div>

        <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
          <div className="text-[9px] text-slate-400 uppercase">% Exploding (|g| &gt; 10)</div>
          <div
            className={`font-bold ${
              stats.pctExploding > 5 ? 'text-rose-400' : 'text-slate-200'
            }`}
          >
            {stats.pctExploding.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};
