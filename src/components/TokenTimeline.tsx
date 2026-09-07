import React from 'react';
import { TokenAssociation, ReadoutResult } from '../types';
import { KeyRound, Eye, CheckCircle, XCircle } from 'lucide-react';

interface TokenTimelineProps {
  associations: TokenAssociation[];
  probeIndex: number;
  onSelectProbe: (idx: number) => void;
  readout?: ReadoutResult | null;
}

export const TokenTimeline: React.FC<TokenTimelineProps> = ({
  associations,
  probeIndex,
  onSelectProbe,
  readout,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-semibold text-slate-200">
            Token Association Sequence <span className="font-mono text-slate-400">({associations.length} Stored)</span>
          </h4>
        </div>
        <span className="text-[11px] text-slate-400">Click any token to probe its associative recall</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin" role="list" aria-label="Token association sequence">
        {associations.map((assoc) => {
          const isProbed = assoc.index === probeIndex;
          const weightPct = Math.round(assoc.retainedWeight * 100);

          return (
            <button
              key={assoc.index}
              onClick={() => onSelectProbe(assoc.index)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg border text-left transition-all cursor-pointer font-mono min-w-[140px] ${
                isProbed
                  ? 'bg-emerald-950/90 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
              role="listitem"
              aria-label={`${assoc.label}, ${weightPct}% retained weight${isProbed ? ', currently probed' : ''}`}
              aria-pressed={isProbed}
            >
              <div className="flex items-center justify-between gap-2 text-xs mb-1">
                <span className="font-bold">{assoc.label}</span>
                {isProbed && (
                  <Eye className="w-3 h-3 text-emerald-400" />
                )}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between gap-2">
                <span>k→v</span>
                <span className={`${weightPct < 90 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {weightPct}%
                </span>
              </div>
              {isProbed && readout && (
                <div className="mt-1.5 pt-1.5 border-t border-emerald-500/30">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Cos:</span>
                    <span className={`font-bold ${readout.cosineSimilarity >= 0.95 ? 'text-emerald-400' : readout.cosineSimilarity >= 0.8 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {readout.cosineSimilarity.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-0.5">
                    <span className="text-slate-400">L2:</span>
                    <span className="text-slate-300">{readout.l2Error.toFixed(3)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-0.5">
                    <span className="text-slate-400">Match:</span>
                    {readout.classificationMatch ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-400" />
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
