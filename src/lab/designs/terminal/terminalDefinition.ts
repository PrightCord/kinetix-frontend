import type { DesignDefinition } from '../../types.ts';

export const terminalDesign: DesignDefinition = {
  id: 'terminal',
  name: 'Terminal TUI (Level 3 Shell)',
  tagline: 'Full ASCII/TUI command console',
  description:
    'A complete Level 3 product presentation replacement. Re-architects the dashboard into an authentic terminal/TUI interface with ASCII frame borders, live telemetry status ribbons, keyboard navigation hotkeys [1-0], and an integrated operator command console.',
  level: 3,
  cssClass: 'design-terminal',
  features: [
    'Complete Level 3 shell substitution consuming shared Kinetix data model',
    'Authentic ASCII box-drawing frames (┌─┐│└─┘) with phosphor green/amber accents',
    'Direct keyboard hotkey navigation: [1] Keys, [2] Routes, [3] Providers, [4] Accounts...',
    'Interactive operator CLI prompt (kinetix> :scenario, :test, :routes)',
    'Real-time monospace telemetry streams and ASCII progress gauges',
  ],
};
