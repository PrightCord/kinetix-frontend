import React from 'react';
import { DesignId } from '../types';
import { getDesign } from '../registry';
import {
  SketchBadge,
  SketchButton,
  WobblyCard,
  SquiggleDivider,
  Thumbtack,
  TapeStrip,
} from '../../components/HandDrawnElements';
import {
  ShieldCheck,
  ShieldAlert,
  Server,
  Shuffle,
  Key,
  Activity,
  Zap,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface ComponentGalleryProps {
  currentDesignId: DesignId;
}

export const ComponentGallery: React.FC<ComponentGalleryProps> = ({ currentDesignId }) => {
  const design = getDesign(currentDesignId);

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
            Design Component Gallery
          </h2>
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
            {design.name}
          </span>
        </div>
        <p className="text-sm text-[var(--ink)]/70">
          State matrices and interactive edge-case presentations for {design.tagline}.
        </p>
      </div>

      {/* 1. Status Badges Matrix */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>1. Status Badge State Matrix</span>
        </h3>
        <div className="p-4 bg-[var(--surface)] border border-[var(--erased)] rounded-lg flex flex-wrap items-center gap-3">
          <SketchBadge variant="green">● HEALTHY (NOMINAL)</SketchBadge>
          <SketchBadge variant="yellow">▲ DEGRADED (503 FAILS)</SketchBadge>
          <SketchBadge variant="red">✕ CIRCUIT OPEN</SketchBadge>
          <SketchBadge variant="blue">◆ STANDBY / POOL</SketchBadge>
          <SketchBadge variant="blue">★ VERIFIED OAUTH</SketchBadge>
          <SketchBadge variant="default">⊘ DISABLED</SketchBadge>
        </div>
      </section>

      {/* 2. Interactive Buttons & Actions */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>2. Action Buttons &amp; Interactive Triggers</span>
        </h3>
        <div className="p-4 bg-[var(--surface)] border border-[var(--erased)] rounded-lg flex flex-wrap items-center gap-3">
          <SketchButton variant="primary">
            + CREATE VIRTUAL KEY
          </SketchButton>
          <SketchButton variant="secondary">
            PROBE CAPABILITIES
          </SketchButton>
          <SketchButton variant="danger">
            REVOKE ACCESS
          </SketchButton>
          <SketchButton variant="primary" disabled>
            SAVING CHANGES...
          </SketchButton>
        </div>
      </section>

      {/* 3. Surface & Card Hierarchies */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-500" />
          <span>3. Card Surfaces &amp; Container Hierarchy</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WobblyCard decoration="tack" variant="white" className="p-4">
            <h4 className="font-bold text-base mb-1">Standard Work Card</h4>
            <p className="text-xs text-[var(--ink)]/80 mb-3">
              Default surface container utilized across accounts, model listings, and virtual key tables.
            </p>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              ● STATUS: NOMINAL
            </div>
          </WobblyCard>

          <WobblyCard decoration="tape" variant="postit" className="p-4">
            <h4 className="font-bold text-base mb-1">Attention Surface</h4>
            <p className="text-xs text-[var(--ink)]/80 mb-3">
              Highlighted surface utilized for operational warnings, rate-limit backpressure, or circuit events.
            </p>
            <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              ▲ QUOTA: 98% UTILIZED
            </div>
          </WobblyCard>

          <WobblyCard decoration="tack-blue" variant="muted" className="p-4">
            <h4 className="font-bold text-base mb-1">Telemetry Surface</h4>
            <p className="text-xs text-[var(--ink)]/80 mb-3">
              Muted backdrop container utilized for live stream logs and background telemetry readouts.
            </p>
            <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              ◆ TTFT: 184ms P50
            </div>
          </WobblyCard>
        </div>
      </section>

      {/* 4. Provider States Matrix */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>4. Provider Card State Variations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Healthy */}
          <div className="p-4 bg-[var(--surface)] border-2 border-[var(--erased)] rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Anthropic Direct</span>
              <SketchBadge variant="green">HEALTHY</SketchBadge>
            </div>
            <div className="text-xs font-mono text-[var(--ink)]/60">https://api.anthropic.com</div>
            <div className="text-xs space-y-0.5 pt-2 border-t border-[var(--erased)]">
              <div>Ping: 124ms</div>
              <div>Accounts: 2 active</div>
              <div>Models: 4 registered</div>
            </div>
          </div>

          {/* Degraded */}
          <div className="p-4 bg-[var(--surface)] border-2 border-[var(--marker-orange)]/60 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Anthropic Direct</span>
              <SketchBadge variant="yellow">DEGRADED</SketchBadge>
            </div>
            <div className="text-xs font-mono text-[var(--ink)]/60">https://api.anthropic.com</div>
            <div className="text-xs space-y-0.5 pt-2 border-t border-[var(--erased)] text-amber-700 dark:text-amber-400">
              <div>Ping: 1840ms (Spike)</div>
              <div>3 qualifying 503 failures</div>
              <div>Fallback chain engaged</div>
            </div>
          </div>

          {/* Circuit Open */}
          <div className="p-4 bg-[var(--surface)] border-2 border-[var(--marker-red)]/60 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Anthropic Direct</span>
              <SketchBadge variant="red">CIRCUIT OPEN</SketchBadge>
            </div>
            <div className="text-xs font-mono text-[var(--ink)]/60">https://api.anthropic.com</div>
            <div className="text-xs space-y-0.5 pt-2 border-t border-[var(--erased)] text-rose-700 dark:text-rose-400">
              <div>Consecutive failures: 8</div>
              <div>Circuit breaker OPEN</div>
              <div>Retry in 45 seconds</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Fallback Hop Chain Showcase */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
          <Shuffle className="w-4 h-4 text-purple-500" />
          <span>5. Route Fallback Cascade Presentation</span>
        </h3>
        <div className="p-4 bg-[var(--surface)] border border-[var(--erased)] rounded-lg space-y-2">
          <div className="font-mono text-xs font-bold text-[var(--ink)]">
            ROUTE: fast-interactive (Claude 3.7 -&gt; GPT-4o failover)
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 p-2 bg-[var(--tint-green)] border border-[var(--pen-green)] rounded text-xs font-mono">
              <div className="font-bold text-[var(--success-text)]">Hop 1: Claude 3.7 Sonnet</div>
              <div className="text-[10px] text-[var(--ink)]/70">Weight 100% • Timeout 15s • Priority 1</div>
            </div>
            <div className="text-center font-bold text-[var(--ink)]/50">➔</div>
            <div className="flex-1 p-2 bg-[var(--surface)] border border-[var(--erased)] rounded text-xs font-mono">
              <div className="font-bold text-[var(--ink)]">Hop 2: GPT-4o</div>
              <div className="text-[10px] text-[var(--ink)]/70">Weight 100% • Failover on 429/5xx</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
