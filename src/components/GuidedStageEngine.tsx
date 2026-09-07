import React from 'react';
import { Compass, ArrowRight, ArrowLeft, Lightbulb, AlertOctagon, Sparkles } from 'lucide-react';
import { GuidedStage } from '../types';

export const GUIDED_STAGES: GuidedStage[] = [
  {
    id: 1,
    title: 'Stage 1: Observe',
    tagline: 'Zero-Overhead Associative Memory',
    question: 'Can a fixed grid of numbers store an association without allocating token slots?',
    explanation:
      'We initialize an empty matrix M = 0. A single association (k₁ → v₁) is bound into M via the Hebbian outer product M = v₁ k₁ᵀ. Probing with k₁ retrieves v̂ = M k₁ = v₁ with 0.0000 error, using strictly 2,048 bytes (16×16×8 Float64).',
    activeConfig: {
      dimension: 16,
      sequenceLength: 1,
      correlationAngleDeg: 90,
      algorithm: 'hebbian',
      decay: 1.0,
      learningRate: 1.0,
      probeIndex: 0,
    },
    highlightedControls: ['probe'],
    suggestedAction: 'Observe that ground truth v* and Fast Weight output v̂ match with 1.0000 cosine similarity.',
  },
  {
    id: 2,
    title: 'Stage 2: Predict',
    tagline: 'Orthogonal Memory Superposition',
    question: 'Will writing a second memory (k₂ → v₂) overwrite or corrupt the first memory?',
    explanation:
      'When two keys are orthogonal (k₁ · k₂ = 0), their outer products add constructively into the same weight matrix M = v₁ k₁ᵀ + v₂ k₂ᵀ. Probing k₁ yields v₁ (since k₂ᵀ k₁ = 0), and probing k₂ yields v₂. Both memories coexist simultaneously in superposition!',
    activeConfig: {
      dimension: 16,
      sequenceLength: 2,
      correlationAngleDeg: 90,
      algorithm: 'hebbian',
      decay: 1.0,
      learningRate: 1.0,
      probeIndex: 0,
    },
    highlightedControls: ['probe'],
    suggestedAction: 'Switch probes between Token #1 and Token #2 to verify that both remain 100% intact.',
  },
  {
    id: 3,
    title: 'Stage 3: Break the System',
    tagline: 'The Interference Catastrophe',
    question: 'What happens when two concepts share features (key angle θ drops below 90°)?',
    explanation:
      'When key vectors correlate (k₁ · k₂ = cos θ ≠ 0), probing k₁ reads: v̂ = v₁ + cos(θ) v₂. The second term is crosstalk noise! As you decrease θ towards 0°, notice the predicted vector morph into an unrecognizable mixture of both memories. This is the fundamental failure mode of linear associative memory.',
    activeConfig: {
      dimension: 16,
      sequenceLength: 2,
      correlationAngleDeg: 40,
      algorithm: 'hebbian',
      decay: 1.0,
      learningRate: 1.0,
      probeIndex: 0,
    },
    highlightedControls: ['correlationAngleDeg'],
    suggestedAction: 'Slide the Correlation Angle θ down to 15° and watch the error spike as crosstalk overwhelms the signal.',
  },
  {
    id: 4,
    title: 'Stage 4: Repair via Delta Rule',
    tagline: 'Local Online Gradient Descent',
    question: 'Can local backpropagation error feedback stabilize associative memory under crosstalk?',
    explanation:
      'Pure Hebbian correlation writes blindly. The Delta Rule computes prior prediction error eₜ = vₜ - Mₜ₋₁ kₜ, performing exact online gradient descent on retrieval loss. If a feature is already learned, update is zero. Notice how switching to Delta Rule dramatically suppresses crosstalk noise.',
    activeConfig: {
      dimension: 16,
      sequenceLength: 2,
      correlationAngleDeg: 40,
      algorithm: 'delta',
      decay: 1.0,
      learningRate: 0.9,
      probeIndex: 0,
    },
    highlightedControls: ['algorithm'],
    suggestedAction: 'Toggle between Hebbian and Delta Rule to witness how local gradient descent cuts retrieval error in half.',
  },
  {
    id: 5,
    title: 'Stage 5: Head-to-Head Comparison',
    tagline: 'Fast Weights vs. KV-Cache Scaling',
    question: 'If KV-cache never forgets, why is frontier AI racing to replace it?',
    explanation:
      'Standard Transformers keep all keys and values, scaling memory by O(T·d). At long horizons, the KV cache crashes GPU memory. Fast Weights maintain a strictly constant O(1) state (2,048 bytes for d=16). Above sequence length N > d (16 tokens), fast weights degrade, but their memory never budges.',
    activeConfig: {
      dimension: 16,
      sequenceLength: 16,
      correlationAngleDeg: 90,
      algorithm: 'delta',
      decay: 0.98,
      learningRate: 0.8,
      probeIndex: 0,
    },
    highlightedControls: ['sequenceLength'],
    suggestedAction: 'Scale the sequence length N up to 24 tokens to see the memory gauge disparity and capacity saturation.',
  },
  {
    id: 6,
    title: 'Stage 6: Frontier BDH Connection',
    tagline: 'Dragon Hatchling & Non-Negative Sparsity',
    question: 'How does Pathway’s BDH architecture scale synaptic fast weights without catastrophic collapse?',
    explanation:
      'Pathway’s Dragon Hatchling (BDH) introduces biological Dale principles: non-negative activations (a ≥ 0) and excitatory monosemantic synapses. In high dimensions, sparse positive activations are naturally quasi-orthogonal, suppressing destructive crosstalk by mathematical construction.',
    activeConfig: {
      dimension: 16,
      sequenceLength: 8,
      correlationAngleDeg: 45,
      algorithm: 'bdh_sparse',
      decay: 0.95,
      learningRate: 0.8,
      probeIndex: 0,
    },
    highlightedControls: ['algorithm'],
    suggestedAction: 'Observe the BDH Sparse Dale update rule suppressing destructive crosstalk while preserving O(1) state.',
  },
  {
    id: 7,
    title: 'Stage 7: Open Research Sandbox',
    tagline: 'Unrestricted Experimental Laboratory',
    question: 'How do arbitrary combinations of dimension, decay, learning rate, and sequence length interact?',
    explanation:
      'All controls are unlocked. Freely adjust dimension (8, 16, 32), inject long sequence associations, modulate passive synaptic decay λ, and probe individual tokens across the sequence history.',
    activeConfig: {},
    highlightedControls: [],
    suggestedAction: 'Explore parameter frontiers, test capacity limits, and export experimental state.',
  },
];

