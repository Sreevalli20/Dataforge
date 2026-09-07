import React, { useState, useMemo } from 'react';
import {
  Brain,
  FileCode2,
  Sparkles,
  ExternalLink,
  Layers,
  Network,
} from 'lucide-react';
import { ExperimentConfig, GuidedStage } from './types';
import { runExperiment } from './lib/memoryEngine';
import { SynapticHeatmap } from './components/SynapticHeatmap';
import { TruthBesideEstimate } from './components/TruthBesideEstimate';
import { MemoryGauges } from './components/MemoryGauges';
import { CrosstalkGraph } from './components/CrosstalkGraph';
import { TokenTimeline } from './components/TokenTimeline';
import { ControlsPanel } from './components/ControlsPanel';
import { GuidedStageEngine, GUIDED_STAGES } from './components/GuidedStageEngine';
import { SpecViewerModal } from './components/SpecViewerModal';
import { NeuralNetworkLab } from './components/NeuralNetworkLab';

export default function App() {
  // Top-level workspace tab
  const [activeWorkspace, setActiveWorkspace] = useState<'neural-network' | 'frontier-substrate'>('neural-network');

  // Fast Weights Substrate State
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);

  const [config, setConfig] = useState<ExperimentConfig>({
    dimension: 16,
    sequenceLength: 1,
    correlationAngleDeg: 90,
    algorithm: 'hebbian',
    decay: 1.0,
    learningRate: 1.0,
    probeIndex: 0,
    seed: 42,
  });

  const handleSelectStage = (stage: GuidedStage) => {
    setCurrentStageId(stage.id);
    if (Object.keys(stage.activeConfig).length > 0) {
      setConfig((prev) => ({
        ...prev,
        ...stage.activeConfig,
      }));
    }
  };

  const handleConfigChange = (newValues: Partial<ExperimentConfig>) => {
    setConfig((prev) => ({ ...prev, ...newValues }));
  };

  const handleReset = () => {
    const stage = GUIDED_STAGES.find((s) => s.id === currentStageId) || GUIDED_STAGES[0];
    setConfig({
      dimension: 16,
      sequenceLength: 2,
      correlationAngleDeg: 90,
      algorithm: 'hebbian',
      decay: 1.0,
      learningRate: 1.0,
      probeIndex: 0,
      seed: 42,
      ...stage.activeConfig,
    });
  };

  // Run the live browser computation for Fast Weights
  const simulation = useMemo(() => {
    return runExperiment(config);
  }, [config]);

  const activeStage = GUIDED_STAGES.find((s) => s.id === currentStageId) || GUIDED_STAGES[0];
  const safeProbeIndex = Math.min(config.probeIndex, simulation.associations.length - 1);
  const currentToken = simulation.associations[safeProbeIndex] || simulation.associations[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white">
                  Neural Weight & Plasticity Explorer
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/50">
                  Interactive Research Lab
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time backpropagation, weight matrices, activation dynamics, and vanishing/exploding gradient analysis
              </p>
            </div>
          </div>

          {/* Center Workspace Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveWorkspace('neural-network')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeWorkspace === 'neural-network'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Weight Matrices & Gradients</span>
            </button>

            <button
              onClick={() => setActiveWorkspace('frontier-substrate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeWorkspace === 'frontier-substrate'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Fast Weights vs. KV-Cache (BDH)</span>
            </button>
          </div>

          {/* Right Action: Specifications Modal */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSpecModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Devin Specs (9 Files)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-4">
        {activeWorkspace === 'neural-network' ? (
          /* Workspace 1: Neural Network Weight Matrices & Gradient Flow Lab */
          <NeuralNetworkLab />
        ) : (
          /* Workspace 2: Frontier Fast Weights vs KV-Cache Substrate */
          <div className="space-y-4">
            {/* Guided Stage Engine / Stepper */}
            <GuidedStageEngine
              currentStageId={currentStageId}
              onSelectStage={handleSelectStage}
            />

            {/* Token Timeline Strip */}
            <TokenTimeline
              associations={simulation.associations}
              probeIndex={safeProbeIndex}
              onSelectProbe={(idx) => handleConfigChange({ probeIndex: idx })}
            />

            {/* Central Workspace: 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Parameter Controls (4 cols on lg) */}
              <div className="lg:col-span-4 space-y-4">
                <ControlsPanel
                  config={config}
                  onChangeConfig={handleConfigChange}
                  onReset={handleReset}
                  highlightedControls={activeStage.highlightedControls}
                />

                {/* Live Crosstalk Curve */}
                <CrosstalkGraph
                  fidelityCurve={simulation.fidelityCurve}
                  currentAngle={config.correlationAngleDeg}
                />
              </div>

              {/* Right Column: Mathematical Visualizers & Truth-Beside-Estimate (8 cols on lg) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Truth beside estimate */}
                <TruthBesideEstimate
                  readout={simulation.readout}
                  probeLabel={currentToken ? currentToken.label : `Token #${safeProbeIndex + 1}`}
                />

                {/* Bottom Row: Synaptic Heatmap + Memory Gauges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SynapticHeatmap
                    matrix={simulation.weightMatrix}
                    dimension={config.dimension}
                    frobenius={simulation.frobenius}
                  />

                  <MemoryGauges
                    fastWeightBytes={simulation.readout.fastWeightBytes}
                    kvCacheBytes={simulation.readout.kvCacheBytes}
                    sequenceLength={config.sequenceLength}
                    dimension={config.dimension}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Scientific Callout */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              [DIRECT COMPUTATION]: 100% evaluated client-side in Float64 typed arrays with real backpropagation. Zero mock animations or pre-recorded values.
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Pathway Dragon Hatchling (BDH) Reference</span>
            <button
              onClick={() => setIsSpecModalOpen(true)}
              className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Inspect Source Documents <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </main>

      {/* Specifications Viewer Modal for Devin */}
      <SpecViewerModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />
    </div>
  );
}
