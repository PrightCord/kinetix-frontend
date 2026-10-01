import type { ScenarioState } from '../types.ts';
import { healthyScenario } from './healthy.ts';

export const loadingScenario: ScenarioState = {
  ...healthyScenario,
  id: 'loading',
  name: 'Simulated Network Latency',
  description: 'Simulates slow 2000ms latency on all Admin API endpoints to test skeleton screens and loading spinners.',
  badge: 'High Latency',
  badgeColor: 'blue',
  metrics: {
    ...healthyScenario.metrics,
    avg_latency_ms: 2150,
  },
};
