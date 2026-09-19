/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, NavTab, TAB_ROUTES } from './components/Navbar';
import { LiveTesterModal } from './components/LiveTesterModal';
import { LoginScreen } from './components/LoginScreen';
import { KeysView } from './components/views/KeysView';
import { CombosView } from './components/views/CombosView';
import { ProvidersView } from './components/views/ProvidersView';
import { AccountsView } from './components/views/AccountsView';
import { UsageView } from './components/views/UsageView';
import { RequestsView } from './components/views/RequestsView';
import { AliasesView } from './components/views/AliasesView';
import { AuditView } from './components/views/AuditView';
import { SquiggleDivider, SketchButton } from './components/HandDrawnElements';
import {
  INITIAL_KEYS,
  INITIAL_PROVIDERS,
  INITIAL_ACCOUNTS,
  INITIAL_MODELS,
  INITIAL_COMBOS,
  INITIAL_ALIASES,
  INITIAL_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_METRICS,
} from './data/mockData';
import { VirtualKey, Combo, Provider, Account, ModelConfig, ModelAlias, AuditLog } from './types';
import { Play } from 'lucide-react';

function getTabFromPath(path: string): NavTab {
  const normalized = path.replace(/\/$/, '');
  const entries = Object.entries(TAB_ROUTES) as [NavTab, string][];
  for (const [tab, route] of entries) {
    if (normalized === route || normalized === route.replace('/admin', '')) {
      return tab;
    }
  }
  return 'keys';
}

