import React, { useState } from 'react';
import {
  Radio,
  Search,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  X,
  FileCode,
  Activity,
  Layers,
} from 'lucide-react';
import { RequestLog, LiveRequest } from '../../types';
import { Card, Button, StatusBadge, Input, Select, TerminalPanel } from '../KinetixUI';
import { formatCurrency, formatLatency, formatTokens } from '../../lib/designSystem';

interface RequestsViewProps {
  requests: RequestLog[];
  liveRequests: LiveRequest[];
}

export const RequestsView: React.FC<RequestsViewProps> = ({ requests, liveRequests }) => {
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'fallback_recovered' | 'rate_limited'>('all');
  const [selectedRequest, setSelectedRequest] = useState<RequestLog | null>(null);
  const [trace, setTrace] = useState<any | null>(null);
  const [diagnostics, setDiagnostics] = useState<any | null>(null);
  const [panel, setPanel] = useState<'trace' | 'diagnostics' | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadTrace = () => {
    if (!selectedRequest) return;
    setPanelError(null);
    setPanel('trace');
    fetch(`/admin/api/requests/${selectedRequest.requestId}/route-trace`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setTrace)
      .catch((e) => setPanelError(`Route trace unavailable (${e}).`));
  };

  const loadDiagnostics = () => {
    if (!selectedRequest) return;
    setPanelError(null);
    setPanel('diagnostics');
    fetch(`/admin/api/requests/${selectedRequest.requestId}/diagnostics`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setDiagnostics)
      .catch((e) => setPanelError(`Diagnostics unavailable (${e}).`));
  };

  const copyRequestId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filtered = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (filterText) {
      const q = filterText.toLowerCase();
      return (
        r.virtualKeyName.toLowerCase().includes(q) ||
        r.requestedModel.toLowerCase().includes(q) ||
        r.effectiveTarget.toLowerCase().includes(q) ||
        r.requestId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <span>Request Telemetry &amp; Live Stream</span>
            {liveRequests.filter((l) => !l.finished).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[var(--healthy)] animate-pulse" />
            )}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Real-time ingress inspector, TTFT latency tracking, and exact failover flight events.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter key, model, request ID…"
            icon={<Search className="w-3.5 h-3.5" />}
            className="w-full sm:w-64"
            mono
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-44 shrink-0"
          >
            <option value="all">All Outcomes</option>
            <option value="success">200 OK (Direct)</option>
            <option value="fallback_recovered">⚡ Failover Recovered</option>
            <option value="rate_limited">429 Rate Limited</option>
          </Select>
        </div>
      </div>

      {/* In-Flight Live Streams */}
      {liveRequests.filter((l) => !l.finished).length > 0 && (
        <Card className="p-0 overflow-hidden border-[var(--primary-border)] bg-[#0d0d14]">
          <div className="px-4 py-2.5 bg-[var(--surface-raised)] border-b border-[var(--border)] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" />
              <span className="font-semibold text-[var(--text-primary)]">ACTIVE IN-FLIGHT STREAMS</span>
            </div>
            <span className="text-[var(--text-muted)]">
              {liveRequests.filter((l) => !l.finished).length} active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="kinetix-table font-mono text-xs">
              <thead>
                <tr>
                  <th>Phase</th>
                  <th>Request ID</th>
                  <th>Key</th>
                  <th>Model</th>
                  <th>TTFT</th>
                  <th>Tokens In/Out</th>
                  <th>Elapsed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {liveRequests
                  .filter((l) => !l.finished)
                  .map((l) => (
                    <tr key={l.requestId}>
                      <td>
                        <StatusBadge variant="info" size="sm">
                          {l.phase}
                        </StatusBadge>
                      </td>
                      <td className="font-semibold text-[var(--text-primary)]">{l.requestId}</td>
                      <td>{l.keyName}</td>
                      <td>{l.requestedModel}</td>
                      <td>{l.ttftMs ? `${l.ttftMs}ms` : 'waiting…'}</td>
                      <td>{l.inputTokens ?? '?'} / {l.outputTokens ?? '?'}</td>
                      <td>{formatLatency(l.latencyMs)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Main Historical Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="kinetix-table">
            <thead>
              <tr>
                <th>Outcome</th>
                <th>Request ID &amp; Timestamp</th>
                <th>Virtual Key</th>
                <th>Requested → Served</th>
                <th>Failover Hops</th>
                <th>TTFT / Total</th>
                <th>Tokens (In / Out / Cache)</th>
                <th>Cost</th>
                <th className="text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs divide-y divide-[var(--border-subtle)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-[var(--text-muted)] font-sans">
                    No requests match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const isFallback = r.fallbackHops > 0;
                  const isSelected = selectedRequest?.id === r.id;

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRequest(r)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[var(--surface-raised)] border-l-2 border-[var(--primary)]'
                          : 'hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <td>
                        {isFallback ? (
                          <StatusBadge variant="warning" size="sm">
                            ⚡ RECOVERED
                          </StatusBadge>
                        ) : r.status === 'success' ? (
                          <StatusBadge variant="healthy" size="sm">
                            200 OK
                          </StatusBadge>
                        ) : (
                          <StatusBadge variant="danger" size="sm">
                            {r.statusCode || 500} ERR
                          </StatusBadge>
                        )}
                      </td>

                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[var(--text-primary)]">{r.requestId}</span>
                          <button
                            onClick={(e) => copyRequestId(r.requestId, e)}
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                            title="Copy ID"
                          >
                            {copiedId === r.requestId ? (
                              <Check className="w-3 h-3 text-[var(--healthy)]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {new Date(r.timestamp).toLocaleTimeString()}
                        </div>
                      </td>

                      <td className="font-sans text-[var(--text-secondary)] truncate max-w-[120px]">
                        {r.virtualKeyName}
                      </td>

                      <td>
                        <div className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                          <span className="text-[var(--info)]">{r.requestedModel}</span>
                          <ArrowRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                          <span>{r.effectiveTarget}</span>
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate max-w-[180px]">
                          Account: {r.servingAccount}
                        </div>
                      </td>

                      <td>
                        {isFallback ? (
                          <span className="font-bold text-[var(--warning)]">
                            {r.fallbackHops} hop (429 retried)
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">0 (Direct)</span>
                        )}
                      </td>

                      <td>
                        <div>TTFT: <b>{r.ttftMs}ms</b></div>
                        <div className="text-[var(--text-muted)]">{formatLatency(r.latencyMs)}</div>
                      </td>

                      <td>
                        <div>{r.inputTokens.toLocaleString()} in / {r.outputTokens.toLocaleString()} out</div>
                        {r.cachedTokens > 0 && (
                          <div className="text-[var(--healthy)] text-[11px]">
                            +{r.cachedTokens.toLocaleString()} cache hit
                          </div>
                        )}
                      </td>

                      <td className="font-semibold text-[var(--text-primary)] tabular-nums">
                        {formatCurrency(r.costUsd || 0)}
                      </td>

                      <td className="text-right font-sans">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(r);
                          }}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Selected Request Terminal Drawer / Inspector */}
      {selectedRequest && (
        <Card className="border-[var(--border-strong)] bg-[#0a0a0e] space-y-4">
          <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-bold text-sm text-[var(--text-primary)]">
                  {selectedRequest.requestId}
                </span>
                {selectedRequest.fallbackHops > 0 ? (
                  <StatusBadge variant="warning" size="sm">
                    FAILOVER RECOVERED ({selectedRequest.fallbackHops} HOPS)
                  </StatusBadge>
                ) : (
                  <StatusBadge variant="healthy" size="sm">
                    DIRECT DISPATCH
                  </StatusBadge>
                )}
                <span className="text-[var(--text-muted)]">
                  {new Date(selectedRequest.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                Key: <b>{selectedRequest.virtualKeyName}</b> • Requested: <b>{selectedRequest.requestedModel}</b> • Served by: <b>{selectedRequest.servingAccount}</b> ({selectedRequest.effectiveTarget})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button size="xs" variant="secondary" onClick={loadTrace}>
                Route Trace
              </Button>
              <Button size="xs" variant="secondary" onClick={loadDiagnostics}>
                Diagnostics
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setSelectedRequest(null);
                  setPanel(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Trace or Diagnostics Terminal Output */}
          {panelError && (
            <div className="text-xs text-[var(--danger)] font-mono p-2 border border-[var(--danger-border)] rounded bg-[var(--danger-bg)]">
              {panelError}
            </div>
          )}

          {panel === 'trace' && trace && (
            <TerminalPanel title="EXECUTION ROUTE TRACE" copyText={JSON.stringify(trace, null, 2)}>
              <div className="space-y-1 text-xs">
                <div className="text-[var(--healthy)]">
                  Outcome: {trace.outcome || 'served_primary'} • Commit: {trace.commit_state || 'committed'}
                </div>
                {(trace.steps || []).map((s: any, i: number) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[var(--text-muted)] w-16 shrink-0">{s.elapsed_ms}ms</span>
                    <span className="text-[var(--info)] w-24 shrink-0 font-bold">[{s.stage}]</span>
                    <span className="text-[var(--text-secondary)]">
                      {s.target && <b>{s.target}: </b>}
                      {s.detail}
                    </span>
                  </div>
                ))}
              </div>
            </TerminalPanel>
          )}

          {panel === 'diagnostics' && diagnostics && (
            <TerminalPanel title="FLIGHT RECORDER DIAGNOSTICS" copyText={JSON.stringify(diagnostics, null, 2)}>
              <div className="space-y-1 text-xs">
                {(diagnostics.flight_events || []).map((e: any, i: number) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[var(--text-muted)] w-16 shrink-0">{e.elapsed_ms}ms</span>
                    <span className="text-[var(--healthy)] w-48 shrink-0 font-semibold">{e.event}</span>
                    <span className="text-[var(--text-secondary)]">{e.detail}</span>
                  </div>
                ))}
              </div>
            </TerminalPanel>
          )}

          {/* Prompt and Completion Snippets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] space-y-1">
              <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-semibold block">
                Prompt Preview
              </span>
              <div className="text-[var(--text-secondary)] whitespace-pre-wrap max-h-24 overflow-y-auto">
                {selectedRequest.promptPreview || (
                  <span className="text-[var(--text-muted)] italic">
                    Prompt bodies are excluded from storage by default for tenant privacy.
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] space-y-1">
              <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-semibold block">
                Upstream Streamed Completion
              </span>
              <div className="text-[var(--text-secondary)] whitespace-pre-wrap max-h-24 overflow-y-auto">
                {selectedRequest.responsePreview || (
                  <span className="text-[var(--text-muted)] italic">
                    Response preview not logged (body persistence disabled).
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
