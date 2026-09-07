import React from 'react';
import { CheckCircle2, AlertTriangle, Crosshair } from 'lucide-react';
import { ReadoutResult } from '../types';

interface TruthBesideEstimateProps {
  readout: ReadoutResult;
  probeLabel: string;
}

export const TruthBesideEstimate: React.FC<TruthBesideEstimateProps> = ({
  readout,
  probeLabel,
}) => {
  const {
    groundTruth: gt,
    fastWeightEstimate: fw,
    kvCacheEstimate: kv,
    cosineSimilarity: cosSim,
    l2Error,
    classificationMatch,
  } = readout;

  const d = gt.length;
  const isHighFidelity = cosSim >= 0.85;
  const isSevereCrosstalk = cosSim < 0.65;

  let maxCoordDiff = 0;
  for (let i = 0; i < d; i++) {
    const diff = Math.abs((gt[i] || 0) - (fw[i] || 0));
    if (diff > maxCoordDiff) maxCoordDiff = diff;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Truth Beside Estimate — Probing <span className="text-emerald-400 font-mono">{probeLabel}</span>
          </h3>
        </div>

        {/* Verdict Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            classificationMatch && isHighFidelity
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
              : isSevereCrosstalk
              ? 'bg-rose-950/80 text-rose-300 border border-rose-700/50 animate-pulse'
              : 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
          }`}
        >
          {classificationMatch && isHighFidelity ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exact Association Recall</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Crosstalk Interference</span>
            </>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            Cosine Fidelity
          </div>
          <div
            className={`text-lg font-mono font-bold ${
              cosSim >= 0.9
                ? 'text-emerald-400'
                : cosSim >= 0.7
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {cosSim.toFixed(4)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Target: 1.0000</div>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            L2 Recon Error
          </div>
          <div
            className={`text-lg font-mono font-bold ${
              l2Error < 0.2
                ? 'text-emerald-400'
                : l2Error < 0.5
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {l2Error.toFixed(4)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">‖v* - v̂‖₂</div>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            Transformer KV
          </div>
          <div className="text-lg font-mono font-bold text-sky-400">
            {readout.kvCosineSimilarity.toFixed(4)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Softmax Baseline</div>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            State Scaling
          </div>
          <div className="text-lg font-mono font-bold text-indigo-400">O(1)</div>
          <div className="text-[10px] text-slate-500 font-mono">{readout.fastWeightBytes} bytes</div>
        </div>
      </div>

      {/* Vector Component Visualizer */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-500 inline-block" />
              <span>Ground Truth v*</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              <span>Fast Weights v̂_FW</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
              <span>KV-Cache v̂_KV</span>
            </span>
          </div>
          <span>Dim: {d}</span>
        </div>

        {/* Bar comparison graph */}
        <div className="h-28 flex items-end gap-1.5 pt-2 px-1 border-b border-slate-800">
          {Array.from({ length: d }).map((_, i) => {
            const targetVal = gt[i] || 0;
            const fwVal = fw[i] || 0;
            const diff = Math.abs(targetVal - fwVal);
            const isDiscrepant = diff > 0.15;

            // Height mapping: from 0 to 100%
            const targetHeightPct = Math.min(100, Math.abs(targetVal) * 100);
            const fwHeightPct = Math.min(100, Math.abs(fwVal) * 100);

            return (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end items-center h-full relative group"
                title={`Dim ${i}: Target=${targetVal.toFixed(3)} | FW=${fwVal.toFixed(3)} | Diff=${diff.toFixed(3)}`}
              >
                {/* Ground truth ghost bar */}
                <div
                  className="w-full absolute bottom-0 bg-slate-700/60 border border-slate-500/40 rounded-t-[2px]"
                  style={{ height: `${targetHeightPct}%` }}
                />
                {/* Fast Weight predicted bar */}
                <div
                  className={`w-3/4 z-10 rounded-t-[2px] transition-all ${
                    isDiscrepant ? 'bg-rose-500/90' : 'bg-emerald-400/90'
                  }`}
                  style={{ height: `${fwHeightPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Residual Discrepancy Strip */}
        <div className="mt-2 pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Coordinate Residual: |v*_j - v̂_j|</span>
          <span className="text-slate-400">
            Max coordinate discrepancy:{' '}
            <strong className="text-amber-400">
              {maxCoordDiff.toFixed(3)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
