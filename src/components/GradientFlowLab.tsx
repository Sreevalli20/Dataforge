import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingDown,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { ActivationType, NeuralNetwork } from '../lib/neuralNetwork';

interface GradientFlowLabProps {
  depth: number;
  onDepthChange: (d: number) => void;
  activation: ActivationType;
  onActivationChange: (act: ActivationType) => void;
  initScale: number;
  onInitScaleChange: (scale: number) => void;
}

export const GradientFlowLab: React.FC<GradientFlowLabProps> = ({
  depth,
  onDepthChange,
  activation,
  onActivationChange,
  initScale,
  onInitScaleChange,
}) => {
  // Build a test network of specified depth with 6 neurons per hidden layer
  const { layerGradNorms, isVanishing, isExploding, ratioEarlyToLate } = useMemo(() => {
    const layerSizes: number[] = [2];
    for (let i = 0; i < depth; i++) {
      layerSizes.push(6);
    }
    layerSizes.push(1); // Output

    const net = new NeuralNetwork({
      layerSizes,
      activation,
      learningRate: 0.1,
      weightInitScale: initScale,
    });

    // Run forward and backward on a test input
    net.forward([0.5, -0.5]);
    net.backward(1.0);

    const norms = net.layers.map((l) => l.gradNorm);

    const firstLayerGrad = norms[0] || 0;
    const lastLayerGrad = norms[norms.length - 1] || 1e-12;

    const vanishing = firstLayerGrad < 1e-5 && lastLayerGrad > 1e-3;
    const exploding = norms.some((n) => n > 50 || isNaN(n));
    const ratio = firstLayerGrad / Math.max(1e-15, lastLayerGrad);

    return {
      layerGradNorms: norms,
      isVanishing: vanishing,
      isExploding: exploding,
      ratioEarlyToLate: ratio,
    };
  }, [depth, activation, initScale]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Failure Mode Laboratory: Vanishing & Exploding Gradients
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          Live Backpropagation Diagnostic
        </span>
      </div>

      {/* Interactive Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
        {/* Control: Network Depth L */}
        <div className="space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Network Depth (L):
            </span>
            <span className="text-amber-400 font-bold">{depth} Layers</span>
          </div>
          <input
            type="range"
            min="2"
            max="12"
            step="1"
            value={depth}
            onChange={(e) => onDepthChange(Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>2 (Shallow)</span>
            <span>6 (Moderate)</span>
            <span>12 (Deep)</span>
          </div>
        </div>

        {/* Control: Activation Function */}
        <div className="space-y-1 font-mono text-xs">
          <span className="text-slate-400 block mb-1">Activation Function:</span>
          <div className="grid grid-cols-3 gap-1">
            {(['sigmoid', 'tanh', 'relu'] as const).map((act) => (
              <button
                key={act}
                onClick={() => onActivationChange(act)}
                className={`py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  activation === act
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
          <div className="text-[9px] text-slate-500">
            {activation === 'sigmoid'
              ? "Max derivative σ' ≤ 0.25"
              : activation === 'tanh'
              ? "Max derivative tanh' ≤ 1.0"
              : "Constant derivative f' = 1.0"}
          </div>
        </div>

        {/* Control: Weight Init Scale */}
        <div className="space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Weight Init Scale:</span>
            <span className="text-amber-400 font-bold">{initScale.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={initScale}
            onChange={(e) => onInitScaleChange(Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0.2× (Under-scaled)</span>
            <span>1.0× (He/Xavier)</span>
            <span>3.0× (Over-scaled)</span>
          </div>
        </div>
      </div>

      {/* Real-time Status Banner */}
      <div
        className={`p-3 rounded-lg border flex items-start gap-3 transition-all ${
          isExploding
            ? 'bg-rose-950/80 border-rose-600 text-rose-200'
            : isVanishing
            ? 'bg-sky-950/80 border-sky-600 text-sky-200'
            : 'bg-emerald-950/70 border-emerald-700/60 text-emerald-200'
        }`}
      >
        <div className="mt-0.5">
          {isExploding ? (
            <Flame className="w-5 h-5 text-rose-400 animate-bounce" />
          ) : isVanishing ? (
            <TrendingDown className="w-5 h-5 text-sky-400" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
        </div>

        <div className="flex-1 text-xs">
          <div className="font-bold text-sm mb-0.5 font-mono">
            {isExploding
              ? 'CRITICAL FAILURE: Exploding Gradients Detected'
              : isVanishing
              ? 'CRITICAL FAILURE: Vanishing Gradients Detected'
              : 'HEALTHY: Stable Gradient Propagation'}
          </div>
          <p className="leading-relaxed opacity-90 font-sans">
            {isExploding
              ? `Weight gradients ballooned to unsustainable magnitudes (max norm: ${Math.max(
                  ...layerGradNorms
                ).toExponential(2)}). Backpropagation produces numerical instability or NaN divergence, throwing weights into infinity.`
              : isVanishing
              ? `Backpropagated gradient norm collapsed by a factor of ${ratioEarlyToLate.toExponential(
                  1
                )} between the output and Layer 1 (Layer 1 norm: ${layerGradNorms[0]?.toExponential(
                  2
                )}). The initial feature extraction layers have stopped learning completely!`
              : `Gradients successfully propagate back to Layer 1 (gradient ratio: ${ratioEarlyToLate.toFixed(
                  3
                )}). Weights across all ${depth} layers will update harmoniously during training.`}
          </p>
        </div>
      </div>

      {/* Layer Gradient Norm Spectrum */}
      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <span>Layer-by-Layer Gradient Magnitude ‖∇W_l‖_F:</span>
          <span>
            Layer 1 Ratio: <strong className="text-white">{ratioEarlyToLate.toExponential(2)}</strong>
          </span>
        </div>

        {/* Bar Chart across layers */}
        <div className="space-y-2 pt-1">
          {layerGradNorms.map((norm, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === layerGradNorms.length - 1;

            // Log scale calculation for visual bar width [0 to 100%]
            // log10(norm) mapped from -10 to 2
            const logVal = Math.log10(Math.max(1e-12, Math.min(100, norm)));
            const barWidth = Math.max(3, Math.min(100, ((logVal + 10) / 12) * 100));

            return (
              <div key={idx} className="flex items-center gap-2 text-xs font-mono">
                <span className="w-20 text-slate-400 text-right">
                  {isFirst ? 'Layer 1 (Earliest)' : isLast ? 'Output Layer' : `Layer ${idx + 1}`}
                </span>

                <div className="flex-1 bg-slate-900 h-5 rounded overflow-hidden flex items-center p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded transition-all duration-300 ${
                      norm < 1e-4
                        ? 'bg-sky-500/80'
                        : norm > 20
                        ? 'bg-rose-500'
                        : 'bg-emerald-500'
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

        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Log scale: 10⁻¹² to 10²</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-2 h-2 rounded bg-sky-500 inline-block" /> Vanishing (&lt; 10⁻⁴)
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded bg-emerald-500 inline-block" /> Healthy Flow
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded bg-rose-500 inline-block" /> Exploding (&gt; 20)
            </span>
          </span>
        </div>
      </div>

      {/* Mathematical Explanation Card */}
      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold font-mono">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Why Gradient Issues Occur & How They Hinder Learning</span>
        </div>

        <p className="text-slate-300 leading-relaxed font-sans">
          During backpropagation, the gradient of the loss with respect to early weights is computed via the continuous chain rule:
        </p>

        <div className="bg-slate-900 p-2.5 rounded border border-slate-800 font-mono text-center text-[11px] text-amber-300">
          ∂L / ∂W₁ = δ₁ xᵀ = [ ∏ₗ₌₂ᴸ ( Wₗᵀ · diag(σ&apos;(zₗ)) ) ] · δ_output · xᵀ
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-slate-400 leading-relaxed font-sans">
          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
            <strong className="text-sky-300 block mb-1 font-mono text-[11px]">
              1. The Vanishing Gradient Mechanism
            </strong>
            When using Sigmoid activations, the maximum derivative is strictly 0.25. Multiplying L layers produces a factor of (0.25)ᴸ. At depth L=10, (0.25)¹⁰ ≈ 9.5 × 10⁻⁷. The gradient vanishes to near zero, meaning early feature detectors cannot update, and the network behaves like an ineffective shallow model.
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
            <strong className="text-rose-300 block mb-1 font-mono text-[11px]">
              2. The Exploding Gradient Mechanism
            </strong>
            If weights are initialized with eigenvalues greater than 1 (or with high initial variance), repeated matrix multiplication causes the Jacobians to compound exponentially. Gradients rapidly exceed numerical float bounds, causing oscillations, arithmetic overflow, and catastrophic NaN parameters.
          </div>
        </div>
      </div>
    </div>
  );
};
