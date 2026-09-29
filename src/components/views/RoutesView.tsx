import React, { useState, useRef, useEffect } from 'react';
import {
  Shuffle,
  Plus,
  ArrowDown,
  ArrowUp,
  Layers,
  Trash2,
  AlertTriangle,
  PlayCircle,
  Search,
  X,
  Table as TableIcon,
  MoreHorizontal,
} from 'lucide-react';
import { Route, Account, ModelConfig } from '../../types';
import { Card, Button, StatusBadge, Input, Select, TerminalPanel } from '../KinetixUI';
import { Kinetix } from '../../lib/resources';

const ROUTE_STRATEGIES: ReadonlyArray<readonly [Route['selectionStrategy'], string]> = [
  ['priority', 'Priority (Ordered fallback on failure)'],
  ['round-robin', 'Round-robin load balancing'],
  ['weighted', 'Weighted distribution'],
  ['least-used', 'Least-used (prefer idle accounts)'],
  ['adaptive', 'Adaptive (capacity + TTFT EWMA)'],
];

interface RoutesViewProps {
  routes: Route[];
  accounts: Account[];
  models: ModelConfig[];
  allowedProviders?: string[];
  onAddRoute: (newRoute: Route) => void;
  onUpdateRoute: (updated: Route) => void;
  onDeleteRoute: (routeId: string) => void;
}

