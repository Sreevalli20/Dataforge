import React, { memo } from 'react';
import { GitCompare } from 'lucide-react';
import { ExperimentConfig, PlasticityAlgorithm } from '../types';
import { runExperiment } from '../lib/memoryEngine';

interface AlgorithmComparisonProps {
  config: ExperimentConfig;
}

export const AlgorithmComparison = memo<AlgorithmComparisonProps>(({ config }) => {
  const algorithms: PlasticityAlgorithm[] = ['hebbian', 'delta', 'bdh_sparse'];
  
  const results = React.useMemo(() => {
    return algorithms.map(algo => {
      const testConfig = { ...config, algorithm: algo };
      const sim = runExperiment(testConfig);
      return {
        algorithm: algo,
        cosineSimilarity: sim.readout.cosineSimilarity,
        l2Error: sim.readout.l2Error,
        frobenius: sim.frobenius,
        classificationMatch: sim.readout.classificationMatch,
      };
    });
  }, [config]);

  const getAlgorithmLabel = (algo: PlasticityAlgorithm) => {
    switch (algo) {
      case 'hebbian': return 'Hebbian';
      case 'delta': return 'Delta Rule';
      case 'bdh_sparse': return 'BDH Dale';
    }
  };

  const getAlgorithmColor = (algo: PlasticityAlgorithm) => {
    switch (algo) {
      case 'hebbian': return 'text-emerald-400';
      case 'delta': return 'text-amber-400';
      case 'bdh_sparse': return 'text-violet-400';
    }
  };

  const getBarColor = (algo: PlasticityAlgorithm) => {
    switch (algo) {
      case 'hebbian': return 'bg-emerald-500';
      case 'delta': return 'bg-amber-500';
      case 'bdh_sparse': return 'bg-violet-500';
    }
  };

  const maxCosine = Math.max(...results.map(r => r.cosineSimilarity));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <GitCompare className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-slate-200">
          Algorithm Comparison
        </h3>
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.algorithm} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold font-mono ${getAlgorithmColor(result.algorithm)}`}>
                {getAlgorithmLabel(result.algorithm)}
              </span>
              <span className={`text-[10px] font-mono ${result.classificationMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.classificationMatch ? '✓ Match' : '✗ Mismatch'}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Cosine Similarity</span>
                  <span className="font-mono">{result.cosineSimilarity.toFixed(4)}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(result.algorithm)} transition-all`}
                    style={{ width: `${(result.cosineSimilarity / maxCosine) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>L2 Error</span>
                <span className="font-mono">{result.l2Error.toFixed(4)}</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Frobenius Norm</span>
                <span className="font-mono">{result.frobenius.toFixed(3)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
