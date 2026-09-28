import React, { useEffect, useRef, useState } from 'react';
import { X, Play, RefreshCw, Zap, CheckCircle2, ArrowRight, AlertTriangle, Terminal, Layers } from 'lucide-react';
import { VirtualKey, Route, ModelConfig } from '../types';
import { Button, StatusBadge, Input, Select, TerminalPanel } from './KinetixUI';

interface LiveTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  keys: VirtualKey[];
  routes: Route[];
  models: ModelConfig[];
}

interface ExecMeta {
  servingAccount: string;
  servingProvider: string;
  routeId: string;
  fallbackHops: number;
  fallbackPath: string[];
  warnings: string[];
  ttftMs: number;
  latencyMs: number;
  statusCode: number;
}

const parseServedBy = (raw: string): { provider: string; account: string } => {
  const parts = raw.split(';').map((s) => s.trim());
  let provider = '';
  let account = '';
  for (const part of parts) {
    const [k, v] = part.split('=').map((s) => s.trim());
    if (k === 'provider') provider = v || '';
    if (k === 'account') account = v || '';
  }
  return { provider, account };
};

const parseFallbackHeader = (raw: string): { hops: number; path: string[] } => {
  if (!raw) return { hops: 0, path: [] };
  const hops = parseInt(raw, 10);
  return { hops: Number.isNaN(hops) ? 0 : hops, path: [] };
};

const extractText = (frame: string, protocol: 'openai' | 'anthropic'): string => {
  const lines = frame.split('\n').filter((l) => l.startsWith('data:'));
  let text = '';
  for (const line of lines) {
    const jsonStr = line.replace(/^data:\s*/, '').trim();
    if (!jsonStr || jsonStr === '[DONE]') continue;
    try {
      const obj = JSON.parse(jsonStr);
      if (protocol === 'openai') {
        const delta = obj.choices?.[0]?.delta?.content;
        if (delta) text += delta;
      } else {
        if (obj.type === 'content_block_delta') {
          const delta = obj.delta?.text;
          if (delta) text += delta;
        }
      }
    } catch {
      /* ignore partial parse error */
    }
  }
  return text;
};

const extractNonStreamText = (json: any, protocol: 'openai' | 'anthropic'): string => {
  if (protocol === 'openai') {
    return json?.choices?.[0]?.message?.content || JSON.stringify(json, null, 2);
  }
  return json?.content?.[0]?.text || JSON.stringify(json, null, 2);
};

