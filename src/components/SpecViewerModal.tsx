import React, { useState } from 'react';
import { BookOpen, X, FileText, Check, Copy } from 'lucide-react';

interface SpecViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPEC_FILES = [
  { id: '01', title: 'PROJECT_SPEC.md', subtitle: 'Architecture & Falsifiable Claim' },
  { id: '02', title: 'CORE_MODEL.md', subtitle: 'Linear Algebra & Plasticity Equations' },
  { id: '03', title: 'INTERACTION_SPEC.md', subtitle: 'Control-to-Computation Mappings' },
  { id: '04', title: 'BDH_INTEGRATION.md', subtitle: 'Pathway Dragon Hatchling Connection' },
  { id: '05', title: 'UI_SPEC.md', subtitle: 'Screen-by-Screen Guided Flow' },
  { id: '06', title: 'VISUALIZATION_SPEC.md', subtitle: 'Mathematical Data-to-Pixel Spec' },
  { id: '07', title: 'TEST_SPEC.md', subtitle: 'Invariant & Benchmark Tests' },
  { id: '08', title: 'IMPLEMENTATION_PLAN.md', subtitle: 'Phased Devin Roadmap' },
  { id: '09', title: 'SOURCES_FOR_IMPLEMENTATION.md', subtitle: 'Primary Papers & Reports' },
];

export const SpecViewerModal: React.FC<SpecViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState(SPEC_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`/${selectedFile.title}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Technical Source of Truth Files for Devin
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  DataForge 2026 Pathway Track
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                All 9 specification documents are persisted in the root repository.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Sidebar + Viewer */}
        <div className="flex-1 flex overflow-hidden">
          {/* File list sidebar */}
          <div className="w-80 border-r border-slate-800 bg-slate-950/50 p-3 overflow-y-auto space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 tracking-wider font-mono">
              9 Required Technical Specs
            </div>
            {SPEC_FILES.map((file) => {
              const isSelected = file.title === selectedFile.title;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-amber-950/60 border border-amber-500/50 text-amber-300 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-bold text-slate-200">{file.title}</div>
                    <div className="text-[11px] text-slate-400 font-sans">{file.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Content Preview */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="font-mono text-xs text-slate-300">
                Path: <strong className="text-amber-300">/{selectedFile.title}</strong>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Path Copied' : 'Copy File Path'}</span>
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed text-slate-300 space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300">
                <div className="text-sm font-bold text-white mb-2 pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span>{selectedFile.title} — {selectedFile.subtitle}</span>
                  <span className="text-xs text-emerald-400 font-mono">FILE PERSISTED</span>
                </div>
                <p className="text-slate-400 font-sans text-xs mb-3">
                  This file has been created at the root of the project repository as the definitive blueprint for Devin.
                  You can inspect the contents in the workspace or review the live interactive implementation running on the main screen.
                </p>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-2">
                  <div>
                    <strong className="text-slate-200">Central Focus:</strong>{' '}
                    Strictly respects the frontier AI mandate for real client-side computation, mathematical rigor, and truthful failure boundary exploration.
                  </div>
                  <div>
                    <strong className="text-slate-200">Key Subsystems:</strong>{' '}
                    Linear Algebra Float64 Engine, Fast Weights Hebbian & Delta Update, KV-Cache Multi-Head Attention, and Dragon Hatchling (BDH) Dale non-negative sparse plasticity.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Ready for Devin autonomous implementation & review</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