export default function App() {
  // Authentication gate state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kinetix_auth') === 'true';
    }
    return false;
  });
  const [currentUser, setCurrentUser] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kinetix_user') || 'admin@kinetix.local';
    }
    return 'admin@kinetix.local';
  });

  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPath(window.location.pathname);
    }
    return 'keys';
  });
  const [isTesterOpen, setIsTesterOpen] = useState(false);

  // Sync tab with URL location on popstate
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    const targetPath = TAB_ROUTES[tab];
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
  };

  const handleLoginSuccess = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    try {
      localStorage.setItem('kinetix_auth', 'true');
      localStorage.setItem('kinetix_user', username);
    } catch {
      // ignore storage errors
    }
    const loginAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: username,
      action: 'admin_login',
      targetType: 'system',
      targetId: 'auth_gateway',
      targetName: 'Kinetix Admin Console',
      details: `Authenticated administrator session started for ${username}.`,
    };
    setAuditLogs((prev) => [loginAudit, ...prev]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('kinetix_auth');
    } catch {
      // ignore storage errors
    }
    const logoutAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser,
      action: 'admin_logout',
      targetType: 'system',
      targetId: 'auth_gateway',
      targetName: 'Kinetix Admin Console',
      details: `Administrator session ended.`,
    };
    setAuditLogs((prev) => [logoutAudit, ...prev]);
  };

  // Core reactive data state
  const [keys, setKeys] = useState<VirtualKey[]>(INITIAL_KEYS);
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [models, setModels] = useState<ModelConfig[]>(INITIAL_MODELS);
  const [combos, setCombos] = useState<Combo[]>(INITIAL_COMBOS);
  const [aliases, setAliases] = useState<ModelAlias[]>(INITIAL_ALIASES);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);

  // Handlers for state updates
  const handleAddKey = (newKey: VirtualKey) => {
    setKeys((prev) => [newKey, ...prev]);
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser,
      action: 'key_created',
      targetType: 'key',
      targetId: newKey.id,
      targetName: newKey.name,
      details: `Created key for ${newKey.owner} with $${newKey.dailyBudget}/day and $${newKey.monthlyBudget}/mo budget.`,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const handleUpdateKeyStatus = (id: string, status: 'active' | 'disabled' | 'revoked') => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status } : k))
    );
    const targetKey = keys.find((k) => k.id === id);
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser,
      action: `key_status_${status}`,
      targetType: 'key',
      targetId: id,
      targetName: targetKey?.name || id,
      details: `Changed virtual key status to ${status}.`,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const handleAddCombo = (newCombo: Combo) => {
    setCombos((prev) => [newCombo, ...prev]);
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser,
      action: 'combo_created',
      targetType: 'combo',
      targetId: newCombo.id,
      targetName: newCombo.name,
      details: `Created combo ${newCombo.name} with ${newCombo.targets.length} targets.`,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const handleUpdateCombo = (updated: Combo) => {
    setCombos((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCombo = (comboId: string) => {
    const target = combos.find((c) => c.id === comboId);
    setCombos((prev) => prev.filter((c) => c.id !== comboId));
    if (target) {
      const newAudit: AuditLog = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: currentUser,
        action: 'combo_deleted',
        targetType: 'combo',
        targetId: comboId,
        targetName: target.name,
        details: `Deleted fallback combo ${target.name}.`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  const handleAddProvider = (prov: Provider) => {
    setProviders((prev) => [...prev, prov]);
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser,
      action: 'provider_added',
      targetType: 'provider',
      targetId: prov.id,
      targetName: prov.name,
      details: `Added ${prov.name} (${prov.wireFormat} wire format at ${prov.baseUrl}).`,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const handleDeleteProvider = (providerId: string) => {
    const target = providers.find((p) => p.id === providerId);
    setProviders((prev) => prev.filter((p) => p.id !== providerId));
    // Clean up models and accounts associated with this provider
    setModels((prev) => prev.filter((m) => m.providerId !== providerId));
    setAccounts((prev) => prev.filter((a) => a.providerId !== providerId));
    if (target) {
      const newAudit: AuditLog = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: currentUser,
        action: 'provider_deleted',
        targetType: 'provider',
        targetId: providerId,
        targetName: target.name,
        details: `Deleted upstream provider ${target.name} and unlinked its models and credential accounts.`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  const handleAddModel = (model: ModelConfig) => {
    setModels((prev) => [...prev, model]);
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser,
      action: 'model_configured',
      targetType: 'model',
      targetId: model.id,
      targetName: model.displayName,
      details: `Configured upstream model ID ${model.upstreamModelId} with ${model.contextWindow} context window.`,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const handleDeleteModel = (modelId: string) => {
    const targetModel = models.find((m) => m.id === modelId);
    setModels((prev) => prev.filter((m) => m.id !== modelId));
    if (targetModel) {
      const newAudit: AuditLog = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: currentUser,
        action: 'model_deleted',
        targetType: 'model',
        targetId: modelId,
        targetName: targetModel.displayName,
        details: `Removed model ${targetModel.displayName} (${targetModel.upstreamModelId}) from upstream provider ${targetModel.providerName}.`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  const handleAddAccount = (acc: Account) => {
    setAccounts((prev) => [...prev, acc]);
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser,
      action: 'account_credential_added',
      targetType: 'account',
      targetId: acc.id,
      targetName: acc.label,
      details: `Enrolled new credential into pool for ${acc.providerName}.`,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const handleUpdateAccount = (acc: Account) => {
    setAccounts((prev) => prev.map((a) => (a.id === acc.id ? acc : a)));
  };

  const handleDeleteAccount = (accountId: string) => {
    const target = accounts.find((a) => a.id === accountId);
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    if (target) {
      const newAudit: AuditLog = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: currentUser,
        action: 'account_credential_removed',
        targetType: 'account',
        targetId: accountId,
        targetName: target.label,
        details: `Removed account credential / pool key ${target.label} for provider ${target.providerName}.`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  const handleAddAlias = (alias: ModelAlias) => {
    setAliases((prev) => [...prev, alias]);
  };

  const handleDeleteAlias = (id: string) => {
    setAliases((prev) => prev.filter((a) => a.id !== id));
  };

  // If user is not logged in, show the login screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2d2d2d] flex flex-col selection:bg-[#fff9c4] selection:text-[#2d2d2d]">
      {/* Hand-Drawn Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        metrics={metrics}
        onOpenTester={() => setIsTesterOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {activeTab === 'keys' && (
          <KeysView
            keys={keys}
            onAddKey={handleAddKey}
            onUpdateKeyStatus={handleUpdateKeyStatus}
          />
        )}

        {activeTab === 'combos' && (
          <CombosView
            combos={combos}
            accounts={accounts}
            models={models}
            onAddCombo={handleAddCombo}
            onUpdateCombo={handleUpdateCombo}
            onDeleteCombo={handleDeleteCombo}
          />
        )}

        {activeTab === 'providers' && (
          <ProvidersView
            providers={providers}
            models={models}
            onAddProvider={handleAddProvider}
            onAddModel={handleAddModel}
            onDeleteModel={handleDeleteModel}
            onDeleteProvider={handleDeleteProvider}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsView
            accounts={accounts}
            providers={providers}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {activeTab === 'usage' && (
          <UsageView
            keys={keys}
            models={models}
            requests={requests}
          />
        )}

        {activeTab === 'requests' && (
          <RequestsView requests={requests} />
        )}

        {activeTab === 'aliases' && (
          <AliasesView
            aliases={aliases}
            combos={combos}
            models={models}
            onAddAlias={handleAddAlias}
            onDeleteAlias={handleDeleteAlias}
          />
        )}

        {activeTab === 'audit' && (
          <AuditView logs={auditLogs} />
        )}
      </main>

      {/* Hand-Drawn Squiggle Footer Divider */}
      <div className="max-w-7xl mx-auto w-full px-4">
        <SquiggleDivider />
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-4 text-center font-body text-sm text-[#2d2d2d]/70">
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <strong className="font-heading text-base text-[#2d2d2d]">Kinetix</strong>
          <span>•</span>
          <span>Zero-downtime LLM Multi-Protocol Proxy</span>
          <span>•</span>
          <span className="underline decoration-wavy decoration-[#ff4d4d]">Hand-Drawn Design System</span>
        </p>
        <p className="text-xs text-[#2d2d2d]/50 font-mono mt-1">
          OpenAI & Anthropic streaming in • Gemini, OpenAI, & Anthropic upstream out • SQLite WAL at rest
        </p>
      </footer>

      {/* Floating Quick Test Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <SketchButton
          variant="danger"
          size="lg"
          onClick={() => setIsTesterOpen(true)}
          className="gap-2 font-heading font-bold shadow-lg shadow-black/10"
        >
          <Play className="w-5 h-5 fill-white" />
          Test Proxy Live
        </SketchButton>
      </div>

      {/* Live Stream & Fallback Simulator Modal */}
      <LiveTesterModal
        isOpen={isTesterOpen}
        onClose={() => setIsTesterOpen(false)}
        keys={keys}
        combos={combos}
        models={models}
      />
    </div>
  );
}
