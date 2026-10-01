import type { ScenarioState } from '../types.ts';
import { healthyScenario } from './healthy.ts';

export const oauthExpiredScenario: ScenarioState = {
  ...healthyScenario,
  id: 'oauth-expired',
  name: 'OAuth Token Expired',
  description: 'Antigravity OAuth refresh token was revoked by upstream identity provider. Re-authentication flow required.',
  badge: 'OAuth Expired',
  badgeColor: 'amber',
  accounts: [
    ...healthyScenario.accounts,
    {
      id: 'acc-google-antigravity',
      provider_id: 'prov-google-ai',
      provider_name: 'Google Gemini Gateway',
      label: 'Google Workspace Cloud Code OAuth',
      key_masked: 'ya29.a0Ac_••••••••5f9e',
      status: 'unhealthy',
      quota_type: 'none',
      soft_quota_usd: 500,
      current_spend: 34.5,
      requests_count: 820,
      tokens_count: 610000,
      priority: 5,
      weight: 100,
      credential_kind: 'oauth2',
      credential_summary: 'Token Expired: invalid_grant (requires re-enrollment)',
    },
  ],
  plugins: [
    {
      ...healthyScenario.plugins[0],
      status: 'attention_required',
      ui: {
        actions: [
          {
            id: 'reconnect',
            label: 'Re-authenticate Google Account',
            kind: 'auth',
            integration: 'antigravity',
            description: 'OAuth grant expired or revoked. Click to initiate renewal.',
          },
        ],
        settings: [],
      },
    },
  ],
  auditLogs: [
    {
      id: 'aud-oauth-exp-01',
      timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
      operator: 'system_circuit',
      action: 'oauth_token_refresh_failed',
      resource_type: 'account',
      resource_id: 'acc-google-antigravity',
      details: 'Google OAuth endpoint rejected refresh token: invalid_grant. Account marked unhealthy.',
      ip_address: '127.0.0.1',
    },
    ...healthyScenario.auditLogs,
  ],
};
