import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Brain,
  AlertTriangle,
  Play,
  Pause,
  StepForward,
  RotateCcw,
  FastForward,
  Activity,
} from 'lucide-react';
import {
  NeuralNetwork,
  ActivationType,
  generateDataset,
  TrainingSample,
} from '../lib/neuralNetwork';
import { NetworkArchitectureVisualizer } from './NetworkArchitectureVisualizer';
import { WeightMatrixInspector } from './WeightMatrixInspector';
import { ActivationFunctionComparator } from './ActivationFunctionComparator';
import { GradientFlowLab } from './GradientFlowLab';
import { DecisionBoundaryCanvas } from './DecisionBoundaryCanvas';
import { GradientHistogram } from './GradientHistogram';
import { GradientFlowInspector } from './GradientFlowInspector';

export const NeuralNetworkLab: React.FC = () => {
  // Navigation sub-tab inside the Lab
  const [labTab, setLabTab] = useState<'weights' | 'flow' | 'failure'>('weights');

  // Network Configuration State
  const [depth, setDepth] = useState<number>(3); // 3 hidden layers = 4 weight matrices
  const [activation, setActivation] = useState<ActivationType>('relu');
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [selectedLayerIdx, setSelectedLayerIdx] = useState<number>(0);
  const [stepCount, setStepCount] = useState<number>(0);

  // Failure Mode Parameters
  const [failureDepth, setFailureDepth] = useState<number>(8);
  const [failureActivation, setFailureActivation] = useState<ActivationType>('sigmoid');
  const [failureInitScale, setFailureInitScale] = useState<number>(1.0);

  // Dataset State
  const [selectedDataset, setSelectedDataset] = useState<'circles' | 'moons' | 'xor' | 'spiral'>('circles');
  const [dataset, setDataset] = useState<TrainingSample[]>(() => generateDataset('circles', 100));

  // Helper to construct layer sizes from depth
  const buildLayerSizes = (numHidden: number) => {
    const sizes = [2];
    for (let i = 0; i < numHidden; i++) {
      sizes.push(6);
    }
    sizes.push(1);
    return sizes;
  };

  // Training & Network State
  const [network, setNetwork] = useState<NeuralNetwork>(() => {
    return new NeuralNetwork({
      layerSizes: buildLayerSizes(3),
      activation: 'relu',
      learningRate: 0.1,
      weightInitScale: 1.0,
    });
  });

  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainTrigger, setTrainTrigger] = useState<number>(0);

  // Animation frame ref for training loop
  const animFrameRef = useRef<number | null>(null);

  // Change dataset
  const handleDatasetChange = (type: 'circles' | 'moons' | 'xor' | 'spiral') => {
    setSelectedDataset(type);
    setDataset(generateDataset(type, 100));
  };

  // Reset Network
  const handleResetNetwork = useCallback(() => {
    setIsTraining(false);
    const newNet = new NeuralNetwork({
      layerSizes: buildLayerSizes(depth),
      activation,
      learningRate,
      weightInitScale: 1.0,
    });
    setNetwork(newNet);
    setLossHistory([]);
    setSelectedLayerIdx(0);
    setStepCount(0);
  }, [depth, activation, learningRate]);

  // Update depth
  const handleDepthChange = (newDepth: number) => {
    setDepth(newDepth);
    setIsTraining(false);
    const newNet = new NeuralNetwork({
      layerSizes: buildLayerSizes(newDepth),
      activation,
      learningRate,
      weightInitScale: 1.0,
    });
    setNetwork(newNet);
    setLossHistory([]);
    setSelectedLayerIdx(0);
  };

  // Update activation function
  const handleSelectActivation = (act: ActivationType) => {
    setActivation(act);
    setIsTraining(false);
    const newNet = new NeuralNetwork({
      layerSizes: buildLayerSizes(depth),
      activation: act,
      learningRate,
      weightInitScale: 1.0,
    });
    setNetwork(newNet);
    setLossHistory([]);
  };

  // Step training once (Single Backpropagation Pass)
  const handleStepTraining = useCallback(() => {
    const { avgLoss } = network.trainBatch(dataset);
    setLossHistory((prev) => [...prev.slice(-100), avgLoss]);
    setTrainTrigger((prev) => prev + 1);
    setStepCount((prev) => prev + 1);
  }, [network, dataset]);

  // Step training multiple times
  const handleStepMultiple = (steps = 10) => {
    for (let i = 0; i < steps; i++) {
      handleStepTraining();
    }
  };

  // Continuous training loop
  useEffect(() => {
    if (!isTraining) return;

    let active = true;
    const loop = () => {
      if (!active) return;
      handleStepTraining();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isTraining, handleStepTraining]);

  // Ensure selectedLayerIdx is valid
  const safeLayerIdx = Math.min(selectedLayerIdx, network.layers.length - 1);
  const activeLayer = network.layers[safeLayerIdx] || network.layers[0];

  return (
    <div className="space-y-4">
      {/* Top Primary Control & Mode Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setLabTab('weights')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              labTab === 'weights'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Weight Matrix & Architecture</span>
          </button>

          <button
            onClick={() => setLabTab('flow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              labTab === 'flow'
                ? 'bg-sky-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Gradient Flow Inspector</span>
          </button>

          <button
            onClick={() => setLabTab('failure')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              labTab === 'failure'
                ? 'bg-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Vanishing/Exploding Lab</span>
          </button>
        </div>

        {/* Granular Training Controls (Step, Pause, Play, Reset) */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Step Counter Badge */}
          <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
            Pass: <strong className="text-amber-400 font-bold">#{stepCount}</strong>
          </div>

          {/* Pause / Play Button */}
          <button
            onClick={() => setIsTraining(!isTraining)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shadow ${
              isTraining
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
            title={isTraining ? 'Pause Training' : 'Start Continuous Training'}
          >
            {isTraining ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isTraining ? 'Pause' : 'Train'}</span>
          </button>

          {/* Granular Step (1 Pass) Button */}
          <button
            onClick={handleStepTraining}
            disabled={isTraining}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-700"
            title="Perform 1 Backpropagation Pass for granular inspection"
          >
            <StepForward className="w-3.5 h-3.5 text-amber-400" />
            <span>Step (1 Pass)</span>
          </button>

          {/* Step (10 Passes) Button */}
          <button
            onClick={() => handleStepMultiple(10)}
            disabled={isTraining}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-700"
            title="Perform 10 Backpropagation Passes"
          >
            <FastForward className="w-3.5 h-3.5 text-slate-400" />
            <span>+10</span>
          </button>

          {/* Reset Network Weights */}
          <button
            onClick={handleResetNetwork}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-700"
            title="Reset Network Weights & History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {labTab === 'weights' && (
        <div className="space-y-4">
          {/* Architecture Visualizer */}
          <NetworkArchitectureVisualizer
            layers={network.layers}
            selectedLayerIndex={safeLayerIdx}
            onSelectLayer={(idx) => setSelectedLayerIdx(idx)}
            inputDim={2}
          />

          {/* 2-Column Layout: Weight Inspector & 2D Decision Space */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Weight Matrix Heatmap & Synapse Inspector (7 cols) */}
            <div className="lg:col-span-7">
              <WeightMatrixInspector
                layer={activeLayer}
                learningRate={learningRate}
                key={`${safeLayerIdx}-${trainTrigger}`}
              />
            </div>

            {/* Decision Space & Loss Curve (5 cols) */}
            <div className="lg:col-span-5">
              <DecisionBoundaryCanvas
                network={network}
                dataset={dataset}
                lossHistory={lossHistory}
                isTraining={isTraining}
                onToggleTraining={() => setIsTraining(!isTraining)}
                onStepTraining={handleStepTraining}
                onResetNetwork={handleResetNetwork}
                onDatasetChange={handleDatasetChange}
                selectedDataset={selectedDataset}
                learningRate={learningRate}
                onLearningRateChange={(lr) => {
                  setLearningRate(lr);
                  network.config.learningRate = lr;
                }}
              />
            </div>
          </div>

          {/* Real-Time Histogram Component for Gradient Distribution */}
          <GradientHistogram
            layers={network.layers}
            selectedLayerIndex={safeLayerIdx}
          />

          {/* Activation Function Comparison Section with Live Derivative Plot */}
          <ActivationFunctionComparator
            currentActivation={activation}
            onSelectActivation={handleSelectActivation}
          />
        </div>
      )}

      {labTab === 'flow' && (
        <div className="space-y-4">
          {/* Dedicated Gradient Flow Inspector Panel */}
          <GradientFlowInspector
            layers={network.layers}
            currentDepth={depth}
            onDepthChange={handleDepthChange}
            currentActivation={activation}
            onActivationChange={handleSelectActivation}
          />

          {/* Real-Time Histogram Component for Gradient Distribution */}
          <GradientHistogram
            layers={network.layers}
            selectedLayerIndex={safeLayerIdx}
          />

          {/* Activation Function Comparison Section with Live Derivative Plot */}
          <ActivationFunctionComparator
            currentActivation={activation}
            onSelectActivation={handleSelectActivation}
          />
        </div>
      )}

      {labTab === 'failure' && (
        /* Failure Case Lab: Vanishing & Exploding Gradients */
        <GradientFlowLab
          depth={failureDepth}
          onDepthChange={setFailureDepth}
          activation={failureActivation}
          onActivationChange={setFailureActivation}
          initScale={failureInitScale}
          onInitScaleChange={setFailureInitScale}
        />
      )}
    </div>
  );
};
