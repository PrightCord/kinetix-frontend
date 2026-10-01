export interface OperationalRequestTrace {
  id: string;
  requestId: string;
  timestamp: string;
  client: {
    name: string;
    keyId: string;
    ip: string;
  };
  route: {
    name: string;
    id: string;
    strategy: string;
  };
  capabilities: {
    streaming: boolean;
    tools: boolean;
    reasoning: string;
    vision: boolean;
  };
  eligibleAccountsCount: number;
  excludedAccounts: {
    name: string;
    reason: string;
  }[];
  stickyAffinity: {
    applied: boolean;
    targetAccount: string;
    cacheAgeSec?: number;
    cacheTokensReused?: number;
  };
  admission: {
    activeConcurrency: number;
    maxLimit: number;
    queueTimeMs: number;
  };
  primaryAttempt: {
    provider: string;
    account: string;
    model: string;
    reasoningTranslation: {
      from: string;
      to: string;
      wirePayload: Record<string, any>;
    };
    outcome: string;
    statusCode: number;
    latencyMs: number;
  };
  fallbackCascade?: {
    triggeredBy: string;
    targetAccount: string;
    targetProvider: string;
    targetModel: string;
    outcome: string;
    statusCode: number;
    latencyMs: number;
  };
  finalOutcome: {
    status: 'success' | 'failed';
    statusCode: number;
    ttftMs: number;
    totalDurationMs: number;
    inputTokens: number;
    cachedTokens: number;
    outputTokens: number;
    thinkingTokens: number;
    totalTokens: number;
    costUsd: number;
  };
}

export interface TargetExplanation {
  routeId: string;
  routeName: string;
  selectedTarget: {
    account: string;
    provider: string;
    model: string;
    reason: string;
  };
  eligibleCount: number;
  excludedCount: number;
  excluded: {
    target: string;
    reason: string;
  }[];
  ranked: {
    rank: number;
    target: string;
    provider: string;
    details: string[];
    concurrency: string;
    ttftMs: number;
    selected: boolean;
  }[];
}

export interface FailureCategory {
  id: string;
  title: string;
  count: number;
  color: string;
  description: string;
  drilldown: {
    provider: string;
    count: number;
    recentError: string;
    affectedAccount: string;
    time: string;
  }[];
}

