import React, { useState } from 'react';
import { Compass, Plus, ArrowRight, Trash2, Search, X } from 'lucide-react';
import { ModelAlias, Route, ModelConfig } from '../../types';
import { Card, Button, StatusBadge, Input, Select } from '../KinetixUI';
import { useConfirm } from '../../lib/useConfirm';

interface AliasesViewProps {
  aliases: ModelAlias[];
  routes: Route[];
  models: ModelConfig[];
  onAddAlias: (alias: ModelAlias) => void;
  onDeleteAlias: (id: string) => void;
}

export const AliasesView: React.FC<AliasesViewProps> = ({
  aliases,
  routes,
  models,
  onAddAlias,
  onDeleteAlias,
}) => {
  const { confirm, confirmNode } = useConfirm();
  const [showAddModal, setShowAddModal] = useState(false);
  const [aliasName, setAliasName] = useState('');
  const [targetType, setTargetType] = useState<'route' | 'model'>('route');
  const [targetId, setTargetId] = useState(routes[0]?.id || '');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aliasName.trim()) return;

    let targetDisplayName = '';
    if (targetType === 'route') {
      const c = routes.find((x) => x.id === targetId) || routes[0];
      targetDisplayName = `Route: ${c?.name || ''}`;
    } else {
      const m = models.find((x) => x.id === targetId) || models[0];
      targetDisplayName = `Model: ${m?.displayName || ''}`;
    }

    const newAlias: ModelAlias = {
      id: `alias-${Date.now()}`,
      aliasName: aliasName.trim().toLowerCase(),
      targetType,
      targetId,
      targetDisplayName,
      description: description.trim() || 'Custom mapped alias',
    };

    onAddAlias(newAlias);
    setShowAddModal(false);
    setAliasName('');
    setDescription('');
  };

  const filtered = aliases.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.aliasName.toLowerCase().includes(q) ||
      a.targetDisplayName.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {confirmNode}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Model Aliasing &amp; Name Translation
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Expose stable virtual model identifiers (e.g. <code>coder</code>, <code>fast</code>) mapped to routes or providers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search aliases…"
            icon={<Search className="w-3.5 h-3.5" />}
            className="w-full sm:w-56"
            mono
          />

          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-3.5 h-3.5" />
            Create Alias
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="kinetix-table font-mono text-xs">
            <thead>
              <tr>
                <th>Virtual Alias</th>
                <th>Target Type</th>
                <th>Resolved Target</th>
                <th>Description</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((alias) => (
                <tr key={alias.id} className="hover:bg-[var(--surface-raised)]">
                  <td className="font-bold text-[var(--primary)]">{alias.aliasName}</td>
                  <td>
                    <StatusBadge variant={alias.targetType === 'route' ? 'info' : 'neutral'} size="sm">
                      {alias.targetType.toUpperCase()}
                    </StatusBadge>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                      <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                      <span>{alias.targetDisplayName}</span>
                    </div>
                  </td>
                  <td className="font-sans text-[var(--text-secondary)] text-xs">
                    {alias.description}
                  </td>
                  <td className="text-right font-sans">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={async () => {
                        const ok = await confirm({
                          title: `Delete alias ${alias.aliasName}?`,
                          message: 'Requests specifying this alias will no longer resolve.',
                          danger: true,
                          confirmLabel: 'Delete',
                        });
                        if (ok) onDeleteAlias(alias.id);
                      }}
                      className="text-[var(--danger)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-[var(--text-muted)] font-sans">
                    No model aliases configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-[6px] max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Create Model Alias</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Alias Name</label>
                <Input
                  value={aliasName}
                  onChange={(e) => setAliasName(e.target.value)}
                  placeholder="e.g. coder, fast, sonnet"
                  required
                  mono
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Target Classification</label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('route');
                      setTargetId(routes[0]?.id || '');
                    }}
                    className={`py-1.5 px-2 rounded-[4px] border cursor-pointer text-center ${
                      targetType === 'route'
                        ? 'bg-[var(--surface-raised)] border-[var(--primary)] text-[var(--primary)] font-semibold'
                        : 'border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Route (Multi-Target)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('model');
                      setTargetId(models[0]?.id || '');
                    }}
                    className={`py-1.5 px-2 rounded-[4px] border cursor-pointer text-center ${
                      targetType === 'model'
                        ? 'bg-[var(--surface-raised)] border-[var(--primary)] text-[var(--primary)] font-semibold'
                        : 'border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Direct Model
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Destination Target</label>
                <Select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full"
                  mono
                >
                  {targetType === 'route' ? (
                    routes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Route: {c.name} ({c.targets.length} targets)
                      </option>
                    ))
                  ) : (
                    models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.displayName} ({m.providerName})
                      </option>
                    ))
                  )}
                </Select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mapping description"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <Button size="sm" variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Save Alias
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
