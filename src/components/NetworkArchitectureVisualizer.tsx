import React from 'react';
import { Layers, Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { LayerState } from '../lib/neuralNetwork';

interface NetworkArchitectureVisualizerProps {
  layers: LayerState[];
  selectedLayerIndex: number;
  onSelectLayer: (layerIdx: number) => void;
  inputDim: number;
}

export const NetworkArchitectureVisualizer: React.FC<NetworkArchitectureVisualizerProps> = ({
  layers,
  selectedLayerIndex,
  onSelectLayer,
  inputDim,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Network Architecture ({layers.length} Learned Layers)
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Click any layer to inspect weight matrix & gradients
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {/* Input Layer Card */}
        <div className="flex-shrink-0 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono">
          <div className="text-[10px] text-slate-400 uppercase">Input</div>
          <div className="text-sm font-bold text-white mt-0.5">{inputDim} Neurons</div>
          <div className="text-[9px] text-slate-500 mt-1">x₁, x₂ (2D)</div>
        </div>

        {/* Arrow */}
        <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

        {/* Hidden & Output Layers */}
        {layers.map((layer, idx) => {
          const isSelected = selectedLayerIndex === idx;
          const isOutput = idx === layers.length - 1;
          const gradNorm = layer.gradNorm;

          // Gradient health classification
          const isVanishing = gradNorm < 1e-4;
          const isExploding = gradNorm > 15;

          return (
            <React.Fragment key={idx}>
              <button
                onClick={() => onSelectLayer(idx)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/80 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
                    : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                    {isOutput ? 'Output Layer' : `Layer ${layer.layerIndex}`}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-1 rounded font-bold font-sans">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between gap-3">
                  <span>W: {layer.outputDim}×{layer.inputDim}</span>
                  <span className="text-slate-500">b: {layer.outputDim}</span>
                </div>

                {/* Gradient status badge */}
                <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">‖∇W‖:</span>
                  <span
                    className={`font-bold font-mono flex items-center gap-1 ${
                      isVanishing
                        ? 'text-sky-400'
                        : isExploding
                        ? 'text-rose-400 animate-pulse'
                        : 'text-emerald-400'
                    }`}
                  >
                    {isVanishing && <Activity className="w-2.5 h-2.5" />}
                    {isExploding && <AlertTriangle className="w-2.5 h-2.5" />}
                    {gradNorm.toExponential(2)}
                  </span>
                </div>
              </button>

              {!isOutput && <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
