import React, { useState, useEffect } from 'react';
import { Radio, Play, Pause, ArrowRight, Eye, RefreshCw, Filter, Layers, Zap } from 'lucide-react';
import type { RequestLog, LiveRequest } from '../../types';
import { INITIAL_REQUEST_TRACES, OperationalRequestTrace } from '../../demo/operationalData';

interface LiveTrafficViewProps {
  requests: RequestLog[];
  liveRequests: LiveRequest[];
  onInspectTrace: (trace: OperationalRequestTrace) => void;
  onExplainTarget: (routeName: string, targetName: string) => void;
}

export const LiveTrafficView: React.FC<LiveTrafficViewProps> = ({
  requests,
  liveRequests,
  onInspectTrace,
  onExplainTarget,
}) => {
  const [isLive, setIsLive] = useState(true);
  const [streamRows, setStreamRows] = useState(INITIAL_REQUEST_TRACES);
  const [filterRoute, setFilterRoute] = useState<string>('all');
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'success' | 'fallback'>('all');

  const filteredRows = streamRows.filter((r) => {
    if (filterRoute !== 'all' && r.route.name !== filterRoute) return false;
    if (filterOutcome === 'fallback' && !r.fallbackCascade) return false;
    if (filterOutcome === 'success' && r.fallbackCascade) return false;
    return true;
  });

  // Simulated live traffic ticker
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const models = ['Claude Sonnet 5', 'Gemini 3.8 Flash', 'DeepSeek V4.1 Flash', 'Claude Opus 4.6'];
      const clients = ['Pi Agent Worker', 'Cursor Editor IDE', 'Analytics Ingest'];
      const routes = ['sonnet', 'gemini-flash', 'deepseek-fast'];
      const randomModel = models[Math.floor(Math.random() * models.length)];
      const randomClient = clients[Math.floor(Math.random() * clients.length)];
      const randomRoute = routes[Math.floor(Math.random() * routes.length)];
      const hasFallback = Math.random() < 0.25;

      const newTrace: OperationalRequestTrace = {
        id: `trace-${Date.now()}`,
        requestId: `req-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        client: {
          name: randomClient,
          keyId: `vk_${randomClient.substring(0, 4).toLowerCase()}_${Math.floor(Math.random() * 9000 + 1000)}`,
          ip: '10.244.1.88',
        },
        route: {
          name: randomRoute,
          id: `route-${randomRoute}`,
          strategy: 'priority',
        },
        capabilities: {
          streaming: true,
          tools: true,
          reasoning: 'high',
          vision: true,
        },
        eligibleAccountsCount: 4,
        excludedAccounts: hasFallback ? [{ name: 'claude-oauth-1', reason: 'in cooldown' }] : [],
        stickyAffinity: {
          applied: true,
          targetAccount: hasFallback ? 'claude-oauth-3' : 'claude-oauth-2',
          cacheAgeSec: 24,
          cacheTokensReused: 14200,
        },
        admission: {
          activeConcurrency: Math.floor(Math.random() * 3 + 1),
          maxLimit: 4,
          queueTimeMs: Math.floor(Math.random() * 15 + 4),
        },
        primaryAttempt: {
          provider: randomModel.includes('Claude') ? 'Anthropic' : randomModel.includes('Gemini') ? 'Google Vertex AI' : 'DeepSeek Native',
          account: 'claude-oauth-2',
          model: randomModel,
          reasoningTranslation: {
            from: 'high',
            to: 'adaptive',
            wirePayload: { thinking: { type: 'adaptive' } },
          },
          outcome: hasFallback ? '429 rate_limit' : '200 OK',
          statusCode: hasFallback ? 429 : 200,
          latencyMs: Math.floor(Math.random() * 300 + 200),
        },
        fallbackCascade: hasFallback
          ? {
              triggeredBy: '429 rate_limit on primary target',
              targetAccount: 'claude-oauth-3',
              targetProvider: 'Anthropic Bedrock Pool',
              targetModel: randomModel,
              outcome: '200 OK',
              statusCode: 200,
              latencyMs: Math.floor(Math.random() * 800 + 1200),
            }
          : undefined,
        finalOutcome: {
          status: 'success',
          statusCode: 200,
          ttftMs: Math.floor(Math.random() * 400 + 200),
          totalDurationMs: Math.floor(Math.random() * 2000 + 1000),
          inputTokens: Math.floor(Math.random() * 12000 + 2000),
          cachedTokens: Math.floor(Math.random() * 10000 + 1000),
          outputTokens: Math.floor(Math.random() * 1500 + 200),
          thinkingTokens: Math.floor(Math.random() * 1200),
          totalTokens: 14820,
          costUsd: 0.024,
        },
      };

      setStreamRows((prev) => [newTrace, ...prev.slice(0, 30)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Header */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold">
              <Radio className={`w-5 h-5 ${isLive ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-[var(--ink)]">
                Live Traffic &amp; Request Flow Stream
              </h2>
              <p className="text-xs text-[var(--ink)]/60 font-mono">
                Streaming pipeline: Client → Route → Target Account → Upstream Model → TTFT &amp; Fallback Status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isLive
                  ? 'border-emerald-600 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)]/60'
              }`}
            >
              {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isLive ? 'Live Ticker Streaming' : 'Stream Paused'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase text-[var(--ink)]/60">Route:</span>
          {['all', 'sonnet', 'gemini-flash', 'deepseek-fast'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRoute(r)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                filterRoute === r
                  ? 'border-[var(--marker-red)] bg-[var(--tint-red)] text-[var(--ink)]'
                  : 'border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)]/70 hover:bg-[var(--erased)]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold uppercase text-[var(--ink)]/60">Outcome:</span>
          {(['all', 'success', 'fallback'] as const).map((out) => (
            <button
              key={out}
              onClick={() => setFilterOutcome(out)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                filterOutcome === out
                  ? 'border-[var(--pen-blue)] bg-blue-50 dark:bg-blue-950/40 text-[var(--ink)]'
                  : 'border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)]/70 hover:bg-[var(--erased)]'
              }`}
            >
              {out}
            </button>
          ))}
        </div>
      </div>

      {/* Stream Table */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl shadow-sketch overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b-2 border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)]/80 uppercase text-[11px] font-sans">
                <th className="p-3.5 pl-5">TIME / ID</th>
                <th className="p-3.5">CLIENT</th>
                <th className="p-3.5">ROUTE</th>
                <th className="p-3.5">TARGET SERVED</th>
                <th className="p-3.5">MODEL</th>
                <th className="p-3.5 text-right">TTFT</th>
                <th className="p-3.5 text-right">TOKENS</th>
                <th className="p-3.5 text-center">HOPS</th>
                <th className="p-3.5">OUTCOME</th>
                <th className="p-3.5 pr-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--erased)]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-[var(--ink)]/60">
                    No requests match the active filter criteria. Try selecting "all".
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const hasCascade = Boolean(row.fallbackCascade);

                  return (
                    <tr
                      key={row.id}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onInspectTrace(row);
                        }
                      }}
                      onClick={() => onInspectTrace(row)}
                      className="hover:bg-[var(--paper)]/70 focus:bg-[var(--paper)] focus:outline-none transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 pl-5">
                        <div className="font-bold text-[var(--ink)]">{new Date(row.timestamp).toLocaleTimeString()}</div>
                        <div className="text-[10px] text-[var(--ink)]/50 font-mono">{row.requestId}</div>
                      </td>

                      <td className="p-3.5 font-bold text-[var(--ink)]">
                        <div>{row.client.name}</div>
                        <div className="text-[10px] text-[var(--ink)]/50 font-mono">{row.client.keyId}</div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold text-[11px]">
                          {row.route.name}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-[var(--ink)]/80">
                        <div>{row.fallbackCascade?.targetAccount || row.primaryAttempt.account}</div>
                        <div className="text-[10px] text-[var(--ink)]/50">
                          {row.fallbackCascade?.targetProvider || row.primaryAttempt.provider}
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-[var(--ink)]">
                        {row.primaryAttempt.model}
                      </td>

                      <td className="p-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {row.finalOutcome.ttftMs}ms
                      </td>

                      <td className="p-3.5 text-right font-mono text-[var(--ink)]/80">
                        <div>{row.finalOutcome.totalTokens.toLocaleString()}</div>
                        <div className="text-[10px] text-cyan-600 dark:text-cyan-400">
                          {row.finalOutcome.cachedTokens.toLocaleString()} cached
                        </div>
                      </td>

                      <td className="p-3.5 text-center font-mono">
                        {hasCascade ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                            +1 hop
                          </span>
                        ) : (
                          <span className="text-[var(--ink)]/40">0</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          200 OK
                        </span>
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectTrace(row);
                          }}
                          aria-label={`Inspect trace for request ${row.requestId}`}
                          className="px-2 py-1 rounded bg-[var(--erased)] hover:bg-[var(--ink)] hover:text-[var(--paper)] text-xs font-bold transition-all cursor-pointer"
                        >
                          Inspect Trace
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
