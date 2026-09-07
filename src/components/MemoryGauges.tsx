import React from 'react';
import { Database, Zap } from 'lucide-react';

interface MemoryGaugesProps {
  fastWeightBytes: number;
  kvCacheBytes: number;
  sequenceLength: number;
  dimension: number;
}

export const MemoryGauges: React.FC<MemoryGaugesProps> = ({
  fastWeightBytes,
  kvCacheBytes,
  sequenceLength: N,
  dimension: d,
}) => {
  // Crossover point: 2 * N * d * 4 > d * d * 4 => N > d / 2
  const crossoverN = Math.floor(d / 2);
  const isPastCrossover = N > crossoverN;
  const memoryRatio = (kvCacheBytes / fastWeightBytes).toFixed(2);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Memory Footprint Scaling: <span className="text-indigo-400 font-mono">O(1) vs. O(T·d)</span>
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Crossover Point: <strong className="text-amber-400 font-bold">N &gt; {crossoverN} tokens</strong>
        </div>
      </div>

      {/* Side-by-side memory meters */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Fast Weights meter */}
        <div className="bg-slate-950 p-3 rounded-lg border border-indigo-900/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-indigo-300 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Fast Weights (Recurrent)
            </span>
            <span className="font-mono text-indigo-400 font-bold">O(1) Constant</span>
          </div>
          <div className="text-xl font-mono font-bold text-white mb-1">
            {fastWeightBytes.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">Bytes</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {d} × {d} matrix = {d * d} floats (invariant to context length)
          </div>
        </div>

        {/* KV-Cache meter */}
        <div className="bg-slate-950 p-3 rounded-lg border border-sky-900/40">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-sky-300 font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              KV-Cache (Transformer)
            </span>
            <span className="font-mono text-sky-400 font-bold">O(T·d) Linear</span>
          </div>
          <div className="text-xl font-mono font-bold text-white mb-1">
            {kvCacheBytes.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">Bytes</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            2 × {N} tokens × {d} dims × 4 bytes = {2 * N * d} floats
          </div>
        </div>
      </div>

      {/* Comparison verdict strip */}
      <div
        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between font-mono ${
          isPastCrossover
            ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-200'
            : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}
      >
        <span>
          Current Context Ratio: KV-cache is{' '}
          <strong className="text-amber-300 font-bold">{memoryRatio}×</strong> the size of Fast Weights state.
        </span>
        <span className="text-[10px] text-slate-400">
          At T=4,096 tokens, KV-cache requires {(2 * 4096 * d * 4 / 1024).toFixed(1)} KB vs Fast Weights 1 KB.
        </span>
      </div>
    </div>
  );
};
