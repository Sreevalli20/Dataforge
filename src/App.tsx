import { useState, useMemo, useCallback } from 'react';
import {
  Brain,
  FileCode2,
  Dices,
} from 'lucide-react';
import { ExperimentConfig, ExperimentState, SweepConfig } from './types';
import { runExperiment } from './lib/memoryEngine';
import { SynapticHeatmap } from './components/SynapticHeatmap';
import { TruthBesideEstimate } from './components/TruthBesideEstimate';
import { MemoryGauges } from './components/MemoryGauges';
import { CrosstalkGraph } from './components/CrosstalkGraph';
import { TokenTimeline } from './components/TokenTimeline';
import { ControlsPanel } from './components/ControlsPanel';
import { SpecViewerModal } from './components/SpecViewerModal';
import { LiveMetricsBar } from './components/LiveMetricsBar';
import { ExperimentControls } from './components/ExperimentControls';
import { ExperimentCounter } from './components/ExperimentCounter';
import { AutoRunPanel } from './components/AutoRunPanel';
import { MatrixEvolution } from './components/MatrixEvolution';
import { PresetExperiments } from './components/PresetExperiments';
import { QuickExperiments } from './components/QuickExperiments';
import { ExportPanel } from './components/ExportPanel';

export default function App() {
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);
  const [experimentState, setExperimentState] = useState<ExperimentState>('IDLE');
  const [autoRunEnabled, setAutoRunEnabled] = useState<boolean>(false);
  const [currentExperiment, setCurrentExperiment] = useState(1);
  const [totalExperiments] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setCurrentTotalSteps] = useState(1);
  const [currentParameter, setCurrentParameter] = useState<string>('');

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

  const handleRun = () => {
    setExperimentState('RUNNING');
    setTimeout(() => {
      setExperimentState('COMPLETE');
    }, 500);
  };

  const handlePause = () => {
    setExperimentState('PAUSED');
  };

  const handleResume = () => {
    setExperimentState('RUNNING');
  };

  const handleReset = () => {
    setExperimentState('IDLE');
    setConfig({
      dimension: 16,
      sequenceLength: 1,
      correlationAngleDeg: 90,
      algorithm: 'hebbian',
      decay: 1.0,
      learningRate: 1.0,
      probeIndex: 0,
      seed: 42,
    });
  };

  const handleReplay = () => {
    setExperimentState('RUNNING');
    setCurrentStep(0);
    setTimeout(() => {
      setExperimentState('COMPLETE');
    }, 500);
  };

  const handleRunSweep = useCallback((sweepConfig: SweepConfig) => {
    setExperimentState('RUNNING');
    setCurrentExperiment(1);
    const steps = Math.floor((sweepConfig.end - sweepConfig.start) / sweepConfig.step) + 1;
    setCurrentTotalSteps(steps);
    setCurrentStep(0);
    setCurrentParameter(`${sweepConfig.parameter}: ${sweepConfig.start}`);

    let step = 0;
    const interval = setInterval(() => {
      if (step >= steps) {
        clearInterval(interval);
        setExperimentState('COMPLETE');
        return;
      }
      step++;
      setCurrentStep(step);
      const paramValue = sweepConfig.start + (step - 1) * sweepConfig.step;
      setCurrentParameter(`${sweepConfig.parameter}: ${paramValue.toFixed(1)}`);
    }, 300);
  }, []);

  const handleLoadPreset = (presetConfig: ExperimentConfig) => {
    setConfig(presetConfig);
    setExperimentState('IDLE');
  };

  const handleRandomExperiment = () => {
    setConfig(prev => ({
      ...prev,
      seed: Math.floor(Math.random() * 100000),
    }));
  };

  const handleQuickResults = (results: any) => {
    console.log('Quick experiment results:', results);
  };

  const handleConfigChange = (newValues: Partial<ExperimentConfig>) => {
    setConfig((prev) => ({ ...prev, ...newValues } as ExperimentConfig));
  };


  const simulation = useMemo(() => {
    return runExperiment(config);
  }, [config]);

  const safeProbeIndex = Math.min(config.probeIndex, simulation.associations.length - 1);
  const currentToken = simulation.associations[safeProbeIndex] || simulation.associations[0];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-40 px-4 py-3">
        <div className="max-w-full mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                DataForge
              </h1>
              <p className="text-xs text-slate-400">
                Fast Weights vs KV-Cache
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomExperiment}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              aria-label="Generate random experiment"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>Random</span>
            </button>
            <button
              onClick={() => setIsSpecModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              aria-label="Open technical specifications modal"
            >
              <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Specs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto p-4 space-y-3">
        {/* Live Metrics Bar */}
        <LiveMetricsBar
          readout={simulation.readout}
          sequenceLength={config.sequenceLength}
          dimension={config.dimension}
          algorithm={config.algorithm}
          frobenius={simulation.frobenius}
        />

        {/* Experiment Controls & Counter */}
        <div className="flex items-center gap-3 flex-wrap">
          <ExperimentControls
            state={experimentState}
            onRun={handleRun}
            onPause={handlePause}
            onResume={handleResume}
            onReset={handleReset}
            onReplay={handleReplay}
            canReplay={simulation.matrixSnapshots.length > 0}
          />
          <ExperimentCounter
            currentExperiment={currentExperiment}
            totalExperiments={totalExperiments}
            currentStep={currentStep}
            totalSteps={totalSteps}
            currentParameter={currentParameter}
            state={experimentState}
          />
          <AutoRunPanel
            isEnabled={autoRunEnabled}
            onToggle={setAutoRunEnabled}
            onRunSweep={handleRunSweep}
            isRunning={experimentState === 'RUNNING'}
          />
        </div>

        {/* Preset Experiments */}
        <PresetExperiments onLoadPreset={handleLoadPreset} />

        {/* Quick Experiments */}
        <QuickExperiments config={config} onResults={handleQuickResults} />

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left Column: Controls & Quick Experiments (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-3">
            <ControlsPanel
              config={config}
              onChangeConfig={handleConfigChange}
              onReset={handleReset}
              highlightedControls={[]}
            />

            <CrosstalkGraph
              fidelityCurve={simulation.fidelityCurve}
              currentAngle={config.correlationAngleDeg}
            />

            <ExportPanel
              config={config}
              readout={simulation.readout}
              timeline={simulation.timeline}
            />
          </div>

          {/* Right Column: Visualizations (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-3">
            <TokenTimeline
              associations={simulation.associations}
              probeIndex={safeProbeIndex}
              onSelectProbe={(idx) => setConfig(prev => ({ ...prev, probeIndex: idx }))}
            />

            <TruthBesideEstimate
              readout={simulation.readout}
              probeLabel={currentToken ? currentToken.label : `Token #${safeProbeIndex + 1}`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {simulation.matrixSnapshots.length > 1 ? (
                <MatrixEvolution
                  snapshots={simulation.matrixSnapshots}
                  dimension={config.dimension}
                  frobenius={simulation.frobenius}
                />
              ) : (
                <SynapticHeatmap
                  matrix={simulation.weightMatrix}
                  dimension={config.dimension}
                  frobenius={simulation.frobenius}
                />
              )}

              <MemoryGauges
                fastWeightBytes={simulation.readout.fastWeightBytes}
                kvCacheBytes={simulation.readout.kvCacheBytes}
                sequenceLength={config.sequenceLength}
                dimension={config.dimension}
              />
            </div>
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