export const RoutesView: React.FC<RoutesViewProps> = ({
  routes,
  accounts,
  models,
  onAddRoute,
  onUpdateRoute,
  onDeleteRoute,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const [confirmDeleteRouteId, setConfirmDeleteRouteId] = useState<string | null>(null);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [routeSearch, setRouteSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cascade' | 'table'>('cascade');
  const overflowRef = useRef<HTMLDivElement>(null);

  // New route form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [strategy, setStrategy] = useState<Route['selectionStrategy']>('adaptive');
  const [on429, setOn429] = useState(true);
  const [onQuota, setOnQuota] = useState(true);
  const [on5xx, setOn5xx] = useState(true);
  const [sticky, setSticky] = useState(true);
  const [dryRunResult, setDryRunResult] = useState<any | null>(null);
  const [dryRunning, setDryRunning] = useState(false);

  // Add-target form state
  const [newTargetModelId, setNewTargetModelId] = useState('');
  const [newTargetAccountId, setNewTargetAccountId] = useState('');

  // Close overflow menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowOverflowMenu(false);
      }
    };
    if (showOverflowMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [showOverflowMenu]);

  const normalizedRouteSearch = routeSearch.trim().toLowerCase();
  const filteredRoutes = routes.filter((route) => {
    if (!normalizedRouteSearch) return true;
    const targetTerms = route.targets.flatMap((target) => {
      const model = models.find((m) => m.id === target.modelId);
      return [
        target.modelId,
        target.modelDisplayName,
        target.providerName,
        model?.upstreamModelId,
        model?.displayName,
      ];
    });
    return [
      route.id,
      route.name,
      route.description,
      route.selectionStrategy,
      ...targetTerms,
    ].some((value) => String(value ?? '').toLowerCase().includes(normalizedRouteSearch));
  });

  const activeRoute =
    filteredRoutes.find((route) => route.id === selectedRouteId) ||
    filteredRoutes[0];

  const renumber = (targets: Route['targets']): Route['targets'] =>
    targets.map((t, i) => ({ ...t, priority: i + 1 }));

  const moveTarget = (route: Route, index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= route.targets.length) return;
    const targets = [...route.targets];
    [targets[index], targets[next]] = [targets[next], targets[index]];
    const reordered = renumber(targets);
    onUpdateRoute({ ...route, targets: reordered, totalHops: Math.max(0, reordered.length - 1) });
  };

  const handleAddTarget = (route: Route) => {
    const model = models.find((m) => m.id === newTargetModelId);
    if (!model) return;
    const account = accounts.find((a) => a.id === newTargetAccountId);
    const target = {
      id: `tgt-${Date.now()}`,
      accountId: account?.id ?? '',
      accountLabel: account?.label ?? 'Auto (pool rotation)',
      providerName: model.providerName,
      modelId: model.id,
      modelDisplayName: model.displayName,
      priority: route.targets.length + 1,
      weight: 100,
    };
    const targets = renumber([...route.targets, target]);
    onUpdateRoute({ ...route, targets, totalHops: Math.max(0, targets.length - 1) });
    setNewTargetModelId('');
    setNewTargetAccountId('');
  };

  const handleDryRun = async () => {
    if (!activeRoute) return;
    setDryRunning(true);
    setDryRunResult(null);
    try {
      const res = await Kinetix.dryRunRoute(activeRoute.name, {
        strategy: activeRoute.selectionStrategy,
        targets: activeRoute.targets,
        fallback_triggers: activeRoute.fallbackTriggers,
      });
      setDryRunResult(res);
    } catch (e) {
      setDryRunResult({
        error: e instanceof Error ? e.message : 'Dry run failed',
        trace: ['Failed to compute candidate selection trace'],
      });
    } finally {
      setDryRunning(false);
    }
  };

  const handleCreateRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddRoute({
      id: `route-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      selectionStrategy: strategy,
      totalHops: 0,
      status: 'active',
      fallbackTriggers: {
        on429,
        onQuota,
        on5xx,
        onTimeout: true,
      },
      portabilityPolicy: 'strip_with_warning',
      cacheAffinity: true,
      stickyRouting: sticky,
      targets: [],
    });

    setName('');
    setDescription('');
    setShowCreateModal(false);
  };

  const formatTriggers = (triggers: Route['fallbackTriggers']) => {
    if (!triggers) return '429 / quota / 5xx';
    const parts: string[] = [];
    if (triggers.on429) parts.push('429');
    if (triggers.onQuota) parts.push('quota');
    if (triggers.on5xx) parts.push('upstream 5xx');
    if (triggers.onTimeout) parts.push('timeout');
    return parts.length > 0 ? parts.join(' / ') : 'manual only';
  };

  const formatTargetCount = (count: number) =>
    `${count} ${count === 1 ? 'target' : 'targets'}`;

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Routes &amp; Fallback
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Define multi-provider routing trees, account priority cascade, and automated failover rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* View mode toggle: Cascade | Table */}
          <div className="inline-flex items-center h-8 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] p-0.5 text-xs font-mono shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cascade')}
              className={`h-full px-2.5 rounded-[3px] flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                viewMode === 'cascade'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cascade</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`h-full px-2.5 rounded-[3px] flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                viewMode === 'table'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Route</span>
          </Button>
        </div>
      </div>

      {routes.length === 0 ? (
        <Card className="p-8 text-center">
          <Shuffle className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-60" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">No Routes Configured</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mt-1 mb-4">
            Routes allow you to group multiple upstream providers and accounts under a single endpoint model.
          </p>
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-3.5 h-3.5" />
            Create First Route
          </Button>
        </Card>
      ) : viewMode === 'table' ? (
        /* Structured Comparison Table */
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="kinetix-table">
              <thead>
                <tr>
                  <th>Route Name</th>
                  <th>Description</th>
                  <th>Strategy</th>
                  <th>Targets</th>
                  <th>Failover Triggers</th>
                  <th>Sticky Routing</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs divide-y divide-[var(--border-subtle)]">
                {routes.map((route) => (
                  <tr
                    key={route.id}
                    onClick={() => {
                      setSelectedRouteId(route.id);
                      setViewMode('cascade');
                    }}
                    className="hover:bg-[var(--surface-raised)] cursor-pointer"
                  >
                    <td className="font-semibold text-[var(--text-primary)]">{route.name}</td>
                    <td className="text-[var(--text-secondary)] font-sans max-w-xs truncate">
                      {route.description}
                    </td>
                    <td>
                      <span className="text-[var(--text-secondary)] font-medium">{route.selectionStrategy}</span>
                    </td>
                    <td>
                      {formatTargetCount(route.targets.length)}
                    </td>
                    <td className="text-[var(--text-muted)]">
                      {formatTriggers(route.fallbackTriggers)}
                    </td>
                    <td>{route.stickyRouting ? 'Enabled' : 'Disabled'}</td>
                    <td>
                      {route.status !== 'active' ? (
                        <StatusBadge variant="danger">
                          {route.status}
                        </StatusBadge>
                      ) : (
                        <span className="text-[var(--text-muted)] font-mono text-[11px]">active</span>
                      )}
                    </td>
                    <td className="text-right font-sans">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRouteId(route.id);
                          setViewMode('cascade');
                        }}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Master-Detail Cascade Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left Column: Route Selector List (Reduced ~18-20% height, dense, no loud green pills) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] px-0.5">
              <span>ROUTES ({filteredRoutes.length})</span>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={routeSearch}
                onChange={(e) => setRouteSearch(e.target.value)}
                placeholder="Search routes…"
                className="w-full pl-8 pr-7 py-1.5 bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] font-mono text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus-visible:outline-none"
              />
              {routeSearch && (
                <button
                  type="button"
                  onClick={() => setRouteSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {filteredRoutes.map((route) => {
                const isSelected = route.id === activeRoute?.id;
                const isAbnormal = route.status !== 'active';
                return (
                  <div
                    key={route.id}
                    onClick={() => {
                      setSelectedRouteId(route.id);
                      setConfirmDeleteRouteId(null);
                      setShowOverflowMenu(false);
                    }}
                    className={`px-3 py-2.5 rounded-[4px] border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[var(--surface-raised)] border-[var(--primary)] shadow-xs'
                        : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {/* Row 1: Name and Strategy (plus anomaly badge only if degraded/disabled) */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-[var(--text-primary)] truncate">
                        {route.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isAbnormal && (
                          <StatusBadge variant="danger" size="sm">
                            {route.status}
                          </StatusBadge>
                        )}
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                          {route.selectionStrategy}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Description */}
                    {route.description && (
                      <p className="text-xs text-[var(--text-muted)] truncate mt-0.5 leading-snug">
                        {route.description}
                      </p>
                    )}

                    {/* Row 3: Target Count (fixed pluralization, no conflicting 0 hops) */}
                    <div className="mt-1 text-[11px] font-mono text-[var(--text-muted)]">
                      {formatTargetCount(route.targets.length)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Ordered Fallback Cascade Editor */}
          {activeRoute && (
            <div className="lg:col-span-2 space-y-4">
              <Card>
                {/* Route Detail Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-[var(--text-primary)] font-mono">
                        {activeRoute.name}
                      </h3>
                      <span className="text-[11px] font-mono text-[var(--text-secondary)] px-2 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border)]">
                        {activeRoute.selectionStrategy}
                      </span>
                      {activeRoute.status !== 'active' && (
                        <StatusBadge variant="danger" size="sm">
                          {activeRoute.status}
                        </StatusBadge>
                      )}
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        {formatTargetCount(activeRoute.targets.length)}
                      </span>
                    </div>
                    {activeRoute.description && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">{activeRoute.description}</p>
                    )}
                  </div>

                  {/* Actions: Dry Run Trace as primary action; Delete separated in overflow menu */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={handleDryRun}
                      isLoading={dryRunning}
                      title="Simulate candidate selection trace"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span>Dry Run Trace</span>
                    </Button>

                    {/* Separated Overflow Menu for Dangerous Actions */}
                    <div className="relative" ref={overflowRef}>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                        className="px-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        title="Route actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>

                      {showOverflowMenu && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-[4px] shadow-lg py-1 z-20 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setShowOverflowMenu(false);
                              setConfirmDeleteRouteId(activeRoute.id);
                            }}
                            className="w-full px-3 py-1.5 text-left text-[var(--danger)] hover:bg-[var(--danger-bg)] flex items-center gap-2 cursor-pointer font-sans"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete route…</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Destructive Action Confirmation Banner */}
                {confirmDeleteRouteId === activeRoute.id && (
                  <div className="my-3 p-3 bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-[4px] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[var(--danger)] font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Delete route <b>{activeRoute.name}</b> and all fallback targets?</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => {
                          onDeleteRoute(activeRoute.id);
                          setConfirmDeleteRouteId(null);
                        }}
                      >
                        Confirm Delete
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => setConfirmDeleteRouteId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Dry Run Trace Output */}
                {dryRunResult && (
                  <div className="my-3">
                    <TerminalPanel title="ROUTE RESOLUTION DRY-RUN TRACE" copyText={JSON.stringify(dryRunResult, null, 2)}>
                      <div className="space-y-1">
                        <div className="text-[var(--primary)] font-semibold">
                          Target Selected: {dryRunResult.selected?.modelId || 'None'}
                        </div>
                        {(dryRunResult.trace || []).map((t: string, i: number) => (
                          <div key={i} className="text-[var(--text-secondary)]">
                            → {t}
                          </div>
                        ))}
                      </div>
                    </TerminalPanel>
                  </div>
                )}

                {/* Ordered Cascade Section */}
                <div className="py-3 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] tracking-wider">
                    <span className="font-semibold text-[var(--text-secondary)] uppercase">
                      Ordered Cascade
                    </span>
                    <span className="text-[11px]">
                      Failover on: <span className="text-[var(--text-secondary)]">{formatTriggers(activeRoute.fallbackTriggers)}</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeRoute.targets.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-[var(--border)] rounded-[4px] text-xs text-[var(--text-muted)]">
                        No targets assigned to this route yet. Add an upstream model target below.
                      </div>
                    ) : (
                      activeRoute.targets.map((tgt, idx) => (
                        <div key={tgt.id}>
                          {/* Simplified Target Row: Index, Model, Provider, Unboxed Metadata, Role Tag, Reorder Controls */}
                          <div className="p-3 bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Clean Numerical Index */}
                              <span className="w-5 text-center font-mono font-bold text-xs text-[var(--text-secondary)] tabular-nums shrink-0">
                                {idx + 1}
                              </span>

                              <div className="min-w-0">
                                {/* Model Name & Provider */}
                                <div className="flex items-center gap-2 truncate">
                                  <span className="font-medium text-[var(--text-primary)] font-sans text-xs">
                                    {tgt.modelDisplayName}
                                  </span>
                                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                                    {tgt.providerName}
                                  </span>
                                </div>

                                {/* Zero-Pill Unboxed Metadata: Account & Weight with typographic dot */}
                                <div className="text-[11px] font-sans text-[var(--text-muted)] mt-0.5 truncate flex items-center gap-1.5">
                                  <span>{tgt.accountLabel || 'Auto (pool rotation)'}</span>
                                  <span aria-hidden="true" className="text-[var(--text-muted)]">·</span>
                                  <span className="font-mono">weight {tgt.weight ?? 100}</span>
                                </div>
                              </div>
                            </div>

                            {/* Role Label & Reorder / Delete Actions */}
                            <div className="flex items-center gap-3 shrink-0">
                              {/* Clear Role Indicator: PRIMARY vs FALLBACK 1, FALLBACK 2... */}
                              {idx === 0 ? (
                                <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--primary)] bg-[var(--primary-bg)] px-2 py-0.5 rounded border border-[var(--primary-border)]">
                                  PRIMARY
                                </span>
                              ) : (
                                <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
                                  FALLBACK {idx}
                                </span>
                              )}

                              <div className="flex items-center gap-1 border-l border-[var(--border)] pl-2">
                                <button
                                  type="button"
                                  onClick={() => moveTarget(activeRoute, idx, -1)}
                                  disabled={idx === 0}
                                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-20 cursor-pointer"
                                  title="Move up in cascade"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveTarget(activeRoute, idx, 1)}
                                  disabled={idx === activeRoute.targets.length - 1}
                                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-20 cursor-pointer"
                                  title="Move down in cascade"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = renumber(activeRoute.targets.filter((t) => t.id !== tgt.id));
                                    onUpdateRoute({
                                      ...activeRoute,
                                      targets: updated,
                                      totalHops: Math.max(0, updated.length - 1),
                                    });
                                  }}
                                  className="p-1 text-[var(--text-muted)] hover:text-[var(--danger)] cursor-pointer"
                                  title="Remove target"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Failover Branch Connector between targets */}
                          {idx < activeRoute.targets.length - 1 && (
                            <div className="flex items-center justify-center py-1">
                              <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                                <ArrowDown className="w-3 h-3 text-[var(--warning)] shrink-0" />
                                <span>Failover on {formatTriggers(activeRoute.fallbackTriggers)}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Target Row: Consistent "target" language, clean form layout */}
                  <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] space-y-2 mt-4">
                    <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 font-sans">
                      <Plus className="w-3.5 h-3.5 text-[var(--primary)]" />
                      Add target
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-center">
                      <Select
                        value={newTargetModelId}
                        onChange={(e) => setNewTargetModelId(e.target.value)}
                        className="w-full min-w-0"
                      >
                        <option value="">Select upstream model…</option>
                        {models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.displayName} ({m.providerName})
                          </option>
                        ))}
                      </Select>
                      <Select
                        value={newTargetAccountId}
                        onChange={(e) => setNewTargetAccountId(e.target.value)}
                        className="w-full min-w-0"
                      >
                        <option value="">Account: auto (pool rotation)</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.label} ({a.providerName})
                          </option>
                        ))}
                      </Select>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!newTargetModelId}
                        onClick={() => handleAddTarget(activeRoute)}
                        className="shrink-0 whitespace-nowrap w-full md:w-auto"
                      >
                        Add target
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Create Route Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-[6px] max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Create Route</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRouteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Route Identifier</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. claude-3-7-sonnet or general-fast"
                  required
                  mono
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Primary fast routing with Anthropic to OpenAI fallback"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Target Selection Strategy</label>
                <Select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value as any)}
                  className="w-full"
                >
                  {ROUTE_STRATEGIES.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border)] font-mono text-xs">
                <span className="block text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                  Failover Triggers
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={on429}
                    onChange={(e) => setOn429(e.target.checked)}
                    className="rounded border-[var(--border)]"
                  />
                  <span>Failover on HTTP 429 Rate Limit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onQuota}
                    onChange={(e) => setOnQuota(e.target.checked)}
                    className="rounded border-[var(--border)]"
                  />
                  <span>Failover on Soft Quota Spend Exceeded</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={on5xx}
                    onChange={(e) => setOn5xx(e.target.checked)}
                    className="rounded border-[var(--border)]"
                  />
                  <span>Failover on Upstream 5xx Server Error</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Create Route
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

