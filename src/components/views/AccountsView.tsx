import React, { useState } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  Clock,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  Trash2,
  Search,
  X,
  Sliders,
  CheckCircle2,
  Play,
  Lock,
} from 'lucide-react';
import { Account, Provider } from '../../types';
import { Card, Button, StatusBadge, Input, Select } from '../KinetixUI';
import { formatCurrency, formatTokens } from '../../lib/designSystem';
import { Kinetix, TestResult } from '../../lib/resources';
import { useAuthEnrollment } from '../CredentialAuthFlow';

interface AccountsViewProps {
  accounts: Account[];
  providers: Provider[];
  onAddAccount: (acc: Account & { apiKey?: string }) => void;
  onUpdateAccount: (acc: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onResetAccount: (accountId: string) => void;
  onRefresh: () => void | Promise<void>;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  providers,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onResetAccount,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteAccountId, setConfirmDeleteAccountId] = useState<string | null>(null);
  const [providerFilter, setProviderFilter] = useState('all');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editPriority, setEditPriority] = useState(1);
  const [editWeight, setEditWeight] = useState(1);
  const [editQuota, setEditQuota] = useState('');
  const [editQuotaType, setEditQuotaType] = useState<Account['quotaType']>('none');
  const [label, setLabel] = useState('');
  const [providerId, setProviderId] = useState(providers[0]?.id || '');
  const [apiKey, setApiKey] = useState('');
  const [softQuota, setSoftQuota] = useState(100);
  const [accountValidation, setAccountValidation] = useState<{ valid: boolean; problems: string[] } | null>(null);
  const [validatingAccount, setValidatingAccount] = useState(false);
  const [testingAccountId, setTestingAccountId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [enrollmentNotice, setEnrollmentNotice] = useState<string | null>(null);

  const authEnrollment = useAuthEnrollment({
    onSuccess: async () => {
      setEnrollmentError(null);
      setEnrollmentNotice('Account connected successfully.');
      await onRefresh();
    },
    onError: (message) => {
      setEnrollmentNotice(null);
      setEnrollmentError(message);
    },
  });

  const handleValidateAccount = async () => {
    const prov = providers.find((p) => p.id === providerId) || providers[0];
    if (!label.trim() || !apiKey.trim() || !prov) return;
    setValidatingAccount(true);
    try {
      const r = await Kinetix.validateAccount({
        provider_id: prov.id,
        label: label.trim(),
        api_key: apiKey.trim(),
        quota_type: 'monthly',
      });
      setAccountValidation({ valid: r.valid, problems: r.problems || [] });
    } catch (e) {
      setAccountValidation({ valid: false, problems: [(e as Error).message] });
    } finally {
      setValidatingAccount(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !apiKey.trim()) return;

    const prov = providers.find((p) => p.id === providerId) || providers[0];
    const masked = apiKey.slice(0, 6) + '...' + apiKey.slice(-4);

    const newAcc: Account & { apiKey?: string } = {
      id: '',
      providerId: prov.id,
      providerName: prov.name,
      label: label.trim(),
      keyMasked: masked,
      status: 'healthy',
      quotaType: 'monthly',
      softQuotaSpendLimit: softQuota,
      currentSpend: 0,
      requestsCount: 0,
      tokensCount: 0,
      priority: accounts.filter((a) => a.providerId === prov.id).length + 1,
      weight: 1,
      apiKey: apiKey.trim(),
    };

    onAddAccount(newAcc);
    setLabel('');
    setApiKey('');
    setAccountValidation(null);
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    const parsedQuota = editQuota === '' ? null : parseFloat(editQuota);
    onUpdateAccount({
      ...editingAccount,
      label: editLabel.trim(),
      priority: editPriority,
      weight: editWeight,
      quotaType: editQuotaType,
      softQuotaSpendLimit: parsedQuota != null && !Number.isNaN(parsedQuota) ? parsedQuota : null,
    });
    setEditingAccount(null);
  };

  const probeAccount = async (acc: Account, clearCooldown = false) => {
    setTestingAccountId(acc.id);
    try {
      const result = await Kinetix.testAccount(acc.id);
      setTestResults((prev) => ({ ...prev, [acc.id]: result }));
      if (clearCooldown && result.ok) {
        onResetAccount(acc.id);
      }
    } catch (e) {
      setTestResults((prev) => ({
        ...prev,
        [acc.id]: { ok: false, status: 500, error: (e as Error).message },
      }));
    } finally {
      setTestingAccountId(null);
    }
  };

  const openAddForProvider = (targetProviderId: string) => {
    setProviderId(targetProviderId);
    setAccountValidation(null);
    setShowAddModal(true);
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredAccounts = accounts.filter((acc) => {
    if (providerFilter !== 'all' && acc.providerId !== providerFilter) return false;
    if (!normalizedSearch) return true;
    return (
      acc.label.toLowerCase().includes(normalizedSearch) ||
      acc.providerName.toLowerCase().includes(normalizedSearch) ||
      acc.keyMasked.toLowerCase().includes(normalizedSearch)
    );
  });

  const visibleProviders =
    providerFilter === 'all'
      ? providers
      : providers.filter((p) => p.id === providerFilter);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Account Pools &amp; Credentials
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Industrial account rotation, priority tiers, rate-limit backoff, and soft quota monitoring.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts or keys…"
            icon={<Search className="w-3.5 h-3.5" />}
            className="w-full sm:w-56"
            mono
          />

          {providers.some((p) => p.credentialMode === 'manual') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const manualProv = providers.find((p) => p.credentialMode === 'manual');
                if (manualProv) openAddForProvider(manualProv.id);
              }}
              className="shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Key
            </Button>
          )}
        </div>
      </div>

      {authEnrollment.modal}

      {enrollmentError && (
        <div className="p-3 bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-[4px] text-xs font-mono text-[var(--danger)]">
          {enrollmentError}
        </div>
      )}
      {enrollmentNotice && (
        <div className="p-3 bg-[var(--healthy-bg)] border border-[var(--healthy-border)] rounded-[4px] text-xs font-mono text-[var(--healthy)]">
          {enrollmentNotice}
        </div>
      )}

      {/* Provider Filter Tabs */}
      {providers.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--border)] pb-2 text-xs font-mono">
          <button
            onClick={() => setProviderFilter('all')}
            className={`px-2.5 py-1 rounded-[3px] transition-colors cursor-pointer ${
              providerFilter === 'all'
                ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold border border-[var(--border-strong)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Pools ({accounts.length})
          </button>
          {providers.map((p) => {
            const count = accounts.filter((a) => a.providerId === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => setProviderFilter(p.id)}
                className={`px-2.5 py-1 rounded-[3px] transition-colors cursor-pointer ${
                  providerFilter === p.id
                    ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold border border-[var(--border-strong)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {p.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Provider Account Pools */}
      <div className="space-y-6">
        {visibleProviders.map((provider) => {
          const poolAccounts = filteredAccounts.filter((acc) => acc.providerId === provider.id);
          const healthy = poolAccounts.filter((acc) => acc.status === 'healthy').length;
          const cooldown = poolAccounts.filter((acc) => acc.status === 'cooldown').length;
          const exhausted = poolAccounts.filter((acc) => acc.status === 'exhausted').length;

          return (
            <Card
              key={provider.id}
              title={`${provider.name} Pool`}
              subtitle={`${poolAccounts.length} credentials • ${healthy} healthy • ${cooldown} in cooldown • ${exhausted} exhausted`}
              action={
                provider.credentialMode === 'manual' ? (
                  <Button size="xs" variant="secondary" onClick={() => openAddForProvider(provider.id)}>
                    <Plus className="w-3 h-3" /> Add API Key
                  </Button>
                ) : provider.credentialMode === 'auth_flow' ? (
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() =>
                      authEnrollment.begin(
                        provider.id,
                        () => Kinetix.startProviderCredentialEnrollment(provider.id),
                      )
                    }
                  >
                    <KeyRound className="w-3 h-3" /> Connect Account
                  </Button>
                ) : null
              }
            >
              {poolAccounts.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-[var(--border)] rounded text-xs text-[var(--text-muted)] font-mono">
                  {provider.credentialMode === 'none'
                    ? 'No credential required for this local/self-hosted provider.'
                    : 'No credentials enrolled in this provider pool yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {poolAccounts.map((acc) => {
                    const isCooldown = acc.status === 'cooldown';
                    const isExhausted = acc.status === 'exhausted';
                    const quotaLimit = acc.softQuotaSpendLimit || 0;
                    const spend = acc.currentSpend || 0;
                    const percent = quotaLimit > 0 ? Math.min(100, Math.round((spend / quotaLimit) * 100)) : 0;

                    return (
                      <div
                        key={acc.id}
                        className={`p-4 rounded-[6px] border ${
                          isCooldown
                            ? 'border-[var(--danger-border)] bg-[var(--danger-bg)]'
                            : isExhausted
                            ? 'border-[var(--warning-border)] bg-[var(--warning-bg)]'
                            : 'border-[var(--border)] bg-[var(--surface-raised)]'
                        } flex flex-col justify-between space-y-3 font-mono text-xs`}
                      >
                        {/* Header */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="font-semibold text-sm text-[var(--text-primary)] font-mono">
                                {acc.label}
                              </div>
                              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                                {acc.providerName}
                              </span>
                            </div>

                            <StatusBadge
                              variant={
                                acc.status === 'healthy'
                                  ? 'healthy'
                                  : acc.status === 'cooldown'
                                  ? 'danger'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {acc.status.toUpperCase()}
                            </StatusBadge>
                          </div>

                          {/* Masked Secret Key Box */}
                          <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between text-[11px] mb-3">
                            <span className="text-[var(--text-secondary)] font-semibold">
                              {acc.keyMasked}
                            </span>
                            <span className="text-[var(--healthy)] text-[10px] flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Encrypted
                            </span>
                          </div>

                          {/* Cooldown Alert Notice */}
                          {isCooldown && (
                            <div className="p-2.5 rounded bg-[var(--surface)] border border-[var(--danger-border)] text-xs text-[var(--danger)] mb-3 space-y-1">
                              <div className="flex items-center gap-1.5 font-bold">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>{acc.lastError || 'Rate Limit (HTTP 429)'}</span>
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)]">
                                Cooling down: {acc.cooldownUntil || 'until Retry-After passes'}
                              </div>
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => void probeAccount(acc, true)}
                                isLoading={testingAccountId === acc.id}
                              >
                                Test &amp; Clear Cooldown
                              </Button>
                            </div>
                          )}

                          {/* Test Results Output */}
                          {testResults[acc.id] && (
                            <div
                              className={`p-2 rounded border text-[11px] mb-3 ${
                                testResults[acc.id].ok
                                  ? 'border-[var(--healthy-border)] bg-[var(--healthy-bg)] text-[var(--healthy)]'
                                  : 'border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)]'
                              }`}
                            >
                              {testResults[acc.id].ok ? '✓ Upstream probe successful' : '✗ Probe failed'}
                              {testResults[acc.id].latency_ms != null && ` (${testResults[acc.id].latency_ms}ms)`}
                            </div>
                          )}

                          {/* Quota Progress Meter */}
                          {quotaLimit > 0 && (
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                                <span>Spend vs Soft Cap</span>
                                <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                                  {formatCurrency(spend)} / {formatCurrency(quotaLimit)} ({percent}%)
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-[var(--surface)] overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
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
                          )}

                          {/* Account Stats */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-2">
                            <div>Requests: <b className="text-[var(--text-secondary)]">{acc.requestsCount.toLocaleString()}</b></div>
                            <div>Tokens: <b className="text-[var(--text-secondary)]">{formatTokens(acc.tokensCount)}</b></div>
                            <div>Priority: <b className="text-[var(--primary)]">P{acc.priority}</b></div>
                            <div>Weight: <b className="text-[var(--text-secondary)]">{acc.weight}</b></div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-between border-t border-[var(--border)] pt-2.5">
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => void probeAccount(acc)}
                            isLoading={testingAccountId === acc.id}
                          >
                            <Play className="w-3 h-3 text-[var(--healthy)]" />
                            Probe
                          </Button>

                          <div className="flex items-center gap-1.5">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => {
                                setEditingAccount(acc);
                                setEditLabel(acc.label);
                                setEditPriority(acc.priority);
                                setEditWeight(acc.weight);
                                setEditQuota(acc.softQuotaSpendLimit ? String(acc.softQuotaSpendLimit) : '');
                                setEditQuotaType(acc.quotaType || 'none');
                              }}
                            >
                              <Sliders className="w-3 h-3" />
                              Configure
                            </Button>

                            {confirmDeleteAccountId === acc.id ? (
                              <div className="flex items-center gap-1 bg-[var(--danger-bg)] px-2 py-0.5 rounded border border-[var(--danger-border)]">
                                <span className="text-[var(--danger)] font-bold text-[10px]">Delete?</span>
                                <button
                                  onClick={() => {
                                    onDeleteAccount(acc.id);
                                    setConfirmDeleteAccountId(null);
                                  }}
                                  className="text-[var(--danger)] font-bold hover:underline"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteAccountId(null)}
                                  className="text-[var(--text-muted)] hover:underline"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteAccountId(acc.id)}
                                className="p-1 text-[var(--text-muted)] hover:text-[var(--danger)] cursor-pointer"
                                title="Delete account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add API Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-[6px] max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Enroll API Key in Account Pool
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Account Label</label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Anthropic Primary Prod Key"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Upstream Provider</label>
                <Select
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  className="w-full"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">API Secret Key</label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  required
                  mono
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Soft Quota Spend Limit (USD/mo)</label>
                <Input
                  type="number"
                  value={softQuota}
                  onChange={(e) => setSoftQuota(Number(e.target.value))}
                  placeholder="100"
                />
              </div>

              {accountValidation && (
                <div
                  className={`p-2.5 rounded border text-xs font-mono ${
                    accountValidation.valid
                      ? 'bg-[var(--healthy-bg)] border-[var(--healthy-border)] text-[var(--healthy)]'
                      : 'bg-[var(--danger-bg)] border-[var(--danger-border)] text-[var(--danger)]'
                  }`}
                >
                  <div className="font-bold">
                    {accountValidation.valid ? '✓ Dry-run validation passed' : '✗ Validation problems found'}
                  </div>
                  {accountValidation.problems.map((p, i) => (
                    <div key={i}>• {p}</div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <Button size="sm" variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={handleValidateAccount}
                  isLoading={validatingAccount}
                >
                  Validate
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Save to Pool
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-[6px] max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Configure {editingAccount.label}
              </h3>
              <button onClick={() => setEditingAccount(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Label</label>
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-muted)] font-mono mb-1">Priority Tier</label>
                  <Input
                    type="number"
                    value={editPriority}
                    onChange={(e) => setEditPriority(parseInt(e.target.value, 10) || 1)}
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] font-mono mb-1">Load Weight</label>
                  <Input
                    type="number"
                    value={editWeight}
                    onChange={(e) => setEditWeight(parseInt(e.target.value, 10) || 1)}
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] font-mono mb-1">Soft Quota (USD)</label>
                <Input
                  type="number"
                  value={editQuota}
                  onChange={(e) => setEditQuota(e.target.value)}
                  placeholder="e.g. 250"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <Button size="sm" variant="ghost" type="button" onClick={() => setEditingAccount(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
