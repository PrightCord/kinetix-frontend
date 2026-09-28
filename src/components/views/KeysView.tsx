import React, { useState } from 'react';
import {
  Key,
  Plus,
  Copy,
  Check,
  ShieldAlert,
  Sparkles,
  Trash2,
  Power,
  Search,
  X,
  Sliders,
  FileCode,
} from 'lucide-react';
import { VirtualKey } from '../../types';
import { Card, Button, StatusBadge, Input, Select } from '../KinetixUI';
import { formatCurrency, formatTokens } from '../../lib/designSystem';
import { useConfirm } from '../../lib/useConfirm';
import ClientProfileGenerator from './ClientProfileGenerator';

interface KeysViewProps {
  keys: VirtualKey[];
  onAddKey: (newKey: VirtualKey) => Promise<{ key: VirtualKey; fullKey: string } | null>;
  onUpdateKeyStatus: (id: string, status: 'active' | 'disabled' | 'revoked') => void;
  onUpdateKeyIps: (id: string, ips: string[]) => void;
  onDeleteKey?: (id: string) => void;
}

const IpAllowlistEditor: React.FC<{
  keyId: string;
  current: string[];
  onSave: (id: string, ips: string[]) => void;
}> = ({ keyId, current, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(current.join(', '));
  return (
    <div className="col-span-2 pt-1 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
      <span>
        IP Allowlist:{' '}
        <strong className="text-[var(--primary)]">
          {current.length > 0 ? current.join(', ') : 'Any IP allowed'}
        </strong>
      </span>
      {editing ? (
        <span className="flex items-center gap-1.5">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. 192.168.1.1, 10.0.0.0/8"
            className="w-48 text-[11px]"
            mono
          />
          <Button
            size="xs"
            variant="primary"
            onClick={() => {
              const ips = text
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              onSave(keyId, ips);
              setEditing(false);
            }}
          >
            Save
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              setText(current.join(', '));
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        </span>
      ) : (
        <Button size="xs" variant="ghost" onClick={() => setEditing(true)}>
          Edit Allowlist
        </Button>
      )}
    </div>
  );
};

export const KeysView: React.FC<KeysViewProps> = ({
  keys,
  onAddKey,
  onUpdateKeyStatus,
  onUpdateKeyIps,
  onDeleteKey,
}) => {
  const { confirm, confirmNode } = useConfirm();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ id: string; name: string; key: string } | null>(null);
  const [clientProfileKeyId, setClientProfileKeyId] = useState<string | null>(null);

  // New key form state
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [tag, setTag] = useState('');
  const [allowedModels, setAllowedModels] = useState('claude-3-7-sonnet, gpt-4o');
  const [rpmLimit, setRpmLimit] = useState(60);
  const [tpmLimit, setTpmLimit] = useState(100000);
  const [dailyBudget, setDailyBudget] = useState(10.0);
  const [monthlyBudget, setMonthlyBudget] = useState(60.0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (keyText: string, id: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1800);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newKeyObj: VirtualKey = {
      id: '',
      key: '',
      name: name.trim() || 'Untitled Key',
      owner: owner.trim() || 'Team Member',
      tag: tag.trim() || 'general',
      allowedModels: allowedModels
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      allowedProviders: [],
      rpmLimit: Number(rpmLimit) || 0,
      tpmLimit: Number(tpmLimit) || 0,
      dailyBudget: Number(dailyBudget) || 0,
      monthlyBudget: Number(monthlyBudget) || 0,
      currentDailySpend: 0,
      currentMonthlySpend: 0,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      status: 'active',
      totalRequests: 0,
      totalTokens: 0,
    };

    const result = await onAddKey(newKeyObj);
    setIsSubmitting(false);
    if (!result) return;

    setNewlyCreatedKey({ id: result.key.id, name: result.key.name, key: result.fullKey });
    setShowCreateModal(false);
    setName('');
    setOwner('');
    setTag('');
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredKeys = keys.filter((k) => {
    if (!normalizedSearch) return true;
    return [k.id, k.name, k.owner, k.tag, k.key, k.status, ...k.allowedModels].some((val) =>
      String(val ?? '').toLowerCase().includes(normalizedSearch),
    );
  });

  return (
    <div className="space-y-6">
      {confirmNode}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Virtual Keys &amp; Client Access
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Issue scoped bearer credentials with budget caps and rate limits. Real provider secrets remain secured.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search virtual keys…"
            icon={<Search className="w-3.5 h-3.5" />}
            className="w-full sm:w-60"
            mono
          />

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Issue Virtual Key
          </Button>
        </div>
      </div>

      {/* Newly Created Secret Banner (Shown once!) */}
      {newlyCreatedKey && (
        <Card className="border-[var(--primary)] bg-[#0d0d16] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                <span className="font-semibold text-xs text-[var(--text-primary)]">
                  New Key Generated for {newlyCreatedKey.name}
                </span>
                <span className="text-[10px] text-[var(--warning)] font-mono">
                  (Shown once — copy now)
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-[var(--surface-raised)] border border-[var(--border)] font-mono text-xs select-all">
                <code className="text-[var(--text-primary)] font-semibold truncate flex-1">
                  {newlyCreatedKey.key}
                </code>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => handleCopy(newlyCreatedKey.key, 'newly-created')}
                >
                  {copiedKeyId === 'newly-created' ? (
                    <Check className="w-3.5 h-3.5 text-[var(--healthy)]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedKeyId === 'newly-created' ? 'Copied' : 'Copy Key'}
                </Button>
              </div>
            </div>

            <button
              onClick={() => setNewlyCreatedKey(null)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Keys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredKeys.map((k) => {
          const budgetCap = k.monthlyBudget || 0;
          const monthlySpend = k.currentMonthlySpend || 0;
          const monthlyPct = budgetCap > 0 ? Math.min(100, Math.round((monthlySpend / budgetCap) * 100)) : 0;

          return (
            <Card key={k.id} className="flex flex-col justify-between space-y-3 font-mono text-xs">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-[var(--primary)] shrink-0" />
                      <span className="font-semibold text-sm text-[var(--text-primary)] truncate font-mono">
                        {k.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-sans mt-0.5">
                      Owner: <b>{k.owner}</b> {k.tag && `• Tag: ${k.tag}`}
                    </div>
                  </div>

                  <StatusBadge
                    variant={k.status === 'active' ? 'healthy' : k.status === 'disabled' ? 'warning' : 'danger'}
                    size="sm"
                  >
                    {k.status.toUpperCase()}
                  </StatusBadge>
                </div>

                {/* Key identifier string */}
                <div className="p-2 rounded bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-between text-[11px] mb-3">
                  <span className="text-[var(--text-secondary)] font-semibold truncate flex-1">
                    {k.key}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0 ml-2">masked</span>
                </div>

                {/* Monthly Budget Progress Meter */}
                {budgetCap > 0 && (
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Monthly Spend Cap</span>
                      <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                        {formatCurrency(monthlySpend)} / {formatCurrency(budgetCap)} ({monthlyPct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--surface-raised)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          monthlyPct > 90
                            ? 'bg-[var(--danger)]'
                            : monthlyPct > 75
                            ? 'bg-[var(--warning)]'
                            : 'bg-[var(--healthy)]'
                        }`}
                        style={{ width: `${monthlyPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Limits & Quotas */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)] bg-[var(--surface-raised)] p-2.5 rounded border border-[var(--border)] mb-3">
                  <div>RPM Limit: <b className="text-[var(--text-secondary)]">{k.rpmLimit} req/m</b></div>
                  <div>TPM Limit: <b className="text-[var(--text-secondary)]">{formatTokens(k.tpmLimit)} tpm</b></div>
                  <div className="col-span-2 text-[10px] truncate border-t border-[var(--border-subtle)] pt-1">
                    Allowed: <span className="text-[var(--primary)]">{k.allowedModels.join(', ') || 'All models'}</span>
                  </div>
                  <IpAllowlistEditor keyId={k.id} current={k.allowedIps || []} onSave={onUpdateKeyIps} />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-2.5">
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => setClientProfileKeyId(k.id)}
                >
                  <FileCode className="w-3 h-3 text-[var(--primary)]" />
                  Client Config
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="xs"
                    variant={k.status === 'active' ? 'ghost' : 'secondary'}
                    onClick={() =>
                      onUpdateKeyStatus(k.id, k.status === 'active' ? 'disabled' : 'active')
                    }
                  >
                    <Power className="w-3 h-3" />
                    {k.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>

                  {onDeleteKey && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={async () => {
                        const ok = await confirm({
                          title: `Delete key ${k.name}?`,
                          message: 'All client applications using this virtual key will immediately fail authentication.',
                          danger: true,
                          confirmLabel: 'Delete Key',
                        });
                        if (ok) onDeleteKey(k.id);
                      }}
                      className="text-[var(--danger)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Client Profile Generator Modal */}
      {clientProfileKeyId && (
        <ClientProfileGenerator
          keyId={clientProfileKeyId}
          onClose={() => setClientProfileKeyId(null)}
        />
      )}

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-[6px] max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Issue New Virtual Key
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Key Name / Client</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pi Coding Assistant or Team Alpha"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-muted)] font-mono mb-1">Owner</label>
                  <Input
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="e.g. Alice"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] font-mono mb-1">Tag</label>
                  <Input
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. development"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Allowed Models / Routes</label>
                <Input
                  value={allowedModels}
                  onChange={(e) => setAllowedModels(e.target.value)}
                  placeholder="comma-separated model IDs"
                  mono
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-muted)] font-mono mb-1">RPM Limit</label>
                  <Input
                    type="number"
                    value={rpmLimit}
                    onChange={(e) => setRpmLimit(Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] font-mono mb-1">Monthly Budget ($)</label>
                  <Input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <Button size="sm" variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting}>
                  Generate Secret Key
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
