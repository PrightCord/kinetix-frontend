import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DESIGNS, DESIGN_LIST, getDesign } from '../src/lab/registry.ts';

test('design registry contains all 5 required designs', () => {
  assert.equal(DESIGN_LIST.length, 5);
  assert.ok(DESIGNS.current, 'current design missing');
  assert.ok(DESIGNS.flat, 'flat design missing');
  assert.ok(DESIGNS.glass, 'glass design missing');
  assert.ok(DESIGNS.brutalist, 'brutalist design missing');
  assert.ok(DESIGNS.terminal, 'terminal design missing');
});

test('current design is baseline canonical with level 1 tokens', () => {
  const current = getDesign('current');
  assert.equal(current.id, 'current');
  assert.equal(current.level, 1);
  assert.match(current.name, /Canonical/i);
});

test('terminal design is full product level 3 shell substitution', () => {
  const terminal = getDesign('terminal');
  assert.equal(terminal.id, 'terminal');
  assert.equal(terminal.level, 3);
  assert.match(terminal.description, /Level 3/i);
});

test('invalid design ID falls back safely to current', () => {
  const fallback = getDesign('non-existent-design-id');
  assert.equal(fallback.id, 'current');
});
