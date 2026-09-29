import React from 'react';
import {
  AlertTriangle,
  Radio,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  ProxyMetrics,
  Route,
  Provider,
  Account,
  VirtualKey,
  RequestLog,
  LiveRequest,
} from '../../types';
import { Card, Button, MetricBox, TerminalPanel } from '../KinetixUI';
import { formatCurrency, formatLatency } from '../../lib/designSystem';

interface OverviewViewProps {
  metrics: ProxyMetrics;
  routes: Route[];
  providers: Provider[];
  accounts: Account[];
  keys: VirtualKey[];
  requests: RequestLog[];
  liveRequests: LiveRequest[];
  onOpenTester: () => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  accounts,
  requests,
  liveRequests,
  onNavigateTab,
}) => {
  // Operational calculations
  const totalSpend = metrics.totalSpendUsd ?? requests.reduce((acc, r) => acc + (r.costUsd || 0), 0);
  const fallbackRequests = requests.filter((r) => r.fallbackHops > 0);
  const degradedAccounts = accounts.filter((a) => a.status !== 'healthy');
  const errorRequests = requests.filter((r) => (r.statusCode && r.statusCode >= 400) || r.fallbackHops > 0);
  const totalInFlight = liveRequests.filter((l) => l.phase !== 'done').length;

  const hasAnomalies = degradedAccounts.length > 0 || fallbackRequests.length > 0;

  return (
    <div className="space-y-4">
      {/* 1. Anomaly-Driven Top KPI Row (Actionable Decision State when degraded, symmetric when nominal) */}
      {hasAnomalies ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          {/* Priority Asymmetric Actionable Incident Card: ACTIVE CONDITION */}
          <div className="lg:col-span-5 p-3.5 rounded-[6px] bg-[var(--warning-bg)] border border-[var(--warning-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--warning)]/20 text-[var(--warning)] font-mono text-[11px] font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  ACTIVE CONDITION · {fallbackRequests.length} FALLBACK
                </span>
                <span className="font-mono text-[11px] text-[var(--warning)] font-semibold uppercase tracking-wider">
                  AUTO-RECOVERING
                </span>
              </div>

              {/* What happened? */}
              <div className="text-[14px] font-semibold text-[var(--text-primary)] font-sans">
                Claude Sonnet 4.6 → fallback account
              </div>
              <div className="text-[11px] font-mono text-[var(--text-secondary)] mt-0.5">
                Primary rate-limited 429 · 621ms ago
              </div>

              {/* What is Kinetix doing? Do I need to intervene? */}
              <div className="mt-2.5 p-2 rounded-[4px] bg-[#12100d] border border-[var(--warning-border)] space-y-1 text-xs font-sans">
                <div className="flex items-center justify-between text-[var(--text-primary)] font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                    Fallback currently serving
                  </span>
                  <span className="font-mono text-[11px] text-[var(--healthy)] font-semibold">200 OK</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono">
                  <span>Retry primary probe:</span>
                  <span className="text-[var(--text-primary)] font-semibold">in 18s (cooldown)</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[var(--warning-border)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)] font-sans">
                {fallbackRequests.length} recovery today · zero client disruption
              </span>
              <button
                onClick={() => onNavigateTab('requests')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--warning)] hover:underline cursor-pointer font-sans"
              >
                Inspect →
              </button>
            </div>
          </div>

          {/* Core Telemetry Metrics (4 Cards) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <MetricBox
              label="Traffic"
              period="24H"
              value="284k"
              subtext="284,190 reqs · 7 live streams"
              indicator="neutral"
              icon={<Radio className="w-4 h-4" />}
            />
            <MetricBox
              label="TTFT Latency"
              period="P95"
              value="184ms"
              subtext="P95: 680ms · direct route"
              indicator="neutral"
              icon={<Clock className="w-4 h-4" />}
            />
            <MetricBox
              label="Prompt Cache"
              period="Today"
              value="48.2%"
              subtext="↑3.1pp · $18.42 saved today"
              indicator="neutral"
              icon={<Sparkles className="w-4 h-4" />}
            />
            <MetricBox
              label="Gateway Spend"
              period="Today"
              value={`$${Math.round(totalSpend)}`}
              subtext={`$${Math.round(totalSpend)} / $2,500 · 15.3%`}
              indicator="neutral"
              icon={<TrendingUp className="w-4 h-4" />}
            />
          </div>
        </div>
      ) : (
        /* Nominal KPI Row: Clean Symmetric 4-Card Layout */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricBox
            label="Gateway Traffic"
            period="24H"
            value="284k"
            subtext="284,190 reqs · 7 live streams"
            indicator="neutral"
            icon={<Radio className="w-4 h-4" />}
          />
          <MetricBox
            label="TTFT Latency"
            period="P95"
            value="184ms"
            subtext="P95: 680ms · 100% direct route"
            indicator="neutral"
            icon={<Clock className="w-4 h-4" />}
          />
          <MetricBox
            label="Prompt Cache Hit"
            period="Today"
            value="48.2%"
            subtext="↑3.1pp · $18.42 saved today"
            indicator="neutral"
            icon={<Sparkles className="w-4 h-4" />}
          />
          <MetricBox
            label="Gateway Spend"
            period="Today"
            value={`$${Math.round(totalSpend)}`}
            subtext={`$${Math.round(totalSpend)} / $2,500 · 15.3%`}
            indicator="neutral"
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </div>
      )}

      {/* 2. Compact Topology Pipeline with Expanded Target Stack & High Edge State */}
      <Card
        title="Routing Pipeline & Cascade Topology"
        subtitle="Multi-protocol ingress, policy resolution, priority targets, and automated failover circuits"
        action={
          <Button size="xs" variant="ghost" onClick={() => onNavigateTab('routes')}>
            Configure Routes →
          </Button>
        }
      >
        <div className="space-y-2">
          <div className="p-3 rounded-[6px] bg-[#09090c] border border-[var(--border)] overflow-x-auto">
            <div className="min-w-[820px] flex items-stretch justify-between gap-2.5 text-xs">
              
              {/* Node 1: Ingress (Cyan theme) */}
              <div className="w-44 p-2.5 rounded-[4px] border border-[var(--border-strong)] bg-[#0d141c] flex flex-col justify-between shrink-0">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--terminal-cyan)]">
                      01 · Ingress
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-secondary)]">HTTP/2</span>
                  </div>
                  <div className="font-semibold text-white truncate text-[13px] font-sans">
                    OpenAI & Anthropic
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-secondary)] mt-0.5 truncate">
                    0.0.0.0:3000 · TLS 1.3
                  </div>
                </div>
                <div className="font-mono text-[10px] text-[var(--text-secondary)] mt-2 pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span>Live Streams:</span>
                  <span className="text-white font-semibold">{totalInFlight} active</span>
                </div>
              </div>

              {/* Edge 1: Trimmed high-value runtime semantics between Ingress → Active Route */}
              <div className="flex-1 flex flex-col justify-center px-2 py-1 bg-[#0b0c10] border border-[var(--border-subtle)] rounded-[4px] font-mono text-[10px] space-y-1">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span className="text-[var(--terminal-cyan)] font-semibold">284 req/s</span>
                  <span>12k rpm cap</span>
                </div>
                <div className="w-full flex items-center gap-1.5 text-[var(--text-muted)]">
                  <div className="flex-1 h-px bg-[var(--border-strong)]" />
                  <span className="text-[var(--text-primary)] font-semibold text-[10px]">auth ✓ · limits ✓</span>
                  <div className="flex-1 h-px bg-[var(--border-strong)]" />
                  <span className="text-[var(--text-primary)]">→</span>
                </div>
                <div className="text-center text-[var(--text-muted)] text-[10px]">
                  0 packet drops
                </div>
              </div>

              {/* Node 2: Selected / Policy-Configured Active Route (Purple Theme) */}
              <div className="w-48 p-2.5 rounded-[4px] border-2 border-[var(--primary-border)] bg-[#121218] flex flex-col justify-between shrink-0 shadow-sm shadow-[var(--primary)]/15">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--primary)]">
                      02 · Active Route
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[var(--primary-bg)] text-[var(--primary)] font-bold">
                      sonnet
                    </span>
                  </div>
                  <div className="font-semibold text-white truncate text-[13px] font-sans">
                    Claude Sonnet 4.6
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-secondary)] mt-0.5 truncate">
                    Adaptive TTFT Policy
                  </div>
                </div>
                <div className="font-mono text-[10px] text-[var(--text-secondary)] mt-2 pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span>Cache Affinity:</span>
                  <span className="text-[var(--text-primary)] font-semibold">92%</span>
                </div>
              </div>

              {/* Edge 2: Trimmed high-value runtime semantics between Route → Targets Cascade */}
              <div className="flex-1 flex flex-col justify-center px-2 py-1 bg-[#0b0c10] border border-[var(--border-subtle)] rounded-[4px] font-mono text-[10px] space-y-1">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span className="text-[var(--warning)] font-semibold">1 recovery / 24h</span>
                  <span>&lt;800ms window</span>
                </div>
                <div className="w-full flex items-center gap-1.5 text-[var(--text-muted)]">
                  <div className="flex-1 h-px bg-[var(--border-strong)]" />
                  <span className="text-[var(--text-primary)] font-semibold text-[10px]">affinity cascade</span>
                  <div className="flex-1 h-px bg-[var(--border-strong)]" />
                  <span className="text-[var(--text-primary)]">→</span>
                </div>
                <div className="text-center text-[var(--warning)] text-[10px] font-medium">
                  trigger: on 429
                </div>
              </div>

              {/* Target Cascade Stack - Expanded Width (~15% more room for comfortable scanning) */}
              <div className="w-76 space-y-1.5 shrink-0 flex flex-col justify-center">
                {/* Target Tier 1 */}
                <div className="px-3 py-1.5 rounded-[4px] border border-[var(--border-strong)] bg-[#111613] flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] shrink-0" />
                      <span className="font-semibold text-white truncate text-xs font-sans">
                        Claude Sonnet 4.6
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-[var(--text-secondary)] truncate">
                      Google OAuth · primary
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] font-semibold">
                      P100 · 184ms
                    </span>
                  </div>
                </div>

                {/* Edge between 1 and 2 */}
                <div className="flex items-center justify-between px-2 font-mono text-[10px] text-[var(--warning)] leading-none">
                  <span>↓ 429 rate limit failover (621ms ago)</span>
                  <span className="text-[var(--text-secondary)] font-medium">fallback</span>
                </div>

                {/* Target Tier 2 (Hot Failover - Loud Exceptional State) */}
                <div className="px-3 py-1.5 rounded-[4px] border border-[var(--warning-border)] bg-[#171410] flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] shrink-0" />
                      <span className="font-semibold text-[var(--text-primary)] truncate text-xs font-sans">
                        Claude Sonnet 4.6
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-[var(--text-secondary)] truncate">
                      Google OAuth · fallback
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-border)] font-bold">
                      P90 · SERVING
                    </span>
                  </div>
                </div>

                {/* Edge between 2 and 3 */}
                <div className="flex items-center justify-between px-2 font-mono text-[10px] text-[var(--text-muted)] leading-none">
                  <span>↓ 5xx / timeout cascade</span>
                  <span>standby</span>
                </div>

                {/* Target Tier 3 (Cold Standby) */}
                <div className="px-3 py-1.5 rounded-[4px] border border-[var(--border-subtle)] bg-[#0e0e12] flex items-center justify-between text-xs opacity-70">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-faint)] shrink-0" />
                      <span className="text-[var(--text-secondary)] truncate text-xs font-sans">
                        Gemini 3.8 Flash
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-[var(--text-muted)] truncate">
                      AI Studio BYOK
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]">
                      P50 · Standby
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Compact Bauhaus Invariant Footer Rail */}
          <div className="px-3 py-1.5 rounded-[4px] bg-[var(--surface-raised)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs font-sans text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-primary)] font-semibold font-mono text-[11px]">Failover Trigger:</span>
              <span>HTTP 429 Rate Limit (&lt; 800ms window)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-primary)] font-semibold font-mono text-[11px]">Circuit Breaker:</span>
              <span>3 consecutive 5xx → Open (30s cooldown)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-primary)] font-semibold font-mono text-[11px]">Routing Invariant:</span>
              <span>Sticky Session + Cache Affinity</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Lower Panels - Recent Ingress Requests (L) & Runtime Exceptions / Incident Log (R) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Recent Ingress Requests (7 cols) - Surfaces Route Behavior Source → Target */}
        <Card
          title="Recent Ingress Requests"
          subtitle="Real-time telemetry, TTFT, and route execution"
          className="lg:col-span-7 p-0 overflow-hidden"
          action={
            <Button size="xs" variant="ghost" onClick={() => onNavigateTab('requests')}>
              Open Inspector →
            </Button>
          }
        >
          <div className="overflow-x-auto -m-4">
            <table className="kinetix-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>REQUEST & ROUTE PATH</th>
                  <th>KEY</th>
                  <th>STATUS</th>
                  <th>LATENCY / TTFT</th>
                  <th className="text-right">COST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {requests.slice(0, 5).map((req) => {
                  const isFallback = req.fallbackHops > 0;
                  const isError = req.statusCode && req.statusCode >= 400;

                  return (
                    <tr
                      key={req.id}
                      onClick={() => onNavigateTab('requests')}
                      className={`cursor-pointer transition-colors ${
                        isFallback
                          ? 'bg-[var(--warning-bg)]/15 border-l-2 border-[var(--warning)] hover:bg-[var(--warning-bg)]/25'
                          : isError
                          ? 'bg-[var(--danger-bg)]/15 border-l-2 border-[var(--danger)] hover:bg-[var(--danger-bg)]/25'
                          : 'hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <td className="py-2 text-[var(--text-secondary)] font-mono text-[11px] whitespace-nowrap">
                        {req.timestamp
                          ? new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                          : 'just now'}
                      </td>
                      <td className="py-2">
                        <div className="font-semibold text-[var(--text-primary)] truncate max-w-[150px] font-sans text-xs">
                          {req.requestedModel}
                        </div>
                        {isFallback ? (
                          <div className="text-[10px] text-[var(--warning)] truncate font-mono flex items-center gap-1 font-medium">
                            <span>primary</span>
                            <span>→</span>
                            <span className="text-[var(--text-primary)]">fallback (hop 1)</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-[var(--text-muted)] truncate font-mono">
                            route: {req.routeName} · direct
                          </div>
                        )}
                      </td>
                      <td className="py-2 text-[var(--text-secondary)] truncate max-w-[100px] font-mono text-[11px]">
                        {req.virtualKeyName}
                      </td>
                      <td className="py-2 whitespace-nowrap">
                        {isFallback ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-border)] text-[11px] font-bold font-mono">
                            ⚡ RECOVERED (1 HOP)
                          </span>
                        ) : isError ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger-border)] text-[11px] font-bold font-mono">
                            {req.statusCode} ERR
                          </span>
                        ) : (
                          <span className="text-[var(--text-secondary)] font-mono text-[11px] font-medium">
                            200 OK
                          </span>
                        )}
                      </td>
                      <td className="py-2 whitespace-nowrap font-mono text-[11px]">
                        <span className="text-[var(--text-primary)] font-medium tabular-nums">
                          {formatLatency(req.latencyMs)}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] ml-1 tabular-nums">
                          ({req.ttftMs}ms)
                        </span>
                      </td>
                      <td className="py-2 text-right font-medium text-[var(--text-primary)] tabular-nums whitespace-nowrap font-mono text-[11px]">
                        {formatCurrency(req.costUsd || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: Runtime Exceptions & Failovers (5 cols - Distinct RECENT EVENT History) */}
        <Card
          title="Runtime Exceptions & Failovers"
          subtitle="Historical intercepted 429s and recovery events"
          className="lg:col-span-5 p-0 overflow-hidden"
          action={
            <Button size="xs" variant="ghost" onClick={() => onNavigateTab('requests')}>
              View Logs →
            </Button>
          }
        >
          <div className="p-3 space-y-2.5">
            {errorRequests.length > 0 ? (
              errorRequests.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateTab('requests')}
                  className="p-2.5 rounded-[4px] bg-[var(--warning-bg)]/20 border border-[var(--warning-border)] text-xs cursor-pointer hover:bg-[var(--warning-bg)]/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-[var(--warning)]/20 text-[var(--warning)] font-mono text-[10px] font-bold">
                      RECENT EVENT · HTTP 429
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                      621ms ago (04:38:00)
                    </span>
                  </div>
                  <div className="font-sans font-semibold text-[var(--text-primary)] text-xs">
                    Anthropic Primary Account Exhausted
                  </div>
                  <div className="font-sans text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Recovered via <span className="font-mono text-[var(--text-primary)] font-medium">Google OAuth · fallback</span> in 115ms (0 dropped requests)
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-[var(--warning-border)] flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
                    <span>Route: <strong className="text-[var(--text-primary)]">sonnet</strong></span>
                    <span className="text-[var(--healthy)] font-semibold">CIRCUIT COOLDOWN (18s)</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center rounded-[4px] border border-dashed border-[var(--border)] text-xs text-[var(--text-secondary)] font-sans">
                <div className="text-[var(--healthy)] font-semibold font-mono text-xs mb-1">ZERO EXCEPTIONS RECORDED</div>
                <div>All upstreams operating within rate limit thresholds.</div>
              </div>
            )}

            {/* Quick Link to Upstream Pools */}
            <div className="p-2.5 rounded-[4px] bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-between text-xs font-sans">
              <div>
                <div className="font-semibold text-[var(--text-primary)]">Upstream Account Pools</div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  {accounts.length} accounts configured · 0 circuits open
                </div>
              </div>
              <Button size="xs" variant="secondary" onClick={() => onNavigateTab('accounts')}>
                Manage Pools →
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Collapsible Terminal Telemetry (Nominal logs do not compete with tables) */}
      <TerminalPanel
        title="GATEWAY RUNTIME TELEMETRY STREAM"
        copyText="kinetix proxy --status ok --metrics nominal"
        collapsible={true}
        defaultCollapsed={true}
      >
        <div className="space-y-1.5 text-xs font-mono text-[var(--text-secondary)]">
          <div>
            <span className="text-[var(--text-muted)]">[2026-09-28T15:45:00Z]</span>{' '}
            <span className="text-[var(--terminal-cyan)] font-semibold">[ingress]</span> HTTP/2 reverse proxy ready on 0.0.0.0:3000 (TLS 1.3 enabled)
          </div>
          <div>
            <span className="text-[var(--text-muted)]">[2026-09-28T15:45:01Z]</span>{' '}
            <span className="text-[var(--primary)] font-semibold">[topology]</span> 5 routing trees compiled; adaptive TTFT cache-affinity active (92% affinity)
          </div>
          <div>
            <span className="text-[var(--text-muted)]">[2026-09-28T15:45:02Z]</span>{' '}
            <span className="text-[var(--healthy)] font-semibold">[circuits]</span> Upstream circuits: Antigravity (CLOSED), AI Studio (CLOSED), OpenCode (CLOSED)
          </div>
          {fallbackRequests.length > 0 && (
            <div className="text-[var(--warning)]">
              <span className="text-[var(--text-muted)]">[2026-09-28T15:45:04Z]</span>{' '}
              <span className="font-bold">[failover]</span> Upstream rate-limit 429 intercepted on Google OAuth · primary → Recovered via Google OAuth · fallback (hop 1, +115ms)
            </div>
          )}
          <div>
            <span className="text-[var(--text-muted)]">[2026-09-28T15:45:05Z]</span>{' '}
            <span className="text-[var(--text-primary)] font-semibold">[telemetry]</span> Ingress QPS nominal • Zero packet drops in buffer • Next health check in 12s
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
};
