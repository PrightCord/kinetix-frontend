import type { ScenarioState } from '../types.ts';
import { healthyScenario } from './healthy.ts';

export const rateLimitedScenario: ScenarioState = {
  ...healthyScenario,
  id: 'rate-limited',
  name: 'Rate-Limited & Quota Exhausted',
  description: 'Primary accounts hit upstream TPM/RPM quotas (HTTP 429). Adaptive rate-limiter backpressure engaged.',
  badge: 'Rate Limited',
  badgeColor: 'amber',
  accounts: healthyScenario.accounts.map((a) =>
    a.id === 'acc-anthropic-primary'
      ? {
          ...a,
          status: 'degraded',
          soft_quota_usd: 100,
          current_spend: 99.85,
        }
      : a,
  ),
  runtimeHealth: {
    ...healthyScenario.runtimeHealth,
    quota: [
      {
        account_id: 'acc-anthropic-primary',
        account_name: 'Anthropic Tier 4 Primary',
        provider_name: 'Anthropic Direct',
        rpm_limit: 5000,
        rpm_used: 4980,
        tpm_limit: 400000,
        tpm_used: 398500,
        daily_spend_limit_usd: 100,
        daily_spend_usd: 99.85,
        monthly_spend_limit_usd: 3000,
        monthly_spend_usd: 2840.0,
        resets_at: new Date(Date.now() + 1000 * 180).toISOString(),
      },
      ...healthyScenario.runtimeHealth.quota.slice(1),
    ],
    telemetry: healthyScenario.runtimeHealth.telemetry.map((t: any) => ({
      ...t,
      client_4xx: 48,
      adaptive_saturation: 0.98,
    })),
    dropped: { queue: 14, persistence: 0 },
  },
};
