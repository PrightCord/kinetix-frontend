export interface ScenarioState {
  id: string;
  name: string;
  description: string;
  badge?: string;
  badgeColor?: 'green' | 'amber' | 'red' | 'blue' | 'purple';
  user?: string;
  keys: any[];
  providers: any[];
  accounts: any[];
  models: any[];
  routes: any[];
  aliases: any[];
  requests: any[];
  liveRequests: any[];
  auditLogs: any[];
  metrics: any;
  runtimeHealth: any;
  plugins: any[];
  exportFiles: any[];
  exportDays: any[];
  publicBaseUrl?: string;
  lifecycleSettings?: any;
}

export type ScenarioId =
  | 'healthy'
  | 'empty'
  | 'loading'
  | 'partial-outage'
  | 'provider-unavailable'
  | 'oauth-expired'
  | 'rate-limited'
  | 'plugin-failed'
  | 'no-usage'
  | 'large-provider-set'
  | 'large-model-catalog'
  | 'complex-fallback-route';
