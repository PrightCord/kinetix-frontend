import type { ScenarioState } from '../types.ts';
import { healthyScenario } from './healthy.ts';

export const pluginFailedScenario: ScenarioState = {
  ...healthyScenario,
  id: 'plugin-failed',
  name: 'Plugin Verification Failed',
  description: 'Cryptographic signature mismatch on custom upstream adapter. Untrusted plugin execution suspended by runtime safety guard.',
  badge: 'Plugin Error',
  badgeColor: 'red',
  plugins: [
    ...healthyScenario.plugins,
    {
      id: 'b-ai-adapter',
      name: 'B.AI Unofficial Provider Adapter',
      version: '0.9.1-untrusted',
      plugin_api_major: 1,
      sha256: '9999999999999999999999999999999999999999999999999999999999999999',
      signature: 'signature_verification_failed',
      status: 'error',
      provides: [
        { capability: 'provider_adapter', name: 'B.AI Wire Adapter' },
      ],
      integrations: [],
      ui: { actions: [], settings: [] },
      permissions: {
        network_hosts: ['api.b-ai.dev'],
        credential_scopes: ['all'],
        credential_read: true,
      },
      limits: {
        memory: '64 MiB',
        wall_time_ms: 30000,
        max_outbound_requests: 8,
        max_http_body: '8 MiB',
        storage: 'none',
      },
      routing_facts_mode: 'cached',
      routing_facts_refresh_ms: 300000,
    },
  ],
  auditLogs: [
    {
      id: 'aud-plugin-err-01',
      timestamp: new Date(Date.now() - 1000 * 20).toISOString(),
      operator: 'plugin_sandbox',
      action: 'plugin_verification_failed',
      resource_type: 'plugin',
      resource_id: 'b-ai-adapter',
      details: 'Signature mismatch against publisher key. Execution disabled.',
      ip_address: '127.0.0.1',
    },
    ...healthyScenario.auditLogs,
  ],
};
