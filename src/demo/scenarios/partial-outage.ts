import type { ScenarioState } from '../types.ts';
import { healthyScenario } from './healthy.ts';

export const partialOutageScenario: ScenarioState = {
  ...healthyScenario,
  id: 'partial-outage',
  name: 'Partial Outage (Degraded Upstream)',
  description: 'Anthropic Direct is experiencing elevated 503 errors and latency spikes. Automatic fallback combos are routing to OpenAI.',
  badge: 'Degraded',
  badgeColor: 'amber',
  providers: healthyScenario.providers.map((p) =>
    p.id === 'prov-anthropic'
      ? { ...p, status: 'degraded', last_ping_ms: 1840 }
      : p,
  ),
  accounts: healthyScenario.accounts.map((a) =>
    a.provider_id === 'prov-anthropic'
      ? { ...a, status: 'degraded' }
      : a,
  ),
  requests: [
    {
      request_id: 'req-deg-001',
      client_format: 'openai',
      virtual_key_id: 'key-prod-app',
      virtual_key_name: 'Production Core Backend',
      virtual_key_tag: 'core-infra',
      requested_model: 'fast-interactive',
      actual_model: 'gpt-4o',
      route_id: 'route-interactive-fast',
      route_name: 'fast-interactive',
      upstream_provider: 'OpenAI Production',
      upstream_account: 'OpenAI Org Production',
      input_tokens: 1420,
      output_tokens: 380,
      total_tokens: 1800,
      cost_usd: 0.00735,
      status: 200,
      latency_ms: 980,
      ttft_ms: 310,
      fallback_hops: 1,
      fallback_path: ['prov-anthropic (HTTP 503 Service Unavailable) -> prov-openai (200 OK)'],
      retry_count: 1,
      user_agent: 'openai-node/4.52.0',
      client_ip: '10.0.4.12',
      commit_state: 'committed',
      timestamp: new Date().toISOString(),
    },
    ...healthyScenario.requests,
  ],
  metrics: {
    ...healthyScenario.metrics,
    healthy_providers: 2,
    healthy_accounts: 3,
    error_rate: 0.084,
    avg_latency_ms: 840,
    circuit_breakers_open: 1,
  },
  runtimeHealth: {
    ...healthyScenario.runtimeHealth,
    telemetry: [
      {
        scope: 'model',
        target: 'claude-3-7-sonnet-20250219',
        requests: 120,
        success: 94,
        client_4xx: 2,
        server_5xx: 24,
        connection_errors: 4,
        timeouts: 2,
        adaptive_saturation: 0.42,
        provider_circuit_rejects: 18,
        ttft_p50_ms: 480,
        ttft_p95_ms: 2100,
        ttft_p99_ms: 3800,
        duration_p50_ms: 1200,
        duration_p95_ms: 4500,
        duration_p99_ms: 8200,
      },
      ...healthyScenario.runtimeHealth.telemetry.filter(
        (t: any) => t.target !== 'claude-3-7-sonnet-20250219',
      ),
    ],
    provider_circuits: [
      {
        provider_id: 'prov-anthropic',
        provider_name: 'Anthropic Direct',
        state: 'half-open',
        failure_count: 24,
        success_count: 94,
        consecutive_failures: 3,
        last_failure_at: new Date(Date.now() - 15000).toISOString(),
        last_success_at: new Date().toISOString(),
      },
      {
        provider_id: 'prov-openai',
        provider_name: 'OpenAI Production',
        state: 'closed',
        failure_count: 0,
        success_count: 310,
        consecutive_failures: 0,
        last_failure_at: null,
        last_success_at: new Date().toISOString(),
      },
    ],
  },
};
