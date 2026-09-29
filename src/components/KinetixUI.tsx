import React, { useState } from 'react';
import { Copy, Check, AlertCircle, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

/* ==========================================================================
   Kinetix Core Primitives
   Swiss Structure · Bauhaus Topology · Industrial Controls · Terminal Telemetry
   ========================================================================== */

// --- Card / Surface Container ----------------------------------------------
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  variant?: 'surface' | 'raised' | 'overlay' | 'flat';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  variant = 'surface',
  className = '',
  ...props
}) => {
  const bgClass =
    variant === 'raised'
      ? 'bg-[var(--surface-raised)]'
      : variant === 'overlay'
      ? 'bg-[var(--surface-overlay)]'
      : variant === 'flat'
      ? 'bg-transparent'
      : 'bg-[var(--surface)]';

  return (
    <div
      className={`border border-[var(--border)] rounded-[6px] ${bgClass} transition-colors ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--border)]">
          <div>
            {title && <h3 className="text-[13px] md:text-sm font-semibold text-[var(--text-primary)] font-sans tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-sans">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

// --- Button ----------------------------------------------------------------
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'terminal' | 'outline' | 'tonal';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'sm',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs gap-1.5 h-6',
    sm: 'px-3 py-1.5 text-xs font-medium gap-1.5 h-8',
    md: 'px-4 py-2 text-sm font-medium gap-2 h-9',
    lg: 'px-5 py-2.5 text-sm font-semibold gap-2.5 h-10',
  }[size];

  const variantStyles = {
    primary:
      'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:translate-y-px border border-transparent shadow-sm',
    secondary:
      'bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] active:translate-y-px shadow-sm',
    danger:
      'bg-[var(--danger-bg)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white border border-[var(--danger-border)] active:translate-y-px',
    ghost:
      'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent',
    terminal:
      'bg-[#09090c] text-[var(--terminal-green)] font-mono border border-[var(--border-strong)] hover:border-[var(--terminal-green)] active:translate-y-px',
    tonal:
      'bg-[var(--primary-bg)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white border border-[var(--primary-border)] active:translate-y-px transition-colors',
    outline:
      'bg-transparent text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-hover)]',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center rounded-[4px] select-none whitespace-nowrap transition-all duration-100 disabled:opacity-45 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};

// --- Status Badge ----------------------------------------------------------
export type StatusBadgeVariant =
  | 'healthy'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'default'
  | 'green'
  | 'yellow'
  | 'red'
  | 'blue';

export interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusBadgeVariant;
  dot?: boolean;
  mono?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = 'neutral',
  dot = true,
  mono = false,
  size = 'sm',
  className = '',
}) => {
  // Normalize mapped aliases
  const v =
    variant === 'green'
      ? 'healthy'
      : variant === 'yellow'
      ? 'warning'
      : variant === 'red'
      ? 'danger'
      : variant === 'blue'
      ? 'info'
      : variant === 'default'
      ? 'neutral'
      : variant;

  const colorStyles = {
    healthy: 'bg-[var(--healthy-bg)] text-[var(--healthy)] border-[var(--healthy-border)]',
    warning: 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning-border)]',
    danger: 'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger-border)]',
    info: 'bg-[var(--info-bg)] text-[var(--info)] border-[var(--info-border)]',
    neutral: 'bg-[var(--surface-raised)] text-[var(--text-secondary)] border-[var(--border)]',
  }[v];

  const dotColors = {
    healthy: 'bg-[var(--healthy)]',
    warning: 'bg-[var(--warning)]',
    danger: 'bg-[var(--danger)]',
    info: 'bg-[var(--info)]',
    neutral: 'bg-[var(--text-muted)]',
  }[v];

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-[4px] whitespace-nowrap select-none ${
        mono ? 'font-mono text-[11px]' : ''
      } ${sizeClass} ${colorStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors}`} />}
      {children}
    </span>
  );
};

// --- Input -----------------------------------------------------------------
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  mono = false,
  icon,
  className = '',
  containerClassName,
  ...props
}) => {
  const tokens = className.split(/\s+/).filter(Boolean);
  const widthTokens = tokens.filter((t) => t.startsWith('w-') || t.includes(':w-'));
  const otherTokens = tokens.filter((t) => !t.startsWith('w-') && !t.includes(':w-'));
  const wrapperClass = containerClassName !== undefined ? containerClassName : (widthTokens.join(' ') || 'w-full');

  return (
    <div className={`relative flex items-center ${wrapperClass}`}>
      {icon && <span className="absolute left-2.5 text-[var(--text-muted)] pointer-events-none">{icon}</span>}
      <input
        className={`w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--primary)] focus:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] ${
          icon ? 'pl-8' : ''
        } ${mono ? 'font-mono' : ''} ${otherTokens.join(' ')}`}
        {...props}
      />
    </div>
  );
};

// --- Select ----------------------------------------------------------------
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  mono?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  mono = false,
  className = '',
  children,
  ...props
}) => (
  <select
    className={`bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] px-3 py-1.5 text-xs text-[var(--text-primary)] transition-colors focus:border-[var(--primary)] focus:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] cursor-pointer min-w-0 max-w-full ${
      mono ? 'font-mono' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </select>
);

// --- Divider ---------------------------------------------------------------
export const Divider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-full h-px bg-[var(--border)] my-3 ${className}`} />
);

