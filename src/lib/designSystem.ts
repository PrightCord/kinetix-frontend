export const DESIGN_TOKENS = {
  colors: {
    canvas: 'var(--canvas)',
    sidebar: 'var(--sidebar)',
    surface: 'var(--surface)',
    surfaceRaised: 'var(--surface-raised)',
    border: 'var(--border)',
    borderStrong: 'var(--border-strong)',
    borderSubtle: 'var(--border-subtle)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    textMuted: 'var(--text-muted)',
    healthy: 'var(--healthy)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
    info: 'var(--info)',
    primary: 'var(--primary)',

    // Legacy mapped aliases
    background: 'var(--canvas)',
    foreground: 'var(--text-primary)',
    muted: 'var(--surface-raised)',
    accent: 'var(--danger)',
    secondaryAccent: 'var(--info)',
    penGreen: 'var(--healthy)',
    markerOrange: 'var(--warning)',
    postit: 'var(--surface-raised)',
    postitBorder: 'var(--border-strong)',
  },
  radii: {
    xs: '3px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    pill: '9999px',

    // Legacy mapped aliases
    wobbly: '6px',
    wobblyMd: '6px',
    wobblyLg: '8px',
    wobblyBtn: '4px',
    wobblyBadge: '4px',
    wobblyCardAlt: '6px',
    wobblyCircle: '50%',
  },
  shadows: {
    none: 'none',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',

    // Legacy mapped aliases
    standard: 'none',
    emphasized: 'none',
    subtle: 'none',
    softPaper: 'none',
    blue: 'none',
    red: 'none',
  },
};

export function formatCurrency(amount: number): string {
  if (amount === 0) return '$0.00';
  if (amount < 0.001 && amount > 0) {
    return `< $0.001`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount > 10 ? 2 : 3,
    maximumFractionDigits: 4,
  }).format(amount);
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(2)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}k`;
  }
  return tokens.toLocaleString();
}

export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${Math.round(ms)}ms`;
}
