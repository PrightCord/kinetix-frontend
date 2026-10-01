import type { ScenarioState } from '../types.ts';
import { healthyScenario } from './healthy.ts';

export const noUsageScenario: ScenarioState = {
  ...healthyScenario,
  id: 'no-usage',
  name: 'No Traffic / Fresh Provisioning',
  description: 'Gateway is configured with keys, providers, and routes, but has not received any live traffic yet.',
  badge: 'Idle',
  badgeColor: 'blue',
  requests: [],
  liveRequests: [],
  metrics: {
    ...healthyScenario.metrics,
    requests_today: 0,
    requests_this_month: 0,
    tokens_today: 0,
    tokens_this_month: 0,
    total_spend_usd: 0,
    spend_today_usd: 0,
    spend_this_month_usd: 0,
    avg_latency_ms: 0,
    avg_ttft_ms: 0,
    error_rate: 0,
    active_streams: 0,
  },
  exportFiles: [],
  exportDays: [],
};
