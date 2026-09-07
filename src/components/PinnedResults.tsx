import { memo } from 'react';
import { Pin, X, Copy } from 'lucide-react';
import { PinnedResult, ExperimentConfig, ReadoutResult } from '../types';

interface PinnedResultsProps {
  pinned: PinnedResult[];
  onPin: (result: PinnedResult) => void;
  onUnpin: (id: string) => void;
  currentConfig: ExperimentConfig;
  currentReadout: ReadoutResult;
}

export const PinnedResults = memo<PinnedResultsProps>(({
  pinned,
  onPin,
  onUnpin,
  currentConfig,
  currentReadout,
}) => {
  const canPin = pinned.length < 3;

  const handlePinCurrent = () => {
    if (!canPin) return;
    
    const newPin: PinnedResult = {
      id: `pin-${Date.now()}`,
      config: { ...currentConfig },
      readout: { ...currentReadout },
      timestamp: Date.now(),
      label: `Exp ${pinned.length + 1}`,
    };
    onPin(newPin);
  };

  const copyPinnedData = (pin: PinnedResult) => {
    const data = {
      label: pin.label,
      config: pin.config,
      results: {
        cosineSimilarity: pin.readout.cosineSimilarity,
        l2Error: pin.readout.l2Error,
        classificationMatch: pin.readout.classificationMatch,
      },
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  if (pinned.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Pinned Results
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">0/3</span>
        </div>

        <button
          onClick={handlePinCurrent}
          disabled={!canPin}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-mono text-slate-300 transition-all cursor-pointer"
          aria-label="Pin current result"
        >
          <Pin className="w-3.5 h-3.5" />
          <span>Pin Current Result</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Pinned Results
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{pinned.length}/3</span>
      </div>

      <div className="space-y-2 mb-3">
        {pinned.map((pin) => (
          <div key={pin.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 font-mono">{pin.label}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyPinnedData(pin)}
                  className="p-1 text-slate-五百 hover:text-white transition-colors cursor-pointer"
                  aria-label="Copy pinned data"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onUnpin(pin.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  aria-label="Unpin result"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
              <div>
                <span className="text-slate-500">Algo:</span> {pin.config.algorithm}
              </div>
              <div>
                <span className="text-slate-500">N:</span> {pin.config.sequenceLength}
              </div>
              <div>
                <span className="text-slate-500">θ:</span> {pin.config.correlationAngleDeg}°
              </div>
              <div>
                <span className="text-slate-500">Cos:</span> {pin.readout.cosineSimilarity.toFixed(3)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {canPin && (
        <button
          onClick={handlePinCurrent}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800 rounded-lg text-xs font-mono text-slate-300 transition-all cursor-pointer"
          aria-label="Pin current result"
        >
          <Pin className="w-3.5 h-3.5" />
          <span>Pin Current Result</span>
        </button>
      )}
    </div>
  );
});
