import { ExperimentConfig } from '../types';

export function configToQueryString(config: ExperimentConfig): string {
  const params = new URLSearchParams();
  params.set('d', config.dimension.toString());
  params.set('N', config.sequenceLength.toString());
  params.set('theta', config.correlationAngleDeg.toString());
  params.set('algo', config.algorithm);
  params.set('lambda', config.decay.toString());
  params.set('eta', config.learningRate.toString());
  params.set('seed', config.seed.toString());
  params.set('probe', config.probeIndex.toString());
  return params.toString();
}

export function queryStringToConfig(queryString: string): Partial<ExperimentConfig> {
  const params = new URLSearchParams(queryString);
  const config: Partial<ExperimentConfig> = {};

  if (params.has('d')) {
    const d = parseInt(params.get('d')!);
    if (d === 8 || d === 16 || d === 32) config.dimension = d;
  }

  if (params.has('N')) {
    const N = parseInt(params.get('N')!);
    if (N >= 1 && N <= 32) config.sequenceLength = N;
  }

  if (params.has('theta')) {
    const theta = parseFloat(params.get('theta')!);
    if (theta >= 0 && theta <= 90) config.correlationAngleDeg = theta;
  }

  if (params.has('algo')) {
    const algo = params.get('algo')!;
    if (['hebbian', 'delta', 'bdh_sparse'].includes(algo)) {
      config.algorithm = algo as any;
    }
  }

  if (params.has('lambda')) {
    const lambda = parseFloat(params.get('lambda')!);
    if (lambda >= 0.7 && lambda <= 1.0) config.decay = lambda;
  }

  if (params.has('eta')) {
    const eta = parseFloat(params.get('eta')!);
    if (eta >= 0.1 && eta <= 2.0) config.learningRate = eta;
  }

  if (params.has('seed')) {
    const seed = parseInt(params.get('seed')!);
    config.seed = seed;
  }

  if (params.has('probe')) {
    const probe = parseInt(params.get('probe')!);
    if (probe >= 0) config.probeIndex = probe;
  }

  return config;
}

export function getShareableURL(config: ExperimentConfig): string {
  const queryString = configToQueryString(config);
  const baseURL = window.location.origin + window.location.pathname;
  return `${baseURL}?${queryString}`;
}
