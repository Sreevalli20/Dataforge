import React from 'react';
import { ReadoutResult } from '../types';

interface LiveMetricsBarProps {
  readout: ReadoutResult;
  sequenceLength: number;
  dimension: number;
  algorithm: string;
  frobenius: number;
}

export const LiveMetricsBar: React.FC<LiveMetricsBarProps> = ({
  readout,
  sequenceLength,
  dimension,
  algorithm,
  frobenius,
}) => {
  const getStatusColor = (value: number, threshold: number, invert = false) => {
    if (invert) {
      return value < threshold ? 'text-emerald-400' : value < threshold * 1.5 ? 'text-amber-400' : 'text-rose-400';
    }
    return value >= threshold ? 'text-emerald-400' : value >= threshold * 0.7 ? 'text-amber-400' : 'text-rose-400';
  };

  const memoryRatio = (readout.kvCacheBytes / readout.fastWeightBytes).toFixed(2);

  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-6 overflow-x-auto text-xs font-mono">
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-slate-400">Cosine:</span>
        <span className={`font-bold ${getStatusColor(readout.cosineSimilarity, 0.85)}`}>
          {readout.cosineSimilarity.toFixed(4)}
        </span>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-slate-400">L2 Err:</span>
        <span className={`font-bold ${getStatusColor(readout.l2Error, 0.2, true)}`}>
          {readout.l2Error.toFixed(4)}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-slate-400">Crosstalk:</span>
        <span className={`font-bold ${getStatusColor(readout.crosstalkResidualNorm, 0.3, true)}`}>
          {readout.crosstalkResidualNorm.toFixed(4)}
        </span>
      </div>

      <div className="w-px h-4 bg-slate-700 flex-shrink-0" />

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-slate-400">FW Mem:</span>
        <span className="font-bold text-indigo-400">{readout.fastWeightBytes} B</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-slate-400">KV Mem:</span>
        <span className="font-bold text-sky-400">{readout.kvCacheBytes} B</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-slate-400">Ratio:</span>
        <span className="font-bold text-amber-400">{memoryRatio}×</span>
      </div>

      <div className="w-px h-4 bg-slate-700 flex-shrink-0" />

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-slate-400">N:</span>
        <span className="font-bold text-white">{sequenceLength}</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-slate-400">d:</span>
        <span className="font-bold text-white">{dimension}</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-slate-400">‖M‖_F:</span>
        <span className="font-bold text-violet-400">{frobenius.toFixed(3)}</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-slate-400">Algo:</span>
        <span className="font-bold text-cyan-400 uppercase">{algorithm}</span>
      </div>
    </div>
  );
};
