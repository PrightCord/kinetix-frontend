import type { ScenarioState } from '../types.ts';
import { healthyScenario } from './healthy.ts';

const modelNames = [
  'claude-3-7-sonnet',
  'claude-3-5-sonnet',
  'claude-3-5-haiku',
  'claude-3-opus',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'o1',
  'o1-mini',
  'o3-mini',
  'gemini-2.0-flash',
  'gemini-2.0-pro-exp',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'deepseek-r1',
  'deepseek-v3',
  'llama-3.3-70b-instruct',
  'llama-3.1-405b-instruct',
  'llama-3.1-8b-instruct',
  'mistral-large-2411',
  'mistral-small-2409',
  'codestral-2501',
  'pixtral-large',
  'qwen-2.5-coder-32b',
  'qwen-2.5-72b-instruct',
  'command-r-plus',
  'command-r-08-2024',
  'sonar-deep-research',
  'sonar-reasoning',
  'grok-2-1212',
  'grok-2-vision',
];

const generatedModels = modelNames.flatMap((baseName, idx) => {
  const providerId = idx % 2 === 0 ? 'prov-anthropic' : 'prov-openai';
  const providerName = idx % 2 === 0 ? 'Anthropic Direct' : 'OpenAI Production';
  return [
    {
      id: `model-${baseName}`,
      provider_id: providerId,
      provider_name: providerName,
      upstream_id: `${baseName}-latest`,
      display_name: baseName.toUpperCase().replace(/-/g, ' '),
      enabled: idx % 7 !== 0,
      context_window: (idx % 3 + 1) * 64000,
      max_output_tokens: 8192,
      capabilities: {
        text: true,
        vision: idx % 3 === 0,
        reasoning: baseName.includes('r1') || baseName.includes('o1') || baseName.includes('3-7') || baseName.includes('reasoning'),
        tool_calling: true,
        structured_output: true,
        audio: idx % 5 === 0,
      },
      prices: {
        input_per_1m: (idx + 1) * 0.25,
        output_per_1m: (idx + 1) * 1.0,
        cached_per_1m: (idx + 1) * 0.05,
        cache_write_per_1m: null,
        thinking_per_1m: null,
      },
      reconciliation: {
        status: idx % 4 === 0 ? 'changed' : 'unchanged',
        checked_at: new Date().toISOString(),
        diff: idx % 4 === 0 ? [{ field: 'max_output_tokens', configured: 4096, observed: 8192 }] : [],
        pinned_fields: [],
      },
      canonical_identity: {
        status: 'resolved',
        upstream_model_id: `${baseName}-latest`,
        canonical_model_id: baseName,
        match: 'exact',
        source: 'models.dev',
      },
      model_type: 'chat',
      execution_supported: true,
    },
  ];
});

export const largeModelCatalogScenario: ScenarioState = {
  ...healthyScenario,
  id: 'large-model-catalog',
  name: 'Massive Model Catalog (30+ Models)',
  description: 'Enterprise catalog with dozens of models across frontier reasoning, multi-modal, and code-specialized architectures with price reconciliation diffs.',
  badge: 'Catalog Stress',
  badgeColor: 'purple',
  models: generatedModels,
};
