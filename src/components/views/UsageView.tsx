import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Database,
  BrainCircuit,
  Download,
  Trash2,
  FileText,
  FolderOpen,
  CalendarRange,
  Sparkles,
} from 'lucide-react';
import { VirtualKey, ModelConfig, RequestLog } from '../../types';
import { Card, Button, StatusBadge, MetricBox } from '../KinetixUI';
import { formatCurrency, formatTokens } from '../../lib/designSystem';
import { useConfirm } from '../../lib/useConfirm';
import type { ExportFile, UsageDay } from '../../lib/resources';

type Range = 'today' | '24h' | '7d' | '30d';

const RANGE_LABELS: { id: Range; label: string; ms: number | 'today' }[] = [
  { id: 'today', label: 'Today', ms: 'today' },
  { id: '24h', label: '24h', ms: 24 * 3600 * 1000 },
  { id: '7d', label: '7d', ms: 7 * 24 * 3600 * 1000 },
  { id: '30d', label: '30d', ms: 30 * 24 * 3600 * 1000 },
];

function inRange(ts: string, range: Range): boolean {
  const t = Date.parse(ts);
  if (Number.isNaN(t)) return true;
  const now = Date.now();
  if (range === 'today') {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return t >= d.getTime();
  }
  const ms = RANGE_LABELS.find((r) => r.id === range)?.ms;
  return typeof ms === 'number' ? t >= now - ms : true;
}

interface UsageViewProps {
  keys: VirtualKey[];
  models: ModelConfig[];
  requests: RequestLog[];
  exportFiles?: ExportFile[];
  exportDir?: string;
  exportRetentionDays?: number;
  exportDays?: UsageDay[];
  onExportDay?: (day?: string) => Promise<void>;
  onDeleteExport?: (name: string) => Promise<void>;
  onRefreshExports?: () => Promise<void> | void;
}

const formatPrice = (value: number | null, digits: number): string =>
  value == null ? '—' : `$${value.toFixed(digits)}`;