// --- Terminal Panel --------------------------------------------------------
export interface TerminalPanelProps {
  title?: string;
  children: React.ReactNode;
  copyText?: string;
  className?: string;
  maxHeight?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  title,
  children,
  copyText,
  className = '',
  maxHeight = 'max-h-72',
  collapsible = true,
  defaultCollapsed = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(collapsible ? defaultCollapsed : false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!copyText) return;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={`border border-[var(--border)] rounded-[6px] bg-[#09090c] overflow-hidden transition-all ${className}`}>
      {title && (
        <div
          onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
          className={`flex items-center justify-between px-3.5 py-2 bg-[var(--surface-raised)] border-b border-[var(--border)] font-mono text-xs select-none ${
            collapsible ? 'cursor-pointer hover:bg-[var(--surface-hover)]' : ''
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[var(--healthy)] opacity-80 shrink-0" />
            <span className="font-semibold text-[var(--text-primary)] truncate">{title}</span>
            {collapsible && isCollapsed && (
              <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
                (stream active · click to expand)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {collapsible && (
              <span className="text-xs text-[var(--text-secondary)] font-sans hover:text-[var(--text-primary)] flex items-center gap-1 font-medium">
                {isCollapsed ? 'Expand ▾' : 'Collapse ▴'}
              </span>
            )}
            {copyText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                title="Copy contents"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[var(--healthy)]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>
      )}
      {!isCollapsed ? (
        <div className={`p-3 font-mono text-xs overflow-y-auto leading-relaxed text-[var(--text-primary)] ${maxHeight}`}>
          {children}
        </div>
      ) : (
        <div
          onClick={() => setIsCollapsed(false)}
          className="px-3.5 py-2 font-mono text-xs text-[var(--text-secondary)] cursor-pointer hover:bg-[#0e0e13] flex items-center justify-between gap-2 border-t border-[var(--border-subtle)]"
        >
          <div className="truncate flex items-center gap-2">
            <span className="text-[var(--text-muted)]">&gt;</span>
            <span className="text-[var(--text-secondary)] truncate">
              [telemetry] Gateway nominal • Active streams buffer 0 drops • Health check scheduled
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] shrink-0 font-sans hover:underline">
            [+] Show 5 events
          </span>
        </div>
      )}
    </div>
  );
};

// --- Metric Box (Industrial / Swiss KPI) ------------------------------------
export interface MetricBoxProps {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  indicator?: 'healthy' | 'warning' | 'danger' | 'info' | 'neutral';
  icon?: React.ReactNode;
  period?: string;
  className?: string;
}

export const MetricBox: React.FC<MetricBoxProps> = ({
  label,
  value,
  subtext,
  indicator = 'neutral',
  icon,
  period,
  className = '',
}) => {
  const indicatorColor = {
    healthy: 'text-[var(--healthy)]',
    warning: 'text-[var(--warning)]',
    danger: 'text-[var(--danger)]',
    info: 'text-[var(--info)]',
    neutral: 'text-[var(--text-primary)]',
  }[indicator];

  return (
    <div className={`p-3.5 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] transition-colors ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-[var(--text-secondary)] font-sans uppercase tracking-wider truncate">
            {label}
          </span>
          {period && (
            <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
              [{period}]
            </span>
          )}
        </div>
        {icon && <span className="text-[var(--text-secondary)] shrink-0">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold tracking-tight mt-1 font-mono tabular-nums ${indicatorColor}`}>
        {value}
      </div>
      {subtext && <div className="text-xs text-[var(--text-secondary)] font-sans mt-1 truncate">{subtext}</div>}
    </div>
  );
};

// --- Bauhaus Topology Node -------------------------------------------------
export interface TopologyNodeProps {
  label: string;
  type: 'ingress' | 'policy' | 'route' | 'target' | 'account' | 'fallback';
  status?: 'active' | 'degraded' | 'standby' | 'disabled';
  detail?: string;
  badge?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const TopologyNode: React.FC<TopologyNodeProps> = ({
  label,
  type,
  status = 'active',
  detail,
  badge,
  selected = false,
  onClick,
  className = '',
}) => {
  const statusBorder = {
    active: 'border-[var(--healthy)]',
    degraded: 'border-[var(--warning)]',
    standby: 'border-[var(--info)]',
    disabled: 'border-[var(--border-strong)] opacity-60',
  }[status];

  const typeBg = {
    ingress: 'bg-[#181822]',
    policy: 'bg-[#181d24]',
    route: 'bg-[#18221d]',
    target: 'bg-[var(--surface-raised)]',
    account: 'bg-[#221c18]',
    fallback: 'bg-[#221818]',
  }[type];

  return (
    <div
      onClick={onClick}
      className={`relative p-3 rounded-[4px] border ${statusBorder} ${typeBg} ${
        selected ? 'ring-2 ring-[var(--primary)]' : ''
      } ${onClick ? 'cursor-pointer hover:brightness-110' : ''} transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--text-muted)]">{type}</span>
        {badge && (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]">
            {badge}
          </span>
        )}
      </div>
      <div className="font-semibold text-xs text-[var(--text-primary)] truncate font-mono">{label}</div>
      {detail && <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{detail}</div>}
    </div>
  );
};
