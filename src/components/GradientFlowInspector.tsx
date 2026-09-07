import React from 'react';
import {
  TrendingDown,
  Layers,
  Zap,
  Activity,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { ActivationType, LayerState } from '../lib/neuralNetwork';

interface GradientFlowInspectorProps {
  layers: LayerState[];
  currentDepth: number;
  onDepthChange: (depth: number) => void;
  currentActivation: ActivationType;
  onActivationChange: (act: ActivationType) => void;
}

export const GradientFlowInspector: React.FC<GradientFlowInspectorProps> = ({
  layers,
  currentDepth,
  onDepthChange,
  currentActivation,
  onActivationChange,
}) => {
  const numLayers = layers.length;
  const firstLayerNorm = layers[0]?.gradNorm || 1e-12;
  const lastLayerNorm = layers[numLayers - 1]?.gradNorm || 1e-12;

  // Signal attenuation metrics
  const totalRatio = firstLayerNorm / Math.max(1e-15, lastLayerNorm);
  // Average per-layer attenuation multiplier (geometric mean)
  const perLayerMultiplier =
    numLayers > 1 ? Math.pow(Math.max(1e-15, totalRatio), 1 / (numLayers - 1)) : 1.0;

  const isVanishing = totalRatio < 1e-3;
  const isExploding = layers.some((l) => l.gradNorm > 20 || isNaN(l.gradNorm));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Gradient Flow Inspector (Real-Time Signal Attenuation)
          </h3>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Signal Ratio (L1 / L_{numLayers}):</span>
          <strong
            className={`font-bold ${
              isVanishing
                ? 'text-sky-400'
                : isExploding
                ? 'text-rose-400'
                : 'text-emerald-400'
            }`}
          >
            {totalRatio.toExponential(2)}
          </strong>
        </div>
      </div>

      {/* Interactive Controls Row: Depth & Activation Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
        {/* Depth Selector */}
        <div className="space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Network Depth:
            </span>
            <span className="text-amber-400 font-bold">{currentDepth} Layers</span>
          </div>
          <div className="grid grid-cols-5 gap-1 pt-1">
            {[2, 4, 6, 8, 10].map((d) => (
              <button
                key={d}
                onClick={() => onDepthChange(d)}
                className={`py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  currentDepth === d
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {d}L
              </button>
            ))}
          </div>
        </div>

        {/* Activation Selector */}
        <div className="space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Activation Function:
            </span>
            <span className="text-white font-bold uppercase">{currentActivation}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-1">
            {(['relu', 'sigmoid', 'tanh'] as const).map((act) => (
              <button
                key={act}
                onClick={() => onActivationChange(act)}
                className={`py-1 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                  currentActivation === act
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layer-by-Layer Signal Flow Chart (Backward direction: Output -> Input) */}
      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1 text-slate-300">
            <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
            Backpropagation Flow: Output Layer → Layer 1
          </span>
          <span>
            Per-Layer Factor γ: <strong className="text-amber-400">{perLayerMultiplier.toFixed(3)}×</strong>
          </span>
        </div>

        <div className="space-y-2 pt-2">
          {layers.map((layer, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === layers.length - 1;
            const norm = layer.gradNorm;

            // Log scale mapping for display bar
            const logVal = Math.log10(Math.max(1e-12, Math.min(100, norm)));
            const barWidth = Math.max(2, Math.min(100, ((logVal + 10) / 12) * 100));

            return (
              <div key={idx} className="flex items-center gap-2 text-xs font-mono">
                <div className="w-24 text-slate-400 text-right truncate">
                  {isFirst ? (
                    <span className="text-amber-400 font-bold">L1 (Earliest)</span>
                  ) : isLast ? (
                    <span className="text-sky-400 font-bold">Output</span>
                  ) : (
                    `Layer ${layer.layerIndex}`
                  )}
                </div>

                <div className="flex-1 bg-slate-900 h-5 rounded overflow-hidden flex items-center p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded transition-all duration-200 ${
                      norm < 1e-4
                        ? 'bg-sky-400/90'
                        : norm > 20
                        ? 'bg-rose-500'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <span
                  className={`w-24 text-right font-bold ${
                    norm < 1e-4
                      ? 'text-sky-400'
                      : norm > 20
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {norm.toExponential(2)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Diagnosis Note */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400">
            {isVanishing ? (
              <span className="text-sky-300 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-sky-400" />
                Signal attenuated by {Math.round(1 / totalRatio).toLocaleString()}×. Early weights receive negligible updates.
              </span>
            ) : isExploding ? (
              <span className="text-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Signal amplified beyond stability threshold. Weights will diverge to NaN.
              </span>
            ) : (
              <span className="text-emerald-300">
                Healthy signal preservation. Gradients remain within 2 orders of magnitude across all layers.
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
