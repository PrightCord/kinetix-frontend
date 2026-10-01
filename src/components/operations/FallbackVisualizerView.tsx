import React, { useState } from 'react';
import { GitBranch, ArrowRight, AlertTriangle, CheckCircle2, Shuffle, HelpCircle } from 'lucide-react';
import type { Route } from '../../types';

interface FallbackVisualizerViewProps {
  routes: Route[];
  onExplainTarget: (routeName: string, targetName: string) => void;
}

export const FallbackVisualizerView: React.FC<FallbackVisualizerViewProps> = ({
  routes,
  onExplainTarget,
}) => {
  const [selectedRouteName, setSelectedRouteName] = useState(routes[0]?.name || 'sonnet');

  const cascades: Record<string, any> = {
    sonnet: {
      routeName: 'sonnet',
      strategy: 'priority',
      fallbackRecoveryRate: 98.4,
      hops: [
        {
          hopNumber: 1,
          target: 'claude-oauth-2',
          provider: 'Anthropic OAuth Pool',
          model: 'claude-3-5-sonnet-latest',
          role: 'Primary Dispatch Target',
          triggersToNext: [
            { error: '429 Rate Limit', condition: 'active cooldown > 0 or 429 received' },
            { error: '503 Overloaded', condition: 'transient capacity bottleneck' },
            { error: 'Timeout (>15s)', condition: 'gateway timeout on TTFT' },
          ],
        },
        {
          hopNumber: 2,
          target: 'claude-oauth-3',
          provider: 'Anthropic Bedrock Pool',
          model: 'claude-3-5-sonnet-20241022',
          role: 'Secondary Failover Target',
          triggersToNext: [
            { error: '429 Quota Exhausted', condition: 'secondary account exhausted' },
            { error: '500 Internal Error', condition: 'datacenter disruption' },
          ],
        },
        {
          hopNumber: 3,
          target: 'antigravity-1',
          provider: 'Antigravity Enterprise Gateway',
          model: 'claude-3-5-sonnet-enterprise',
          role: 'Tertiary Disaster Recovery Cluster',
          triggersToNext: [],
        },
      ],
    },
    'gemini-flash': {
      routeName: 'gemini-flash',
      strategy: 'round-robin',
      fallbackRecoveryRate: 99.7,
      hops: [
        {
          hopNumber: 1,
          target: 'google-ai-studio-primary',
          provider: 'Google Vertex AI',
          model: 'gemini-3.8-flash',
          role: 'Primary Low-Latency Pipeline',
          triggersToNext: [
            { error: '503 Unavailable', condition: 'regional quota hit' },
            { error: 'Timeout (>8s)', condition: 'slow connect timeout' },
          ],
        },
        {
          hopNumber: 2,
          target: 'ai-studio-backup',
          provider: 'Google AI Studio Tier',
          model: 'gemini-2.0-flash',
          role: 'Secondary Fast Failover',
          triggersToNext: [],
        },
      ],
    },
  };

  const cascade = cascades[selectedRouteName] || cascades['sonnet'];

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Header */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center font-bold">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-[var(--ink)]">
                Fallback Path &amp; Transition Visualizer
              </h2>
              <p className="text-xs text-[var(--ink)]/60 font-mono">
                Visual cascade showing hop-by-hop failover transitions and the exact trigger conditions that cause rerouting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="route-select" className="sr-only">Select route</label>
            <select
              id="route-select"
              value={selectedRouteName}
              onChange={(e) => setSelectedRouteName(e.target.value)}
              className="p-2 rounded-lg border-2 border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)] text-xs font-bold focus:border-[var(--ink)] outline-none"
            >
              {Array.from(new Set(['sonnet', 'gemini-flash', ...routes.map((r) => r.name)])).map((name) => (
                <option key={name} value={name}>
                  Route: {name}
                </option>
              ))}
            </select>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-3 py-1.5 rounded-lg">
              {cascade.fallbackRecoveryRate}% Cascade Recovery Rate
            </span>
          </div>
        </div>
      </div>

      {/* Visual DAG Cascade */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-6 shadow-sketch space-y-6">
        <div className="border-b-2 border-[var(--erased)] pb-3 flex items-center justify-between">
          <span className="font-bold text-xs uppercase text-[var(--ink)]/70">
            Cascade Sequence for Route: <span className="text-purple-600 font-mono">{cascade.routeName}</span>
          </span>
          <span className="text-xs text-[var(--ink)]/60 font-mono">Strategy: {cascade.strategy}</span>
        </div>

        <div className="space-y-6">
          {cascade.hops.map((hop: any, idx: number) => {
            const hasNext = idx < cascade.hops.length - 1;

            return (
              <div key={hop.hopNumber} className="space-y-4">
                {/* Hop Card */}
                <div className="p-5 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-xl relative shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--erased)] pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        #{hop.hopNumber}
                      </span>
                      <div>
                        <div className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                          <span>{hop.target}</span>
                          <span className="text-xs font-normal text-[var(--ink)]/60 font-mono">({hop.model})</span>
                        </div>
                        <div className="text-[11px] text-[var(--ink)]/60 font-mono">{hop.provider}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                        {hop.role}
                      </span>
                      <button
                        onClick={() => onExplainTarget(cascade.routeName, hop.target)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> Explain
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-[var(--ink)]/80">
                    Dispatched automatically when preceding targets in cascade are exhausted, rate limited, or unhealthy.
                  </div>
                </div>

                {/* Transition Arrow & Triggers */}
                {hasNext && (
                  <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border-2 border-dashed border-amber-400 dark:border-amber-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                      <ArrowRight className="w-4 h-4 text-amber-600" />
                      <span>Fallback Transition Triggered If:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {hop.triggersToNext.map((trig: any, tIdx: number) => (
                        <div
                          key={tIdx}
                          className="p-2 bg-[var(--surface)] border border-amber-300 dark:border-amber-800 rounded text-[11px]"
                        >
                          <div className="font-bold text-rose-600 dark:text-rose-400">{trig.error}</div>
                          <div className="text-[var(--ink)]/70 text-[10px] mt-0.5">{trig.condition}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
