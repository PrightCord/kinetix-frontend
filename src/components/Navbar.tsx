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
  ArrowLeftRight,
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
  ChevronsLeft,
} from 'lucide-react';
import { ProxyMetrics, Account, RequestLog } from '../types';
import { formatCurrency } from '../lib/designSystem';
import { Button } from './KinetixUI';
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
  badge?: 'LIVE';
  clusterBreakBefore?: boolean;
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Operations',
    items: [
      { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.8} /> },
      { id: 'routes', label: 'Routes & Fallback', icon: <Shuffle className="w-4 h-4" strokeWidth={1.8} /> },
      { id: 'requests', label: 'Request Inspector', icon: <Radio className="w-4 h-4" strokeWidth={1.8} />, badge: 'LIVE' },
    ],
  },
  {
    label: 'Access & Providers',
    items: [
      { id: 'keys', label: 'Virtual Keys', icon: <Key className="w-4 h-4" strokeWidth={1.8} /> },
      { id: 'providers', label: 'Upstream Providers', icon: <Server className="w-4 h-4" strokeWidth={1.8} /> },
      { id: 'accounts', label: 'Accounts & Pools', icon: <Users className="w-4 h-4" strokeWidth={1.8} /> },
      { id: 'aliases', label: 'Model Aliases', icon: <ArrowLeftRight className="w-4 h-4" strokeWidth={1.8} /> },
      { id: 'plugins', label: 'Plugins & Credentials', icon: <Puzzle className="w-4 h-4" strokeWidth={1.8} />, clusterBreakBefore: true },
    ],
  },
  {
    label: 'Observability & System',
    items: [
      { id: 'health', label: 'Runtime Health', icon: <Activity className="w-4 h-4" strokeWidth={1.8} /> },
      { id: 'usage', label: 'Usage & Cost', icon: <BarChart3 className="w-4 h-4" strokeWidth={1.8} /> },
      { id: 'audit', label: 'Audit Log', icon: <History className="w-4 h-4" strokeWidth={1.8} /> },
      { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" strokeWidth={1.8} /> },
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

interface BrandProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function Brand({ collapsed, onToggleCollapse }: BrandProps) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-3.5 border-b border-[var(--border)]">
        <button
          onClick={onToggleCollapse}
          title="Expand sidebar"
          className="w-8 h-8 rounded-[4px] bg-[#14141c] border border-indigo-500/80 flex items-center justify-center font-mono font-bold text-sm text-[var(--primary)] shrink-0 select-none shadow-xs hover:border-indigo-400 hover:text-indigo-400 transition-colors cursor-pointer group relative focus:outline-none"
          aria-label="Expand sidebar"
        >
          K
          {/* Floating tooltip on hover */}
          <div className="hidden group-hover:flex absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1 rounded-[4px] bg-[var(--surface-overlay)] border border-[var(--border-strong)] shadow-lg whitespace-nowrap text-xs font-mono text-[var(--text-primary)] items-center gap-1.5 pointer-events-none select-none">
            <span className="font-semibold">KINETIX</span>
            <span className="text-[10px] text-[var(--text-muted)]">v0.5.2</span>
            <span className="text-[10px] text-[var(--primary)] font-sans ml-1">Expand</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-3 py-3.5 border-b border-[var(--border)]">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Bauhaus Geometric Icon - reduced border saturation by ~15-20% */}
        <div className="w-7 h-7 rounded-[4px] bg-[#14141c] border border-indigo-500/80 flex items-center justify-center font-mono font-bold text-sm text-[var(--primary)] shrink-0 select-none shadow-xs">
          K
        </div>
        <div className="min-w-0 flex items-baseline gap-2">
          <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)]">KINETIX</span>
          <span className="font-mono text-[10px] text-[var(--text-muted)]">v0.5.2</span>
        </div>
      </div>
      <button
        onClick={onToggleCollapse}
        title="Collapse sidebar"
        className="hidden lg:flex p-1 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors cursor-pointer"
        aria-label="Collapse sidebar"
      >
        <ChevronsLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
      </button>
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
  currentUser = 'demo@kinetix.local',
  onLogout,
  mobileOpen,
  onCloseMobile,
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('kinetix_sidebar_collapsed') === 'true';
  });

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('kinetix_sidebar_collapsed', String(next));
      return next;
    });
  };

  const renderNav = (isDrawer = false) => {
    const isCollapsed = !isDrawer && collapsed;

    return (
      <div className="h-full flex flex-col justify-between bg-[var(--sidebar)] text-[var(--text-primary)] select-none">
        <div className="overflow-y-auto overflow-x-hidden">
          <Brand collapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />

          <nav className={isCollapsed ? 'p-1.5 space-y-3' : 'p-2 space-y-4 text-xs'}>
            {NAV_GROUPS.map((group, groupIdx) => (
              <div key={group.label} className={isCollapsed ? 'space-y-1' : 'space-y-1'}>
                {isCollapsed ? (
                  groupIdx > 0 ? (
                    <div className="h-px bg-[var(--border-subtle)] my-2 mx-1" />
                  ) : null
                ) : (
                  /* Section label with ~2px extra vertical rhythm before first item */
                  <div className="px-2.5 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                    {group.label}
                  </div>
                )}

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    const breakClass = item.clusterBreakBefore ? (isCollapsed ? 'mt-1.5' : 'mt-2 pt-0.5') : '';

                    if (isCollapsed) {
                      return (
                        <div key={item.id} className={`relative group ${breakClass}`}>
                          <button
                            onClick={() => onSelectTab(item.id)}
                            className={`w-full h-8 flex items-center justify-center rounded-[4px] transition-colors cursor-pointer relative ${
                              isActive
                                ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-xs before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[18px] before:w-[2px] before:rounded-[1px] before:bg-indigo-400/40'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                            }`}
                            aria-label={item.badge === 'LIVE' ? `${item.label} · LIVE` : item.label}
                          >
                            <span className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}>
                              {item.icon}
                            </span>
                            {item.badge === 'LIVE' && (
                              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse pointer-events-none" />
                            )}
                          </button>

                          {/* Hover Tooltip when collapsed: immediate functional navigation cue */}
                          <div className="hidden group-hover:flex absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1 rounded-[4px] bg-[var(--surface-overlay)] border border-[var(--border-strong)] shadow-lg items-center gap-1.5 pointer-events-none whitespace-nowrap text-xs font-medium text-[var(--text-primary)] select-none">
                            <span>{item.label}</span>
                            {item.badge === 'LIVE' && (
                              <span className="font-mono text-[10px] text-purple-400/90 flex items-center gap-1">
                                <span className="text-[var(--text-muted)]">·</span>
                                <span>LIVE</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={item.id} className={breakClass}>
                        <button
                          onClick={() => {
                            onSelectTab(item.id);
                            onCloseMobile();
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] font-medium transition-colors cursor-pointer text-left relative overflow-hidden group ${
                            isActive
                              ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold shadow-xs before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[18px] before:w-[2px] before:rounded-[1px] before:bg-indigo-400/40'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}>
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>

                          {/* Refined LIVE Badge: ~10% quieter border & background, preserves dot */}
                          {item.badge === 'LIVE' && (
                            <span className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-[3px] bg-purple-500/8 text-purple-400/90 border border-purple-500/15">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                              LIVE
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Operator Session Footer */}
        {isCollapsed ? (
          <div className="p-2 border-t border-[var(--border)] bg-[var(--surface-raised)]/20 hover:bg-[var(--surface-raised)]/50 transition-colors flex flex-col items-center gap-[10px]">
            <div className="group relative">
              <div className="w-6 h-6 rounded-[4px] bg-[#14141c] border border-[var(--border-strong)] flex items-center justify-center text-[10px] font-mono text-[var(--text-secondary)] font-semibold uppercase cursor-default">
                {currentUser[0] || 'D'}
              </div>
              <div className="hidden group-hover:flex absolute left-full ml-2.5 bottom-0 z-50 px-2.5 py-1.5 rounded-[4px] bg-[var(--surface-overlay)] border border-[var(--border-strong)] shadow-lg whitespace-nowrap text-xs font-mono text-[var(--text-primary)] flex-col gap-0.5 pointer-events-none select-none">
                <div className="font-semibold text-[11px] leading-tight">{currentUser}</div>
                <div className="text-[10px] text-[var(--text-muted)] leading-tight">operator</div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign out of dashboard"
                className="w-6 h-6 flex items-center justify-center rounded-[4px] text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.8} />
              </button>
            )}
          </div>
        ) : (
          <div className="p-2.5 border-t border-[var(--border)] bg-[var(--surface-raised)]/20 hover:bg-[var(--surface-raised)]/60 transition-colors flex items-center justify-between text-xs group">
            <div className="flex items-center min-w-0 flex-1 mr-2">
              <div className="w-6 h-6 rounded-[4px] bg-[#14141c] border border-[var(--border-strong)] flex items-center justify-center text-[10px] font-mono text-[var(--text-secondary)] font-semibold uppercase shrink-0 select-none">
                {currentUser[0] || 'D'}
              </div>
              <div className="min-w-0 ml-2.5 flex-1 flex flex-col justify-center">
                <div className="font-mono text-[11px] font-medium text-[var(--text-primary)] truncate leading-none mb-1">
                  {currentUser}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono leading-none">
                  operator
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign out of dashboard"
                className="w-7 h-7 flex items-center justify-center p-1.5 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--surface)] transition-colors cursor-pointer shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.8} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Rail with 240px expanded -> 56px collapsed transition */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 border-r border-[var(--border)] z-30 transition-all duration-200 ease-in-out ${
          collapsed ? 'w-14' : 'w-60'
        }`}
      >
        {renderNav(false)}
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
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
            {renderNav(true)}
          </div>
        </div>
      )}
    </>
  );
};

interface TopBarProps {
  activeTab: NavTab;
  metrics: ProxyMetrics;
  accounts?: Account[];
  requests?: RequestLog[];
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
  accounts,
  requests,
  onOpenTester,
  onOpenNav,
  onRefresh,
  isRefreshing,
  themeMode,
  onThemeChange,
}) => {
  const [themeOpen, setThemeOpen] = useState(false);

  const totalAccounts = accounts?.length ?? 5;
  const healthyAccounts = accounts ? accounts.filter((a) => a.status === 'healthy').length : totalAccounts;
  const hasDegradedAccounts = accounts ? accounts.some((a) => a.status !== 'healthy') : false;
  const hasActiveFallback = requests ? requests.some((r) => r.fallbackHops > 0) : true;
  const isRecoveringOrDegraded = hasDegradedAccounts || hasActiveFallback;

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
        {/* Unified Operational Status: ● OPERATIONAL · 5/5 accounts · 0 circuits · $382.41 today */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)] border-r border-[var(--border)] pr-3 select-none">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isRecoveringOrDegraded ? 'bg-[var(--warning)]' : 'bg-[var(--healthy)]'}`} />
          <span className="font-semibold text-[var(--text-primary)]">
            {isRecoveringOrDegraded ? 'OPERATIONAL' : 'NOMINAL'}
          </span>
          <span className="text-[var(--text-muted)]">•</span>
          <span>{healthyAccounts}/{totalAccounts} accounts</span>
          <span className="text-[var(--text-muted)]">•</span>
          <span>0 circuits</span>
          <span className="text-[var(--text-muted)]">•</span>
          <span className="font-semibold text-[var(--text-primary)] tabular-nums">
            {formatCurrency(metrics.totalSpendUsd || 0)} today
          </span>
        </div>

        {/* Global Live Tester CTA - Tonal refined treatment */}
        <Button
          variant="tonal"
          size="sm"
          onClick={onOpenTester}
          className="h-7.5 px-3 font-mono text-xs"
        >
          <Play className="w-3 h-3 fill-current" />
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