export const LiveTesterModal: React.FC<LiveTesterModalProps> = ({
  isOpen,
  onClose,
  keys,
  routes,
  models,
}) => {
  const [selectedKeyId, setSelectedKeyId] = useState(keys[0]?.id || '');
  const [authMode, setAuthMode] = useState<'admin' | 'raw'>('admin');
  const [rawKey, setRawKey] = useState('');
  const [protocol, setProtocol] = useState<'openai' | 'anthropic'>('openai');
  const [target, setTarget] = useState<string>('');
  const [prompt, setPrompt] = useState('REPLY BACK EXACTLY: `Testing Kinetix proxy gateway`');
  const [stream, setStream] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ExecMeta | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadTracePath = async (routeId: string) => {
    try {
      const res = await fetch(`/admin/api/route-traces/${encodeURIComponent(routeId)}`, {
        credentials: 'same-origin',
      });
      if (!res.ok) return;
      const j = await res.json();
      const steps: any[] = Array.isArray(j?.steps) ? j.steps : [];
      const path = steps.map((s: any) =>
        s?.target ? `${s.target}: ${s.detail ?? ''}`.trim() : String(s?.detail ?? s?.stage ?? ''),
      );
      const hops = steps.filter((s: any) => s?.stage === 'attempt').length;
      setMeta((m) =>
        m ? { ...m, fallbackHops: hops > 1 ? hops - 1 : m.fallbackHops, fallbackPath: path } : m,
      );
    } catch {
      /* trace is best-effort */
    }
  };

  useEffect(() => {
    if (!selectedKeyId && keys.length > 0) setSelectedKeyId(keys[0].id);
  }, [keys, selectedKeyId]);

  if (!isOpen) return null;

  const defaultTarget =
    routes.length > 0
      ? routes[0].name
      : models.length > 0
      ? models[0].upstreamModelId
      : '';
  const effectiveTarget = target || defaultTarget;
  const useRaw = authMode === 'raw';

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
  };

  const handleRunTest = async () => {
    setIsLoading(true);
    setOutput('');
    setError(null);
    setMeta(null);

    const controller = new AbortController();
    abortRef.current = controller;
    const started = performance.now();
    let ttft = 0;
    let accumulated = '';

    const url = useRaw
      ? protocol === 'openai'
        ? '/v1/chat/completions'
        : '/v1/messages'
      : '/admin/api/test-stream';

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body: Record<string, unknown>;

    if (useRaw) {
      if (protocol === 'openai') {
        headers['Authorization'] = `Bearer ${rawKey.trim()}`;
      } else {
        headers['x-api-key'] = rawKey.trim();
        headers['anthropic-version'] = '2023-06-01';
      }
      body = {
        model: effectiveTarget,
        max_tokens: 512,
        stream,
        messages: [{ role: 'user', content: prompt }],
      };
    } else {
      body = {
        key_id: selectedKeyId,
        model: effectiveTarget,
        prompt,
        format: protocol,
        stream,
        max_tokens: 512,
      };
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers,
        signal: controller.signal,
        body: JSON.stringify(body),
      });

      const servedBy = parseServedBy(res.headers.get('x-kinetix-served-by') || '');
      const routeId = res.headers.get('x-kinetix-route-id') || '';
      const fallback = res.headers.get('x-kinetix-fallback') || '';
      const parsedFallback = parseFallbackHeader(fallback);

      if (!res.ok) {
        const text = await res.text();
        let message = `HTTP ${res.status}`;
        try {
          const j = JSON.parse(text);
          message = j?.error?.message || j?.error || message;
        } catch {
          /* keep default */
        }
        setError(message);
        setMeta({
          servingAccount: servedBy.account,
          servingProvider: servedBy.provider,
          routeId,
          warnings: [],
          fallbackHops: parsedFallback.hops,
          fallbackPath: parsedFallback.path,
          ttftMs: 0,
          latencyMs: Math.round(performance.now() - started),
          statusCode: res.status,
        });
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split('\n\n');
          buffer = frames.pop() || '';
          for (const frame of frames) {
            const text = extractText(frame, protocol);
            if (text) {
              if (!ttft) ttft = Math.round(performance.now() - started);
              accumulated += text;
              setOutput(accumulated);
            }
          }
        }
      } else {
        const j = await res.json();
        accumulated = extractNonStreamText(j, protocol);
        setOutput(accumulated);
        ttft = Math.round(performance.now() - started);
      }

      setMeta({
        servingAccount: servedBy.account,
        servingProvider: servedBy.provider,
        routeId,
        warnings: [],
        fallbackHops: parsedFallback.hops,
        fallbackPath: parsedFallback.path,
        ttftMs: ttft,
        latencyMs: Math.round(performance.now() - started),
        statusCode: res.status,
      });

      if (parsedFallback.hops > 0 && routeId) {
        void loadTracePath(routeId);
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError((e as Error).message || 'Request failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-[6px] max-w-4xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)] bg-[var(--surface-raised)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              KINETIX PIPELINE TESTER
            </h3>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              (Live Streaming &amp; Failover Evaluation)
            </span>
          </div>

          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Split: Left Controls / Right Stream */}
        <div className="grid grid-cols-1 md:grid-cols-5 flex-1 overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
          {/* Left Column: Controls (2 cols) */}
          <div className="md:col-span-2 p-4 space-y-3.5 text-xs font-mono">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                  1. Authentication
                </label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setAuthMode('admin')}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      authMode === 'admin'
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    Stored Key
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('raw')}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      authMode === 'raw'
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    Raw Secret
                  </button>
                </div>
              </div>

              {!useRaw ? (
                <Select
                  value={selectedKeyId}
                  onChange={(e) => setSelectedKeyId(e.target.value)}
                  className="w-full"
                  mono
                >
                  {keys.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} ({k.tag})
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  value={rawKey}
                  onChange={(e) => setRawKey(e.target.value)}
                  placeholder="sk-kinetix-..."
                  mono
                />
              )}
            </div>

            <div>
              <label className="block text-[var(--text-muted)] uppercase tracking-wider text-[10px] mb-1">
                2. Inbound Wire Protocol
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProtocol('openai')}
                  className={`py-1.5 px-2 rounded-[4px] border font-mono text-xs cursor-pointer text-center transition-colors ${
                    protocol === 'openai'
                      ? 'bg-[var(--surface-raised)] border-[var(--primary)] text-[var(--primary)] font-bold'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  OpenAI (/v1/chat)
                </button>
                <button
                  type="button"
                  onClick={() => setProtocol('anthropic')}
                  className={`py-1.5 px-2 rounded-[4px] border font-mono text-xs cursor-pointer text-center transition-colors ${
                    protocol === 'anthropic'
                      ? 'bg-[var(--surface-raised)] border-[var(--primary)] text-[var(--primary)] font-bold'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  Anthropic (/v1/messages)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[var(--text-muted)] uppercase tracking-wider text-[10px] mb-1">
                3. Target Route / Model
              </label>
              <Select
                value={effectiveTarget}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full"
                mono
              >
                {routes.length > 0 && (
                  <optgroup label="Routes (Automatic Fallback)">
                    {routes.map((c) => (
                      <option key={c.id} value={c.name}>
                        ⚡ Route: {c.name} ({c.targets.length} pool tiers)
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Direct Models">
                  {models.map((m) => (
                    <option key={m.id} value={m.upstreamModelId}>
                      {m.displayName} ({m.providerName})
                    </option>
                  ))}
                </optgroup>
              </Select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={stream}
                  onChange={(e) => setStream(e.target.checked)}
                  className="rounded border-[var(--border)]"
                />
                <span className="text-xs text-[var(--text-primary)]">Stream SSE Response</span>
              </label>
            </div>

            <div className="pt-2">
              {isLoading ? (
                <Button variant="danger" size="md" onClick={handleStop} className="w-full">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Stop Stream
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRunTest}
                  disabled={useRaw ? !rawKey.trim() || !effectiveTarget : !selectedKeyId || !effectiveTarget}
                  className="w-full font-mono text-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Execute Request
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: Prompt & Live Stream Console (3 cols) */}
          <div className="md:col-span-3 p-4 flex flex-col space-y-3 bg-[#08080b]">
            <div>
              <label className="block text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider mb-1">
                Prompt Payload
              </label>
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-2 font-mono text-xs text-[var(--text-primary)] focus:border-[var(--primary)] focus-visible:outline-none resize-none"
              />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-1 text-xs font-mono">
                <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-[var(--primary)]" />
                  Live SSE Output
                </span>
                {meta && (
                  <span className="text-[var(--healthy)] text-[11px]">
                    TTFT {meta.ttftMs}ms • Total {meta.latencyMs}ms
                  </span>
                )}
              </div>

              {/* Streaming Output Box */}
              <div className="flex-1 min-h-[180px] max-h-[300px] overflow-y-auto bg-[#050508] border border-[var(--border)] rounded-[4px] p-3 font-mono text-xs text-[var(--text-primary)] leading-relaxed select-text whitespace-pre-wrap">
                {isLoading && !output && (
                  <span className="text-[var(--text-muted)] animate-pulse">
                    Connecting to upstream endpoint…
                  </span>
                )}
                {output}
                {error && <span className="text-[var(--danger)] block mt-1">Error: {error}</span>}
                {!isLoading && !output && !error && (
                  <span className="text-[var(--text-muted)] italic">
                    Press "Execute Request" to dispatch through the routing pipeline.
                  </span>
                )}
              </div>
            </div>

            {/* Execution Meta Strip */}
            {meta && (
              <div className="p-2.5 rounded-[4px] bg-[var(--surface-raised)] border border-[var(--border)] font-mono text-[11px] space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--text-muted)]">Served by:</span>
                    <b className="text-[var(--text-primary)]">{meta.servingProvider}</b>
                    <span className="text-[var(--text-muted)]">({meta.servingAccount})</span>
                  </div>

                  {meta.fallbackHops > 0 ? (
                    <StatusBadge variant="warning" size="sm">
                      ⚡ 429 RECOVERED ({meta.fallbackHops} HOPS)
                    </StatusBadge>
                  ) : (
                    <StatusBadge variant="healthy" size="sm">
                      DIRECT ROUTE
                    </StatusBadge>
                  )}
                </div>

                {meta.fallbackPath.length > 0 && (
                  <div className="text-[10px] text-[var(--text-secondary)] border-t border-[var(--border)] pt-1">
                    Path: {meta.fallbackPath.join(' → ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
