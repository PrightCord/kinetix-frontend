import { installFetchInterceptor } from './backend/interceptor.ts';
import { demoStore } from './backend/store.ts';
import type { ScenarioId } from './types.ts';
import { SCENARIOS } from './scenarios/index.ts';

export function bootstrapDemo() {
  installFetchInterceptor();

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const scenarioParam = params.get('scenario');
    if (scenarioParam && scenarioParam in SCENARIOS) {
      demoStore.setScenario(scenarioParam as ScenarioId);
    }
  }
}

// Auto-run bootstrap on module import
bootstrapDemo();
