import type { ScenarioState, ScenarioId } from '../types.ts';
import { getScenario, SCENARIOS } from '../scenarios/index.ts';

type Listener = () => void;

class DemoStore {
  private activeScenarioId: ScenarioId = 'healthy';
  private state: ScenarioState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('kinetix_scenario') : null;
    if (saved && saved in SCENARIOS) {
      this.activeScenarioId = saved as ScenarioId;
    }
    this.state = structuredClone(getScenario(this.activeScenarioId));
  }

  public getScenarioId(): ScenarioId {
    return this.activeScenarioId;
  }

  public getState(): ScenarioState {
    return this.state;
  }

  public setScenario(id: ScenarioId) {
    this.activeScenarioId = id;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kinetix_scenario', id);
    }
    this.state = structuredClone(getScenario(id));
    this.notify();
  }

  public resetCurrentScenario() {
    this.state = structuredClone(getScenario(this.activeScenarioId));
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (e) {
        console.error('DemoStore listener error:', e);
      }
    }
  }

  // --- Mutators -------------------------------------------------------------
  public addKey(body: any) {
    const newKey = {
      id: `key-${Date.now().toString(36)}`,
      name: body.name || 'New Virtual Key',
      key_hash: `kinetix_live_${Date.now().toString(36)}`,
      owner: body.owner || 'Operator',
      tag: body.tag || 'custom',
      allowed_models: body.allowed_models || ['*'],
      allowed_providers: body.allowed_providers || [],
      rpm_limit: body.rpm_limit ?? 1000,
      tpm_limit: body.tpm_limit ?? 100000,
      daily_budget: body.daily_budget ?? 0,
      monthly_budget: body.monthly_budget ?? 0,
      current_daily_spend: 0,
      current_monthly_spend: 0,
      status: 'active',
      allowed_ips: body.allowed_ips || [],
      created_at: new Date().toISOString(),
      expires_at: null,
      total_requests: 0,
      total_tokens: 0,
    };
    this.state.keys = [newKey, ...this.state.keys];
    this.recordAudit('virtual_key_created', 'key', newKey.id, `Created key: ${newKey.name}`);
    this.notify();
    return { key: newKey, full_key: `sk-kinetix-live-${newKey.id}-${Math.random().toString(36).substring(2, 10)}` };
  }

  public updateKey(id: string, patch: any) {
    this.state.keys = this.state.keys.map((k) =>
      k.id === id ? { ...k, ...patch } : k,
    );
    this.recordAudit('virtual_key_updated', 'key', id, `Updated key fields: ${Object.keys(patch).join(', ')}`);
    this.notify();
  }

  public deleteKey(id: string) {
    this.state.keys = this.state.keys.filter((k) => k.id !== id);
    this.recordAudit('virtual_key_deleted', 'key', id, 'Deleted virtual key');
    this.notify();
  }

  public addProvider(body: any) {
    const newProv = {
      id: `prov-${Date.now().toString(36)}`,
      name: body.name,
      base_url: body.base_url,
      wire_format: body.wire_format || 'openai',
      auth_scheme: body.auth_scheme || 'bearer',
      custom_header_name: body.custom_header_name || null,
      custom_param_name: body.custom_param_name || null,
      extra_headers: body.extra_headers || {},
      models_path: body.models_path || '/v1/models',
      timeout_ms: body.timeout_ms || 60000,
      capability_mode: body.capability_mode || 'strict',
      credential_hosts: body.credential_hosts || '',
      follow_redirects: body.follow_redirects ?? true,
      allow_insecure_tls: body.allow_insecure_tls ?? false,
      status: 'healthy',
      last_ping_ms: 120,
      models_count: 0,
      accounts_count: body.api_key ? 1 : 0,
      credential_mode: 'manual',
    };
    this.state.providers = [...this.state.providers, newProv];

    if (body.api_key) {
      this.addAccount({
        provider_id: newProv.id,
        label: body.account_label || `${newProv.name} Default Account`,
        key: body.api_key,
        priority: 10,
        weight: 100,
      });
    }

    this.recordAudit('provider_created', 'provider', newProv.id, `Registered provider: ${newProv.name}`);
    this.notify();
    return newProv;
  }

  public updateProvider(id: string, patch: any) {
    this.state.providers = this.state.providers.map((p) =>
      p.id === id ? { ...p, ...patch } : p,
    );
    this.recordAudit('provider_updated', 'provider', id, 'Updated provider settings');
    this.notify();
  }

  public deleteProvider(id: string) {
    this.state.providers = this.state.providers.filter((p) => p.id !== id);
    this.state.accounts = this.state.accounts.filter((a) => a.provider_id !== id);
    this.state.models = this.state.models.filter((m) => m.provider_id !== id);
    this.recordAudit('provider_deleted', 'provider', id, 'Deleted provider and associated accounts/models');
    this.notify();
  }

  public addAccount(body: any) {
    const prov = this.state.providers.find((p) => p.id === body.provider_id);
    const masked = body.key ? `${body.key.slice(0, 4)}••••${body.key.slice(-4)}` : '••••••••';
    const newAcc = {
      id: `acc-${Date.now().toString(36)}`,
      provider_id: body.provider_id,
      provider_name: prov?.name || body.provider_id,
      label: body.label || 'Account Pool Member',
      key_masked: masked,
      status: 'healthy',
      quota_type: body.quota_type || 'none',
      soft_quota_usd: body.soft_quota_usd || null,
      current_spend: 0,
      requests_count: 0,
      tokens_count: 0,
      priority: body.priority ?? 10,
      weight: body.weight ?? 100,
      credential_kind: 'api_key',
      credential_summary: 'Manual Credential',
    };
    this.state.accounts = [...this.state.accounts, newAcc];
    if (prov) prov.accounts_count = (prov.accounts_count || 0) + 1;
    this.recordAudit('account_created', 'account', newAcc.id, `Enrolled account: ${newAcc.label}`);
    this.notify();
    return newAcc;
  }

  public updateAccount(id: string, patch: any) {
    this.state.accounts = this.state.accounts.map((a) =>
      a.id === id ? { ...a, ...patch } : a,
    );
    this.recordAudit('account_updated', 'account', id, 'Updated account pool config');
    this.notify();
  }

  public deleteAccount(id: string) {
    const acc = this.state.accounts.find((a) => a.id === id);
    if (acc) {
      const prov = this.state.providers.find((p) => p.id === acc.provider_id);
      if (prov && prov.accounts_count > 0) prov.accounts_count--;
    }
    this.state.accounts = this.state.accounts.filter((a) => a.id !== id);
    this.recordAudit('account_deleted', 'account', id, 'Deleted account');
    this.notify();
  }

  public resetAccount(id: string) {
    this.state.accounts = this.state.accounts.map((a) =>
      a.id === id ? { ...a, status: 'healthy', current_spend: 0 } : a,
    );
    this.recordAudit('account_reset', 'account', id, 'Cleared error state & reset soft quota spend');
    this.notify();
  }

  public addModel(providerId: string, body: any) {
    const prov = this.state.providers.find((p) => p.id === providerId);
    const newModel = {
      id: `model-${Date.now().toString(36)}`,
      provider_id: providerId,
      provider_name: prov?.name || providerId,
      upstream_id: body.upstream_id || 'custom-model',
      display_name: body.display_name || body.upstream_id || 'Custom Model',
      enabled: body.enabled ?? true,
      context_window: body.context_window ?? 128000,
      max_output_tokens: body.max_output_tokens ?? 4096,
      capabilities: body.capabilities || { text: true, vision: false, reasoning: false, tool_calling: true, structured_output: true, audio: false },
      prices: body.prices || { input_per_1m: 1.0, output_per_1m: 3.0, cached_per_1m: 0.1, cache_write_per_1m: null, thinking_per_1m: null },
      thinking_map: body.thinking_map || { levels: {} },
      transport_override: body.transport_override || null,
      reconciliation: { status: 'new', checked_at: new Date().toISOString(), diff: [], pinned_fields: [] },
      canonical_identity: { status: 'resolved', upstream_model_id: body.upstream_id, canonical_model_id: body.upstream_id, match: 'exact', source: 'manual' },
      model_type: 'chat',
      execution_supported: true,
    };
    this.state.models = [...this.state.models, newModel];
    if (prov) prov.models_count = (prov.models_count || 0) + 1;
    this.recordAudit('model_created', 'model', newModel.id, `Configured model: ${newModel.display_name}`);
    this.notify();
    return newModel;
  }

  public updateModel(id: string, patch: any) {
    this.state.models = this.state.models.map((m) =>
      m.id === id ? { ...m, ...patch } : m,
    );
    this.recordAudit('model_updated', 'model', id, 'Updated model parameters');
    this.notify();
  }

  public deleteModel(id: string) {
    const model = this.state.models.find((m) => m.id === id);
    if (model) {
      const prov = this.state.providers.find((p) => p.id === model.provider_id);
      if (prov && prov.models_count > 0) prov.models_count--;
    }
    this.state.models = this.state.models.filter((m) => m.id !== id);
    this.recordAudit('model_deleted', 'model', id, 'Deleted model configuration');
    this.notify();
  }

  public addRoute(body: any) {
    const newRoute = {
      id: `route-${Date.now().toString(36)}`,
      name: body.name,
      description: body.description || '',
      selection_strategy: body.selection_strategy || body.strategy || 'priority',
      fallback_triggers: body.fallback_triggers || { on_429: true, on_quota: true, on_5xx: true, on_timeout: true },
      targets: body.targets || [],
      portability_policy: body.portability_policy || 'strip_with_warning',
      cache_affinity: body.cache_affinity ?? true,
      sticky_routing: body.sticky_routing ?? true,
      total_hops: 0,
      status: 'active',
      enabled: body.enabled !== false,
    };
    this.state.routes = [...this.state.routes, newRoute];
    this.recordAudit('route_created', 'route', newRoute.id, `Created route: ${newRoute.name} with ${newRoute.targets.length} targets`);
    this.notify();
    return newRoute;
  }

  public updateRoute(id: string, patch: any) {
    this.state.routes = this.state.routes.map((r) =>
      r.id === id ? { ...r, ...patch } : r,
    );
    this.recordAudit('route_updated', 'route', id, 'Updated route target chain');
    this.notify();
  }

  public deleteRoute(id: string) {
    this.state.routes = this.state.routes.filter((r) => r.id !== id);
    this.recordAudit('route_deleted', 'route', id, 'Deleted route');
    this.notify();
  }

  public addAlias(body: any) {
    const newAlias = {
      id: `alias-${Date.now().toString(36)}`,
      alias: body.alias,
      target_type: body.target_type,
      target_id: body.target_id,
      description: body.description || '',
    };
    this.state.aliases = [...this.state.aliases, newAlias];
    this.recordAudit('alias_created', 'alias', newAlias.id, `Bound alias: ${newAlias.alias} -> ${newAlias.target_id}`);
    this.notify();
    return newAlias;
  }

  public deleteAlias(id: string) {
    this.state.aliases = this.state.aliases.filter((a) => a.id !== id);
    this.recordAudit('alias_deleted', 'alias', id, 'Removed model alias');
    this.notify();
  }

  private recordAudit(action: string, resourceType: string, resourceId: string, details: string) {
    const log = {
      id: `aud-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      operator: this.state.user || 'admin',
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: '127.0.0.1',
    };
    this.state.auditLogs = [log, ...this.state.auditLogs];
  }
}

export const demoStore = new DemoStore();
