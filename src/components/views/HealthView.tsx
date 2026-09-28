import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  TimerReset,
  RefreshCw,
  Clock,
  Layers,
  Zap,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card, Button, StatusBadge, MetricBox } from '../KinetixUI';

type WindowKey = '5m' | '1h' | '24h';
type ScopeKey = 'all' | 'provider' | 'account' | 'model';

interface Circuit {
  provider_id: string;
  provider_name?: string;
  state: 'closed' | 'open' | 'half-open';
  recent_qualifying_failures: number;
  distinct_failing_accounts: number;
  distinct_failing_targets: number;
  recent_failures: Array<{
    account_id: string;
    target_id: string;
    observed_at?: string;
  }>;
  retry_at?: string | null;
  last_successful_probe?: string | null;
}

interface Quota {
  provider_id: string;
  account_id: string;
  remaining_fraction?: number | null;
  reset_at?: string | null;
  freshness: string;
  source: string;
  observed_at?: string | null;
  routing?: {
    remaining_fraction?: number | null;
    reset_at?: string | null;
    routing_eligible?: boolean;
    source: string;
    observed_at?: string | null;
  } | null;
}

interface Telemetry {
  scope: string;
  target?: string;
  provider_id?: string;
  account_id?: string;
  model_id?: string;
  attempts: number;
  requests?: number;
  success?: number;
  success_rate: number;
  rate_limits: number;
  quota_exhausted: number;
  auth_errors: number;
  target_errors: number;
  bad_requests: number;
  client_4xx: number;
  fallbacks: number;
  fallback_failures: number;
  cancellations: number;
  server_5xx: number;
  connection_errors: number;
  timeouts: number;
  adaptive_saturation: number;
  provider_circuit_rejects: number;
  ttft_p50_ms?: number | null;
  ttft_p95_ms?: number | null;
  ttft_p99_ms?: number | null;
  duration_p50_ms?: number | null;
  duration_p95_ms?: number | null;
  duration_p99_ms?: number | null;
}

interface RuntimeHealth {
  window: WindowKey;
  telemetry: Telemetry[];
  provider_circuits: Circuit[];
  quota: Quota[];
  dropped: { queue: number; persistence: number };
}

function pct(value?: number | null): string {
  return value == null ? '—' : `${(value * 100).toFixed(1)}%`;
}

function ms(value?: number | null): string {
  return value == null ? '—' : `${Math.round(value)}ms`;
}

function when(value?: string | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleTimeString();
}