export interface AccountHealthItem {
  id: string;
  provider: string;
  label: string;
  authType: 'oauth' | 'byok' | 'service_account';
  status: 'healthy' | 'cooldown' | 'degraded' | 'expired';
  cooldownRemainingSec?: number;
  concurrency: {
    active: number;
    max: number;
  };
  recentFailures: number;
  lastFailureMessage?: string;
  credentialExpiresAt?: string;
  rotationCount: number;
  lastRotated: string;
  tokenValid: boolean;
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'credential' | 'provider' | 'fallback' | 'plugin' | 'cooldown';
  title: string;
  details: string;
  affectedTarget: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface ConfigHistoryEntry {
  id: string;
  timestamp: string;
  operator: string;
  category: 'route' | 'plugin' | 'account' | 'discovery' | 'key';
  target: string;
  summary: string;
  diff: {
    field: string;
    before: any;
    after: any;
  }[];
  snapshot: Record<string, any>;
}

export interface ReasoningTranslationRule {
  level: 'off' | 'low' | 'medium' | 'high' | 'max';
  integration: string;
  capability: string;
  wirePayload: Record<string, any>;
  notes: string;
}

export interface CapabilityMatrixRow {
  modelId: string;
  displayName: string;
  provider: string;
  tools: boolean;
  images: boolean;
  reasoning: 'Adaptive' | 'Budget' | 'Tiered' | 'Toggle' | 'None';
  reasoningLevels: string;
  streaming: boolean;
  contextWindow: string;
  source: 'plugin' | 'models.dev' | 'catalog' | 'manual';
  provenance: {
    pluginId?: string;
    version?: string;
    manifestRef?: string;
    lastVerified: string;
    probeStatus: 'verified' | 'cached' | 'pending';
  };
}

export const INITIAL_REQUEST_TRACES: OperationalRequestTrace[] = [
  {
    id: 'trace-1',
    requestId: 'req-01HX89Z2PA',
    timestamp: new Date(Date.now() - 14000).toISOString(),
    client: {
      name: 'Pi Agent Worker',
      keyId: 'vk_prod_pi_9918',
      ip: '10.244.1.88',
    },
    route: {
      name: 'sonnet',
      id: 'route-sonnet-primary',
      strategy: 'priority',
    },
    capabilities: {
      streaming: true,
      tools: true,
      reasoning: 'high',
      vision: true,
    },
    eligibleAccountsCount: 4,
    excludedAccounts: [
      { name: 'deepseek-coder-1', reason: 'tools unsupported for this schema' },
      { name: 'claude-oauth-1', reason: 'in active cooldown until 14:42 (rate limited)' },
    ],
    stickyAffinity: {
      applied: true,
      targetAccount: 'claude-oauth-2',
      cacheAgeSec: 42,
      cacheTokensReused: 16901,
    },
    admission: {
      activeConcurrency: 2,
      maxLimit: 4,
      queueTimeMs: 14,
    },
    primaryAttempt: {
      provider: 'Anthropic',
      account: 'claude-oauth-2',
      model: 'Claude Sonnet 5',
      reasoningTranslation: {
        from: 'high',
        to: 'adaptive',
        wirePayload: {
          thinking: {
            type: 'adaptive',
          },
        },
      },
      outcome: '429 rate_limit',
      statusCode: 429,
      latencyMs: 340,
    },
    fallbackCascade: {
      triggeredBy: '429 rate_limit on primary target',
      targetAccount: 'claude-oauth-3',
      targetProvider: 'Anthropic Bedrock Pool',
      targetModel: 'claude-3-5-sonnet-20241022',
      outcome: '200 OK',
      statusCode: 200,
      latencyMs: 3860,
    },
    finalOutcome: {
      status: 'success',
      statusCode: 200,
      ttftMs: 812,
      totalDurationMs: 4200,
      inputTokens: 18420,
      cachedTokens: 16901,
      outputTokens: 1822,
      thinkingTokens: 1420,
      totalTokens: 20242,
      costUsd: 0.0482,
    },
  },
  {
    id: 'trace-2',
    requestId: 'req-01HX89M40Q',
    timestamp: new Date(Date.now() - 42000).toISOString(),
    client: {
      name: 'Cursor Editor IDE',
      keyId: 'vk_dev_cursor_44',
      ip: '192.168.1.14',
    },
    route: {
      name: 'gemini-flash',
      id: 'route-gemini-fast',
      strategy: 'round-robin',
    },
    capabilities: {
      streaming: true,
      tools: false,
      reasoning: 'medium',
      vision: true,
    },
    eligibleAccountsCount: 3,
    excludedAccounts: [],
    stickyAffinity: {
      applied: true,
      targetAccount: 'google-ai-studio-primary',
      cacheAgeSec: 120,
      cacheTokensReused: 8400,
    },
    admission: {
      activeConcurrency: 1,
      maxLimit: 8,
      queueTimeMs: 4,
    },
    primaryAttempt: {
      provider: 'Google Vertex AI',
      account: 'google-ai-studio-primary',
      model: 'gemini-3.8-flash',
      reasoningTranslation: {
        from: 'medium',
        to: 'budget_tokens',
        wirePayload: {
          thinkingConfig: {
            thinkingBudget: 4096,
          },
        },
      },
      outcome: '200 OK',
      statusCode: 200,
      latencyMs: 780,
    },
    finalOutcome: {
      status: 'success',
      statusCode: 200,
      ttftMs: 240,
      totalDurationMs: 780,
      inputTokens: 9200,
      cachedTokens: 8400,
      outputTokens: 640,
      thinkingTokens: 512,
      totalTokens: 9840,
      costUsd: 0.0031,
    },
  },
  {
    id: 'trace-3',
    requestId: 'req-01HX88X19B',
    timestamp: new Date(Date.now() - 85000).toISOString(),
    client: {
      name: 'Analytics Batch Ingest',
      keyId: 'vk_batch_pipeline_01',
      ip: '10.200.4.12',
    },
    route: {
      name: 'deepseek-fast',
      id: 'route-deepseek-main',
      strategy: 'least-used',
    },
    capabilities: {
      streaming: false,
      tools: false,
      reasoning: 'off',
      vision: false,
    },
    eligibleAccountsCount: 2,
    excludedAccounts: [],
    stickyAffinity: {
      applied: false,
      targetAccount: 'deepseek-direct-1',
    },
    admission: {
      activeConcurrency: 3,
      maxLimit: 10,
      queueTimeMs: 8,
    },
    primaryAttempt: {
      provider: 'DeepSeek Native',
      account: 'deepseek-direct-1',
      model: 'deepseek-chat',
      reasoningTranslation: {
        from: 'off',
        to: 'none',
        wirePayload: {},
      },
      outcome: '503 Service Unavailable',
      statusCode: 503,
      latencyMs: 120,
    },
    fallbackCascade: {
      triggeredBy: '503 Service Unavailable on primary',
      targetAccount: 'openrouter-failover',
      targetProvider: 'OpenRouter Gateway',
      targetModel: 'deepseek/deepseek-chat',
      outcome: '200 OK',
      statusCode: 200,
      latencyMs: 1450,
    },
    finalOutcome: {
      status: 'success',
      statusCode: 200,
      ttftMs: 680,
      totalDurationMs: 1570,
      inputTokens: 3100,
      cachedTokens: 0,
      outputTokens: 890,
      thinkingTokens: 0,
      totalTokens: 3990,
      costUsd: 0.0014,
    },
  },
];

export const TARGET_EXPLANATIONS: Record<string, TargetExplanation> = {
  sonnet: {
    routeId: 'route-sonnet-primary',
    routeName: 'sonnet',
    selectedTarget: {
      account: 'claude-oauth-3',
      provider: 'Anthropic OAuth Pool',
      model: 'claude-3-5-sonnet-latest',
      reason: 'Sticky cache affinity matched with 0 active in-flight requests and lowest p50 TTFT (620ms)',
    },
    eligibleCount: 5,
    excludedCount: 2,
    excluded: [
      {
        target: 'deepseek-coder-1',
        reason: 'Tools unsupported for this tool_choice schema',
      },
      {
        target: 'claude-oauth-1',
        reason: 'In active cooldown until 14:42 (triggered by 429 upstream rate limit)',
      },
    ],
    ranked: [
      {
        rank: 1,
        target: 'claude-oauth-3',
        provider: 'Anthropic OAuth Pool',
        details: ['Sticky affinity verified', 'Healthy status', 'Hot prompt cache present'],
        concurrency: '1/4',
        ttftMs: 620,
        selected: true,
      },
      {
        rank: 2,
        target: 'claude-oauth-2',
        provider: 'Anthropic BYOK Tier 4',
        details: ['Healthy status', 'No cooldown', 'Cold cache'],
        concurrency: '0/4',
        ttftMs: 710,
        selected: false,
      },
      {
        rank: 3,
        target: 'antigravity-1',
        provider: 'Antigravity Enterprise Gateway',
        details: ['Healthy status', 'Alternative region failover'],
        concurrency: '2/4',
        ttftMs: 840,
        selected: false,
      },
    ],
  },
};

export const FAILURE_CATEGORIES: FailureCategory[] = [
  {
    id: 'rate_limited',
    title: 'rate_limited (429)',
    count: 38,
    color: '#f59e0b',
    description: 'Upstream provider TPM/RPM rate limit triggered; dispatched to fallback cascade',
    drilldown: [
      { provider: 'Anthropic', count: 21, recentError: 'rate_limit_error: Number of request tokens exceeded limits', affectedAccount: 'claude-oauth-1', time: '14:22:10' },
      { provider: 'Google Vertex AI', count: 9, recentError: 'ResourceExhausted: Quota exceeded for GenerateContent', affectedAccount: 'gemini-pro-1', time: '13:58:02' },
      { provider: 'OpenCode Free', count: 8, recentError: 'HTTP 429: Too many requests for free tier', affectedAccount: 'opencode-free-pool', time: '12:45:19' },
    ],
  },
  {
    id: 'credential_invalid',
    title: 'credential_invalid',
    count: 14,
    color: '#ef4444',
    description: 'OAuth token expired or API key revoked; account moved to cooldown pending rotation',
    drilldown: [
      { provider: 'Anthropic Claude Code', count: 9, recentError: 'invalid_grant: Refresh token has expired or been revoked', affectedAccount: 'claude-oauth-2', time: '14:02:44' },
      { provider: 'AI Studio Service Account', count: 5, recentError: 'unauthenticated: The request does not have valid authentication credentials', affectedAccount: 'ai-studio-service-1', time: '11:15:20' },
    ],
  },
  {
    id: 'provider_capacity',
    title: 'provider_capacity (503)',
    count: 12,
    color: '#8b5cf6',
    description: 'Upstream datacenter overloaded or undergoing transient maintenance',
    drilldown: [
      { provider: 'DeepSeek Native', count: 8, recentError: '503 Service Temporarily Unavailable: High GPU cluster load', affectedAccount: 'deepseek-direct-1', time: '13:30:11' },
      { provider: 'Anthropic Direct', count: 4, recentError: 'OverloadedError: Anthropic is experiencing high traffic', affectedAccount: 'claude-byok-1', time: '10:14:09' },
    ],
  },
  {
    id: 'account_unavailable',
    title: 'account_unavailable',
    count: 8,
    color: '#ec4899',
    description: 'Account paused by operator or reached soft billing quota limit',
    drilldown: [
      { provider: 'Anthropic BYOK', count: 5, recentError: 'Soft quota spend threshold ($100.00) exceeded', affectedAccount: 'acc-anthropic-dev', time: '09:40:00' },
      { provider: 'Mistral Cloud', count: 3, recentError: 'Account manually paused by operator', affectedAccount: 'mistral-eu-1', time: '08:22:15' },
    ],
  },
  {
    id: 'capability_mismatch',
    title: 'capability_mismatch',
    count: 3,
    color: '#3b82f6',
    description: 'Client requested reasoning or image inputs unsupported by selected model target',
    drilldown: [
      { provider: 'DeepSeek Native', count: 2, recentError: 'Model deepseek-coder does not support tool calling in strict mode', affectedAccount: 'deepseek-coder-1', time: '12:10:44' },
      { provider: 'Ollama Local', count: 1, recentError: 'Vision inputs provided but llama3.2 is text-only', affectedAccount: 'ollama-box', time: '07:30:11' },
    ],
  },
  {
    id: 'upstream_internal',
    title: 'upstream_internal (500)',
    count: 11,
    color: '#64748b',
    description: 'Internal server errors from upstream LLM infrastructure',
    drilldown: [
      { provider: 'OpenAI Gateway', count: 7, recentError: '500 InternalServerError: The server had an error processing your request', affectedAccount: 'openai-corp-pool', time: '14:12:00' },
      { provider: 'Cohere Enterprise', count: 4, recentError: '500 internal_error: Service generation failed', affectedAccount: 'cohere-command-r', time: '11:05:32' },
    ],
  },
  {
    id: 'transport_failure',
    title: 'transport_failure',
    count: 2,
    color: '#06b6d4',
    description: 'TCP connection reset or TLS handshake timeout before HTTP response',
    drilldown: [
      { provider: 'Ollama Edge', count: 2, recentError: 'ECONNREFUSED 10.0.4.99:11434 (Host unreachable)', affectedAccount: 'ollama-edge-worker', time: '06:15:20' },
    ],
  },
];

export const ACCOUNT_HEALTH_ITEMS: AccountHealthItem[] = [
  {
    id: 'acc-claude-oauth-1',
    provider: 'Anthropic',
    label: 'Claude Code OAuth #1',
    authType: 'oauth',
    status: 'cooldown',
    cooldownRemainingSec: 254,
    concurrency: { active: 0, max: 4 },
    recentFailures: 3,
    lastFailureMessage: '429 Rate limit exceeded; cooling down for 5 minutes',
    credentialExpiresAt: new Date(Date.now() + 3600000 * 5).toISOString(),
    rotationCount: 4,
    lastRotated: '2026-10-01T06:14:00Z',
    tokenValid: true,
  },
  {
    id: 'acc-claude-oauth-2',
    provider: 'Anthropic',
    label: 'Claude Code OAuth #2',
    authType: 'oauth',
    status: 'healthy',
    concurrency: { active: 2, max: 4 },
    recentFailures: 0,
    credentialExpiresAt: new Date(Date.now() + 3600000 * 8).toISOString(),
    rotationCount: 6,
    lastRotated: '2026-10-01T04:20:00Z',
    tokenValid: true,
  },
  {
    id: 'acc-claude-oauth-3',
    provider: 'Anthropic',
    label: 'Claude Code OAuth #3',
    authType: 'oauth',
    status: 'healthy',
    concurrency: { active: 1, max: 4 },
    recentFailures: 0,
    credentialExpiresAt: new Date(Date.now() + 3600000 * 12).toISOString(),
    rotationCount: 2,
    lastRotated: '2026-10-01T01:00:00Z',
    tokenValid: true,
  },
  {
    id: 'acc-google-vertex-1',
    provider: 'Google Vertex AI',
    label: 'Vertex Gemini BYOK Primary',
    authType: 'service_account',
    status: 'healthy',
    concurrency: { active: 1, max: 8 },
    recentFailures: 0,
    credentialExpiresAt: new Date(Date.now() + 86400000 * 20).toISOString(),
    rotationCount: 1,
    lastRotated: '2026-09-20T00:00:00Z',
    tokenValid: true,
  },
  {
    id: 'acc-antigravity-1',
    provider: 'Antigravity Gateway',
    label: 'Antigravity Enterprise OAuth',
    authType: 'oauth',
    status: 'healthy',
    concurrency: { active: 2, max: 6 },
    recentFailures: 1,
    lastFailureMessage: 'Token refreshed successfully via OAuth helper',
    credentialExpiresAt: new Date(Date.now() + 3600000 * 2).toISOString(),
    rotationCount: 12,
    lastRotated: '2026-10-01T07:10:00Z',
    tokenValid: true,
  },
  {
    id: 'acc-deepseek-1',
    provider: 'DeepSeek Native',
    label: 'DeepSeek Official API Direct',
    authType: 'byok',
    status: 'degraded',
    concurrency: { active: 3, max: 10 },
    recentFailures: 8,
    lastFailureMessage: '503 GPU cluster temporary capacity bottleneck',
    rotationCount: 0,
    lastRotated: '2026-09-01T00:00:00Z',
    tokenValid: true,
  },
];

export const INCIDENT_EVENTS: IncidentEvent[] = [
  {
    id: 'inc-101',
    timestamp: '2026-10-01T07:35:12Z',
    severity: 'warning',
    category: 'fallback',
    title: 'Fallback cascade rate elevated on route `sonnet`',
    details: 'Fallback rate increased from 3.2% to 11.8% over the last 15-minute window following upstream 429 surges.',
    affectedTarget: 'route:sonnet',
    resolved: false,
  },
  {
    id: 'inc-102',
    timestamp: '2026-10-01T07:28:40Z',
    severity: 'critical',
    category: 'cooldown',
    title: 'Account entered automatic cooldown',
    details: 'Claude Code OAuth #1 placed in 5-minute cooldown after 3 consecutive 429 rate limit errors.',
    affectedTarget: 'account:claude-oauth-1',
    resolved: false,
  },
  {
    id: 'inc-103',
    timestamp: '2026-10-01T07:18:02Z',
    severity: 'info',
    category: 'credential',
    title: 'Automatic OAuth credential rotation completed',
    details: 'Antigravity OAuth token refreshed proactively 15 minutes before expiration token deadline.',
    affectedTarget: 'account:antigravity-1',
    resolved: true,
    resolvedAt: '2026-10-01T07:18:03Z',
  },
  {
    id: 'inc-104',
    timestamp: '2026-10-01T06:45:11Z',
    severity: 'info',
    category: 'plugin',
    title: 'Plugin antigravity-oauth upgraded',
    details: 'Plugin manifest updated from v0.7.1 to v0.7.2 with enhanced thinking parameter mappings.',
    affectedTarget: 'plugin:antigravity-oauth',
    resolved: true,
    resolvedAt: '2026-10-01T06:45:12Z',
  },
];

export const CONFIG_HISTORY_ENTRIES: ConfigHistoryEntry[] = [
  {
    id: 'hist-201',
    timestamp: '2026-10-01T07:21:00Z',
    operator: 'admin',
    category: 'route',
    target: 'route:sonnet',
    summary: 'Route `sonnet` updated: fallback triggers configured',
    diff: [
      { field: 'fallbackTriggers.on429', before: false, after: true },
      { field: 'portabilityPolicy', before: 'reject', after: 'strip_with_warning' },
    ],
    snapshot: {
      id: 'route-sonnet-primary',
      name: 'sonnet',
      selectionStrategy: 'priority',
      fallbackTriggers: { on429: true, onQuota: true, on5xx: true, onTimeout: true },
    },
  },
  {
    id: 'hist-202',
    timestamp: '2026-10-01T07:18:00Z',
    operator: 'system-agent',
    category: 'plugin',
    target: 'plugin:antigravity-oauth',
    summary: 'Plugin antigravity-oauth 0.7.1 → 0.7.2',
    diff: [
      { field: 'version', before: '0.7.1', after: '0.7.2' },
      { field: 'routing_facts_refresh_ms', before: 60000, after: 30000 },
    ],
    snapshot: {
      id: 'antigravity-oauth',
      version: '0.7.2',
      status: 'active',
    },
  },
  {
    id: 'hist-203',
    timestamp: '2026-10-01T06:54:00Z',
    operator: 'admin',
    category: 'account',
    target: 'account:claude-oauth-2',
    summary: 'Account claude-oauth-2 credential refreshed',
    diff: [
      { field: 'status', before: 'cooldown', after: 'healthy' },
      { field: 'weight', before: 1, after: 3 },
    ],
    snapshot: {
      id: 'acc-claude-oauth-2',
      status: 'healthy',
      weight: 3,
    },
  },
  {
    id: 'hist-204',
    timestamp: '2026-10-01T05:41:00Z',
    operator: 'discovery-sync',
    category: 'discovery',
    target: 'provider:opencode-free',
    summary: 'Discovery refresh: 4 models changed in catalog',
    diff: [
      { field: 'modelsCount', before: 8, after: 12 },
      { field: 'newModels', before: [], after: ['opencode-qwen-2.5', 'opencode-deepseek-r1'] },
    ],
    snapshot: {
      providerId: 'opencode-free',
      modelsCount: 12,
    },
  },
];

export const REASONING_TRANSLATIONS: ReasoningTranslationRule[] = [
  {
    level: 'high',
    integration: 'Claude Code OAuth (Anthropic)',
    capability: 'adaptive reasoning',
    wirePayload: {
      thinking: {
        type: 'adaptive',
      },
    },
    notes: 'Normalized to Claude adaptive reasoning policy with unbounded thinking output.',
  },
  {
    level: 'high',
    integration: 'Anthropic Direct (Budgeted)',
    capability: 'budgeted thinking',
    wirePayload: {
      thinking: {
        type: 'enabled',
        budget_tokens: 16000,
      },
    },
    notes: 'Maps canonical "high" reasoning level to 16,000 budget tokens.',
  },
  {
    level: 'high',
    integration: 'OpenCode Free / OpenAI o-series',
    capability: 'reasoning_effort parameter',
    wirePayload: {
      reasoning_effort: 'high',
    },
    notes: 'Maps canonical level to standard reasoning_effort field.',
  },
  {
    level: 'high',
    integration: 'Google Gemini 3.8 Flash (Vertex/AI Studio)',
    capability: 'thinkingConfig.thinkingBudget',
    wirePayload: {
      thinkingConfig: {
        thinkingBudget: 8192,
      },
    },
    notes: 'Maps canonical "high" to 8,192 tokens thinking budget.',
  },
  {
    level: 'medium',
    integration: 'Claude Code OAuth (Anthropic)',
    capability: 'adaptive reasoning',
    wirePayload: {
      thinking: {
        type: 'enabled',
        budget_tokens: 8000,
      },
    },
    notes: 'Maps canonical "medium" reasoning level to 8,000 budget tokens.',
  },
  {
    level: 'low',
    integration: 'OpenAI o-series',
    capability: 'reasoning_effort parameter',
    wirePayload: {
      reasoning_effort: 'low',
    },
    notes: 'Low effort setting for fast code checks and light reasoning.',
  },
  {
    level: 'off',
    integration: 'All Providers',
    capability: 'disabled',
    wirePayload: {},
    notes: 'Strips thinking tokens and forwards standard generation parameters.',
  },
];

export const CAPABILITY_MATRIX_DATA: CapabilityMatrixRow[] = [
  {
    modelId: 'claude-sonnet-5',
    displayName: 'Claude Sonnet 5',
    provider: 'Anthropic',
    tools: true,
    images: true,
    reasoning: 'Adaptive',
    reasoningLevels: 'off / high',
    streaming: true,
    contextWindow: '200,000',
    source: 'plugin',
    provenance: {
      pluginId: 'antigravity-oauth',
      version: '0.7.2',
      manifestRef: 'plugin.yaml:models[0]',
      lastVerified: '2026-10-01',
      probeStatus: 'verified',
    },
  },
  {
    modelId: 'claude-opus-4-6',
    displayName: 'Claude Opus 4.6',
    provider: 'Anthropic',
    tools: true,
    images: true,
    reasoning: 'Budget',
    reasoningLevels: '5 levels (1k - 32k)',
    streaming: true,
    contextWindow: '200,000',
    source: 'models.dev',
    provenance: {
      pluginId: 'models.dev-sync',
      version: '1.4.0',
      manifestRef: 'api.models.dev/v1/anthropic/opus',
      lastVerified: '2026-09-28',
      probeStatus: 'verified',
    },
  },
  {
    modelId: 'gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash',
    provider: 'Google Vertex AI',
    tools: true,
    images: true,
    reasoning: 'Tiered',
    reasoningLevels: '4 tiers (off, low, med, high)',
    streaming: true,
    contextWindow: '1,048,576',
    source: 'plugin',
    provenance: {
      pluginId: 'vertex-oauth',
      version: '0.5.0',
      manifestRef: 'vertex.yaml:models[2]',
      lastVerified: '2026-10-01',
      probeStatus: 'verified',
    },
  },
  {
    modelId: 'deepseek-v4-1-flash',
    displayName: 'DeepSeek V4.1 Flash',
    provider: 'DeepSeek Native',
    tools: true,
    images: false,
    reasoning: 'Toggle',
    reasoningLevels: 'off / on',
    streaming: true,
    contextWindow: '64,000',
    source: 'plugin',
    provenance: {
      pluginId: 'deepseek-native-driver',
      version: '0.3.1',
      manifestRef: 'deepseek.json:wireFormat',
      lastVerified: '2026-09-30',
      probeStatus: 'verified',
    },
  },
  {
    modelId: 'gpt-4o',
    displayName: 'OpenAI GPT-4o',
    provider: 'OpenAI Gateway',
    tools: true,
    images: true,
    reasoning: 'None',
    reasoningLevels: 'none',
    streaming: true,
    contextWindow: '128,000',
    source: 'catalog',
    provenance: {
      manifestRef: 'openai.com/v1/models',
      lastVerified: '2026-09-25',
      probeStatus: 'cached',
    },
  },
  {
    modelId: 'o3-mini',
    displayName: 'OpenAI o3-mini',
    provider: 'OpenAI Gateway',
    tools: true,
    images: false,
    reasoning: 'Tiered',
    reasoningLevels: 'low / medium / high',
    streaming: true,
    contextWindow: '200,000',
    source: 'catalog',
    provenance: {
      manifestRef: 'openai.com/v1/models',
      lastVerified: '2026-09-29',
      probeStatus: 'verified',
    },
  },
];
