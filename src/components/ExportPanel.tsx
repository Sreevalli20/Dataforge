import React from 'react';
import { Download, Copy, Share2 } from 'lucide-react';
import { ExperimentConfig, ReadoutResult } from '../types';
import { getShareableURL } from '../lib/urlState';

interface ExportPanelProps {
  config: ExperimentConfig;
  readout: ReadoutResult;
  timeline: any[];
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  config,
  readout,
  timeline,
}) => {
  const exportJSON = () => {
    const data = {
      config,
      readout: {
        cosineSimilarity: readout.cosineSimilarity,
        l2Error: readout.l2Error,
        kvCosineSimilarity: readout.kvCosineSimilarity,
        kvL2Error: readout.kvL2Error,
        classificationMatch: readout.classificationMatch,
        fastWeightBytes: readout.fastWeightBytes,
        kvCacheBytes: readout.kvCacheBytes,
        crosstalkResidualNorm: readout.crosstalkResidualNorm,
      },
      timeline: timeline.map(t => ({
        tokenIndex: t.tokenIndex,
        error: t.error,
        cosineSimilarity: t.cosineSimilarity,
      })),
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataforge-experiment-${config.seed}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['TokenIndex', 'CosineSimilarity', 'L2Error', 'KV-Cosine', 'KV-L2Error'];
    const rows = timeline.map(t => [
      t.tokenIndex,
      t.cosineSimilarity.toFixed(6),
      t.error.toFixed(6),
      readout.kvCosineSimilarity.toFixed(6),
      readout.kvL2Error.toFixed(6),
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataforge-experiment-${config.seed}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyConfig = () => {
    const configStr = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(configStr);
  };

  const copySummary = () => {
    const summary = `DataForge Experiment Summary
==========================
Algorithm: ${config.algorithm}
Dimension: ${config.dimension}
Sequence Length: ${config.sequenceLength}
Correlation Angle: ${config.correlationAngleDeg}°
Learning Rate: ${config.learningRate}
Decay: ${config.decay}
Seed: ${config.seed}

Results:
Cosine Similarity: ${readout.cosineSimilarity.toFixed(6)}
L2 Error: ${readout.l2Error.toFixed(6)}
Classification Match: ${readout.classificationMatch}
Fast Weight Memory: ${readout.fastWeightBytes} bytes
KV Cache Memory: ${readout.kvCacheBytes} bytes
Memory Ratio: ${(readout.kvCacheBytes / readout.fastWeightBytes).toFixed(2)}×
`;
    navigator.clipboard.writeText(summary);
  };

  const shareURL = () => {
    const url = getShareableURL(config);
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3">
        Export & Share
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={exportJSON}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 rounded-lg text-xs font-mono text-slate-300 transition-all cursor-pointer"
          aria-label="Export as JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </button>

        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 rounded-lg text-xs font-mono text-slate-300 transition-all cursor-pointer"
          aria-label="Export as CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={copyConfig}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 rounded-lg text-xs font-mono text-slate-300 transition-all cursor-pointer"
          aria-label="Copy configuration"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Config</span>
        </button>

        <button
          onClick={copySummary}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 rounded-lg text-xs font-mono text-slate-300 transition-all cursor-pointer"
          aria-label="Copy result summary"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Summary</span>
        </button>

        <button
          onClick={shareURL}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 rounded-lg text-xs font-mono text-slate-300 transition-all cursor-pointer"
          aria-label="Copy shareable URL"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share URL</span>
        </button>
      </div>
    </div>
  );
};
