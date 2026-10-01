import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SCENARIOS, SCENARIO_LIST, getScenario } from '../src/demo/scenarios/index.ts';

const REQUIRED_SCENARIOS = [
  'healthy',
  'empty',
  'loading',
  'partial-outage',
  'provider-unavailable',
  'oauth-expired',
  'rate-limited',
  'plugin-failed',
  'no-usage',
  'large-provider-set',
  'large-model-catalog',
  'complex-fallback-route',
];

test('scenario registry contains all 12 required deterministic scenarios', () => {
  for (const id of REQUIRED_SCENARIOS) {
    assert.ok(SCENARIOS[id], `Missing required scenario: ${id}`);
  }
  assert.ok(SCENARIO_LIST.length >= 12);
});

test('empty scenario has zero entities', () => {
  const empty = getScenario('empty');
  assert.equal(empty.keys.length, 0);
  assert.equal(empty.providers.length, 0);
  assert.equal(empty.accounts.length, 0);
  assert.equal(empty.routes.length, 0);
  assert.equal(empty.metrics.total_requests, 0);
});

test('provider-unavailable scenario has circuit breaker in open state', () => {
  const outage = getScenario('provider-unavailable');
  const circuit = outage.runtimeHealth.provider_circuits.find((c) => c.provider_id === 'prov-anthropic');
  assert.ok(circuit);
  assert.equal(circuit.state, 'open');
  assert.ok(circuit.consecutive_failures > 0);
});

test('oauth-expired scenario contains expired credential account and audit record', () => {
  const oauth = getScenario('oauth-expired');
  const acc = oauth.accounts.find((a) => a.credential_kind === 'oauth2');
  assert.ok(acc, 'OAuth account missing');
  assert.equal(acc.status, 'unhealthy');
  assert.match(acc.credential_summary, /expired/i);
});

test('complex-fallback-route scenario has multi-hop cascade chain', () => {
  const complex = getScenario('complex-fallback-route');
  const route = complex.routes.find((r) => r.id === 'route-cascade-ultra');
  assert.ok(route, 'Ultra-reliable chain route missing');
  assert.ok(route.targets.length >= 5, 'Must contain multi-hop targets');
});
