import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shuffle,
  Shield,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Server,
  Play,
  Bug,
} from 'lucide-react';
import type { ProxyMetrics, Route, Account, Provider } from '../../types';
import { INCIDENT_EVENTS } from '../../demo/operationalData';

interface OperationsOverviewViewProps {
  metrics: ProxyMetrics;
  routes: Route[];
  accounts: Account[];
  providers: Provider[];
  onNavigateTab: (tab: any) => void;
  onOpenPlayground: () => void;
  onOpenDebugMode: () => void;
}

export const OperationsOverviewView: React.FC<OperationsOverviewViewProps> = ({
  metrics,
  routes,
  accounts,
  providers,
  onNavigateTab,
  onOpenPlayground,
  onOpenDebugMode,
}) => {
  // Operational telemetry
  const requestsPerMin = 12.4;
  const successRate = 99.2;
  const fallbackRate = 3.1;
  const stickyHitRate = 91.7;
  const p50TtftMs = 620;
  const activeStreams = metrics.activeStreams || 4;

  const coolingDownAccounts = accounts.filter((a) => a.status === 'cooldown' || a.id.includes('oauth-1'));
  const activeIncidents = INCIDENT_EVENTS.filter((i) => !i.resolved);

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner: Core Operational Status */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-6 shadow-sketch">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[var(--erased)] pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
              <h2 className="font-heading font-bold text-2xl text-[var(--ink)]">
                Is Kinetix behaving correctly?
              </h2>
            </div>
            <p className="text-xs text-[var(--ink)]/60 font-mono mt-1">
              Gateway Runtime: <span className="text-emerald-600 dark:text-emerald-400 font-bold">NORMAL OPERATIONAL STATE</span> • Active Routing Engines: {routes.length} • Pooled Accounts: {accounts.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPlayground}
              className="px-3 py-2 rounded-lg border-2 border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--erased)] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-blue-600" />
              Route Playground
            </button>
            <button
              onClick={onOpenDebugMode}
              className="px-3 py-2 rounded-lg border-2 border-amber-600 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-amber-500/20"
            >
              <Bug className="w-3.5 h-3.5 text-amber-600" />
              Debug Mode
            </button>
          </div>
        </div>

        {/* Operational Telemetry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-5">
          <div className="p-3.5 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
            <div className="text-[11px] text-[var(--ink)]/60 uppercase font-sans font-bold">SYSTEM</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <span>Healthy</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          <div className="p-3.5 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
            <div className="text-[11px] text-[var(--ink)]/60 uppercase font-sans font-bold">Requests / Min</div>
            <div className="text-xl font-bold text-[var(--ink)] mt-1 font-mono">
              {requestsPerMin}
            </div>
          </div>

          <div className="p-3.5 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
            <div className="text-[11px] text-[var(--ink)]/60 uppercase font-sans font-bold">Success Rate</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {successRate}%
            </div>
          </div>

          <div className="p-3.5 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
            <div className="text-[11px] text-[var(--ink)]/60 uppercase font-sans font-bold">Fallback Rate</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
              {fallbackRate}%
            </div>
          </div>

          <div className="p-3.5 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
            <div className="text-[11px] text-[var(--ink)]/60 uppercase font-sans font-bold">Sticky Cache Hit</div>
            <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1 font-mono">
              {stickyHitRate}%
            </div>
          </div>

          <div className="p-3.5 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
            <div className="text-[11px] text-[var(--ink)]/60 uppercase font-sans font-bold">P50 TTFT</div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 font-mono">
              {p50TtftMs} ms
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: ATTENTION Alerts vs Topology Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATTENTION Panel */}
        <div className="bg-[var(--surface)] border-2 border-amber-500/60 rounded-xl p-5 shadow-sketch">
          <div className="flex items-center justify-between border-b-2 border-[var(--erased)] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-heading font-bold text-base uppercase tracking-wider text-[var(--ink)]">
                ATTENTION / Action Required
              </h3>
            </div>
            <span className="text-xs font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-bold">
              {activeIncidents.length + 2} notices
            </span>
          </div>

          <div className="space-y-3">
            {/* Alert 1 */}
            <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-900 rounded-lg text-xs">
              <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
                <span>Claude Code OAuth</span>
                <span className="text-[10px] bg-amber-200 dark:bg-amber-900 px-1.5 py-0.5 rounded font-mono">
                  AUTO-BACKOFF
                </span>
              </div>
              <div className="mt-1 text-[var(--ink)]/80">
                2 / 6 accounts currently cooling down following upstream 429 quota exhaustion.
              </div>
              <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-900 flex justify-between items-center text-[11px]">
                <span className="text-[var(--ink)]/60">Estimated recovery: ~02:40</span>
                <button
                  onClick={() => onNavigateTab('account-health')}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  View Accounts →
                </button>
              </div>
            </div>

            {/* Alert 2 */}
            <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-900 rounded-lg text-xs">
              <div className="flex items-center justify-between font-bold text-rose-900 dark:text-rose-200">
                <span>sonnet Route Fallback Surge</span>
                <span className="text-[10px] bg-rose-200 dark:bg-rose-900 px-1.5 py-0.5 rounded font-mono">
                  ELEVATED
                </span>
              </div>
              <div className="mt-1 text-[var(--ink)]/80">
                Fallback rate ↑ 3.2% → 11.8% over the last 15m window. Secondary pool absorbing traffic.
              </div>
              <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900 flex justify-between items-center text-[11px]">
                <span className="text-[var(--ink)]/60">Secondary target: claude-oauth-3</span>
                <button
                  onClick={() => onNavigateTab('failures')}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Inspect Failures →
                </button>
              </div>
            </div>

            {/* Alert 3 */}
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-900 rounded-lg text-xs">
              <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-200">
                <span>Antigravity Integration</span>
                <span className="text-[10px] bg-blue-200 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono">
                  ROTATION
                </span>
              </div>
              <div className="mt-1 text-[var(--ink)]/80">
                3 credential rotations in 10m. Proactive token refresh cycling smoothly without downtime.
              </div>
            </div>

            {/* Alert 4 */}
            <div className="p-3.5 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg text-xs">
              <div className="flex items-center justify-between font-bold text-[var(--ink)]">
                <span>OpenCode Free Catalog</span>
                <span className="text-[10px] bg-[var(--erased)] px-1.5 py-0.5 rounded font-mono">
                  DISCOVERY
                </span>
              </div>
              <div className="mt-1 text-[var(--ink)]/80">
                Model catalog changed: 4 new models observed via upstream discovery probe.
              </div>
            </div>
          </div>
        </div>

        {/* Live Credential & Account Topology Snapshot */}
        <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-[var(--erased)] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-500" />
                <h3 className="font-heading font-bold text-base uppercase tracking-wider text-[var(--ink)]">
                  Live Routing Topology
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('topology')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-bold"
              >
                Full Topology Graph →
              </button>
            </div>

            {/* Topology ASCII/Flow Render */}
            <div className="p-4 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg space-y-3 text-xs font-mono">
              {/* Route 1: sonnet */}
              <div>
                <div className="text-[var(--ink)]/60 text-[11px] mb-1">CLIENT: Pi Agent Worker (vk_prod_pi_9918)</div>
                <div className="pl-2 border-l-2 border-purple-500 space-y-1.5">
                  <div className="font-bold text-purple-600 dark:text-purple-400">
                    └── route: sonnet (strategy: priority)
                  </div>
                  <div className="pl-4 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>├─ Claude OAuth A (Primary)</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">● active (1/4)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>├─ Claude OAuth B (Secondary)</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">● standby (0/4)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>├─ Claude OAuth C (Rate limited)</span>
                      <span className="text-amber-500 font-bold flex items-center gap-1">◐ cooldown (02:40)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>└─ Antigravity Failover</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">● standby (0/6)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route 2: gemini */}
              <div className="pt-2 border-t border-[var(--erased)]">
                <div className="text-[var(--ink)]/60 text-[11px] mb-1">CLIENT: Cursor IDE (vk_dev_cursor_44)</div>
                <div className="pl-2 border-l-2 border-blue-500 space-y-1.5">
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    └── route: gemini-flash (strategy: round-robin)
                  </div>
                  <div className="pl-4 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>├─ Gemini Vertex BYOK</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">● active (2/8)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>└─ Google AI Studio Backup</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">● standby (0/5)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--erased)] flex items-center justify-between text-xs text-[var(--ink)]/60">
            <span>Click any node to inspect cooldowns &amp; concurrency</span>
            <button
              onClick={() => onNavigateTab('traces')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              Inspect Recent Traces →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
