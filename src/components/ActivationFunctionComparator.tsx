import React, { useState } from 'react';
import { Sparkles, Info, CheckCircle2, Crosshair, ArrowRight } from 'lucide-react';
import { ActivationType, activate, activateDerivative } from '../lib/neuralNetwork';

interface ActivationFunctionComparatorProps {
  currentActivation: ActivationType;
  onSelectActivation: (act: ActivationType) => void;
}

const ACTIVATION_DATA: Record<
  ActivationType,
  {
    name: string;
    formula: string;
    derivative: string;
    range: string;
    maxDeriv: string;
    summary: string;
    pros: string[];
    cons: string[];
    vanishingRisk: 'Low' | 'High' | 'Severe';
  }
> = {
  relu: {
    name: 'ReLU (Rectified Linear Unit)',
    formula: 'f(z) = max(0, z)',
    derivative: "f'(z) = 1 if z > 0 else 0",
    range: '[0, +∞)',
    maxDeriv: '1.0 (for z > 0)',
    summary:
      'The modern standard for deep neural networks. Because the gradient does not saturate for positive inputs, backpropagated error flows freely through dozens of layers without decaying.',
    pros: ['Prevents vanishing gradients for active neurons', 'Computationally fast (simple thresholding)', 'Promotes sparse representations'],
    cons: ['Dying ReLU problem: if z ≤ 0, gradient is exactly 0 and neuron permanently freezes', 'Not zero-centered'],
    vanishingRisk: 'Low',
  },
  sigmoid: {
    name: 'Sigmoid / Logistic',
    formula: 'σ(z) = 1 / (1 + e⁻ᶻ)',
    derivative: "σ'(z) = σ(z)(1 - σ(z))",
    range: '(0, 1)',
    maxDeriv: '0.25 (at z = 0)',
    summary:
      'Classic biological squashing function. Smooth and bounded between 0 and 1. However, because its maximum derivative is strictly 0.25, chaining L layers shrinks gradients by at least (0.25)ᴸ, causing catastrophic vanishing gradients.',
    pros: ['Smooth, differentiable everywhere', 'Interpretable as firing probability', 'Useful in binary output layer'],
    cons: ['Catastrophic vanishing gradients in deep hidden layers', 'Not zero-centered (causes zig-zag weight updates)', 'Saturates easily at extremes (|z| > 3)'],
    vanishingRisk: 'Severe',
  },
  tanh: {
    name: 'Tanh (Hyperbolic Tangent)',
    formula: 'tanh(z) = (eᶻ - e⁻ᶻ) / (eᶻ + e⁻ᶻ)',
    derivative: "tanh'(z) = 1 - tanh²(z)",
    range: '(-1, 1)',
    maxDeriv: '1.0 (at z = 0)',
    summary:
      'Zero-centered version of sigmoid with range (-1, 1). Its maximum derivative is 1.0 at origin, providing stronger initial gradient flow than sigmoid, but still saturates at extremes (|z| > 2), leading to vanishing gradients in deep architectures.',
    pros: ['Zero-centered (mean output near 0 stabilizes optimization)', 'Maximum derivative of 1.0 at origin', 'Better convergence than Sigmoid'],
    cons: ['Still suffers from vanishing gradients when activations saturate', 'Exponential computation cost'],
    vanishingRisk: 'High',
  },
};

