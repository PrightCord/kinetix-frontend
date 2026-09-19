import React, { useState } from 'react';
import { Shuffle, Plus, ArrowDown, Shield, Check, Layers, ArrowRight, Trash2, AlertTriangle } from 'lucide-react';
import { Route, Account, ModelConfig } from '../../types';
import { WobblyCard, SketchButton, SketchBadge } from '../HandDrawnElements';
import { DESIGN_TOKENS } from '../../lib/designSystem';

interface RoutesViewProps {
  routes: Route[];
  accounts: Account[];
  models: ModelConfig[];
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
  const [confirmRemoveTargetId, setConfirmRemoveTargetId] = useState<string | null>(null);

  // New route form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [strategy, setStrategy] = useState<'priority' | 'round-robin' | 'weighted'>('priority');
  const [on429, setOn429] = useState(true);
  const [onQuota, setOnQuota] = useState(true);
  const [on5xx, setOn5xx] = useState(true);
  const [sticky, setSticky] = useState(true);

  const activeRoute = routes.find((c) => c.id === selectedRouteId) || routes[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Pick initial 2 targets as defaults
    const newTargets = accounts.slice(0, 2).map((acc, idx) => ({
      id: `tgt-${Date.now()}-${idx}`,
      accountId: acc.id,
      accountLabel: acc.label,
      providerName: acc.providerName,
      modelId: models[0]?.id || 'model-1',
      modelDisplayName: models[0]?.displayName || 'Gemini 2.5 Pro',
      priority: idx + 1,
    }));

    const newRoute: Route = {
      id: `route-${Date.now()}`,
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description.trim() || 'Custom fallback route',
      selectionStrategy: strategy,
      fallbackTriggers: {
        on429,
        onQuota,
        on5xx,
        onTimeout: true,
      },
      targets: newTargets,
      continuityPolicy: 'strip',
      stickyRouting: sticky,
      totalHops: 0,
      status: 'active',
    };

    onAddRoute(newRoute);
    setSelectedRouteId(newRoute.id);
    setShowCreateModal(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-[var(--ink)] flex items-center gap-2">
            <span>Routes & Automatic Fallback</span>
            <SketchBadge variant="yellow" rotation="1deg">
              FR-12 Architecture
            </SketchBadge>
          </h2>
          <p className="text-base font-body text-[var(--ink)]/80">
            Group accounts across providers under one model name. If an account is rate-limited or exhausted, Kinetix falls back automatically before the first byte!
          </p>
        </div>

        <SketchButton
          variant="primary"
          size="md"
          onClick={() => setShowCreateModal(true)}
          className="gap-2 font-heading font-bold"
        >
          <Plus className="w-5 h-5" />
          Create New Route
        </SketchButton>
      </div>

      {/* Main Grid: Routes selector on left, Deep Inspector on right */}
      {routes.length === 0 ? (
        <WobblyCard decoration="tack" className="p-10 text-center bg-[var(--surface)]">
          <Shuffle className="w-12 h-12 text-[var(--pen-blue)] mx-auto mb-3 opacity-60" />
          <h3 className="text-2xl font-heading font-bold text-[var(--ink)]">No Routes Configured</h3>
          <p className="text-base font-body text-[var(--ink)]/80 max-w-lg mx-auto mt-2 mb-6">
            Routes allow you to group multiple upstream provider accounts and models under one seamless model alias. If one account exhausts its quota or hits rate limits, Kinetix instantly retries on the next healthy tier.
          </p>
          <SketchButton
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            className="gap-2 font-heading font-bold"
          >
            <Plus className="w-5 h-5" />
            Create First Fallback Route
          </SketchButton>
        </WobblyCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of Routes */}
          <div className="space-y-4">
            <h3 className="text-xl font-heading font-bold text-[var(--ink)] flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-[var(--pen-blue)]" />
              Configured Routes ({routes.length})
            </h3>

            {routes.map((route, idx) => {
              const isSelected = route.id === activeRoute?.id;
              const tilt = idx % 2 === 0 ? '-rotate-0.5' : 'rotate-0.5';

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-4 border-2 border-[var(--ink)] cursor-pointer transition-all ${tilt} ${
                    isSelected
                      ? 'bg-[var(--postit)] sketch-shadow -translate-y-1 font-bold'
                      : 'bg-[var(--surface)] hover:bg-[var(--erased-soft)] sketch-shadow-sm'
                  }`}
                  style={{ borderRadius: DESIGN_TOKENS.radii.wobblyMd }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm px-2 py-0.5 bg-[var(--surface)] border border-[var(--ink)] rounded">
                        {route.name}
                      </span>
                      <h4 className="font-heading text-lg mt-1 text-[var(--ink)]">{route.description}</h4>
                    </div>
                    <SketchBadge variant={route.status === 'active' ? 'green' : 'red'}>
                      {route.status}
                    </SketchBadge>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[var(--ink)]/20 flex items-center justify-between text-xs font-mono text-[var(--ink)]/70">
                    <span>Strategy: <strong>{route.selectionStrategy}</strong></span>
                    <span>{route.targets.length} targets • {route.totalHops} hops</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Route Detail & Target Fallback Chain */}
          {activeRoute && (
            <div className="lg:col-span-2 space-y-5">
              <WobblyCard decoration="tape" className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-3 border-b-2 border-dashed border-[var(--ink)]/30">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-3xl font-heading font-bold text-[var(--ink)]">
                        Route: <span className="underline decoration-wavy decoration-[var(--marker-red)]">{activeRoute.name}</span>
                      </h3>
                      <SketchBadge variant="blue" rotation="-1deg">
                        {activeRoute.selectionStrategy} strategy
                      </SketchBadge>
                    </div>
                    <p className="text-base font-body text-[var(--ink)]/80 mt-1">
                      {activeRoute.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono bg-[var(--erased)] px-2 py-1 border border-[var(--ink)] rounded">
                      Total Fallback Hops: <strong>{activeRoute.totalHops}</strong>
                    </span>

                    {confirmDeleteRouteId === activeRoute.id ? (
                      <div className="flex items-center gap-1.5 bg-[var(--tint-red)] px-2.5 py-1 border border-[var(--marker-red)] rounded text-xs font-heading">
                        <span className="text-[var(--danger-text)] font-bold">Delete {activeRoute.name}?</span>
                        <button
                          onClick={() => {
                            onDeleteRoute(activeRoute.id);
                            setConfirmDeleteRouteId(null);
                          }}
                          className="px-2 py-0.5 bg-[var(--marker-red)] text-[var(--surface)] rounded font-bold hover:bg-[var(--marker-red)] cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteRouteId(null)}
                          className="px-2 py-0.5 bg-[var(--surface)] border border-[var(--ink)] rounded hover:bg-[var(--erased)] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteRouteId(activeRoute.id)}
                        className="px-2.5 py-1 text-xs font-heading font-bold text-[var(--marker-red)] hover:bg-[var(--tint-red)] border border-[var(--marker-red)]/50 hover:border-[var(--marker-red)] rounded flex items-center gap-1 cursor-pointer transition-colors"
                        title="Delete this route configuration"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Route</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Targets Fallback Sequence */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-lg font-heading font-bold text-[var(--ink)] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[var(--marker-red)]" />
                    Fallback Target Hierarchy (Priority Ordered)
                  </h4>

                  <div className="space-y-3">
                    {activeRoute.targets.map((tgt, idx) => (
                      <React.Fragment key={tgt.id}>
                        <div
                          className="p-4 bg-[var(--surface)] border-2 border-[var(--ink)] sketch-shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative"
                          style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-[var(--ink)] bg-[var(--pen-blue)] text-[var(--surface)] flex items-center justify-center font-heading font-bold text-base">
                              #{tgt.priority}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-heading font-bold text-lg text-[var(--ink)]">
                                  {tgt.modelDisplayName}
                                </span>
                                <span className="text-xs font-mono bg-[var(--erased)] px-1.5 py-0.5 rounded border border-[var(--ink)]/30">
                                  {tgt.providerName}
                                </span>
                              </div>
                              <p className="text-sm font-body text-[var(--ink)]/70">
                                Serving Account: <strong>{tgt.accountLabel}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="px-2 py-1 bg-[var(--tint-green)] text-[var(--success-text)] border border-[var(--pen-green)] rounded">
                              {idx === 0 ? 'Primary Default' : `Fallback Tier ${idx}`}
                            </span>

                            {activeRoute.targets.length > 1 && (
                              confirmRemoveTargetId === tgt.id ? (
                                <div className="flex items-center gap-1 bg-[var(--tint-red)] px-2 py-0.5 border border-[var(--marker-red)] rounded">
                                  <span className="text-[var(--danger-text)] font-bold">Remove tier?</span>
                                  <button
                                    onClick={() => {
                                      const updatedTargets = activeRoute.targets
                                        .filter((t) => t.id !== tgt.id)
                                        .map((t, i) => ({ ...t, priority: i + 1 }));
                                      onUpdateRoute({
                                        ...activeRoute,
                                        targets: updatedTargets,
                                        totalHops: Math.max(0, updatedTargets.length - 1),
                                      });
                                      setConfirmRemoveTargetId(null);
                                    }}
                                    className="px-1.5 py-0.5 bg-[var(--marker-red)] text-[var(--surface)] rounded font-bold hover:bg-[var(--marker-red)] cursor-pointer"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setConfirmRemoveTargetId(null)}
                                    className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--ink)] rounded cursor-pointer"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmRemoveTargetId(tgt.id)}
                                  className="p-1 text-[var(--marker-red)] hover:bg-[var(--tint-red)] border border-transparent hover:border-[var(--marker-red)]/40 rounded cursor-pointer transition-colors"
                                  title="Remove this target tier from route pool"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {idx < activeRoute.targets.length - 1 && (
                          <div className="flex justify-center -my-1">
                            <div className="flex items-center gap-1 bg-[var(--postit)] px-3 py-1 border border-[var(--ink)] rounded-full text-xs font-mono sketch-shadow-sm z-10">
                              <ArrowDown className="w-3.5 h-3.5 text-[var(--marker-red)]" />
                              <span>Falls back on 429 / Quota / 5xx error</span>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

              {/* Route Policies & Triggers Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--paper)] p-4 border-2 border-[var(--ink)] rounded-lg">
                <div>
                  <h5 className="font-heading font-bold text-base text-[var(--ink)] mb-2 flex items-center gap-1">
                    <Shield className="w-4 h-4 text-[var(--pen-blue)]" />
                    Configured Fallback Triggers
                  </h5>
                  <div className="space-y-1.5 text-sm font-body">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeRoute.fallbackTriggers.on429}
                        onChange={(e) =>
                          onUpdateRoute({
                            ...activeRoute,
                            fallbackTriggers: { ...activeRoute.fallbackTriggers, on429: e.target.checked },
                          })
                        }
                        className="accent-[var(--marker-red)]"
                      />
                      <span>Rate limit (HTTP 429) & Cooldown honoring Retry-After</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeRoute.fallbackTriggers.onQuota}
                        onChange={(e) =>
                          onUpdateRoute({
                            ...activeRoute,
                            fallbackTriggers: { ...activeRoute.fallbackTriggers, onQuota: e.target.checked },
                          })
                        }
                        className="accent-[var(--marker-red)]"
                      />
                      <span>Quota exhaustion (Daily or Monthly provider caps)</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeRoute.fallbackTriggers.on5xx}
                        onChange={(e) =>
                          onUpdateRoute({
                            ...activeRoute,
                            fallbackTriggers: { ...activeRoute.fallbackTriggers, on5xx: e.target.checked },
                          })
                        }
                        className="accent-[var(--marker-red)]"
                      />
                      <span>Upstream 5xx / connection timeout</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h5 className="font-heading font-bold text-base text-[var(--ink)] mb-2 flex items-center gap-1">
                    <Check className="w-4 h-4 text-[var(--pen-green)]" />
                    Session & Conversation Continuity
                  </h5>
                  <div className="space-y-2 text-sm font-body">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeRoute.stickyRouting}
                        onChange={(e) =>
                          onUpdateRoute({
                            ...activeRoute,
                            stickyRouting: e.target.checked,
                          })
                        }
                        className="accent-[var(--pen-blue)]"
                      />
                      <span>Sticky routing (Preserves prompt cache while target healthy)</span>
                    </label>

                    <div className="pt-1">
                      <span className="text-xs font-mono text-[var(--ink)]/70 block mb-1">
                        Cross-Provider Content Policy:
                      </span>
                      <select
                        value={activeRoute.continuityPolicy}
                        onChange={(e) =>
                          onUpdateRoute({
                            ...activeRoute,
                            continuityPolicy: e.target.value as any,
                          })
                        }
                        className="bg-[var(--surface)] border border-[var(--ink)] px-2 py-1 text-xs font-mono rounded w-full"
                      >
                        <option value="strip">Strip proprietary thinking tokens / vendor signatures</option>
                        <option value="convert">Convert where target equivalent exists</option>
                        <option value="error">Error on non-portable conversation turn</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </WobblyCard>
          </div>
        )}
      </div>
    )}

      {/* Create Route Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg">
            <WobblyCard decoration="tape" className="bg-[var(--paper)] p-6 relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-[var(--ink)] font-bold text-xl hover:text-[var(--marker-red)] cursor-pointer"
              >
                ✕
              </button>

              <h3 className="text-2xl font-heading font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
                <Shuffle className="w-6 h-6 text-[var(--pen-blue)]" />
                Create New Fallback Route
              </h3>

              <form onSubmit={handleCreateSubmit} className="space-y-4 font-body">
                <div>
                  <label className="block text-sm font-heading font-bold text-[var(--ink)] mb-1">
                    Route Slug Name (Clients request this model)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. coder, fast-chat, vision-route"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[var(--surface)] border-2 border-[var(--ink)] px-3 py-2 text-base sketch-shadow-sm focus:outline-none font-mono"
                    style={{ borderRadius: DESIGN_TOKENS.radii.wobblyMd }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-heading font-bold text-[var(--ink)] mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Free Gemini tier falling back to paid Gemini and Groq"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[var(--surface)] border-2 border-[var(--ink)] px-3 py-2 text-base sketch-shadow-sm focus:outline-none"
                    style={{ borderRadius: DESIGN_TOKENS.radii.wobbly }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-heading font-bold text-[var(--ink)] mb-1">
                    Selection Strategy
                  </label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value as any)}
                    className="w-full bg-[var(--surface)] border-2 border-[var(--ink)] px-3 py-2 text-base sketch-shadow-sm focus:outline-none font-mono"
                    style={{ borderRadius: DESIGN_TOKENS.radii.wobblyMd }}
                  >
                    <option value="priority">Priority (Ordered fallback on failure)</option>
                    <option value="round-robin">Round-robin load balancing</option>
                    <option value="weighted">Weighted distribution</option>
                  </select>
                </div>

                <div className="p-3 bg-[var(--postit)] border border-[var(--ink)] rounded space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={on429}
                      onChange={(e) => setOn429(e.target.checked)}
                      className="accent-[var(--marker-red)]"
                    />
                    <span>Fallback automatically on 429 Rate Limit</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={onQuota}
                      onChange={(e) => setOnQuota(e.target.checked)}
                      className="accent-[var(--marker-red)]"
                    />
                    <span>Fallback on Quota Exhaustion</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sticky}
                      onChange={(e) => setSticky(e.target.checked)}
                      className="accent-[var(--pen-blue)]"
                    />
                    <span>Enable sticky session routing (Prompt cache preservation)</span>
                  </label>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <SketchButton
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </SketchButton>
                  <SketchButton type="submit" variant="danger" className="font-bold">
                    Create Route
                  </SketchButton>
                </div>
              </form>
            </WobblyCard>
          </div>
        </div>
      )}
    </div>
  );
};
