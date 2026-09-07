import React from 'react';
import { Activity } from 'lucide-react';
import { CurvePoint } from '../types';

interface CrosstalkGraphProps {
  fidelityCurve: CurvePoint[];
  currentAngle: number;
}

export const CrosstalkGraph: React.FC<CrosstalkGraphProps> = ({
  fidelityCurve,
  currentAngle,
}) => {
  // SVG Dimensions
  const width = 360;
  const height = 150;
  const padding = { top: 15, right: 20, bottom: 25, left: 35 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Scale functions: X is angle [0, 90], Y is cosine [0, 1.05]
  const scaleX = (angle: number) => padding.left + (angle / 90) * plotW;
  const scaleY = (val: number) => padding.top + plotH - Math.max(0, Math.min(1.05, val)) * plotH;

  // Generate SVG path strings
  const theoryPath = fidelityCurve
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.angleDeg)} ${scaleY(pt.theoryCosine)}`)
    .join(' ');

  const fwPath = fidelityCurve
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.angleDeg)} ${scaleY(pt.fastWeightCosine)}`)
    .join(' ');

  const kvPath = fidelityCurve
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.angleDeg)} ${scaleY(pt.kvCacheCosine)}`)
    .join(' ');

  // Current marker point
  const currentTheoryY = 1.0 / Math.sqrt(1.0 + Math.pow(Math.cos((currentAngle * Math.PI) / 180), 2));
  const markerX = scaleX(currentAngle);
  const markerY = scaleY(currentTheoryY);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Fidelity vs. Key Orthogonality <span className="font-mono text-xs text-sky-400">(θ)</span>
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Current Angle: <strong className="text-amber-400">{currentAngle}°</strong>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="bg-slate-950 rounded-lg p-2 border border-slate-800/80 flex justify-center">
        <svg width={width} height={height} className="overflow-visible select-none">
          {/* Background gridlines */}
          <line
            x1={padding.left}
            y1={scaleY(1.0)}
            x2={width - padding.right}
            y2={scaleY(1.0)}
            stroke="#334155"
            strokeDasharray="2,2"
          />
          <line
            x1={padding.left}
            y1={scaleY(0.707)}
            x2={width - padding.right}
            y2={scaleY(0.707)}
            stroke="#475569"
            strokeDasharray="2,2"
          />
          <line
            x1={scaleX(90)}
            y1={padding.top}
            x2={scaleX(90)}
            y2={height - padding.bottom}
            stroke="#334155"
            strokeDasharray="2,2"
          />

          {/* Axes */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#64748b"
            strokeWidth="1.5"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#64748b"
            strokeWidth="1.5"
          />

          {/* Labels */}
          <text x={padding.left - 5} y={scaleY(1.0) + 3} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">
            1.0
          </text>
          <text x={padding.left - 5} y={scaleY(0.707) + 3} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">
            0.71
          </text>
          <text x={scaleX(0)} y={height - padding.bottom + 14} fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
            0°
          </text>
          <text x={scaleX(45)} y={height - padding.bottom + 14} fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
            45°
          </text>
          <text x={scaleX(90)} y={height - padding.bottom + 14} fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
            90° (⊥)
          </text>

          {/* Theoretical Curve (Dashed Amber) */}
          <path d={theoryPath} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />

          {/* KV-Cache Curve (Sky Blue) */}
          <path d={kvPath} fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.9" />

          {/* Fast Weights Curve (Emerald) */}
          <path d={fwPath} fill="none" stroke="#10b981" strokeWidth="2.5" />

          {/* Current Operating Point Marker */}
          <circle cx={markerX} cy={markerY} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          <line
            x1={markerX}
            y1={padding.top}
            x2={markerX}
            y2={height - padding.bottom}
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Legend & Equation */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
            <span className="text-emerald-300">Fast Weights</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-sky-400 inline-block" />
            <span className="text-sky-300">KV-Cache</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 border-b border-dashed border-amber-400 inline-block" />
            <span className="text-amber-300">Theory</span>
          </span>
        </div>
        <span className="text-[10px] text-slate-500">
          Theory: cos(θ) crosstalk
        </span>
      </div>
    </div>
  );
};
