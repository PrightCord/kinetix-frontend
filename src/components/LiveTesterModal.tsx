import React, { useState } from 'react';
import { X, Play, RefreshCw, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { VirtualKey, Combo, ModelConfig } from '../types';
import { WobblyCard, SketchButton, SketchBadge } from './HandDrawnElements';

interface LiveTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  keys: VirtualKey[];
  combos: Combo[];
  models: ModelConfig[];
  onLogNewRequest?: (req: any) => void;
}

export const LiveTesterModal: React.FC<LiveTesterModalProps> = ({
  isOpen,
  onClose,
  keys,
  combos,
  models,
}) => {
  const [selectedKeyId, setSelectedKeyId] = useState(keys[0]?.id || '');
  const [protocol, setProtocol] = useState<'openai' | 'anthropic'>('openai');
  const [target, setTarget] = useState<string>('coder');
  const [prompt, setPrompt] = useState<string>(
    'Write a quick Rust function to calculate exponential backoff for an LLM pool key.'
  );
  const [simulate429, setSimulate429] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamChunks, setStreamChunks] = useState<string[]>([]);
  const [executionMeta, setExecutionMeta] = useState<{
    latencyMs: number;
    ttftMs: number;
    servingAccount: string;
    servingProvider: string;
    fallbackHops: number;
    fallbackPath: string[];
    costUsd: number;
    tokensIn: number;
    tokensOut: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setIsLoading(true);
    setStreamChunks([]);
    setExecutionMeta(null);

    const isFallback = simulate429 && target === 'coder';

    // Mock realistic streaming response from proxy
    const sampleTokens = [
      'Here is the exponential backoff function in Rust for Kinetix:\n\n',
      '```rust\n',
      'use std::time::Duration;\n\n',
      'pub fn calculate_backoff(attempt: u32, base_ms: u64, max_ms: u64) -> Duration {\n',
      '    let exp = 2u64.saturating_pow(attempt);\n',
      '    let millis = (base_ms * exp).min(max_ms);\n',
      '    Duration::from_millis(millis)\n',
      '}\n',
      '```\n\n',
      '// Handled safely before first byte: zero client interruption.',
    ];

    // Simulate TTFT (time to first token)
    await new Promise((r) => setTimeout(r, isFallback ? 420 : 180));

    let accumulated = '';
    for (let i = 0; i < sampleTokens.length; i++) {
      await new Promise((r) => setTimeout(r, 60));
      accumulated += sampleTokens[i];
      setStreamChunks((prev) => [...prev, sampleTokens[i]]);
    }

    setExecutionMeta({
      latencyMs: isFallback ? 980 : 420,
      ttftMs: isFallback ? 420 : 180,
      servingAccount: isFallback
        ? 'Gemini Team Pay-as-you-go (Fallback Account #2)'
        : 'Gemini Free Tier (Account #1)',
      servingProvider: 'Google Gemini',
      fallbackHops: isFallback ? 1 : 0,
      fallbackPath: isFallback
        ? ['acc-gemini-free (429 RateLimit Triggered)', 'acc-gemini-paid (200 OK Fallback)']
        : ['acc-gemini-free (200 OK)'],
      costUsd: isFallback ? 0.0038 : 0.0001,
      tokensIn: 840,
      tokensOut: 245,
    });

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        <WobblyCard decoration="tape" className="bg-[#fdfbf7] p-6 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full border-2 border-[#2d2d2d] bg-white hover:bg-[#ff4d4d] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#ff4d4d] text-white border-2 border-[#2d2d2d] wobbly-circle -rotate-3">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#2d2d2d]">
                Live Proxy Interactive Tester
              </h2>
              <p className="text-base text-[#2d2d2d]/80 font-body">
                Verify client streaming, virtual key limits, and zero-downtime combo fallback in real-time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Control Panel */}
            <div className="space-y-4">
              {/* Virtual Key Select */}
              <div>
                <label className="block text-base font-heading font-bold text-[#2d2d2d] mb-1">
                  1. Virtual Key (Authorization)
                </label>
                <select
                  value={selectedKeyId}
                  onChange={(e) => setSelectedKeyId(e.target.value)}
                  className="w-full bg-white border-2 border-[#2d2d2d] px-3 py-2 text-base font-body sketch-shadow-sm focus:outline-none focus:border-[#2d5da1]"
                  style={{ borderRadius: '15px 225px 255px 25px / 255px 25px 225px 15px' }}
                >
                  {keys.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} ({k.key.slice(0, 14)}...)
                    </option>
                  ))}
                </select>
              </div>

              {/* Protocol Dialect */}
              <div>
                <label className="block text-base font-heading font-bold text-[#2d2d2d] mb-1">
                  2. Inbound Format (Client Wire)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProtocol('openai')}
                    className={`py-1.5 px-2 border-2 border-[#2d2d2d] text-sm font-heading cursor-pointer text-center ${
                      protocol === 'openai'
                        ? 'bg-[#2d5da1] text-white sketch-shadow-sm font-bold'
                        : 'bg-white text-[#2d2d2d]'
                    }`}
                    style={{ borderRadius: '120px 10px 100px 10px / 10px 100px 10px 120px' }}
                  >
                    OpenAI (/v1/chat)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProtocol('anthropic')}
                    className={`py-1.5 px-2 border-2 border-[#2d2d2d] text-sm font-heading cursor-pointer text-center ${
                      protocol === 'anthropic'
                        ? 'bg-[#ff4d4d] text-white sketch-shadow-sm font-bold'
                        : 'bg-white text-[#2d2d2d]'
                    }`}
                    style={{ borderRadius: '120px 10px 100px 10px / 10px 100px 10px 120px' }}
                  >
                    Anthropic (/v1/messages)
                  </button>
                </div>
              </div>

              {/* Model / Combo selection */}
              <div>
                <label className="block text-base font-heading font-bold text-[#2d2d2d] mb-1">
                  3. Requested Model or Combo
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-white border-2 border-[#2d2d2d] px-3 py-2 text-base font-body sketch-shadow-sm focus:outline-none focus:border-[#2d5da1]"
                  style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                >
                  <optgroup label="Combos (With Automatic Fallback)">
                    {combos.map((c) => (
                      <option key={c.id} value={c.name}>
                        ⚡ Combo: {c.name} ({c.targets.length} pool targets)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Direct Models">
                    {models.map((m) => (
                      <option key={m.id} value={m.upstreamModelId}>
                        {m.displayName} ({m.providerName})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Simulate 429 toggle */}
              <div
                className="p-3 bg-[#fff9c4] border-2 border-[#2d2d2d] sketch-shadow-sm"
                style={{ borderRadius: '15px 225px 255px 25px / 255px 25px 225px 15px' }}
              >
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={simulate429}
                    onChange={(e) => setSimulate429(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#ff4d4d]"
                  />
                  <div>
                    <span className="font-heading font-bold text-sm text-[#2d2d2d]">
                      Simulate 429 Rate Limit on Primary Key
                    </span>
                    <p className="text-xs text-[#2d2d2d]/80 font-body">
                      Tests Kinetix automatic fallback hops before any bytes reach the client!
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit button */}
              <SketchButton
                variant="danger"
                size="lg"
                disabled={isLoading}
                onClick={handleRunTest}
                className="w-full gap-2 font-heading font-bold"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Streaming via Proxy...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    Send Stream Request
                  </>
                )}
              </SketchButton>
            </div>

            {/* Prompt & Output Panel */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-base font-heading font-bold text-[#2d2d2d] mb-1">
                  Prompt (Pi Coding Agent format)
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-white border-2 border-[#2d2d2d] p-3 font-body text-base sketch-shadow-sm focus:outline-none focus:border-[#2d5da1] resize-none"
                  style={{ borderRadius: '15px 225px 255px 25px / 255px 25px 225px 15px' }}
                />
              </div>

              {/* Streaming Output Box */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-base font-heading font-bold text-[#2d2d2d] flex items-center gap-2">
                    <span>Live SSE Stream Result</span>
                    {isLoading && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#ff4d4d] animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-[#ff4d4d]" /> Receiving chunks
                      </span>
                    )}
                  </label>
                  {executionMeta && (
                    <span className="text-xs text-[#2d2d2d]/70 font-mono">
                      TTFT: {executionMeta.ttftMs}ms | Total: {executionMeta.latencyMs}ms
                    </span>
                  )}
                </div>

                <div
                  className="w-full min-h-[160px] max-h-[220px] overflow-y-auto bg-white border-2 border-[#2d2d2d] p-3 font-mono text-sm sketch-shadow-sm whitespace-pre-wrap select-text"
                  style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                >
                  {streamChunks.length === 0 && !isLoading && (
                    <span className="text-[#2d2d2d]/40 font-body text-base">
                      Click "Send Stream Request" to test Kinetix proxy streaming and view headers...
                    </span>
                  )}
                  {streamChunks.join('')}
                </div>
              </div>

              {/* Execution Trace & Fallback Information */}
              {executionMeta && (
                <div
                  className="p-3 bg-[#e5e0d8]/50 border-2 border-[#2d2d2d] sketch-shadow-sm space-y-2 text-sm"
                  style={{ borderRadius: '15px 225px 255px 25px / 255px 25px 225px 15px' }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2d2d2d]/20 pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
                      <span className="font-heading font-bold text-base">
                        Served By: {executionMeta.servingAccount}
                      </span>
                    </div>
                    {executionMeta.fallbackHops > 0 ? (
                      <SketchBadge variant="red" rotation="-1deg">
                        ⚡ Fallback Recovered ({executionMeta.fallbackHops} hop)
                      </SketchBadge>
                    ) : (
                      <SketchBadge variant="green" rotation="1deg">
                        Direct Primary Key
                      </SketchBadge>
                    )}
                  </div>

                  {executionMeta.fallbackHops > 0 && (
                    <div className="text-xs font-mono text-[#2d2d2d] bg-white p-2 border border-[#2d2d2d] rounded">
                      <strong className="font-heading">Fallback Sequence:</strong>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {executionMeta.fallbackPath.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <span className={step.includes('429') ? 'text-[#ff4d4d] font-bold' : 'text-[#2e7d32]'}>
                              {step}
                            </span>
                            {idx < executionMeta.fallbackPath.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-[#2d2d2d]" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono pt-1">
                    <div className="bg-white p-1 border border-[#2d2d2d] rounded">
                      Tokens In: <strong>{executionMeta.tokensIn}</strong>
                    </div>
                    <div className="bg-white p-1 border border-[#2d2d2d] rounded">
                      Tokens Out: <strong>{executionMeta.tokensOut}</strong>
                    </div>
                    <div className="bg-white p-1 border border-[#2d2d2d] rounded">
                      Cost: <strong>${executionMeta.costUsd.toFixed(4)}</strong>
                    </div>
                    <div className="bg-white p-1 border border-[#2d2d2d] rounded">
                      Status: <strong className="text-[#2e7d32]">200 OK</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </WobblyCard>
      </div>
    </div>
  );
};
