import { demoStore } from './store.ts';

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function sseResponse(tokens: string[], meta?: Record<string, string>): Response {
  let cancelled = false;
  let idx = 0;

  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        if (cancelled) {
          clearInterval(interval);
          return;
        }
        if (idx < tokens.length) {
          const chunk = JSON.stringify({
            choices: [{ delta: { content: tokens[idx] } }],
            usage: idx === tokens.length - 1 ? { prompt_tokens: 16, completion_tokens: tokens.length } : undefined,
          });
          controller.enqueue(new TextEncoder().encode(`data: ${chunk}\n\n`));
          idx++;
        } else {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          clearInterval(interval);
          controller.close();
        }
      }, 30);
    },
    cancel() {
      cancelled = true;
    },
  });

  const headers: Record<string, string> = {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'x-kinetix-served-by': meta?.servedBy || 'provider=Anthropic Direct;account=acc-anthropic-primary',
    'x-kinetix-route-id': meta?.routeId || 'route-interactive-fast',
    'x-kinetix-fallback': meta?.fallback || '0',
  };

  return new Response(stream, { headers });
}

export async function handleMockRequest(urlStr: string, init?: RequestInit): Promise<Response | null> {
  const method = (init?.method || 'GET').toUpperCase();
  const parsed = new URL(urlStr, 'http://localhost');
  const path = parsed.pathname;
  const store = demoStore;
  const state = store.getState();

  // If loading scenario, add artificial delay
  if (state.id === 'loading') {
    await new Promise((r) => setTimeout(r, 600));
  }

  // Parse JSON body if present
  let body: any = {};
  if (init?.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = {};
    }
  }

  // Healthz check
  if (path === '/healthz' || path === '/admin/healthz') {
    return json({ status: 'healthy', version: '0.5.2', uptime_seconds: 3600 });
  }

  // --- Session -------------------------------------------------------------
  if (path === '/admin/api/me') {
    return json({ authenticated: true, user: state.user || 'admin' });
  }
  if (path === '/admin/api/login') {
    return json({ ok: true, user: 'admin' });
  }
  if (path === '/admin/api/logout') {
    return json({ ok: true });
  }
  if (path === '/admin/api/password') {
    return json({ ok: true, note: 'Password updated (demo)' });
  }

  // --- Settings ------------------------------------------------------------
  if (path === '/admin/api/settings/public-base-url') {
    if (method === 'PUT') {
      state.publicBaseUrl = body.public_base_url;
      return json({ ok: true, public_base_url: state.publicBaseUrl, source: 'dashboard' });
    }
    return json({
      public_base_url: state.publicBaseUrl || 'https://gateway.kinetix.internal',
      source: 'dashboard',
      environment_default: 'http://127.0.0.1:20128',
    });
  }

  if (path === '/admin/api/settings/model-lifecycle') {
    if (method === 'PUT') {
      state.lifecycleSettings = { ...(state.lifecycleSettings || {}), ...body };
      return json({ ok: true, ...state.lifecycleSettings });
    }
    return json(state.lifecycleSettings || {
      reconciliation_interval_secs: 21600,
      pricing_sync_interval_secs: 43200,
      jitter_secs: 900,
      probe_freshness_secs: 86400,
    });
  }

  // --- Exports -------------------------------------------------------------
  if (path === '/admin/api/exports') {
    if (method === 'POST') {
      return json({ ok: true, day: body.day || '2026-09-30', jsonl: 'usage-export.jsonl', csv: 'usage-export.csv' });
    }
    return json({
      dir: '/var/lib/kinetix/exports',
      retention_days: 30,
      files: state.exportFiles || [],
      days: state.exportDays || [],
    });
  }

  if (path.startsWith('/admin/api/exports/')) {
    return json({ ok: true });
  }

  // --- Overview metrics ----------------------------------------------------
  if (path === '/admin/api/overview') {
    return json(state.metrics || {});
  }

  // --- Virtual Keys --------------------------------------------------------
  if (path === '/admin/api/keys') {
    if (method === 'POST') {
      const res = store.addKey(body);
      return json(res);
    }
    const offset = Number(parsed.searchParams.get('offset') || 0);
    const limit = Number(parsed.searchParams.get('limit') || 500);
    const keys = state.keys || [];
    const slice = keys.slice(offset, offset + limit);
    const nextOffset = offset + slice.length < keys.length ? offset + slice.length : null;
    return json({
      keys: slice,
      page: { limit, offset, total: keys.length, next_offset: nextOffset },
    });
  }

  if (path.startsWith('/admin/api/keys/')) {
    const parts = path.split('/');
    const keyId = decodeURIComponent(parts[4]);

    if (parts[5] === 'client-profile-models') {
      const key = state.keys.find((k) => k.id === keyId);
      if (!key) return json({ error: { code: 'not_found', message: 'Key not found', fields: [] } }, 404);
      const allowed = key.allowed_models || ['*'];
      const routeNames = (state.routes || []).map((r) => r.name);
      const modelNames = (state.models || []).map((m) => m.upstream_id || m.id);
      const all = allowed.includes('*') ? [...routeNames, ...modelNames] : allowed;
      return json({ models: Array.from(new Set(all)).map((id) => ({ id })) });
    }

    if (method === 'PUT') {
      store.updateKey(keyId, body);
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      store.deleteKey(keyId);
      return json({ ok: true });
    }
  }

  if (path === '/admin/api/client-profiles/generate') {
    const key = state.keys.find((k) => k.id === body.key_id);
    const model = body.model;
    const client = body.client;
    const apiKey = body.api_key || key?.key_hash || 'sk-kinetix-live-demo-key';
    const baseUrl = (state.publicBaseUrl || 'https://gateway.kinetix.internal').replace(/\/+$/, '') + '/v1';

    let files: any[] = [];
    if (client === 'claude_code') {
      files = [{
        filename: 'kinetix-claude.sh',
        destination: null,
        content_type: 'text/x-shellscript',
        content: `#!/usr/bin/env bash\nexport ANTHROPIC_BASE_URL="${baseUrl}"\nexport ANTHROPIC_API_KEY="${apiKey}"\nexec claude --model "${model}" "$@"\n`,
      }];
    } else if (client === 'codex') {
      files = [{
        filename: 'config.toml',
        destination: '~/.codex/config.toml',
        content_type: 'application/toml',
        content: `model = "${model}"\nmodel_provider = "kinetix"\n\n[model_providers.kinetix]\nbase_url = "${baseUrl}"\nenv_key = "KINETIX_API_KEY"\n`,
      }];
    } else {
      files = [{
        filename: 'config.json',
        destination: null,
        content_type: 'application/json',
        content: JSON.stringify({ baseUrl, model, apiKey }, null, 2),
      }];
    }

    return json({
      client,
      model,
      public_base_url: state.publicBaseUrl,
      files,
    });
  }

  // --- Providers -----------------------------------------------------------
  if (path === '/admin/api/providers') {
    if (method === 'POST') {
      const p = store.addProvider(body);
      return json({ ok: true, provider: p });
    }
    const offset = Number(parsed.searchParams.get('offset') || 0);
    const limit = Number(parsed.searchParams.get('limit') || 500);
    const providers = state.providers || [];
    const slice = providers.slice(offset, offset + limit);
    const nextOffset = offset + slice.length < providers.length ? offset + slice.length : null;
    return json({
      providers: slice,
      page: { limit, offset, total: providers.length, next_offset: nextOffset },
    });
  }

  if (path === '/admin/api/validate/provider') {
    return json({ valid: true, problems: [], warnings: [], outbound_security: 'tls_verified' });
  }

  if (path.startsWith('/admin/api/providers/')) {
    const parts = path.split('/');
    const provId = decodeURIComponent(parts[4]);

    if (parts[5] === 'discover') {
      const models = (state.models || []).filter((m) => m.provider_id === provId);
      return json({
        models: models.map((m) => ({
          id: m.upstream_id || m.id,
          display_name: m.display_name,
          context_window: m.context_window,
          max_output_tokens: m.max_output_tokens,
          capabilities: m.capabilities,
          prices: m.prices,
          canonical_identity: m.canonical_identity,
          model_type: 'chat',
          execution_supported: true,
          already_imported: true,
        })),
        disappeared: [],
        lifecycle: {
          reconciliation: { last_attempt: new Date().toISOString(), last_success: new Date().toISOString() },
          pricing_sync: { last_attempt: new Date().toISOString(), last_success: new Date().toISOString() },
        },
      });
    }

    if (parts[5] === 'reconcile') {
      return json({
        models: (state.models || []).filter((m) => m.provider_id === provId),
        disappeared: [],
        lifecycle: { reconciliation: { last_attempt: new Date().toISOString(), last_success: new Date().toISOString() } },
      });
    }

    if (parts[5] === 'pricing' && parts[6] === 'sync') {
      return json({
        ok: true,
        updated: (state.models || []).filter((m) => m.provider_id === provId).map((m) => m.id),
        skipped_manual: [],
        lifecycle: { pricing_sync: { last_attempt: new Date().toISOString(), last_success: new Date().toISOString() } },
      });
    }

    if (parts[5] === 'test') {
      return json({ ok: true, status: 200, latency_ms: 114, response_preview: 'OK 200 Ping Successful' });
    }

    if (parts[5] === 'credential-enrollment' && parts[6] === 'start') {
      return json({
        authorize_url: '#demo-oauth-enroll',
        redirect_uri: 'http://localhost:3000/admin/api/plugins/auth/callback',
        state: `demo-${provId}`,
        expires_in_secs: 300,
        manual_callback_supported: true,
      });
    }

    if (parts[5] === 'models' && method === 'POST') {
      const newModel = store.addModel(provId, body);
      return json({ ok: true, model: newModel });
    }

    if (method === 'GET') {
      const p = state.providers.find((item) => item.id === provId);
      if (!p) return json({ error: { code: 'not_found', message: 'Provider not found', fields: [] } }, 404);
      return json(p);
    }
    if (method === 'PUT') {
      store.updateProvider(provId, body);
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      store.deleteProvider(provId);
      return json({ ok: true });
    }
  }

  // --- Models --------------------------------------------------------------
  if (path === '/admin/api/models') {
    const offset = Number(parsed.searchParams.get('offset') || 0);
    const limit = Number(parsed.searchParams.get('limit') || 500);
    const models = state.models || [];
    const slice = models.slice(offset, offset + limit);
    const nextOffset = offset + slice.length < models.length ? offset + slice.length : null;
    return json({
      models: slice,
      page: { limit, offset, total: models.length, next_offset: nextOffset },
    });
  }

  if (path === '/admin/api/validate/model') {
    return json({ valid: true, problems: [], warnings: [] });
  }

  if (path.startsWith('/admin/api/models/')) {
    const parts = path.split('/');
    const modelId = decodeURIComponent(parts[4]);

    if (parts[5] === 'probe') {
      return json({
        status: 'supported',
        reason: `Probe verified capability ${body.capability}`,
        transport: 'openai',
        evidence: {
          status: 'supported',
          verified_at: new Date().toISOString(),
          fresh_until: new Date(Date.now() + 86400000).toISOString(),
          estimated_max_cost_usd: 0.005,
          detail: 'Synthetic probe verified upstream transport response.',
        },
      });
    }

    if (parts[5] === 'reconciliation' && method === 'PUT') {
      return json({ ok: true });
    }

    if (method === 'PUT') {
      store.updateModel(modelId, body);
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      store.deleteModel(modelId);
      return json({ ok: true });
    }
  }

  // --- Accounts ------------------------------------------------------------
  if (path === '/admin/api/accounts') {
    if (method === 'POST') {
      const a = store.addAccount(body);
      return json({ ok: true, account: a });
    }
    const offset = Number(parsed.searchParams.get('offset') || 0);
    const limit = Number(parsed.searchParams.get('limit') || 500);
    const accounts = state.accounts || [];
    const slice = accounts.slice(offset, offset + limit);
    const nextOffset = offset + slice.length < accounts.length ? offset + slice.length : null;
    return json({
      accounts: slice,
      page: { limit, offset, total: accounts.length, next_offset: nextOffset },
    });
  }

  if (path === '/admin/api/validate/account') {
    return json({ valid: true, problems: [] });
  }

  if (path.startsWith('/admin/api/accounts/')) {
    const parts = path.split('/');
    const accId = decodeURIComponent(parts[4]);

    if (parts[5] === 'reset') {
      store.resetAccount(accId);
      return json({ ok: true });
    }
    if (parts[5] === 'test') {
      return json({ ok: true, status: 200, latency_ms: 98, response_preview: 'OK 200 Key Validated' });
    }
    if (method === 'PUT') {
      store.updateAccount(accId, body);
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      store.deleteAccount(accId);
      return json({ ok: true });
    }
  }

  // --- Routes --------------------------------------------------------------
  if (path === '/admin/api/routes') {
    if (method === 'POST') {
      const r = store.addRoute(body);
      return json({ ok: true, route: r });
    }
    const offset = Number(parsed.searchParams.get('offset') || 0);
    const limit = Number(parsed.searchParams.get('limit') || 500);
    const routes = state.routes || [];
    const slice = routes.slice(offset, offset + limit);
    const nextOffset = offset + slice.length < routes.length ? offset + slice.length : null;
    return json({
      routes: slice,
      page: { limit, offset, total: routes.length, next_offset: nextOffset },
    });
  }

  if (path === '/admin/api/validate/route') {
    return json({ valid: true, problems: [], warnings: [] });
  }

  if (path === '/admin/api/routes/dry-run') {
    const route = (state.routes || []).find((r) => r.name === body.model) || state.routes?.[0];
    return json({
      selected: route?.targets?.[0] || null,
      trace: [
        { stage: 'evaluate', target: route?.name || 'default', detail: 'Evaluated candidate targets' },
        { stage: 'cache', target: 'Affinity match', detail: 'Selected primary target' },
        { stage: 'commit', target: route?.targets?.[0]?.model || 'model', detail: 'Commit state ready' },
      ],
    });
  }

  if (path.startsWith('/admin/api/routes/')) {
    const parts = path.split('/');
    const routeId = decodeURIComponent(parts[4]);

    if (method === 'PUT') {
      store.updateRoute(routeId, body);
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      store.deleteRoute(routeId);
      return json({ ok: true });
    }
  }

  // --- Aliases -------------------------------------------------------------
  if (path === '/admin/api/aliases') {
    if (method === 'POST') {
      const a = store.addAlias(body);
      return json({ ok: true, alias: a });
    }
    const offset = Number(parsed.searchParams.get('offset') || 0);
    const limit = Number(parsed.searchParams.get('limit') || 500);
    const aliases = state.aliases || [];
    const slice = aliases.slice(offset, offset + limit);
    const nextOffset = offset + slice.length < aliases.length ? offset + slice.length : null;
    return json({
      aliases: slice,
      page: { limit, offset, total: aliases.length, next_offset: nextOffset },
    });
  }

  if (path.startsWith('/admin/api/aliases/')) {
    const id = decodeURIComponent(path.split('/')[4]);
    if (method === 'DELETE') {
      store.deleteAlias(id);
      return json({ ok: true });
    }
  }

  // --- Usage & Requests ----------------------------------------------------
  if (path === '/admin/api/usage') {
    const limit = Number(parsed.searchParams.get('limit') || 200);
    return json({ usage: (state.requests || []).slice(0, limit) });
  }

  if (path === '/admin/api/requests/live') {
    return json({ live: state.liveRequests || [] });
  }

  // --- Health Runtime Telemetry --------------------------------------------
  if (path === '/admin/api/health/runtime') {
    const rawHealth = state.runtimeHealth || {
      window: '1h',
      telemetry: [],
      provider_circuits: [],
      quota: [],
      dropped: { queue: 0, persistence: 0 },
    };
    const normalizedCircuits = (rawHealth.provider_circuits || []).map((c: any) => ({
      ...c,
      state: c.state || 'closed',
      recent_qualifying_failures: c.recent_qualifying_failures ?? c.failure_count ?? 0,
      distinct_failing_accounts: c.distinct_failing_accounts ?? (c.failure_count > 0 ? 1 : 0),
      distinct_failing_targets: c.distinct_failing_targets ?? (c.failure_count > 0 ? 1 : 0),
      recent_failures: Array.isArray(c.recent_failures)
        ? c.recent_failures
        : c.last_failure_at
        ? [{ at: c.last_failure_at, account_id: 'acc-primary', target_id: 'default' }]
        : [],
    }));
    return json({
      ...rawHealth,
      provider_circuits: normalizedCircuits,
      telemetry: rawHealth.telemetry || [],
      quota: rawHealth.quota || [],
      dropped: rawHealth.dropped || { queue: 0, persistence: 0 },
    });
  }

  // --- Traces & Diagnostics ------------------------------------------------
  if (path.includes('/route-trace') || path.startsWith('/admin/api/route-traces/')) {
    return json({
      outcome: 'served_primary',
      commit_state: 'committed',
      steps: [
        { elapsed_ms: 2, stage: 'evaluate', target: 'Route: Fast Interactive', detail: 'Evaluated candidate targets' },
        { elapsed_ms: 5, stage: 'cache', target: 'Cache Affinity', detail: 'Affinity match acc-anthropic-primary' },
        { elapsed_ms: 8, stage: 'commit', target: 'acc-anthropic-primary', detail: 'Dispatched to upstream endpoint' },
      ],
      warnings: [],
    });
  }

  if (path.includes('/diagnostics')) {
    return json({
      flight_events: [
        { elapsed_ms: 1, event: 'virtual_key_verified', detail: 'Key sk-kinetix-live-core accepted' },
        { elapsed_ms: 4, event: 'route_matched', detail: 'Matched route: fast-interactive' },
        { elapsed_ms: 12, event: 'connection_established', detail: 'HTTP/2 stream active' },
        { elapsed_ms: 184, event: 'first_byte_streamed', detail: 'TTFT 184ms recorded' },
        { elapsed_ms: 642, event: 'stream_closed', detail: 'Final chunk [DONE] received gracefully' },
      ],
    });
  }

  // --- Live Test Streaming -------------------------------------------------
  if (
    path === '/admin/api/test-stream' ||
    path === '/v1/chat/completions' ||
    path === '/v1/messages'
  ) {
    const isStream = body.stream !== false;
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
      'proxy ',
      'gateway. ',
      'Route ',
      'execution ',
      'and ',
      'virtual ',
      'key ',
      'are ',
      'active ',
      'and ',
      'nominal!',
    ];

    if (isStream) {
      return sseResponse(tokens, {
        servedBy: 'provider=Anthropic Direct;account=acc-anthropic-primary',
        routeId: 'route-interactive-fast',
        fallback: state.id === 'partial-outage' ? '1' : '0',
      });
    }

    return json({
      id: 'chatcmpl-test-live',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: body.model || 'claude-3-7-sonnet',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: tokens.join(''),
          },
          finish_reason: 'stop',
        },
      ],
      usage: { prompt_tokens: 14, completion_tokens: tokens.length, total_tokens: 14 + tokens.length },
    }, 200);
  }

  // --- Plugins -------------------------------------------------------------
  if (path === '/admin/api/plugins') {
    return json({ plugins: state.plugins || [] });
  }

  if (path === '/admin/api/plugins/catalog') {
    const plugins = (state.plugins || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: `${p.name} integration adapter for the Kinetix workbench.`,
      publisher: 'PrightCord',
      official: true,
      homepage: 'https://github.com/PrightCord/kinetix',
      latest_version: p.version,
      artifact_name: `${p.id}.kxp`,
      capabilities: p.provides.map((x: any) => x.capability),
      installable: true,
      install_ready: true,
      trust_status: p.signature === 'verified' ? 'trusted' : 'unavailable',
      installed: true,
      installed_version: p.version,
      update_available: false,
      distribution: null,
    }));
    return json({ schema_version: 1, plugins });
  }

  if (path === '/admin/api/plugins/catalog/refresh') {
    return json({ schema_version: 1, count: state.plugins.length, refreshed: true });
  }

  if (path.startsWith('/admin/api/plugins/')) {
    const parts = path.split('/');
    const pluginId = decodeURIComponent(parts[4]);
    const plugin = (state.plugins || []).find((p) => p.id === pluginId) || state.plugins?.[0];

    if (parts[5] === 'preview') {
      return json({
        id: plugin?.id,
        name: plugin?.name,
        current_version: plugin?.version,
        target_version: plugin?.version,
        sha256: plugin?.sha256,
        signature: plugin?.signature,
        source: 'catalog',
        permissions: plugin?.permissions,
        permission_diff: { network_hosts: { added: [], removed: [] }, credential_scopes: { added: [], removed: [] }, credential_read: { from: true, to: true, changed: false } },
        provides: plugin?.provides,
      });
    }

    if (parts[5] === 'permissions') {
      if (method === 'POST') return json({ ok: true, id: pluginId, approved: [] });
      return json({ id: pluginId, requested: plugin?.permissions, approved: [] });
    }

    if (parts[5] === 'settings') {
      if (method === 'PUT') return json({ id: pluginId, settings: [] });
      return json({ id: pluginId, settings: [] });
    }

    if (parts[5] === 'enable' || parts[5] === 'disable') {
      return json({ ok: true, id: pluginId, enabled: parts[5] === 'enable' });
    }

    if (parts[5] === 'validate') {
      return json({ ok: true, id: pluginId, provides: plugin?.provides || [] });
    }

    if (method === 'GET') {
      return json(plugin || { id: pluginId, name: pluginId, version: '1.0.0', status: 'enabled', provides: [], permissions: {}, limits: {} });
    }

    if (method === 'DELETE') {
      state.plugins = state.plugins.filter((p) => p.id !== pluginId);
      return json({ ok: true, id: pluginId });
    }
  }

  // --- Audit ---------------------------------------------------------------
  if (path === '/admin/api/audit') {
    const limit = Number(parsed.searchParams.get('limit') || 200);
    return json({ audit: (state.auditLogs || []).slice(0, limit) });
  }

  // Fallback for unknown /admin/api routes
  if (path.startsWith('/admin/api/')) {
    return json({ ok: true });
  }

  return null;
}
