import type { ScenarioState, ScenarioId } from '../types.ts';
import { healthyScenario } from './healthy.ts';
import { emptyScenario } from './empty.ts';
import { loadingScenario } from './loading.ts';
import { partialOutageScenario } from './partial-outage.ts';
import { providerUnavailableScenario } from './provider-unavailable.ts';
import { oauthExpiredScenario } from './oauth-expired.ts';
import { rateLimitedScenario } from './rate-limited.ts';
import { pluginFailedScenario } from './plugin-failed.ts';
import { noUsageScenario } from './no-usage.ts';
import { largeProviderSetScenario } from './large-provider-set.ts';
import { largeModelCatalogScenario } from './large-model-catalog.ts';
import { complexFallbackRouteScenario } from './complex-fallback-route.ts';

export const SCENARIOS: Record<ScenarioId, ScenarioState> = {
  healthy: healthyScenario,
  empty: emptyScenario,
  loading: loadingScenario,
  'partial-outage': partialOutageScenario,
  'provider-unavailable': providerUnavailableScenario,
  'oauth-expired': oauthExpiredScenario,
  'rate-limited': rateLimitedScenario,
  'plugin-failed': pluginFailedScenario,
  'no-usage': noUsageScenario,
  'large-provider-set': largeProviderSetScenario,
  'large-model-catalog': largeModelCatalogScenario,
  'complex-fallback-route': complexFallbackRouteScenario,
};

export const SCENARIO_LIST: ScenarioState[] = Object.values(SCENARIOS);

export function getScenario(id: string): ScenarioState {
  return SCENARIOS[id as ScenarioId] || SCENARIOS.healthy;
}
