import React from 'react';
import {
  Activity,
  Shuffle,
  ShieldCheck,
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingUp,
  Cpu,
  Radio,
  Server,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
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
import { Card, Button, StatusBadge, MetricBox, TerminalPanel } from '../KinetixUI';
import { formatCurrency, formatLatency, formatTokens } from '../../lib/designSystem';

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
  routes,
  providers,
  accounts,
  keys,
  requests,
  liveRequests,
  onOpenTester,
  onNavigateTab,
}) => {
  // Operational calculations
  const totalSpend = metrics.totalSpendUsd || requests.reduce((acc, r) => acc + (r.costUsd || 0), 0);
  const fallbackRequests = requests.filter((r) => r.fallbackHops > 0);
  const degradedAccounts = accounts.filter((a) => a.status !== 'healthy');
  const healthyAccounts = accounts.filter((a) => a.status === 'healthy');
  const totalInFlight = liveRequests.filter((l) => !l.finished).length;

  const isSystemDegraded = degradedAccounts.length > 0 || fallbackRequests.length > 3;

  return (
    <div className="space-y-6">
      {/* 1. Vital Operator Status Banner */}
      {!isSystemDegraded ? (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-[6px] bg-[var(--surface-raised)] border border-[var(--border)] text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--healthy)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--healthy)]" />
            </span>
            <span className="font-semibold text-[var(--text-primary)]">SYSTEM NOMINAL</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-[var(--text-secondary)]">
              All {routes.length} routes healthy • {accounts.length} accounts in active rotation • 0 circuits open
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[var(--text-muted)]">Proxy v0.5.2</span>
            <Button size="xs" variant="secondary" onClick={onOpenTester}>
              <Play className="w-3 h-3 text-[var(--primary)]" />
              Test Pipeline
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-[6px] bg-[var(--warning-bg)] border border-[var(--warning-border)] text-xs text-[var(--warning)]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--warning)]" />
            <span className="font-bold">ATTENTION REQUIRED:</span>
            <span>
              {degradedAccounts.length} account(s) degraded • {fallbackRequests.length} failover event(s) recorded in current window
            </span>
          </div>
          <Button size="xs" variant="danger" onClick={() => onNavigateTab('health')}>
            Inspect Health
          </Button>
        </div>
      )}

      {/* 2. Key Operator KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricBox
          label="Gateway Traffic"
          value={`${metrics.totalRequests ?? requests.length} reqs`}
          subtext={`${totalInFlight} in-flight streaming`}
          indicator="neutral"
          icon={<Radio className="w-4 h-4" />}
        />
        <MetricBox
          label="Active Fallbacks"
          value={fallbackRequests.length}
          subtext={fallbackRequests.length > 0 ? 'Automatic 429 recoveries' : 'All requests direct'}
          indicator={fallbackRequests.length > 0 ? 'warning' : 'healthy'}
          icon={<Shuffle className="w-4 h-4" />}
        />
        <MetricBox
          label="Latency (TTFT)"
          value="184ms"
          subtext="P95 total: 680ms"
          indicator="neutral"
          icon={<Clock className="w-4 h-4" />}
        />
        <MetricBox
          label="Prompt Cache Hit"
          value="48.2%"
          subtext="+$18.40 saved today"
          indicator="healthy"
          icon={<Sparkles className="w-4 h-4" />}
        />
        <MetricBox
          label="Spend Today"
          value={formatCurrency(totalSpend)}
          subtext="Budget: $250.00 (25%)"
          indicator="neutral"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* 3. Bauhaus Routing Topology Visualization */}
      <Card
        title="Active Route Topology & Failover Cascade"
        subtitle="Visualizes multi-protocol ingress, policy resolution, priority targets, and automated account failover"
        action={
          <Button size="xs" variant="ghost" onClick={() => onNavigateTab('routes')}>
            Configure Routes <ArrowRight className="w-3 h-3" />
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-[6px] bg-[#09090c] border border-[var(--border)] overflow-x-auto">
            <div className="min-w-[700px] flex items-center justify-between gap-4 py-2 font-mono text-xs">
              {/* Ingress Node */}
              <div className="w-44 p-3 rounded-[4px] border border-[var(--info-border)] bg-[#0d141c]">
                <div className="text-[10px] uppercase tracking-wider text-[var(--info)] mb-1">
                  1. Client Ingress
                </div>
                <div className="font-semibold text-white truncate">OpenAI & Anthropic</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">/v1/chat & /v1/messages</div>
              </div>

              {/* Connecting line */}
              <div className="flex-1 flex items-center justify-center relative">
                <div className="w-full h-px bg-[var(--border-strong)]" />
                <span className="absolute bg-[#09090c] px-2 text-[10px] text-[var(--text-muted)] border border-[var(--border)] rounded">
                  Auth & Rate Limit
                </span>
              </div>

              {/* Policy Node */}
              <div className="w-48 p-3 rounded-[4px] border border-[var(--border-strong)] bg-[#121217]">
                <div className="text-[10px] uppercase tracking-wider text-[var(--primary)] mb-1">
                  2. Route Resolution
                </div>
                <div className="font-semibold text-white truncate">Primary Fast Route</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Strategy: Adaptive TTFT</div>
              </div>

              {/* Connecting line */}
              <div className="flex-1 flex items-center justify-center relative">
                <div className="w-full h-px bg-[var(--border-strong)]" />
                <span className="absolute bg-[#09090c] px-2 text-[10px] text-[var(--text-muted)] border border-[var(--border)] rounded">
                  Cascade
                </span>
              </div>

              {/* Target Cascade Nodes */}
              <div className="w-64 space-y-2">
                <div className="p-2.5 rounded-[4px] border border-[var(--healthy-border)] bg-[#0e1a14] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--healthy)]" />
                      <span className="font-semibold text-white">Tier 1: Claude 3.7 Sonnet</span>
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      Anthropic Prod (Account Pool)
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--healthy)] font-bold">Priority 1</span>
                </div>

                <div className="p-2.5 rounded-[4px] border border-[var(--border)] bg-[#121216] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                      <span className="font-semibold text-[var(--text-secondary)]">Tier 2: GPT-4o</span>
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      OpenAI Prod (Trigger on 429)
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">Priority 2</span>
                </div>

                <div className="p-2.5 rounded-[4px] border border-[var(--border-subtle)] bg-[#101014] flex items-center justify-between opacity-70">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
                      <span className="text-[var(--text-muted)]">Tier 3: Gemini 2.5 Flash</span>
                    </div>
                    <div className="text-[10px] text-[var(--text-faint)] mt-0.5">Standby Failover</div>
                  </div>
                  <span className="text-[10px] text-[var(--text-faint)]">Priority 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Split Grid: Provider Health & Live Request Ingress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Upstream Accounts & Circuits */}
        <Card
          title="Upstream Account Pools & Circuits"
          subtitle="Real-time capacity, rate limits, and circuit breaker status"
          action={
            <Button size="xs" variant="ghost" onClick={() => onNavigateTab('accounts')}>
              Manage Pools <ArrowRight className="w-3 h-3" />
            </Button>
          }
        >
          <div className="divide-y divide-[var(--border)]">
            {accounts.slice(0, 4).map((acc) => (
              <div key={acc.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)] truncate">{acc.label}</span>
                    <StatusBadge
                      variant={acc.status === 'healthy' ? 'healthy' : 'warning'}
                      size="sm"
                    >
                      {acc.status.toUpperCase()}
                    </StatusBadge>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Provider: {acc.providerName} • Priority P{acc.priority} • Weight {acc.weight}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[var(--text-primary)] font-semibold">
                    {formatCurrency(acc.currentSpend || 0)} / {acc.softQuotaSpendLimit ? `$${acc.softQuotaSpendLimit}` : '∞'}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {acc.requestsCount ? `${acc.requestsCount.toLocaleString()} reqs` : '0 reqs'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Recent Requests & In-Flight */}
        <Card
          title="Recent Ingress Requests"
          subtitle="Real-time telemetry, TTFT, and fallback recovery status"
          action={
            <Button size="xs" variant="ghost" onClick={() => onNavigateTab('requests')}>
              Open Inspector <ArrowRight className="w-3 h-3" />
            </Button>
          }
        >
          <div className="divide-y divide-[var(--border)]">
            {requests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                onClick={() => onNavigateTab('requests')}
                className="py-2.5 flex items-center justify-between text-xs font-mono cursor-pointer hover:bg-[var(--surface-raised)] -mx-2 px-2 rounded transition-colors"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)] truncate">
                      {req.requestedModel}
                    </span>
                    {req.fallbackHops > 0 ? (
                      <StatusBadge variant="warning" size="sm">
                        ⚡ RECOVERED ({req.fallbackHops} HOP)
                      </StatusBadge>
                    ) : (
                      <StatusBadge variant="healthy" size="sm">
                        200 OK
                      </StatusBadge>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">
                    Key: {req.virtualKeyName} • Target: {req.effectiveTarget}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[var(--text-primary)] font-medium">
                    {formatLatency(req.latencyMs)}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    TTFT {req.ttftMs}ms • {formatCurrency(req.costUsd || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 5. Terminal Telemetry Footer / Diagnostics */}
      <TerminalPanel title="GATEWAY RUNTIME TELEMETRY STREAM" copyText="kinetix proxy --status ok --metrics nominal">
        <div className="space-y-1">
          <div className="text-[var(--text-muted)]">
            [2026-09-28T15:45:00Z] [INFO] [ingress] HTTP/2 reverse proxy ready on 0.0.0.0:3000
          </div>
          <div className="text-[var(--text-muted)]">
            [2026-09-28T15:45:01Z] [INFO] [topology] 6 routing trees compiled; cache-affinity active
          </div>
          <div className="text-[var(--terminal-green)]">
            [2026-09-28T15:45:02Z] [HEALTH] Upstream circuits: Anthropic (CLOSED), OpenAI (CLOSED), Google (CLOSED)
          </div>
          <div className="text-[var(--text-secondary)]">
            [2026-09-28T15:45:05Z] [METRICS] Ingress QPS nominal • Zero packet drops in telemetry buffer
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
};
