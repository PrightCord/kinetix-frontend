import React from 'react';
import { Database, Zap, DollarSign, ArrowRight, ShieldCheck, RefreshCw, BarChart2 } from 'lucide-react';

export const CacheAffinityView: React.FC = () => {
  const stickyHitRate = 91.7;
  const promptTokensCached = 4128900;
  const estimatedSavingsUsd = 124.50;

  const affinityAccounts = [
    {
      account: 'claude-oauth-2',
      provider: 'Anthropic OAuth Pool',
      route: 'sonnet',
      cachedTokens: 2410000,
      hitRate: 94.2,
      activeClients: ['Pi Agent Worker', 'Cursor IDE'],
      savingsUsd: 72.30,
    },
    {
      account: 'google-ai-studio-primary',
      provider: 'Google Vertex AI',
      route: 'gemini-flash',
      cachedTokens: 1180000,
      hitRate: 89.4,
      activeClients: ['Cursor IDE', 'Analytics Ingest'],
      savingsUsd: 35.40,
    },
    {
      account: 'deepseek-direct-1',
      provider: 'DeepSeek Native',
      route: 'deepseek-fast',
      cachedTokens: 538900,
      hitRate: 78.1,
      activeClients: ['Analytics Ingest'],
      savingsUsd: 16.80,
    },
  ];

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Header */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-[var(--ink)]">
                Sticky Routing &amp; Prompt Cache Affinity
              </h2>
              <p className="text-xs text-[var(--ink)]/60 font-mono">
                Pin repeat conversational contexts to the same upstream provider account to maximize prompt cache hits and minimize TTFT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-3 py-1.5 rounded-lg">
              Estimated Spend Saved: ${estimatedSavingsUsd.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl shadow-sketch">
          <div className="text-xs text-[var(--ink)]/60 font-sans uppercase font-bold">Sticky Cache Hit Rate</div>
          <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1">
            {stickyHitRate}%
          </div>
          <div className="text-[11px] text-[var(--ink)]/60 mt-1">Target consistency preserved</div>
        </div>

        <div className="p-4 bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl shadow-sketch">
          <div className="text-xs text-[var(--ink)]/60 font-sans uppercase font-bold">Cached Prompt Tokens</div>
          <div className="text-2xl font-bold font-mono text-[var(--ink)] mt-1">
            {promptTokensCached.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Discounted 90% by upstreams</div>
        </div>

        <div className="p-4 bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl shadow-sketch">
          <div className="text-xs text-[var(--ink)]/60 font-sans uppercase font-bold">Average TTFT Reduction</div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            -480 ms
          </div>
          <div className="text-[11px] text-[var(--ink)]/60 mt-1">From KV-cache warm dispatches</div>
        </div>

        <div className="p-4 bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl shadow-sketch">
          <div className="text-xs text-[var(--ink)]/60 font-sans uppercase font-bold">Affinity Cache TTL</div>
          <div className="text-2xl font-bold font-mono text-[var(--ink)] mt-1">
            300 sec
          </div>
          <div className="text-[11px] text-[var(--ink)]/60 mt-1">Sliding eviction window</div>
        </div>
      </div>

      {/* Account Affinity Distribution */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch space-y-4">
        <div className="border-b-2 border-[var(--erased)] pb-3 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm uppercase text-[var(--ink)]">
            Account Affinity &amp; Warm Cache Distribution
          </h3>
          <span className="text-xs text-[var(--ink)]/60 font-mono">
            {affinityAccounts.length} active cache affinities
          </span>
        </div>

        <div className="space-y-3">
          {affinityAccounts.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg text-xs space-y-2 font-mono"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-base text-[var(--ink)]">{item.account}</div>
                  <div className="text-[11px] text-[var(--ink)]/60">
                    {item.provider} • Route: <span className="font-bold text-purple-600">{item.route}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-bold px-2 py-0.5 rounded">
                    {item.hitRate}% hit rate
                  </span>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                    +${item.savingsUsd.toFixed(2)} saved
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[var(--erased)] text-[11px] text-[var(--ink)]/70">
                <div>
                  Cached Tokens Held:{' '}
                  <span className="font-bold text-[var(--ink)] font-mono">
                    {item.cachedTokens.toLocaleString()} tokens
                  </span>
                </div>
                <div>
                  Bound Clients:{' '}
                  <span className="font-bold text-[var(--ink)] font-mono">
                    {item.activeClients.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
