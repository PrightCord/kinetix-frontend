import type { ScenarioState } from '../types.ts';
import { healthyScenario } from './healthy.ts';

export const providerUnavailableScenario: ScenarioState = {
  ...healthyScenario,
  id: 'provider-unavailable',
  name: 'Provider Outage (Circuit Open)',
  description: 'Primary provider Anthropic Direct is completely down. Gateway circuit breaker is in OPEN state with hard failover to standby targets.',
  badge: 'Circuit Open',
  badgeColor: 'red',
  providers: healthyScenario.providers.map((p) =>
    p.id === 'prov-anthropic'
      ? { ...p, status: 'unhealthy', last_ping_ms: 0 }
      : p,
  ),
  accounts: healthyScenario.accounts.map((a) =>
    a.provider_id === 'prov-anthropic'
      ? { ...a, status: 'unhealthy' }
      : a,
  ),
  metrics: {
    ...healthyScenario.metrics,
    healthy_providers: 2,
    healthy_accounts: 3,
    circuit_breakers_open: 2,
    error_rate: 0.125,
  },
  runtimeHealth: {
    ...healthyScenario.runtimeHealth,
    provider_circuits: [
      {
        provider_id: 'prov-anthropic',
        provider_name: 'Anthropic Direct',
        state: 'open',
        failure_count: 52,
        success_count: 0,
        consecutive_failures: 8,
        last_failure_at: new Date(Date.now() - 4000).toISOString(),
        last_success_at: new Date(Date.now() - 1000 * 600).toISOString(),
        retry_at: new Date(Date.now() + 45000).toISOString(),
      },
      {
        provider_id: 'prov-openai',
        provider_name: 'OpenAI Production',
        state: 'closed',
        failure_count: 0,
        success_count: 420,
        consecutive_failures: 0,
        last_failure_at: null,
        last_success_at: new Date().toISOString(),
      },
    ],
  },
};