export const UsageView: React.FC<UsageViewProps> = ({
  keys,
  models,
  requests,
  exportFiles = [],
  exportDir,
  exportRetentionDays,
  exportDays = [],
  onExportDay,
  onDeleteExport,
}) => {
  const [range, setRange] = useState<Range>('30d');
  const [busy, setBusy] = useState(false);
  const { confirm, confirmNode } = useConfirm();

  const filtered = useMemo(() => requests.filter((r) => inRange(r.timestamp, range)), [requests, range]);

  const totalSpend = keys.reduce((acc, k) => acc + (k.currentMonthlySpend || 0), 0);
  const totalTokens = keys.reduce((acc, k) => acc + (k.totalTokens || 0), 0);
  const totalCachedTokens = filtered.reduce((acc, r) => acc + (r.cachedTokens || 0), 0);
  const totalThinkingTokens = filtered.reduce((acc, r) => acc + (r.thinkingTokens || 0), 0);

  const yesterday = useMemo(() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const handleExport = async (day?: string) => {
    if (!onExportDay) return;
    const label = day ?? yesterday;
    const ok = await confirm({
      title: `Export ${label} usage?`,
      message: `Write ${label}'s request logs to JSONL and CSV in the export directory.`,
      confirmLabel: 'Export',
    });
    if (!ok) return;
    setBusy(true);
    try {
      await onExportDay(day);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!onDeleteExport) return;
    const ok = await confirm({
      title: 'Delete this export file?',
      message: `Permanently remove ${name} from disk.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await onDeleteExport(name);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {confirmNode}

      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Usage, Attribution &amp; Cost
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Per-key financial attribution, prompt cache savings, reasoning tokens, and audit export.
          </p>
        </div>

        <div className="flex items-center rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] p-0.5 text-xs font-mono">
          {RANGE_LABELS.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-2.5 py-1 rounded-[3px] transition-colors cursor-pointer ${
                range === r.id
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricBox
          label="Total Spend (MTD)"
          value={formatCurrency(totalSpend)}
          subtext={`Across ${keys.length} active virtual keys`}
          indicator="neutral"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <MetricBox
          label="Tokens Processed"
          value={formatTokens(totalTokens)}
          subtext="Input and output billable"
          indicator="neutral"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricBox
          label="Prompt Cache Tokens"
          value={formatTokens(totalCachedTokens)}
          subtext="Saved via cache-affinity"
          indicator="healthy"
          icon={<Sparkles className="w-4 h-4" />}
        />
        <MetricBox
          label="Reasoning Tokens"
          value={formatTokens(totalThinkingTokens)}
          subtext="Deep thinking / o-series tier"
          indicator="info"
          icon={<BrainCircuit className="w-4 h-4" />}
        />
      </div>

      {/* Virtual Key Financial Attribution Table */}
      <Card
        title="Virtual Key Attribution & Budgets"
        subtitle="Spend and token accounting attributed by client application or operator"
      >
        <div className="overflow-x-auto">
          <table className="kinetix-table font-mono text-xs">
            <thead>
              <tr>
                <th>Key Name</th>
                <th>Owner / Tag</th>
                <th>Spend (Month)</th>
                <th>Monthly Budget</th>
                <th>Budget Usage</th>
                <th>Tokens</th>
                <th>Allowed Models</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {keys.map((k) => {
                const limit = k.monthlyBudget || 0;
                const spend = k.currentMonthlySpend || 0;
                const percent = limit > 0 ? Math.min(100, Math.round((spend / limit) * 100)) : 0;

                return (
                  <tr key={k.id}>
                    <td className="font-semibold text-[var(--text-primary)]">{k.name}</td>
                    <td className="font-sans text-[var(--text-secondary)]">
                      {k.owner} {k.tag && <span className="text-[var(--text-muted)]">({k.tag})</span>}
                    </td>
                    <td className="tabular-nums font-semibold text-[var(--text-primary)]">
                      {formatCurrency(spend)}
                    </td>
                    <td className="tabular-nums text-[var(--text-muted)]">
                      {limit ? formatCurrency(limit) : '∞ Unlimited'}
                    </td>
                    <td className="w-36">
                      {limit > 0 ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[var(--surface-raised)] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percent > 90
                                  ? 'bg-[var(--danger)]'
                                  : percent > 75
                                  ? 'bg-[var(--warning)]'
                                  : 'bg-[var(--healthy)]'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)] text-[11px]">No limit</span>
                      )}
                    </td>
                    <td className="tabular-nums">{formatTokens(k.totalTokens || 0)}</td>
                    <td className="text-[var(--text-muted)] truncate max-w-xs font-sans">
                      {k.allowedModels.length > 0 ? k.allowedModels.join(', ') : 'All models allowed'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upstream Model Price Sheet */}
      <Card
        title="Model Pricing Reference Sheet"
        subtitle="Upstream catalog rates per 1,000,000 tokens (inclusive of cache & reasoning variants)"
      >
        <div className="overflow-x-auto">
          <table className="kinetix-table font-mono text-xs">
            <thead>
              <tr>
                <th>Model</th>
                <th>Provider</th>
                <th>Input / 1M</th>
                <th>Output / 1M</th>
                <th>Cache Read / 1M</th>
                <th>Cache Write / 1M</th>
                <th>Thinking / 1M</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {models.map((m) => (
                <tr key={m.id}>
                  <td className="font-semibold text-[var(--text-primary)]">{m.displayName}</td>
                  <td className="font-sans text-[var(--text-secondary)]">{m.providerName}</td>
                  <td className="tabular-nums">{formatPrice(m.prices.inputPer1M, 2)}</td>
                  <td className="tabular-nums">{formatPrice(m.prices.outputPer1M, 2)}</td>
                  <td className="tabular-nums text-[var(--healthy)]">
                    {formatPrice(m.prices.cachedPer1M, 2)}
                  </td>
                  <td className="tabular-nums">{formatPrice(m.prices.cacheWritePer1M, 2)}</td>
                  <td className="tabular-nums text-[var(--info)]">
                    {formatPrice(m.prices.thinkingPer1M, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Export & Archive Section */}
      <Card
        title="Data Exports & Financial Records"
        subtitle={exportDir ? `Daily ledger stored at ${exportDir} (Retention: ${exportRetentionDays ?? 30} days)` : 'Daily ledger exports'}
        action={
          <Button
            size="xs"
            variant="secondary"
            onClick={() => void handleExport()}
            isLoading={busy}
          >
            <Download className="w-3.5 h-3.5" />
            Export Yesterday
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="kinetix-table font-mono text-xs">
            <thead>
              <tr>
                <th>File / Partition</th>
                <th>Created</th>
                <th>Size</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {exportFiles.map((f) => (
                <tr key={f.name}>
                  <td className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    {f.name}
                  </td>
                  <td>{f.day || '—'}</td>
                  <td>{f.bytes ? `${Math.round(f.bytes / 1024)} KB` : '—'}</td>
                  <td className="text-right">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => void handleDelete(f.name)}
                      className="text-[var(--danger)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {exportFiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-[var(--text-muted)] font-sans">
                    No exported ledger files currently stored on disk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
