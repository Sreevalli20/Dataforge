import React from 'react';
import { Sliders, Dices, RotateCcw } from 'lucide-react';
import { ExperimentConfig, PlasticityAlgorithm } from '../types';

interface ControlsPanelProps {
  config: ExperimentConfig;
  onChangeConfig: (newConfig: Partial<ExperimentConfig>) => void;
  onReset: () => void;
  highlightedControls?: string[];
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  config,
  onChangeConfig,
  onReset,
  highlightedControls = [],
}) => {
  const isHighlighted = (name: string) => highlightedControls.includes(name);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Interactive Parameter Controls
          </h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors font-mono cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Control 01: Correlation Angle theta */}
      <div
        className={`p-2.5 rounded-lg border transition-all ${
          isHighlighted('correlationAngleDeg')
            ? 'bg-amber-950/40 border-amber-500/70 ring-1 ring-amber-500/30'
            : 'bg-slate-950/60 border-slate-800/80'
        }`}
      >
        <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            Key Correlation Angle (θ)
          </span>
          <span className="text-amber-400 font-bold">{config.correlationAngleDeg}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="90"
          step="1"
          value={config.correlationAngleDeg}
          onChange={(e) => onChangeConfig({ correlationAngleDeg: Number(e.target.value) })}
          className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-mono">
          <span>0° (Collinear Collision)</span>
          <span>45° (Crosstalk)</span>
          <span>90° (Orthogonal ⊥)</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={() => onChangeConfig({ correlationAngleDeg: 90 })}
            className="flex-1 text-[10px] py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
          >
            90° Orthogonal
          </button>
          <button
            onClick={() => onChangeConfig({ correlationAngleDeg: 45 })}
            className="flex-1 text-[10px] py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
          >
            45° Moderate
          </button>
          <button
            onClick={() => onChangeConfig({ correlationAngleDeg: 10 })}
            className="flex-1 text-[10px] py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-rose-300"
          >
            10° Collision
          </button>
        </div>
      </div>

      {/* Control 02: Plasticity Algorithm */}
      <div
        className={`p-2.5 rounded-lg border transition-all ${
          isHighlighted('algorithm')
            ? 'bg-amber-950/40 border-amber-500/70 ring-1 ring-amber-500/30'
            : 'bg-slate-950/60 border-slate-800/80'
        }`}
      >
        <div className="text-xs text-slate-300 font-semibold mb-2 font-mono">
          Synaptic Plasticity Update Rule
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { id: 'hebbian', label: 'Hebbian' },
              { id: 'delta', label: 'Delta Rule' },
              { id: 'bdh_sparse', label: 'BDH Dale' },
            ] as const
          ).map((item) => {
            const isSelected = config.algorithm === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeConfig({ algorithm: item.id as PlasticityAlgorithm })}
                className={`py-1.5 px-2 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Control 03: Sequence Length N & Dimension d */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            isHighlighted('sequenceLength')
              ? 'bg-amber-950/40 border-amber-500/70'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1 font-mono">
            <span className="text-slate-300">Length (N)</span>
            <span className="text-amber-400 font-bold">{config.sequenceLength}</span>
          </div>
          <input
            type="range"
            min="1"
            max="32"
            step="1"
            value={config.sequenceLength}
            onChange={(e) => onChangeConfig({ sequenceLength: Number(e.target.value) })}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="text-[10px] text-slate-500 mt-1 font-mono flex justify-between">
            <span>1</span>
            <span>d={config.dimension}</span>
            <span>32</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg border bg-slate-950/60 border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
            <span className="text-slate-300">Dimension (d)</span>
            <span className="text-amber-400 font-bold">{config.dimension}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {([8, 16, 32] as const).map((dim) => (
              <button
                key={dim}
                onClick={() => onChangeConfig({ dimension: dim })}
                className={`py-1 text-[11px] rounded font-mono font-semibold transition-all ${
                  config.dimension === dim
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {dim}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control 04: Retention Decay lambda & Learning Rate eta */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg border bg-slate-950/60 border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1 font-mono">
            <span className="text-slate-300">Decay (λ)</span>
            <span className="text-amber-400 font-bold">{config.decay.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.0"
            step="0.01"
            value={config.decay}
            onChange={(e) => onChangeConfig({ decay: Number(e.target.value) })}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="text-[9px] text-slate-500 mt-0.5 font-mono">1.0 = Perfect Memory</div>
        </div>

        <div className="p-2.5 rounded-lg border bg-slate-950/60 border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1 font-mono">
            <span className="text-slate-300">Rate (η)</span>
            <span className="text-amber-400 font-bold">{config.learningRate.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.8"
            step="0.1"
            value={config.learningRate}
            onChange={(e) => onChangeConfig({ learningRate: Number(e.target.value) })}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="text-[9px] text-slate-500 mt-0.5 font-mono">Gradient Step Size</div>
        </div>
      </div>

      {/* Seed Re-roller */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
        <button
          onClick={() => onChangeConfig({ seed: Math.floor(Math.random() * 100000) })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
        >
          <Dices className="w-3.5 h-3.5 text-amber-400" />
          <span>Re-roll Random Basis</span>
        </button>
        <span>Seed: {config.seed}</span>
      </div>
    </div>
  );
};
