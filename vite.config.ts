import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, Plugin } from 'vite';

function kinetixMockApiPlugin(): Plugin {
  return {
    name: 'kinetix-mock-api',
    configureServer(server) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const rawUrl = req.url || '';
        const url = rawUrl.startsWith('/admin') ? rawUrl.replace(/^\/admin/, '') : rawUrl;
        const pathname = url.split('?')[0] || '';

        if (pathname === '/healthz' || rawUrl === '/healthz') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'healthy', version: '0.5.2', uptime_seconds: 3600 }));
          return;
        }

        if (
          pathname.startsWith('/api/health/runtime') ||
          rawUrl.startsWith('/admin/api/health/runtime')
        ) {
          const urlParams = new URL(rawUrl, 'http://localhost:3000');
          const windowKey = urlParams.searchParams.get('window') || '1h';
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              window: windowKey,
              telemetry: [
                {
                  scope: 'model',
                  target: 'claude-3-7-sonnet',
                  requests: 412,
                  success: 408,
                  client_4xx: 3,
                  server_5xx: 1,
                  connection_errors: 0,
                  timeouts: 0,
                  adaptive_saturation: 0.04,
                  provider_circuit_rejects: 0,
                  ttft_p50_ms: 320,
                  ttft_p95_ms: 680,
                  ttft_p99_ms: 1150,
                  duration_p50_ms: 1450,
                  duration_p95_ms: 2900,
                  duration_p99_ms: 4200,
                },
                {
                  scope: 'model',
                  target: 'gpt-4o',
                  requests: 285,
                  success: 284,
                  client_4xx: 1,
                  server_5xx: 0,
                  connection_errors: 0,
                  timeouts: 0,
                  adaptive_saturation: 0.01,
                  provider_circuit_rejects: 0,
                  ttft_p50_ms: 280,
                  ttft_p95_ms: 520,
                  ttft_p99_ms: 890,
                  duration_p50_ms: 1100,
                  duration_p95_ms: 2200,
                  duration_p99_ms: 3400,
                },
                {
                  scope: 'provider',
                  target: 'Anthropic Direct',
                  requests: 412,
                  success: 408,
                  client_4xx: 3,
                  server_5xx: 1,
                  connection_errors: 0,
                  timeouts: 0,
                  adaptive_saturation: 0.04,
                  provider_circuit_rejects: 0,
                  ttft_p50_ms: 320,
                  ttft_p95_ms: 680,
                  ttft_p99_ms: 1150,
                  duration_p50_ms: 1450,
                  duration_p95_ms: 2900,
                  duration_p99_ms: 4200,
                },
                {
                  scope: 'provider',
                  target: 'OpenAI Production',
                  requests: 285,
                  success: 284,
                  client_4xx: 1,
                  server_5xx: 0,
                  connection_errors: 0,
                  timeouts: 0,
                  adaptive_saturation: 0.01,
                  provider_circuit_rejects: 0,
                  ttft_p50_ms: 280,
                  ttft_p95_ms: 520,
                  ttft_p99_ms: 890,
                  duration_p50_ms: 1100,
                  duration_p95_ms: 2200,
                  duration_p99_ms: 3400,
                },
              ],
              provider_circuits: [
                {
                  provider_id: 'prov-anthropic',
                  provider_name: 'Anthropic Direct',
                  state: 'closed',
                  failure_count: 0,
                  recent_qualifying_failures: 0,
                  distinct_failing_accounts: 0,
                  distinct_failing_targets: 0,
                  recent_failures: [],
                  success_count: 408,
                  consecutive_failures: 0,
                  last_failure_at: null,
                  last_success_at: new Date().toISOString(),
                },
                {
                  provider_id: 'prov-openai',
                  provider_name: 'OpenAI Production',
                  state: 'closed',
                  failure_count: 0,
                  recent_qualifying_failures: 0,
                  distinct_failing_accounts: 0,
                  distinct_failing_targets: 0,
                  recent_failures: [],
                  success_count: 284,
                  consecutive_failures: 0,
                  last_failure_at: null,
                  last_success_at: new Date().toISOString(),
                },
              ],
              quota: [
                {
                  account_id: 'acc-anthropic-prod',
                  account_name: 'Anthropic Production Account',
                  provider_name: 'Anthropic',
                  rpm_limit: 1000,
                  rpm_used: 42,
                  tpm_limit: 80000,
                  tpm_used: 12400,
                  daily_spend_limit_usd: 150,
                  daily_spend_usd: 28.45,
                  monthly_spend_limit_usd: 3000,
                  monthly_spend_usd: 412.3,
                  resets_at: new Date(Date.now() + 86400000 * 3).toISOString(),
                },
                {
                  account_id: 'acc-openai-prod',
                  account_name: 'OpenAI Production Account',
                  provider_name: 'OpenAI',
                  rpm_limit: 1500,
                  rpm_used: 56,
                  tpm_limit: 120000,
                  tpm_used: 24500,
                  daily_spend_limit_usd: 200,
                  daily_spend_usd: 34.12,
                  monthly_spend_limit_usd: 4000,
                  monthly_spend_usd: 580.4,
                  resets_at: new Date(Date.now() + 86400000 * 3).toISOString(),
                },
              ],
              dropped: { queue: 0, persistence: 0 },
            }),
          );
          return;
        }

        if (url.includes('/route-trace')) {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              outcome: 'served_primary',
              commit_state: 'committed',
              steps: [
                { elapsed_ms: 2, stage: 'evaluate', target: 'Route: Fast Interactive', detail: 'Evaluated candidate targets' },
                { elapsed_ms: 5, stage: 'cache', target: 'Cache Affinity', detail: 'Affinity match acc-anthropic-prod' },
                { elapsed_ms: 8, stage: 'commit', target: 'acc-anthropic-prod', detail: 'Dispatched to upstream endpoint' },
              ],
              warnings: [],
            }),
          );
          return;
        }

        if (url.includes('/diagnostics')) {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              flight_events: [
                { elapsed_ms: 1, event: 'virtual_key_verified', detail: 'Key sk-kinetix-alpha accepted for Team Alpha' },
                { elapsed_ms: 4, event: 'route_matched', detail: 'Matched route: fast-claude' },
                { elapsed_ms: 12, event: 'connection_established', detail: 'HTTP/2 stream active to Anthropic Direct' },
                { elapsed_ms: 184, event: 'first_byte_streamed', detail: 'TTFT 184ms recorded' },
                { elapsed_ms: 642, event: 'stream_closed', detail: 'Final chunk [DONE] received gracefully' },
              ],
            }),
          );
          return;
        }

        if (
          pathname.startsWith('/api/route-traces/') ||
          rawUrl.startsWith('/admin/api/route-traces/')
        ) {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              steps: [
                { stage: 'attempt', target: 'acc-anthropic-prod', detail: 'Primary attempt on Anthropic Claude 3.7' },
                { stage: 'commit', target: 'acc-anthropic-prod', detail: 'Stream returned 200 OK' },
              ],
            }),
          );
          return;
        }

        if (
          pathname.startsWith('/api/test-stream') ||
          rawUrl.startsWith('/admin/api/test-stream') ||
          pathname.startsWith('/v1/chat/completions') ||
          rawUrl.startsWith('/v1/chat/completions') ||
          pathname.startsWith('/v1/messages') ||
          rawUrl.startsWith('/v1/messages')
        ) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('x-kinetix-served-by', 'provider=Anthropic Direct;account=acc-anthropic-prod');
          res.setHeader('x-kinetix-route-id', 'route-demo-fast');

          const tokens = [
            'Hello! ',
            'This ',
            'is ',
            'a ',
            'live ',
            'test ',
            'response ',
            'from ',
            'the ',
            'Kinetix ',
            'intelligent ',
            'LLM ',
            'proxy. ',
            'Your ',
            'virtual ',
            'key ',
            'and ',
            'upstream ',
            'route ',
            'routing ',
            'are ',
            'active ',
            'and ',
            'healthy!',
          ];

          let idx = 0;
          const timer = setInterval(() => {
            if (idx < tokens.length) {
              const chunk = JSON.stringify({
                choices: [{ delta: { content: tokens[idx] } }],
                usage: idx === tokens.length - 1 ? { prompt_tokens: 14, completion_tokens: tokens.length } : undefined,
              });
              res.write(`data: ${chunk}\n\n`);
              idx++;
            } else {
              res.write('data: [DONE]\n\n');
              clearInterval(timer);
              res.end();
            }
          }, 35);

          req.on('close', () => clearInterval(timer));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), kinetixMockApiPlugin()],
  base: '/admin/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
