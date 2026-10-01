import React, { useState } from 'react';
import {
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
  Key,
  X,
  ChevronRight,
  Activity,
  Layers,
} from 'lucide-react';
import type { ProxyMetrics, Route, Account, Provider } from '../../types';

interface OperationsOverviewViewProps {
  metrics: ProxyMetrics;
  routes: Route[];
  accounts: Account[];
  providers: Provider[];
  onNavigateTab: (tab: any) => void;
  onOpenPlayground: () => void;
  onOpenDebugMode: () => void;
}

interface SelectedNodeInfo {
  id: string;
  name: string;
  type: 'client' | 'route' | 'account';
  status: 'active' | 'standby' | 'cooldown' | 'healthy';
  activeStreams?: string;
  rateLimit?: string;
  concurrency?: string;
  cooldownRemaining?: string;
  strategy?: string;
  targetHops?: string;
  provider?: string;
  rpm?: string;
  ttft?: string;
  details: string;
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
  // Selected node state for inline topology inspector
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>({
    id: 'claude-oauth-c',
    name: 'Claude OAuth C',
    type: 'account',
    status: 'cooldown',
    concurrency: '0 / 4',
    cooldownRemaining: '~02:40 remaining',
    provider: 'Anthropic Direct',
    rpm: '0 req/min',
    ttft: '580 ms',
    details: 'Auto-backoff activated after upstream HTTP 429 quota exhaustion. Route failover redirected subsequent calls to Claude OAuth A and B.',
  });

  const handleSelectNode = (node: SelectedNodeInfo) => {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  };