export const ActivationFunctionComparator: React.FC<ActivationFunctionComparatorProps> = ({
  currentActivation,
  onSelectActivation,
}) => {
  const [probeZ, setProbeZ] = useState<number>(0.8);
  const current = ACTIVATION_DATA[currentActivation];

  // Evaluate current activation at probeZ
  const currentF = activate(probeZ, currentActivation);
  const currentGrad = activateDerivative(probeZ, currentActivation);

  // Compare gradients at probeZ across all 3 functions
  const reluGrad = activateDerivative(probeZ, 'relu');
  const sigmoidGrad = activateDerivative(probeZ, 'sigmoid');
  const tanhGrad = activateDerivative(probeZ, 'tanh');

  // Compute 8-layer gradient cascade (f'(z))^8
  const reluCascade = Math.pow(reluGrad, 8);
  const sigmoidCascade = Math.pow(sigmoidGrad, 8);
  const tanhCascade = Math.pow(tanhGrad, 8);

  // Generate SVG curve points for z in [-4, 4]
  const plotWidth = 260;
  const plotHeight = 130;
  const pad = 24;

  const pointsF: string[] = [];
  const pointsD: string[] = [];

  for (let z = -4; z <= 4; z += 0.2) {
    const fVal = activate(z, currentActivation);
    const dVal = activateDerivative(z, currentActivation);

    // Map z in [-4, 4] to [pad, plotWidth - pad]
    const x = pad + ((z + 4) / 8) * (plotWidth - 2 * pad);
    // Map fVal in [-1.2, 2.5] to Y
    const yF = plotHeight - pad - ((fVal + 1.2) / 3.7) * (plotHeight - 2 * pad);
    // Map dVal in [-0.05, 1.1] to Y
    const yD = plotHeight - pad - ((dVal + 0.05) / 1.15) * (plotHeight - 2 * pad);

    pointsF.push(`${pointsF.length === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yF.toFixed(1)}`);
    pointsD.push(`${pointsD.length === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yD.toFixed(1)}`);
  }

  // Position of probe marker
  const probeX = pad + ((probeZ + 4) / 8) * (plotWidth - 2 * pad);
  const probeYGrad = plotHeight - pad - ((currentGrad + 0.05) / 1.15) * (plotHeight - 2 * pad);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Activation Functions & Live Derivative Mapping
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {(['relu', 'sigmoid', 'tanh'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onSelectActivation(type)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                currentActivation === type
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Interactive Derivative Plot with Live Input Probe (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-0.5 bg-amber-400 inline-block" /> Output f(z)
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-2.5 h-0.5 bg-sky-400 inline-block border-b border-dashed" /> Gradient f&apos;(z)
            </span>
          </div>

          {/* SVG Canvas */}
          <div className="flex justify-center py-1">
            <svg width={plotWidth} height={plotHeight} className="overflow-visible select-none">
              {/* Axes */}
              <line x1={pad} y1={plotHeight - pad} x2={plotWidth - pad} y2={plotHeight - pad} stroke="#334155" />
              <line x1={plotWidth / 2} y1={pad} x2={plotWidth / 2} y2={plotHeight - pad} stroke="#334155" />

              {/* Zero baseline */}
              <line
                x1={pad}
                y1={plotHeight - pad - (1.2 / 3.7) * (plotHeight - 2 * pad)}
                x2={plotWidth - pad}
                y2={plotHeight - pad - (1.2 / 3.7) * (plotHeight - 2 * pad)}
                stroke="#1e293b"
                strokeDasharray="2,2"
              />

              {/* f(z) Curve */}
              <path d={pointsF.join(' ')} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
              {/* f'(z) Derivative Curve */}
              <path d={pointsD.join(' ')} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

              {/* Interactive Probe Line & Point */}
              <line
                x1={probeX}
                y1={pad}
                x2={probeX}
                y2={plotHeight - pad}
                stroke="#ec4899"
                strokeDasharray="2,2"
                strokeWidth="1.5"
              />
              <circle cx={probeX} cy={probeYGrad} r="4.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />

              {/* Labels */}
              <text x={pad} y={plotHeight - 6} fill="#64748b" fontSize="8" fontFamily="monospace">
                -4
              </text>
              <text x={plotWidth / 2} y={plotHeight - 6} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                z = 0
              </text>
              <text x={plotWidth - pad} y={plotHeight - 6} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">
                +4
              </text>
            </svg>
          </div>

          {/* Interactive Input Slider */}
          <div className="bg-slate-900/90 p-2 rounded border border-slate-800 space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-pink-400" /> Probe Input (z):
              </span>
              <strong className="text-pink-400">{probeZ.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="-3.5"
              max="3.5"
              step="0.05"
              value={probeZ}
              onChange={(e) => setProbeZ(Number(e.target.value))}
              className="w-full accent-pink-500 h-1 bg-slate-800 rounded cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>f({probeZ.toFixed(1)}) = <strong className="text-amber-300">{currentF.toFixed(3)}</strong></span>
              <span>f&apos;({probeZ.toFixed(1)}) = <strong className="text-sky-300">{currentGrad.toFixed(4)}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Comparative Derivative Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Side-by-side Gradient Comparison at probeZ */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-xs font-mono font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>Simultaneous Gradient at Input z = {probeZ.toFixed(2)}:</span>
              <span className="text-[10px] text-slate-500">Derivative f&apos;(z)</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {/* ReLU */}
              <div
                className={`p-2 rounded border transition-all ${
                  currentActivation === 'relu'
                    ? 'bg-amber-950/60 border-amber-500'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="text-[10px] uppercase text-slate-400 font-bold">ReLU</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {reluGrad.toFixed(2)}
                </div>
                <div className="text-[9px] text-slate-500 mt-1">
                  {probeZ > 0 ? 'Full transmission (1.0)' : 'Dying neuron (0.0)'}
                </div>
              </div>

              {/* Sigmoid */}
              <div
                className={`p-2 rounded border transition-all ${
                  currentActivation === 'sigmoid'
                    ? 'bg-amber-950/60 border-amber-500'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="text-[10px] uppercase text-slate-400 font-bold">Sigmoid</div>
                <div
                  className={`text-base font-bold mt-0.5 ${
                    sigmoidGrad < 0.1 ? 'text-rose-400' : 'text-sky-400'
                  }`}
                >
                  {sigmoidGrad.toFixed(4)}
                </div>
                <div className="text-[9px] text-slate-500 mt-1">
                  Max = 0.25 ({((sigmoidGrad / 0.25) * 100).toFixed(0)}% peak)
                </div>
              </div>

              {/* Tanh */}
              <div
                className={`p-2 rounded border transition-all ${
                  currentActivation === 'tanh'
                    ? 'bg-amber-950/60 border-amber-500'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="text-[10px] uppercase text-slate-400 font-bold">Tanh</div>
                <div
                  className={`text-base font-bold mt-0.5 ${
                    tanhGrad < 0.2 ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {tanhGrad.toFixed(4)}
                </div>
                <div className="text-[9px] text-slate-500 mt-1">
                  {Math.abs(probeZ) > 1.5 ? 'Saturating to 0' : 'Active near origin'}
                </div>
              </div>
            </div>
          </div>

          {/* 8-Layer Gradient Chain Calculator: (f'(z))^8 */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold">Multi-Layer Gradient Chain Propagation (Depth L = 8):</span>
              <span className="text-[10px] text-slate-500">Chain factor (f&apos;(z))⁸</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400">ReLU⁸: </span>
                <strong className={reluCascade > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                  {reluCascade.toFixed(2)}
                </strong>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400">Sigmoid⁸: </span>
                <strong className="text-sky-400">{sigmoidCascade.toExponential(2)}</strong>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400">Tanh⁸: </span>
                <strong className={tanhCascade < 1e-4 ? 'text-rose-400' : 'text-amber-400'}>
                  {tanhCascade.toExponential(2)}
                </strong>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 font-sans leading-snug">
              Notice that even at optimal origin $z=0$, Sigmoid shrinks the backpropagated gradient by $(0.25)^8 \approx 1.5 \times 10^{-5}$ across 8 layers. For Tanh, as soon as activations exceed $|z| &gt; 1.5$, the gradient chain collapses to zero. ReLU passes $1.0$ through all active layers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