interface GuidedStageEngineProps {
  currentStageId: number;
  onSelectStage: (stage: GuidedStage) => void;
}

export const GuidedStageEngine: React.FC<GuidedStageEngineProps> = ({
  currentStageId,
  onSelectStage,
}) => {
  const currentStage = GUIDED_STAGES.find((s) => s.id === currentStageId) || GUIDED_STAGES[0];
  const isFirst = currentStageId === 1;
  const isLast = currentStageId === GUIDED_STAGES.length;

  const handlePrev = () => {
    if (!isFirst) {
      const prev = GUIDED_STAGES.find((s) => s.id === currentStageId - 1);
      if (prev) onSelectStage(prev);
    }
  };

  const handleNext = () => {
    if (!isLast) {
      const next = GUIDED_STAGES.find((s) => s.id === currentStageId + 1);
      if (next) onSelectStage(next);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm mb-4">
      {/* Top stage stepper */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Guided Learning Journey:
          </span>
          <span className="text-xs font-bold text-amber-400 font-mono">
            {currentStage.title} — {currentStage.tagline}
          </span>
        </div>

        {/* Stepper pills */}
        <div className="flex items-center gap-1.5">
          {GUIDED_STAGES.map((s) => {
            const isActive = s.id === currentStageId;
            return (
              <button
                key={s.id}
                onClick={() => onSelectStage(s)}
                className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
                title={s.title}
                aria-label={`Select ${s.title}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {s.id === 7 ? 'Sandbox' : `S${s.id}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Core stage prompt & explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-slate-200">{currentStage.question}</div>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">{currentStage.explanation}</p>
            </div>
          </div>
        </div>

        {/* Next step call to action */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex flex-col justify-between">
          <div className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1.5 mb-2">
            {currentStageId === 3 ? (
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Learner Experiment:</span>
          </div>
          <div className="text-xs text-slate-300 font-mono mb-3">{currentStage.suggestedAction}</div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer font-mono"
              aria-label="Previous stage"
            >
              <ArrowLeft className="w-3 h-3" /> Prev
            </button>
            <button
              onClick={handleNext}
              disabled={isLast}
              className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold rounded font-mono transition-colors cursor-pointer"
              aria-label="Next stage"
            >
              Next Stage <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
