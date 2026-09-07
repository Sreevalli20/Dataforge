import { memo } from 'react';
import { TrendingUp } from 'lucide-react';

interface SweepResultsProps {
  results: any;
}

export const SweepResults = memo<SweepResultsProps>(({ results }) => {
  if (!results || !results.data) {
    return null;
  }

  const chartData = results.data.map((item: any) => ({
    label: results.type === 'capacity' ? `N=${item.N}` : 
           results.type === 'crosstalk' ? `${item.angle}°` :
           results.type === 'learningRate' ? `η=${item.learningRate.toFixed(1)}` :
           results.type === 'decay' ? `λ=${item.decay.toFixed(2)}` : '',
    cosine: item.cosineSimilarity,
    error: item.l2Error,
  }));

  const getTitle = () => {
    switch (results.type) {
      case 'capacity': return 'Capacity Limit Sweep';
      case 'crosstalk': return 'Crosstalk Stress Test';
      case 'learningRate': return 'Learning Rate Stability';
      case 'decay': return 'Decay/Retention Sweep';
      default: return 'Sweep Results';
    }
  };

  const width = 400;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const scaleX = (index: number) => padding.left + (index / (chartData.length - 1)) * plotW;
  const scaleY = (value: number) => padding.top + plotH - Math.max(0, Math.min(1, value)) * plotH;

  const pathD = chartData.map((d: any, i: number) => 
    `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.cosine)}`
  ).join(' ');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-slate-200">
          {getTitle()}
        </h3>
      </div>

      <div className="bg-slate-950 rounded-lg p-2 border border-slate-800/80">
        <svg width={width} height={height} className="overflow-visible select-none">
          {/* Grid lines */}
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
            y1={scaleY(0.5)}
            x2={width - padding.right}
            y2={scaleY(0.5)}
            stroke="#334155"
            strokeDasharray="2,2"
          />
          <line
            x1={padding.left}
            y1={scaleY(0)}
            x2={width - padding.right}
            y2={scaleY(0)}
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

          {/* Y-axis labels */}
          <text x={padding.left - 5} y={scaleY(1.0) + 3} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">
            1.0
          </text>
          <text x={padding.left - 5} y={scaleY(0.5) + 3} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">
            0.5
          </text>
          <text x={padding.left - 5} y={scaleY(0) + 3} fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">
            0.0
          </text>

          {/* X-axis labels */}
          {chartData.length > 0 && (
            <>
              <text x={scaleX(0)} y={height - padding.bottom + 14} fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                {chartData[0].label}
              </text>
              <text x={scaleX(Math.floor(chartData.length / 2))} y={height - padding.bottom + 14} fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                {chartData[Math.floor(chartData.length / 2)].label}
              </text>
              <text x={scaleX(chartData.length - 1)} y={height - padding.bottom + 14} fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                {chartData[chartData.length - 1].label}
              </text>
            </>
          )}

          {/* Data line */}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" />

          {/* Data points */}
          {chartData.map((d: any, i: number) => (
            <circle
              key={i}
              cx={scaleX(i)}
              cy={scaleY(d.cosine)}
              r="3"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>
    </div>
  );
});