export function HealthView() {
  const [windowKey, setWindowKey] = useState<WindowKey>('1h');
  const [scopeKey, setScopeKey] = useState<ScopeKey>('all');
  const [data, setData] = useState<RuntimeHealth | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api.get<RuntimeHealth>(`/admin/api/health/runtime?window=${windowKey}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to load runtime health');
    } finally {
      setLoading(false);
    }
  }, [windowKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const telemetryRows =
    data?.telemetry.filter((row) => scopeKey === 'all' || row.scope === scopeKey) ?? [];
  const openCircuits = data?.provider_circuits.filter((circuit) => circuit.state !== 'closed') ?? [];

  return (
    <div className="space-y-6">
      {/* Header and Window Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Runtime Health &amp; Concurrency
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Circuit breaker trip states, latency percentiles, adaptive saturation, and quota evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] p-0.5 text-xs font-mono">
            {(['5m', '1h', '24h'] as WindowKey[]).map((w) => (
              <button
                key={w}
                onClick={() => setWindowKey(w)}
                className={`px-2.5 py-1 rounded-[3px] transition-colors cursor-pointer ${
                  windowKey === w
                    ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <Button size="sm" variant="secondary" onClick={() => void refresh()} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-[4px] text-xs font-mono text-[var(--danger)]">
          {error}
        </div>
      )}

      {/* Industrial Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricBox
          label="Circuit Breakers"
          value={openCircuits.length === 0 ? 'ALL CLOSED' : `${openCircuits.length} TRIPPED`}
          subtext={openCircuits.length === 0 ? 'Normal routing to all providers' : 'Failover active'}
          indicator={openCircuits.length === 0 ? 'healthy' : 'danger'}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
        <MetricBox
          label="Telemetry Dropped"
          value={(data?.dropped.queue ?? 0) + (data?.dropped.persistence ?? 0)}
          subtext="0 buffer pressure dropouts"
          indicator="neutral"
          icon={<Activity className="w-4 h-4" />}
        />
        <MetricBox
          label="Fresh Quota Evidence"
          value={data?.quota.filter((q) => q.freshness === 'fresh').length ?? 0}
          subtext="Active routing eligibility"
          indicator="info"
          icon={<TimerReset className="w-4 h-4" />}
        />
      </div>

      {/* Provider Circuits Table */}
      <Card
        title="Provider Circuit Breakers"
        subtitle="Automatic backoff on upstream 429 / 5xx cascades. Tripped circuits failover immediately."
      >
        <div className="overflow-x-auto">
          <table className="kinetix-table font-mono text-xs">
            <thead>
              <tr>
                <th>Provider ID</th>
                <th>Circuit State</th>
                <th>Qualifying Failures</th>
                <th>Failing Accounts / Targets</th>
                <th>Auto-Retry Next Probe</th>
                <th>Last Success Recovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {(data?.provider_circuits ?? []).map((c) => (
                <tr key={c.provider_id}>
                  <td className="font-semibold text-[var(--text-primary)]">
                    {c.provider_name || c.provider_id}
                  </td>
                  <td>
                    <StatusBadge
                      variant={c.state === 'closed' ? 'healthy' : c.state === 'half-open' ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {c.state.toUpperCase()}
                    </StatusBadge>
                  </td>
                  <td>{c.recent_qualifying_failures}</td>
                  <td>
                    {c.distinct_failing_accounts} accounts / {c.distinct_failing_targets} targets
                  </td>
                  <td>{when(c.retry_at)}</td>
                  <td>{when(c.last_successful_probe)}</td>
                </tr>
              ))}
              {data?.provider_circuits.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-[var(--text-muted)] font-sans">
                    No circuit breaker events recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Target Telemetry Percentiles Table */}
      <Card
        title={`Latency & Concurrency Telemetry (${windowKey})`}
        subtitle="Detailed TTFT, duration percentiles, saturation, and failure classification"
        action={
          <div className="flex items-center gap-1 text-xs font-mono">
            {(['all', 'provider', 'account', 'model'] as ScopeKey[]).map((s) => (
              <button
                key={s}
                onClick={() => setScopeKey(s)}
                className={`px-2 py-0.5 rounded-[3px] capitalize cursor-pointer ${
                  scopeKey === s
                    ? 'bg-[var(--primary)] text-white font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="kinetix-table font-mono text-xs">
            <thead>
              <tr>
                <th>Scope</th>
                <th>Target Identifier</th>
                <th>Attempts</th>
                <th>Success %</th>
                <th>TTFT (P50 / P95 / P99)</th>
                <th>Duration (P50 / P95 / P99)</th>
                <th>5xx / Timeout</th>
                <th>Rate / Quota</th>
                <th>Failover Hops</th>
                <th>Saturation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {telemetryRows.map((r, i) => (
                <tr key={i}>
                  <td>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      {r.scope}
                    </span>
                  </td>
                  <td className="font-semibold text-[var(--text-primary)]">
                    {r.target || r.provider_id || r.account_id || r.model_id || 'Global'}
                  </td>
                  <td>{r.attempts ?? r.requests ?? 0}</td>
                  <td>
                    <span className="text-[var(--healthy)] font-semibold">{pct(r.success_rate)}</span>
                  </td>
                  <td>
                    {ms(r.ttft_p50_ms)} / {ms(r.ttft_p95_ms)} / {ms(r.ttft_p99_ms)}
                  </td>
                  <td>
                    {ms(r.duration_p50_ms)} / {ms(r.duration_p95_ms)} / {ms(r.duration_p99_ms)}
                  </td>
                  <td>
                    <span className={r.server_5xx > 0 ? 'text-[var(--danger)] font-bold' : ''}>
                      {r.server_5xx}
                    </span>{' '}
                    / {r.timeouts}
                  </td>
                  <td>
                    <span className={r.rate_limits > 0 ? 'text-[var(--warning)] font-bold' : ''}>
                      {r.rate_limits}
                    </span>{' '}
                    / {r.quota_exhausted}
                  </td>
                  <td>{r.fallbacks}</td>
                  <td>
                    <span className="text-[var(--text-muted)]">
                      {r.adaptive_saturation != null ? `${(r.adaptive_saturation * 100).toFixed(0)}%` : '0%'}
                    </span>
                  </td>
                </tr>
              ))}
              {telemetryRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-6 text-[var(--text-muted)] font-sans">
                    No telemetry records available for this filter window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
