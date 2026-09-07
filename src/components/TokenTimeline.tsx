import React from 'react';
import { TokenAssociation } from '../types';
import { KeyRound } from 'lucide-react';

interface TokenTimelineProps {
  associations: TokenAssociation[];
  probeIndex: number;
  onSelectProbe: (idx: number) => void;
}

export const TokenTimeline: React.FC<TokenTimelineProps> = ({
  associations,
  probeIndex,
  onSelectProbe,
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
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-left transition-all cursor-pointer font-mono ${
                isProbed
                  ? 'bg-emerald-950/90 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
              role="listitem"
              aria-label={`${assoc.label}, ${weightPct}% retained weight${isProbed ? ', currently probed' : ''}`}
              aria-pressed={isProbed}
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-bold">{assoc.label}</span>
                {isProbed && (
                  <span className="text-[10px] bg-emerald-500 text-slate-950 px-1 rounded font-sans font-semibold">
                    PROBE
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between gap-2 mt-0.5">
                <span>k_{assoc.index + 1} → v_{assoc.index + 1}</span>
                <span className={`${weightPct < 90 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {weightPct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