  const handleKeyDownNode = (e: React.KeyboardEvent, node: SelectedNodeInfo) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectNode(node);
    }
  };

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* ====================================================================
          1. SCOPED GLOBAL HEALTH & RUNTIME BANNER
          ==================================================================== */}
      <section
        aria-labelledby="ops-banner-heading"
        className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 md:p-6 shadow-sketch"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5 shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
              </span>
              <h2
                id="ops-banner-heading"
                className="font-heading font-bold text-2xl md:text-3xl text-[var(--ink)] tracking-tight"
              >
                Is Kinetix behaving correctly?
              </h2>
            </div>

            {/* Scoped semantic status: clean, glanceable single-sentence operational state */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                SYSTEM Degraded · Recovering
              </span>
              <span className="text-[var(--ink)]/80 font-sans">
                1 route degraded · 2 accounts cooling down — Traffic serving normally via fallback with zero request drops.
              </span>
            </div>
          </div>

          {/* Quick Action controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenPlayground}
              className="px-3 py-2 rounded-lg border-2 border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--erased)] text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" aria-hidden="true" />
              <span>Route Playground</span>
            </button>
            <button
              onClick={onOpenDebugMode}
              className="px-3 py-2 rounded-lg border-2 border-amber-600 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-amber-500/20 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
              title="Open full interactive request debugger"
            >
              <Bug className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span>Open Debugger</span>
            </button>
          </div>
        </div>

        {/* ====================================================================
            2. UNIFIED TELEMETRY STRIP (WITH PERIOD, DENOMINATOR, & THRESHOLD)
            ==================================================================== */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-[var(--ink)]/60 font-sans font-bold uppercase tracking-wider mb-2">
            <span>Telemetry Context</span>
            <span className="bg-[var(--erased)] px-2 py-0.5 rounded font-mono text-[10px] text-[var(--ink)]">
              Window: Last 15m
            </span>
          </div>

          <div className="bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[var(--erased)]">
            {/* Metric 1 */}
            <div className="p-3">
              <div className="text-[10px] text-[var(--ink)]/60 uppercase font-sans font-bold">Requests / Min</div>
              <div className="text-xl font-bold text-[var(--ink)] font-mono mt-0.5">12.4</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans mt-0.5 font-medium flex items-center gap-0.5">
                <span>+8%</span>
                <span className="text-[var(--ink)]/50">vs last hr</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-3">
              <div className="text-[10px] text-[var(--ink)]/60 uppercase font-sans font-bold">Success Rate</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">99.2%</div>
              <div className="text-[10px] text-[var(--ink)]/60 font-mono mt-0.5">
                1,843 / 1,858
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-3">
              <div className="text-[10px] text-[var(--ink)]/60 uppercase font-sans font-bold">Fallback Rate</div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">3.1%</div>
              <div className="text-[10px] text-[var(--ink)]/60 font-sans mt-0.5">
                normal &lt;5% threshold
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-3">
              <div className="text-[10px] text-[var(--ink)]/60 uppercase font-sans font-bold">Sticky Cache Hit</div>
              <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">91.7%</div>
              <div className="text-[10px] text-[var(--ink)]/60 font-mono mt-0.5">
                1,201 eligible
              </div>
            </div>

            {/* Metric 5 */}
            <div className="p-3">
              <div className="text-[10px] text-[var(--ink)]/60 uppercase font-sans font-bold">P50 TTFT</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5">620 ms</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans mt-0.5 font-medium">
                -42 ms vs baseline
              </div>
            </div>

            {/* Metric 6 */}
            <div className="p-3">
              <div className="text-[10px] text-[var(--ink)]/60 uppercase font-sans font-bold">Active Streams</div>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">2 / 4</div>
              <div className="text-[10px] text-[var(--ink)]/60 font-mono mt-0.5">
                active streams
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. MAIN OPERATIONS GRID: ATTENTION vs INDEPENDENT TOPOLOGY
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (5 cols): NEEDS ATTENTION + RECENT ACTIVITY */}
        <div className="lg:col-span-5 space-y-6">
          {/* NEEDS ATTENTION (ANOMALIES & DEGRADED ONLY) */}
          <section
            aria-labelledby="needs-attention-heading"
            className="bg-[var(--surface)] border-2 border-amber-500/70 rounded-xl p-5 shadow-sketch"
          >
            <div className="flex items-center justify-between border-b-2 border-[var(--erased)] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />
                <h3
                  id="needs-attention-heading"
                  className="font-heading font-bold text-lg text-[var(--ink)]"
                >
                  NEEDS ATTENTION
                </h3>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                2 active
              </span>
            </div>

            <div className="space-y-3">
              {/* Notice 1 */}
              <div className="p-3.5 bg-[var(--paper)] border border-[var(--erased)] border-l-4 border-l-amber-500 rounded-lg">
                <div className="flex items-center justify-between font-bold text-xs text-[var(--ink)]">
                  <span className="flex items-center gap-1.5">
                    <span className="text-amber-600">⚠</span>
                    <span>Claude Code OAuth</span>
                  </span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded font-mono font-bold text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                    AUTO-BACKOFF
                  </span>
                </div>
                <div className="mt-1.5 text-xs text-[var(--ink)]/80 font-sans leading-relaxed">
                  2 / 6 accounts currently cooling down following upstream 429 quota exhaustion.
                </div>
                <div className="mt-2.5 flex justify-between items-center text-xs">
                  <span className="text-[var(--ink)]/60 font-mono text-[11px]">Recovery ~02:40</span>
                  <button
                    onClick={() => onNavigateTab('account-health')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  >
                    View accounts →
                  </button>
                </div>
              </div>

              {/* Notice 2 */}
              <div className="p-3.5 bg-[var(--paper)] border border-[var(--erased)] border-l-4 border-l-amber-500 rounded-lg">
                <div className="flex items-center justify-between font-bold text-xs text-[var(--ink)]">
                  <span className="flex items-center gap-1.5">
                    <span className="text-amber-600">⚠</span>
                    <span>sonnet Route Fallback Surge</span>
                  </span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded font-mono font-bold text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                    ELEVATED
                  </span>
                </div>
                <div className="mt-1.5 text-xs text-[var(--ink)]/80 font-sans leading-relaxed">
                  Fallback rate ↑ 3.2% → 11.8% over the last 15m window. Secondary pool absorbing traffic.
                </div>
                <div className="mt-2.5 flex justify-between items-center text-xs">
                  <span className="text-[var(--ink)]/60 font-mono text-[11px]">Route: sonnet</span>
                  <button
                    onClick={() => onNavigateTab('failures')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  >
                    Inspect failures →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* RECENT ACTIVITY (ROUTINE / INFORMATIONAL EVENTS) */}
          <section
            aria-labelledby="recent-activity-heading"
            className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch"
          >
            <div className="flex items-center justify-between border-b-2 border-[var(--erased)] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                <h3
                  id="recent-activity-heading"
                  className="font-heading font-bold text-lg text-[var(--ink)]"
                >
                  RECENT ACTIVITY
                </h3>
              </div>
              <span className="text-[10px] text-[var(--ink)]/60 font-mono">Routine events</span>
            </div>

            <div className="space-y-3">
              {/* Event 1 */}
              <div className="p-3 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg text-xs">
                <div className="flex items-center justify-between font-bold text-[var(--ink)]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Antigravity · 3 credential rotations</span>
                  </div>
                  <span className="text-[10px] text-[var(--ink)]/50 font-mono">4m ago</span>
                </div>
                <p className="text-[var(--ink)]/70 font-sans mt-1 text-[11px] leading-relaxed">
                  Proactive token refresh cycling smoothly without customer downtime.
                </p>
              </div>

              {/* Event 2 */}
              <div className="p-3 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg text-xs">
                <div className="flex items-center justify-between font-bold text-[var(--ink)]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true"></span>
                    <span>OpenCode Free · 4 models discovered</span>
                  </div>
                  <span className="text-[10px] text-[var(--ink)]/50 font-mono">8m ago</span>
                </div>
                <p className="text-[var(--ink)]/70 font-sans mt-1 text-[11px] leading-relaxed">
                  Model catalog updated dynamically via upstream discovery probe.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (7 cols): INTERACTIVE ROUTING TOPOLOGY */}
        <div className="lg:col-span-7 space-y-4">
          <section
            aria-labelledby="routing-topology-heading"
            className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[var(--erased)] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                <div>
                  <h3
                    id="routing-topology-heading"
                    className="font-heading font-bold text-lg text-[var(--ink)]"
                  >
                    ROUTING TOPOLOGY
                  </h3>
                  <p className="text-[11px] text-[var(--ink)]/60 font-sans">
                    Select any tree row to inspect real-time concurrency and recovery state
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('topology')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-bold font-mono self-start sm:self-auto focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                Full Topology Graph →
              </button>
            </div>

            {/* Interactive Tree View with role="tree" */}
            <div
              role="tree"
              aria-label="Active Routing Topologies"
              className="p-4 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg space-y-4 text-xs font-mono select-none"
            >
              {/* TREE 1: Pi Agent Worker */}
              <div>
                {/* Client Root Node */}
                <div
                  role="treeitem"
                  tabIndex={0}
                  aria-selected={selectedNode?.id === 'vk-pi'}
                  onClick={() =>
                    handleSelectNode({
                      id: 'vk-pi',
                      name: 'Pi Agent Worker',
                      type: 'client',
                      status: 'active',
                      activeStreams: '2 / 4',
                      rateLimit: '1,000 req/min',
                      ttft: '620 ms',
                      details: 'Production coding agent client. Authenticated via Virtual Key vk_prod_pi_9918.',
                    })
                  }
                  onKeyDown={(e) =>
                    handleKeyDownNode(e, {
                      id: 'vk-pi',
                      name: 'Pi Agent Worker',
                      type: 'client',
                      status: 'active',
                      activeStreams: '2 / 4',
                      rateLimit: '1,000 req/min',
                      ttft: '620 ms',
                      details: 'Production coding agent client. Authenticated via Virtual Key vk_prod_pi_9918.',
                    })
                  }
                  className={`p-2 rounded cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center justify-between ${
                    selectedNode?.id === 'vk-pi'
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-400/80 shadow-sm'
                      : 'hover:bg-[var(--erased)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
                    <span className="font-bold text-[var(--ink)]">Pi Agent Worker</span>
                    <span className="text-[10px] text-[var(--ink)]/50 font-mono">(vk_prod_pi_9918)</span>
                  </div>
                  <span className="text-[10px] text-[var(--ink)]/60 font-mono">2 active streams</span>
                </div>

                {/* Route Branch */}
                <div className="pl-4 ml-2 border-l-2 border-purple-400 dark:border-purple-600 space-y-1 mt-1">
                  <div
                    role="treeitem"
                    tabIndex={0}
                    aria-selected={selectedNode?.id === 'route-sonnet'}
                    onClick={() =>
                      handleSelectNode({
                        id: 'route-sonnet',
                        name: 'route: sonnet',
                        type: 'route',
                        status: 'active',
                        strategy: 'priority failover',
                        targetHops: '4 candidates',
                        ttft: '620 ms',
                        details: 'Priority failover policy across 3 pooled Claude OAuth credentials with automatic Antigravity failover catch-all.',
                      })
                    }
                    onKeyDown={(e) =>
                      handleKeyDownNode(e, {
                        id: 'route-sonnet',
                        name: 'route: sonnet',
                        type: 'route',
                        status: 'active',
                        strategy: 'priority failover',
                        targetHops: '4 candidates',
                        ttft: '620 ms',
                        details: 'Priority failover policy across 3 pooled Claude OAuth credentials with automatic Antigravity failover catch-all.',
                      })
                    }
                    className={`p-1.5 rounded cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center justify-between ${
                      selectedNode?.id === 'route-sonnet'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-400'
                        : 'hover:bg-[var(--erased)]'
                    }`}
                  >
                    <div className="font-bold text-purple-700 dark:text-purple-300">
                      └── route: sonnet (strategy: priority)
                    </div>
                    <span className="text-[10px] text-[var(--ink)]/60">4 hops</span>
                  </div>

                  {/* Upstream Account Targets */}
                  <div className="pl-4 space-y-1">
                    {/* Node 1: Claude OAuth A */}
                    <div
                      role="treeitem"
                      tabIndex={0}
                      aria-selected={selectedNode?.id === 'claude-oauth-a'}
                      onClick={() =>
                        handleSelectNode({
                          id: 'claude-oauth-a',
                          name: 'Claude OAuth A',
                          type: 'account',
                          status: 'active',
                          concurrency: '1 / 4',
                          provider: 'Anthropic Direct',
                          rpm: '42 req/min',
                          ttft: '610 ms',
                          details: 'Primary tier 1 target. Currently healthy and actively processing streaming requests.',
                        })
                      }
                      onKeyDown={(e) =>
                        handleKeyDownNode(e, {
                          id: 'claude-oauth-a',
                          name: 'Claude OAuth A',
                          type: 'account',
                          status: 'active',
                          concurrency: '1 / 4',
                          provider: 'Anthropic Direct',
                          rpm: '42 req/min',
                          ttft: '610 ms',
                          details: 'Primary tier 1 target. Currently healthy and actively processing streaming requests.',
                        })
                      }
                      className={`p-1.5 rounded cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center justify-between ${
                        selectedNode?.id === 'claude-oauth-a'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-400'
                          : 'hover:bg-[var(--erased)]'
                      }`}
                    >
                      <span>├─ Claude OAuth A (Primary)</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                        <span>active</span>
                        <span className="text-[10px] text-[var(--ink)]/60 font-sans font-normal">
                          1 / 4 concurrency
                        </span>
                      </span>
                    </div>

                    {/* Node 2: Claude OAuth B */}
                    <div
                      role="treeitem"
                      tabIndex={0}
                      aria-selected={selectedNode?.id === 'claude-oauth-b'}
                      onClick={() =>
                        handleSelectNode({
                          id: 'claude-oauth-b',
                          name: 'Claude OAuth B',
                          type: 'account',
                          status: 'standby',
                          concurrency: '0 / 4',
                          provider: 'Anthropic Direct',
                          rpm: '0 req/min',
                          ttft: '—',
                          details: 'Secondary warm standby. Absorbs overflow traffic if primary saturates or trips 429 quota.',
                        })
                      }
                      onKeyDown={(e) =>
                        handleKeyDownNode(e, {
                          id: 'claude-oauth-b',
                          name: 'Claude OAuth B',
                          type: 'account',
                          status: 'standby',
                          concurrency: '0 / 4',
                          provider: 'Anthropic Direct',
                          rpm: '0 req/min',
                          ttft: '—',
                          details: 'Secondary warm standby. Absorbs overflow traffic if primary saturates or trips 429 quota.',
                        })
                      }
                      className={`p-1.5 rounded cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center justify-between ${
                        selectedNode?.id === 'claude-oauth-b'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-400'
                          : 'hover:bg-[var(--erased)]'
                      }`}
                    >
                      <span>├─ Claude OAuth B (Secondary)</span>
                      <span className="text-[var(--ink)]/70 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
                        <span>standby</span>
                        <span className="text-[10px] text-[var(--ink)]/60 font-sans font-normal">
                          0 / 4 concurrency
                        </span>
                      </span>
                    </div>

                    {/* Node 3: Claude OAuth C (Cooldown) */}
                    <div
                      role="treeitem"
                      tabIndex={0}
                      aria-selected={selectedNode?.id === 'claude-oauth-c'}
                      onClick={() =>
                        handleSelectNode({
                          id: 'claude-oauth-c',
                          name: 'Claude OAuth C',
                          type: 'account',
                          status: 'cooldown',
                          concurrency: '0 / 4',
                          cooldownRemaining: '~02:40 remaining',
                          provider: 'Anthropic Direct',
                          rpm: '0 req/min',
                          ttft: '580 ms',
                          details: 'Auto-backoff activated after upstream HTTP 429 quota exhaustion. Route failover redirected subsequent calls to Claude OAuth A and B.',
                        })
                      }
                      onKeyDown={(e) =>
                        handleKeyDownNode(e, {
                          id: 'claude-oauth-c',
                          name: 'Claude OAuth C',
                          type: 'account',
                          status: 'cooldown',
                          concurrency: '0 / 4',
                          cooldownRemaining: '~02:40 remaining',
                          provider: 'Anthropic Direct',
                          rpm: '0 req/min',
                          ttft: '580 ms',
                          details: 'Auto-backoff activated after upstream HTTP 429 quota exhaustion. Route failover redirected subsequent calls to Claude OAuth A and B.',
                        })
                      }
                      className={`p-1.5 rounded cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center justify-between ${
                        selectedNode?.id === 'claude-oauth-c'
                          ? 'bg-amber-100 dark:bg-amber-950/60 border border-amber-400'
                          : 'hover:bg-[var(--erased)] bg-amber-50/50 dark:bg-amber-950/20'
                      }`}
                    >
                      <span className="text-amber-900 dark:text-amber-200 font-bold">
                        ├─ Claude OAuth C (Rate limit)
                      </span>
                      <span className="text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
                        <span>cooldown ~02:40</span>
                        <span className="text-[10px] text-[var(--ink)]/60 font-sans font-normal">
                          0 / 4 concurrency
                        </span>
                      </span>
                    </div>

                    {/* Node 4: Antigravity Failover */}
                    <div
                      role="treeitem"
                      tabIndex={0}
                      aria-selected={selectedNode?.id === 'antigravity-failover'}
                      onClick={() =>
                        handleSelectNode({
                          id: 'antigravity-failover',
                          name: 'Antigravity Failover',
                          type: 'account',
                          status: 'standby',
                          concurrency: '0 / 6',
                          provider: 'Google Vertex AI',
                          rpm: '0 req/min',
                          ttft: '450 ms',
                          details: 'Cross-provider emergency fallback target. Automatically invoked if all Claude credentials enter circuit backoff.',
                        })
                      }
                      onKeyDown={(e) =>
                        handleKeyDownNode(e, {
                          id: 'antigravity-failover',
                          name: 'Antigravity Failover',
                          type: 'account',
                          status: 'standby',
                          concurrency: '0 / 6',
                          provider: 'Google Vertex AI',
                          rpm: '0 req/min',
                          ttft: '450 ms',
                          details: 'Cross-provider emergency fallback target. Automatically invoked if all Claude credentials enter circuit backoff.',
                        })
                      }
                      className={`p-1.5 rounded cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center justify-between ${
                        selectedNode?.id === 'antigravity-failover'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-400'
                          : 'hover:bg-[var(--erased)]'
                      }`}
                    >
                      <span>└─ Antigravity Failover</span>
                      <span className="text-[var(--ink)]/70 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
                        <span>standby</span>
                        <span className="text-[10px] text-[var(--ink)]/60 font-sans font-normal">
                          0 / 6 concurrency
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TREE 2: Cursor IDE */}
              <div className="pt-3 border-t border-[var(--erased)]">
                {/* Client Root Node */}
                <div
                  role="treeitem"
                  tabIndex={0}
                  aria-selected={selectedNode?.id === 'vk-cursor'}
                  onClick={() =>
                    handleSelectNode({
                      id: 'vk-cursor',
                      name: 'Cursor IDE',
                      type: 'client',
                      status: 'active',
                      activeStreams: '2 / 8',
                      rateLimit: '2,500 req/min',
                      ttft: '240 ms',
                      details: 'Interactive IDE assistant client. Authenticated via Virtual Key vk_dev_cursor_44.',
                    })
                  }
                  onKeyDown={(e) =>
                    handleKeyDownNode(e, {
                      id: 'vk-cursor',
                      name: 'Cursor IDE',
                      type: 'client',
                      status: 'active',
                      activeStreams: '2 / 8',
                      rateLimit: '2,500 req/min',
                      ttft: '240 ms',
                      details: 'Interactive IDE assistant client. Authenticated via Virtual Key vk_dev_cursor_44.',
                    })
                  }
                  className={`p-2 rounded cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center justify-between ${
                    selectedNode?.id === 'vk-cursor'
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-400/80 shadow-sm'
                      : 'hover:bg-[var(--erased)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                    <span className="font-bold text-[var(--ink)]">Cursor IDE</span>
                    <span className="text-[10px] text-[var(--ink)]/50 font-mono">(vk_dev_cursor_44)</span>
                  </div>
                  <span className="text-[10px] text-[var(--ink)]/60 font-mono">2 active streams</span>
                </div>

                {/* Route Branch */}
                <div className="pl-4 ml-2 border-l-2 border-blue-400 dark:border-blue-600 space-y-1 mt-1">
                  <div
                    role="treeitem"
                    tabIndex={0}
                    aria-selected={selectedNode?.id === 'route-gemini'}
                    onClick={() =>
                      handleSelectNode({
                        id: 'route-gemini',
                        name: 'route: gemini-flash',
                        type: 'route',
                        status: 'active',
                        strategy: 'round-robin',
                        targetHops: '2 candidates',
                        ttft: '280 ms',
                        details: 'Round-robin load balancing across Vertex BYOK accounts with failover to AI Studio.',
                      })
                    }
                    onKeyDown={(e) =>
                      handleKeyDownNode(e, {
                        id: 'route-gemini',
                        name: 'route: gemini-flash',
                        type: 'route',
                        status: 'active',
                        strategy: 'round-robin',
                        targetHops: '2 candidates',
                        ttft: '280 ms',
                        details: 'Round-robin load balancing across Vertex BYOK accounts with failover to AI Studio.',
                      })
                    }
                    className={`p-1.5 rounded cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center justify-between ${
                      selectedNode?.id === 'route-gemini'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-400'
                        : 'hover:bg-[var(--erased)]'
                    }`}
                  >
                    <div className="font-bold text-blue-700 dark:text-blue-300">
                      └── route: gemini-flash (strategy: round-robin)
                    </div>
                    <span className="text-[10px] text-[var(--ink)]/60">2 hops</span>
                  </div>

                  {/* Upstream Account Targets */}
                  <div className="pl-4 space-y-1">
                    <div
                      role="treeitem"
                      tabIndex={0}
                      aria-selected={selectedNode?.id === 'gemini-vertex'}
                      onClick={() =>
                        handleSelectNode({
                          id: 'gemini-vertex',
                          name: 'Gemini Vertex BYOK',
                          type: 'account',
                          status: 'active',
                          concurrency: '2 / 8',
                          provider: 'Google Vertex AI',
                          rpm: '180 req/min',
                          ttft: '280 ms',
                          details: 'Enterprise Vertex AI service account with high quota limits.',
                        })
                      }
                      onKeyDown={(e) =>
                        handleKeyDownNode(e, {
                          id: 'gemini-vertex',
                          name: 'Gemini Vertex BYOK',
                          type: 'account',
                          status: 'active',
                          concurrency: '2 / 8',
                          provider: 'Google Vertex AI',
                          rpm: '180 req/min',
                          ttft: '280 ms',
                          details: 'Enterprise Vertex AI service account with high quota limits.',
                        })
                      }
                      className={`p-1.5 rounded cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center justify-between ${
                        selectedNode?.id === 'gemini-vertex'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-400'
                          : 'hover:bg-[var(--erased)]'
                      }`}
                    >
                      <span>├─ Gemini Vertex BYOK</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                        <span>active</span>
                        <span className="text-[10px] text-[var(--ink)]/60 font-sans font-normal">
                          2 / 8 concurrency
                        </span>
                      </span>
                    </div>

                    <div
                      role="treeitem"
                      tabIndex={0}
                      aria-selected={selectedNode?.id === 'ai-studio-backup'}
                      onClick={() =>
                        handleSelectNode({
                          id: 'ai-studio-backup',
                          name: 'Google AI Studio Backup',
                          type: 'account',
                          status: 'standby',
                          concurrency: '0 / 5',
                          provider: 'Google AI Studio',
                          rpm: '0 req/min',
                          ttft: '—',
                          details: 'Developer tier backup account.',
                        })
                      }
                      onKeyDown={(e) =>
                        handleKeyDownNode(e, {
                          id: 'ai-studio-backup',
                          name: 'Google AI Studio Backup',
                          type: 'account',
                          status: 'standby',
                          concurrency: '0 / 5',
                          provider: 'Google AI Studio',
                          rpm: '0 req/min',
                          ttft: '—',
                          details: 'Developer tier backup account.',
                        })
                      }
                      className={`p-1.5 rounded cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex items-center justify-between ${
                        selectedNode?.id === 'ai-studio-backup'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-400'
                          : 'hover:bg-[var(--erased)]'
                      }`}
                    >
                      <span>└─ Google AI Studio Backup</span>
                      <span className="text-[var(--ink)]/70 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
                        <span>standby</span>
                        <span className="text-[10px] text-[var(--ink)]/60 font-sans font-normal">
                          0 / 5 concurrency
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stable Node Inspector — opens inline rather than immediately navigating away */}
            {selectedNode ? (
              <div className="mt-4 p-4 bg-[var(--surface)] border-2 border-indigo-500/80 rounded-lg shadow-sm">
                <div className="flex items-center justify-between border-b border-[var(--erased)] pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Node Inspector:
                    </span>
                    <span className="font-bold text-sm text-[var(--ink)]">{selectedNode.name}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[var(--erased)] text-[var(--ink)]">
                      {selectedNode.type}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 text-[var(--ink)]/60 hover:text-[var(--ink)] cursor-pointer rounded focus-visible:ring-1 focus-visible:ring-indigo-500"
                    aria-label="Close inspector"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Type-Aware Dense Definition Grid (avoids nested-box mini-cards) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs py-2.5 px-3 bg-[var(--paper)] rounded-lg border border-[var(--erased)] font-mono mb-3">
                  {selectedNode.type === 'client' ? (
                    <>
                      <div>
                        <span className="text-[10px] text-[var(--ink)]/50 uppercase block font-sans font-bold">Active Streams</span>
                        <span className="font-bold text-[var(--ink)]">{selectedNode.activeStreams || '2 / 4'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--ink)]/50 uppercase block font-sans font-bold">Rate Limit</span>
                        <span className="font-bold text-[var(--ink)]">{selectedNode.rateLimit || '1,000 req/min'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--ink)]/50 uppercase block font-sans font-bold">P50 TTFT</span>
                        <span className="font-bold text-[var(--ink)]">{selectedNode.ttft || '620 ms'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--ink)]/50 uppercase block font-sans font-bold">Status</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 capitalize">{selectedNode.status}</span>
                      </div>
                    </>
                  ) : selectedNode.type === 'route' ? (
                    <>
                      <div>
                        <span className="text-[10px] text-[var(--ink)]/50 uppercase block font-sans font-bold">Strategy</span>
                        <span className="font-bold text-[var(--ink)]">{selectedNode.strategy || 'priority failover'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--ink)]/50 uppercase block font-sans font-bold">Target Hops</span>
                        <span className="font-bold text-[var(--ink)]">{selectedNode.targetHops || '4 candidates'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--ink)]/50 uppercase block font-sans font-bold">P50 TTFT</span>
                        <span className="font-bold text-[var(--ink)]">{selectedNode.ttft || '620 ms'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--ink)]/50 uppercase block font-sans font-bold">Status</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400 capitalize">{selectedNode.status}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-[10px] text-[var(--ink)]/50 uppercase block font-sans font-bold">Concurrency</span>
                        <span className="font-bold text-[var(--ink)]">{selectedNode.concurrency || '0 / 4'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--ink)]/50 uppercase block font-sans font-bold">Throughput</span>
                        <span className="font-bold text-[var(--ink)]">{selectedNode.rpm || '0 req/min'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--ink)]/50 uppercase block font-sans font-bold">P50 TTFT</span>
                        <span className="font-bold text-[var(--ink)]">{selectedNode.ttft || '580 ms'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--ink)]/50 uppercase block font-sans font-bold">Status</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 capitalize">
                          {selectedNode.cooldownRemaining || selectedNode.status}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-xs text-[var(--ink)]/80 font-sans leading-relaxed mb-3">
                  {selectedNode.details}
                </p>

                {/* Type-Aware Primary / Secondary Action Hierarchy */}
                <div className="pt-2.5 border-t border-[var(--erased)] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] text-[var(--ink)]/50 font-sans">
                    Press <kbd className="px-1.5 py-0.5 bg-[var(--erased)] rounded text-[10px] font-mono">Esc</kbd> to dismiss
                  </span>
                  <div className="flex items-center gap-3">
                    {selectedNode.type === 'client' ? (
                      <button
                        onClick={() => onNavigateTab('keys')}
                        className="text-xs text-[var(--ink)]/70 hover:text-[var(--ink)] font-mono hover:underline cursor-pointer"
                      >
                        View client details
                      </button>
                    ) : selectedNode.type === 'route' ? (
                      <button
                        onClick={() => onNavigateTab('routes')}
                        className="text-xs text-[var(--ink)]/70 hover:text-[var(--ink)] font-mono hover:underline cursor-pointer"
                      >
                        View route configuration
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigateTab('account-health')}
                        className="text-xs text-[var(--ink)]/70 hover:text-[var(--ink)] font-mono hover:underline cursor-pointer"
                      >
                        View account health
                      </button>
                    )}
                    <button
                      onClick={() => onNavigateTab('traces')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-mono font-bold text-xs cursor-pointer shadow-sm flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-colors"
                    >
                      <span>Inspect related traces</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-[var(--paper)] border border-dashed border-[var(--ink)]/30 rounded-lg text-xs text-[var(--ink)]/60 text-center font-sans">
                Click or press Enter on any topology row above to open the node inspector.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
