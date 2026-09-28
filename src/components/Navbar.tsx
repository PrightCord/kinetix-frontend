import React, { useState } from 'react';
import {
  Activity,
  Play,
  Key,
  Shuffle,
  Server,
  Users,
  BarChart3,
  Radio,
  Compass,
  History,
  LogOut,
  RefreshCw,
  Menu,
  X,
  Settings,
  Sun,
  Moon,
  Monitor,
  Puzzle,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { ProxyMetrics } from '../types';
import { formatCurrency } from '../lib/designSystem';
import { Button, StatusBadge } from './KinetixUI';
import type { ThemeMode } from '../lib/theme';

export type NavTab =
  | 'overview'
  | 'keys'
  | 'routes'
  | 'providers'
  | 'accounts'
  | 'plugins'
  | 'usage'
  | 'requests'
  | 'health'
  | 'aliases'
  | 'audit'
  | 'settings';

export const TAB_ROUTES: Record<NavTab, string> = {
  overview: '/admin/overview',
  keys: '/admin/keys',
  routes: '/admin/routes',
  providers: '/admin/providers',
  accounts: '/admin/accounts',
  plugins: '/admin/plugins',
  usage: '/admin/usage',
  requests: '/admin/requests',
  health: '/admin/health',
  aliases: '/admin/aliases',
  audit: '/admin/audit',
  settings: '/admin/settings',
};

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Operations',
    items: [
      { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'routes', label: 'Routes & Topology', icon: <Shuffle className="w-4 h-4" />, badge: 'Active' },
      { id: 'requests', label: 'Request Inspector', icon: <Radio className="w-4 h-4" />, badge: 'Live' },
    ],
  },
  {
    label: 'Access & Providers',
    items: [
      { id: 'keys', label: 'Virtual Keys', icon: <Key className="w-4 h-4" /> },
      { id: 'providers', label: 'Upstream Providers', icon: <Server className="w-4 h-4" /> },
      { id: 'accounts', label: 'Accounts & Pools', icon: <Users className="w-4 h-4" /> },
      { id: 'aliases', label: 'Model Aliases', icon: <Compass className="w-4 h-4" /> },
      { id: 'plugins', label: 'Plugins & Credentials', icon: <Puzzle className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Observability & System',
    items: [
      { id: 'health', label: 'Runtime Health', icon: <Activity className="w-4 h-4" /> },
      { id: 'usage', label: 'Usage & Cost', icon: <BarChart3 className="w-4 h-4" /> },
      { id: 'audit', label: 'Audit Log', icon: <History className="w-4 h-4" /> },
      { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    ],
  },
];

export function tabLabel(tab: NavTab): string {
  for (const g of NAV_GROUPS) {
    const found = g.items.find((i) => i.id === tab);
    if (found) return found.label;
  }
  return 'Kinetix';
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-4 border-b border-[var(--border)]">
      {/* Bauhaus Geometric Icon */}
      <div className="w-7 h-7 rounded-[4px] bg-[#1a1a24] border border-[var(--primary)] flex items-center justify-center font-mono font-bold text-sm text-[var(--primary)] shrink-0 select-none">
        K
      </div>
      <div className="min-w-0 flex items-baseline gap-2">
        <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)]">KINETIX</span>
        <span className="font-mono text-[10px] text-[var(--text-muted)]">v0.5.2</span>
      </div>
    </div>
  );
}

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser?: string;
  onLogout?: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser = 'admin',
  onLogout,
  mobileOpen,
  onCloseMobile,
}) => {
  const content = (
    <div className="h-full flex flex-col justify-between bg-[var(--sidebar)] text-[var(--text-primary)] select-none">
      <div className="overflow-y-auto">
        <Brand />

        <nav className="p-2 space-y-4 text-xs">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] font-medium transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold shadow-xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`font-mono text-[9px] px-1.5 py-0.2 rounded border ${
                            item.badge === 'Live'
                              ? 'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger-border)]'
                              : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Operator Session Footer */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-raised)]/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full bg-[var(--border-strong)] flex items-center justify-center text-[10px] font-mono text-[var(--text-secondary)] uppercase">
            {currentUser[0] || 'A'}
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[11px] font-medium text-[var(--text-primary)] truncate">
              {currentUser}
            </div>
            <div className="text-[10px] text-[var(--healthy)] flex items-center gap-1 font-mono">
              <span className="w-1 h-1 rounded-full bg-[var(--healthy)]" />
              operator
            </div>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign out of dashboard"
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Rail */}
      <aside className="hidden lg:block w-60 shrink-0 h-screen sticky top-0 border-r border-[var(--border)] z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-xl z-10 border-r border-[var(--border)]">
            <button
              onClick={onCloseMobile}
              className="absolute top-3 right-3 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-4 h-4" />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
};

interface TopBarProps {
  activeTab: NavTab;
  metrics: ProxyMetrics;
  onOpenTester: () => void;
  onOpenNav: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  metrics,
  onOpenTester,
  onOpenNav,
  onRefresh,
  isRefreshing,
  themeMode,
  onThemeChange,
}) => {
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <header className="h-13 bg-[var(--canvas)] border-b border-[var(--border)] px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left Title & Mobile Hamburger */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenNav}
          className="lg:hidden p-1.5 -ml-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[4px] border border-[var(--border)]"
          aria-label="Open navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight truncate">
            {tabLabel(activeTab)}
          </h2>
        </div>
      </div>

      {/* Right Operational Controls & Telemetry */}
      <div className="flex items-center gap-3">
        {/* Quick telemetry indicators (hidden on small mobile) */}
        <div className="hidden sm:flex items-center gap-3 font-mono text-xs text-[var(--text-secondary)] border-r border-[var(--border)] pr-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--healthy)]" />
            <span className="text-[var(--text-muted)]">CIRCUITS</span>
            <span className="font-semibold text-[var(--text-primary)]">ALL CLOSED</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">TODAY</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              {formatCurrency(metrics.totalSpendUsd || 0)}
            </span>
          </div>
        </div>

        {/* Global Live Tester CTA */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenTester}
          className="h-7.5 px-3 font-mono text-xs"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Live Tester</span>
        </Button>

        {/* Refresh Action */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-7.5 px-2.5 text-xs"
          title="Refresh gateway state"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Sync</span>
        </Button>

        {/* Minimal Theme Switcher */}
        <div className="relative">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="p-1.5 rounded-[4px] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] cursor-pointer"
            title={`Theme: ${themeMode}`}
          >
            {themeMode === 'light' ? (
              <Sun className="w-3.5 h-3.5" />
            ) : themeMode === 'dark' ? (
              <Moon className="w-3.5 h-3.5" />
            ) : (
              <Monitor className="w-3.5 h-3.5" />
            )}
          </button>

          {themeOpen && (
            <div className="absolute right-0 mt-1 w-32 rounded-[4px] bg-[var(--surface-raised)] border border-[var(--border)] shadow-md py-1 text-xs z-30 font-medium">
              {(['dark', 'light', 'system'] as ThemeMode[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onThemeChange(t);
                    setThemeOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left capitalize hover:bg-[var(--surface)] flex items-center justify-between cursor-pointer ${
                    themeMode === t ? 'text-[var(--primary)] font-semibold' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <span>{t}</span>
                  {themeMode === t && <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
