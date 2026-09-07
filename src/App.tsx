import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Brain,
  FileCode2,
  Dices,
  Play,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { ExperimentConfig, ExperimentState, SweepConfig, PinnedResult } from './types';
import { runExperiment } from './lib/memoryEngine';
import { createLiveExecutionEngine, LiveState } from './lib/liveExecutionEngine';
import { queryStringToConfig } from './lib/urlState';
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
import { AlgorithmComparison } from './components/AlgorithmComparison';
import { SweepHeatmap } from './components/SweepHeatmap';
import { PinnedResults } from './components/PinnedResults';
import { SweepResults } from './components/SweepResults';
import { LiveMemoryDemo } from './components/LiveMemoryDemo';

export default function App() {
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);
  const [experimentState, setExperimentState] = useState<ExperimentState>('IDLE');
  const [autoRunEnabled, setAutoRunEnabled] = useState<boolean>(false);
  const [currentExperiment, setCurrentExperiment] = useState(1);
  const [totalExperiments] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setCurrentTotalSteps] = useState(1);
  const [currentParameter, setCurrentParameter] = useState<string>('');
  const [pinnedResults, setPinnedResults] = useState<PinnedResult[]>([]);
  const [sweepResults, setSweepResults] = useState<any>(null);
  const [speed, setSpeed] = useState(500);
  const [liveState, setLiveState] = useState<LiveState | null>(null);
  const engineRef = useRef<ReturnType<typeof createLiveExecutionEngine> | null>(null);

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

  // Load config from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString()) {
      const loadedConfig = queryStringToConfig(urlParams.toString());
      if (Object.keys(loadedConfig).length > 0) {
        setConfig(prev => ({ ...prev, ...loadedConfig } as ExperimentConfig));
      }
    }
  }, []);

  const handleRun = () => {
    setExperimentState('RUNNING');
    
    // Create fresh engine
    const engine = createLiveExecutionEngine(config);
    engineRef.current = engine;
    
    const runLoop = async () => {
      while (!engine.isPaused && !engine.isComplete) {
        const state = engine.stepForward();
        setLiveState(state);
        setCurrentStep(state.step);
        
        if (state.isComplete) {
          setExperimentState('COMPLETE');
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, speed));
      }
    };
    
    runLoop();
  };

  const handlePause = () => {
    setExperimentState('PAUSED');
    if (engineRef.current) {
      engineRef.current.pause();
    }
  };

  const handleResume = () => {
    setExperimentState('RUNNING');
    if (engineRef.current) {
      engineRef.current.resume();
      
      const engine = engineRef.current;
      const runLoop = async () => {
        while (!engine.isPaused && !engine.isComplete) {
          const state = engine.stepForward();
          setLiveState(state);
          setCurrentStep(state.step);
          
          if (state.isComplete) {
            setExperimentState('COMPLETE');
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, speed));
        }
      };
      runLoop();
    }
  };

  const handleReset = () => {
    setExperimentState('IDLE');
    setLiveState(null);
    setCurrentStep(0);
    if (engineRef.current) {
      engineRef.current.reset();
    }
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
    
    // Reset and recreate engine
    const engine = createLiveExecutionEngine(config);
    engineRef.current = engine;
    
    const runLoop = async () => {
      while (!engine.isPaused && !engine.isComplete) {
        const state = engine.stepForward();
        setLiveState(state);
        setCurrentStep(state.step);
        
        if (state.isComplete) {
          setExperimentState('COMPLETE');
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, speed));
      }
    };
    
    runLoop();
  };

  const handleStep = () => {
    if (engineRef.current) {
      const state = engineRef.current.stepForward();
      setLiveState(state);
      setCurrentStep(state.step);
      
      if (state.isComplete) {
        setExperimentState('COMPLETE');
      }
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (engineRef.current) {
      engineRef.current.setSpeed(newSpeed);
    }
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
    const newSeed = Math.floor(Math.random() * 1000000);
    setConfig(prev => ({
      ...prev,
      seed: newSeed,
    }));
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(config.seed.toString());
  };

  const handleRerunSeed = () => {
    // Keep current seed but reset experiment state
    setLiveState(null);
    setCurrentStep(0);
    if (engineRef.current) {
      engineRef.current.reset();
    }
  };

  const handleQuickResults = (results: any) => {
    setSweepResults(results);
  };

  const handlePinResult = (result: PinnedResult) => {
    setPinnedResults(prev => [...prev, result]);
  };

  const handleUnpinResult = (id: string) => {
    setPinnedResults(prev => prev.filter(r => r.id !== id));
  };

  const handleConfigChange = (newValues: Partial<ExperimentConfig>) => {
    setConfig((prev) => ({ ...prev, ...newValues } as ExperimentConfig));
  };


  const simulation = useMemo(() => {
    return runExperiment(config);
  }, [config]);

  // Use live state if available, otherwise use static simulation
  const activeReadout = liveState?.readout || simulation.readout;
  const activeMatrix = liveState?.matrix || simulation.weightMatrix;
  const activeFrobenius = liveState?.frobenius || simulation.frobenius;
  const activeAssociations = liveState ? engineRef.current?.associations || simulation.associations : simulation.associations;
  
  const safeProbeIndex = Math.min(config.probeIndex, activeAssociations.length - 1);
  const currentToken = activeAssociations[safeProbeIndex] || activeAssociations[0];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Hero Area with Central Claim */}
      <header className="border-b border-slate-800 bg-slate-900/98 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  DataForge
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  Fast Weights × KV-Cache
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
                onClick={handleCopySeed}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                aria-label="Copy seed"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Seed: {config.seed}</span>
              </button>
              <button
                onClick={handleRerunSeed}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                aria-label="Rerun with current seed"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Re-run</span>
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

          {/* Central Claim */}
          <div className="bg-gradient-to-r from-slate-950/80 to-slate-900/80 border border-slate-700/50 rounded-xl p-4 mb-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-2 py-1 rounded bg-indigo-950/50 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold">
                    O(1) LEARNED STATE
                  </div>
                  <span className="text-slate-500 font-mono text-xs">vs</span>
                  <div className="px-2 py-1 rounded bg-sky-950/50 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold">
                    O(T·d) CACHE
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Fast weights achieve <span className="text-indigo-400 font-semibold">constant memory</span> with synaptic plasticity, while KV-cache grows <span className="text-sky-400 font-semibold">linearly with sequence length</span>.
                </p>
              </div>
              <button
                onClick={handleRun}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer border border-emerald-400/30"
                aria-label="Run live experiment"
              >
                <Play className="w-4 h-4" />
                <span>RUN LIVE EXPERIMENT</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto p-4 space-y-3">
        {/* Live Metrics Bar */}
        <LiveMetricsBar
          readout={activeReadout}
          sequenceLength={config.sequenceLength}
          dimension={config.dimension}
          algorithm={config.algorithm}
          frobenius={activeFrobenius}
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
            onStep={handleStep}
            canReplay={simulation.matrixSnapshots.length > 0}
            speed={speed}
            onSpeedChange={handleSpeedChange}
          />
          <ExperimentCounter
            currentExperiment={currentExperiment}
            totalExperiments={totalExperiments}
            currentStep={liveState?.step || currentStep}
            totalSteps={liveState?.totalSteps || totalSteps}
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

        {/* Live Memory Demo */}
        <LiveMemoryDemo config={config} />

        {/* Automated Tests */}
        <AutomatedTests config={config} onConfigChange={handleConfigChange} />

        {/* Quick Experiments */}
        <QuickExperiments config={config} onResults={handleQuickResults} />

        {/* Sweep Results */}
        {sweepResults && (
          <SweepResults results={sweepResults} />
        )}

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

            <PinnedResults
              pinned={pinnedResults}
              onPin={handlePinResult}
              onUnpin={handleUnpinResult}
              currentConfig={config}
              currentReadout={activeReadout}
            />

            <ExportPanel
              config={config}
              readout={activeReadout}
              timeline={simulation.timeline}
            />
          </div>

          {/* Right Column: Visualizations (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-3">
            <TokenTimeline
              associations={activeAssociations}
              probeIndex={safeProbeIndex}
              onSelectProbe={(idx) => setConfig(prev => ({ ...prev, probeIndex: idx }))}
            />

            <TruthBesideEstimate
              readout={activeReadout}
              probeLabel={currentToken ? currentToken.label : `Token #${safeProbeIndex + 1}`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {liveState || simulation.matrixSnapshots.length > 1 ? (
                <MatrixEvolution
                  snapshots={liveState ? [liveState.matrix] : simulation.matrixSnapshots}
                  dimension={config.dimension}
                  frobenius={activeFrobenius}
                />
              ) : (
                <SynapticHeatmap
                  matrix={activeMatrix}
                  dimension={config.dimension}
                  frobenius={activeFrobenius}
                />
              )}

              <MemoryGauges
                fastWeightBytes={activeReadout.fastWeightBytes}
                kvCacheBytes={activeReadout.kvCacheBytes}
                sequenceLength={config.sequenceLength}
                dimension={config.dimension}
              />
            </div>

            <AlgorithmComparison config={config} />

            <SweepHeatmap config={config} />
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
