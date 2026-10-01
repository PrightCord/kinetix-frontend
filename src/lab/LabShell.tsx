import React, { useState } from 'react';
import { DesignId } from './types';
import { DESIGN_LIST, getDesign } from './registry';
import { SCENARIO_LIST } from '../demo/scenarios';
import { ScenarioId } from '../demo/types';
import { ComponentGallery } from './components/ComponentGallery';
import { ScreenPreview } from './components/ScreenPreview';
import { ComparisonView } from './components/ComparisonView';
import {
  FlaskConical,
  Layers,
  Sparkles,
  Columns,
  Grid,
  Monitor,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { demoStore } from '../demo/backend/store';

export type LabTab = 'overview' | 'designs' | 'scenarios' | 'components' | 'screens' | 'comparison';

interface LabShellProps {
  currentDesignId: DesignId;
  currentScenarioId: ScenarioId;
  onDesignChange: (id: DesignId) => void;
  onScenarioChange: (id: ScenarioId) => void;
  onExitLab: () => void;
}

export const LabShell: React.FC<LabShellProps> = ({
  currentDesignId,
  currentScenarioId,
  onDesignChange,
  onScenarioChange,
  onExitLab,
}) => {
  const [activeTab, setActiveTab] = useState<LabTab>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const tabParam = p.get('tab') as LabTab;
      if (['overview', 'designs', 'scenarios', 'components', 'screens', 'comparison'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'overview';
  });

  const activeDesign = getDesign(currentDesignId);
  const activeScenario = SCENARIO_LIST.find((s) => s.id === currentScenarioId) || SCENARIO_LIST[0];

  return (
    <div className="min-h-screen bg-[#090d16] text-zinc-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white pb-20">
      {/* Top Navigation */}
      <header className="h-14 bg-[#0d1220] border-b border-[#1f293d] px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded font-mono font-bold text-xs">
            <FlaskConical className="w-4 h-4" />
            <span>KINETIX DESIGN LAB</span>
          </div>
          <span className="text-zinc-500 text-xs hidden md:inline">/</span>
          <span className="text-zinc-400 text-xs font-mono hidden md:inline">
            Active: <strong className="text-white">{activeDesign.name}</strong> • Scenario: <strong className="text-amber-300">{activeScenario.name}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExitLab}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs font-mono cursor-pointer transition-colors"
          >
            <span>Exit Lab to Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Lab Tabs Navigation */}
      <div className="bg-[#0b0f1a] border-b border-[#1b2333] px-4 md:px-8 flex items-center gap-2 overflow-x-auto text-xs font-mono shrink-0">
        {(
          [
            ['overview', 'Overview & Architecture', <Info className="w-3.5 h-3.5" />],
            ['designs', `Designs (${DESIGN_LIST.length})`, <Layers className="w-3.5 h-3.5" />],
            ['scenarios', `Scenarios (${SCENARIO_LIST.length})`, <Sparkles className="w-3.5 h-3.5" />],
            ['components', 'Components Gallery', <Grid className="w-3.5 h-3.5" />],
            ['screens', 'Screen Preview', <Monitor className="w-3.5 h-3.5" />],
            ['comparison', 'Side-by-Side Compare', <Columns className="w-3.5 h-3.5" />],
          ] as const
        ).map(([tabId, label, icon]) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === tabId
                ? 'border-indigo-500 text-white font-bold bg-indigo-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <main className="flex-1 overflow-auto">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Kinetix Standalone UI Workbench
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
                This repository is a standalone reflection of the canonical Kinetix production UI (
                <code className="text-indigo-300 font-mono">PrightCord/kinetix/dashboard</code>). It provides deterministic fake backend states, a runtime design registry, disposable UI experimentation, and 1:1 production parity tooling.
              </p>
            </div>

            {/* Architecture Card */}
            <div className="p-5 bg-[#0e1424] border border-[#222c42] rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Architectural Invariant</span>
              </div>
              <div className="bg-[#080c17] p-3 rounded-lg border border-[#1a2336] font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto">
                <div>PrightCord/kinetix/dashboard  = Canonical Production Truth (Untouched Reference)</div>
                <div>kinetix-frontend/current      = Exact 1:1 Reflection</div>
                <div>kinetix-frontend/demo         = Scenario-Driven Deterministic Fake Backend</div>
                <div>kinetix-frontend/lab          = Disposable Presentation-Only Design Lab</div>
                <div>designs                       = Presentation Only (Shared API / Resource Layer)</div>
              </div>
            </div>

            {/* Active State Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0e1424] border border-[#222c42] rounded-xl space-y-2">
                <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                  <span>CURRENTLY ACTIVE DESIGN</span>
                  <span className="text-indigo-400 font-bold">Level {activeDesign.level}</span>
                </div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{activeDesign.name}</span>
                </div>
                <p className="text-xs text-zinc-400">{activeDesign.description}</p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('designs')}
                    className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Browse other designs</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#0e1424] border border-[#222c42] rounded-xl space-y-2">
                <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                  <span>ACTIVE DEMO SCENARIO</span>
                  <span className="text-amber-400 font-bold">{activeScenario.badge}</span>
                </div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{activeScenario.name}</span>
                </div>
                <p className="text-xs text-zinc-400">{activeScenario.description}</p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('scenarios')}
                    className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Switch scenario</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab('comparison')}
                className="p-3 bg-[#0d1322] hover:bg-[#131b30] border border-[#1f2a40] rounded-lg text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-purple-400 mb-1">
                  <Columns className="w-3.5 h-3.5" />
                  <span>Compare vs Production</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Inspect Current vs an experiment side-by-side on identical data.
                </p>
              </button>

              <button
                onClick={() => setActiveTab('components')}
                className="p-3 bg-[#0d1322] hover:bg-[#131b30] border border-[#1f2a40] rounded-lg text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-indigo-400 mb-1">
                  <Grid className="w-3.5 h-3.5" />
                  <span>Component Matrix</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Audit status badges, buttons, cards, and routing cascades.
                </p>
              </button>

              <button
                onClick={() => {
                  demoStore.resetCurrentScenario();
                  alert('Scenario mutations reset to initial seed.');
                }}
                className="p-3 bg-[#0d1322] hover:bg-[#131b30] border border-[#1f2a40] rounded-lg text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-emerald-400 mb-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo State</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Restore in-memory scenario state back to clean initial data.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* DESIGNS TAB */}
        {activeTab === 'designs' && (
          <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Design Registry</h2>
              <p className="text-zinc-400 text-xs">
                Switch designs hot at runtime without a full page reload. All designs share the identical Kinetix state and action layer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DESIGN_LIST.map((d) => {
                const isActive = d.id === currentDesignId;
                return (
                  <div
                    key={d.id}
                    className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-[#12192c] border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                        : 'bg-[#0e1424] border-[#1f293d] hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-white">{d.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                          Level {d.level} {d.level === 3 ? '(Full Product Shell)' : d.level === 2 ? '(Component Presentation)' : '(Theme Tokens)'}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-indigo-400">{d.tagline}</div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{d.description}</p>
                      <div className="pt-2">
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Key Attributes:</div>
                        <ul className="text-xs space-y-1 text-zinc-300">
                          {d.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                              <span className="text-indigo-400">•</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#1f293d] flex items-center justify-between">
                      {isActive ? (
                        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Currently Active</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onDesignChange(d.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          Activate Design
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SCENARIOS TAB */}
        {activeTab === 'scenarios' && (
          <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Scenario Registry</h2>
              <p className="text-zinc-400 text-xs">
                Deterministic fake backend states representing real Kinetix edge cases. All views immediately render the active scenario.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {SCENARIO_LIST.map((s) => {
                const isActive = s.id === currentScenarioId;
                return (
                  <div
                    key={s.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isActive
                        ? 'bg-[#151c2e] border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-[#0e1424] border-[#1f293d] hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{s.name}</span>
                        {s.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                              s.badgeColor === 'green'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : s.badgeColor === 'amber'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : s.badgeColor === 'red'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                            }`}
                          >
                            {s.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{s.description}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#1f293d] flex items-center justify-between">
                      {isActive ? (
                        <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Scenario</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onScenarioChange(s.id as ScenarioId)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs font-mono cursor-pointer transition-colors"
                        >
                          Apply Scenario
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COMPONENTS TAB */}
        {activeTab === 'components' && (
          <div className="bg-[var(--paper)] min-h-screen text-[var(--ink)]">
            <ComponentGallery currentDesignId={currentDesignId} />
          </div>
        )}

        {/* SCREENS TAB */}
        {activeTab === 'screens' && (
          <ScreenPreview
            currentDesignId={currentDesignId}
            currentScenarioId={currentScenarioId}
            onDesignChange={onDesignChange}
            onScenarioChange={onScenarioChange}
          />
        )}

        {/* COMPARISON TAB */}
        {activeTab === 'comparison' && (
          <ComparisonView
            experimentalDesignId={currentDesignId === 'current' ? 'flat' : currentDesignId}
            onSelectExperiment={onDesignChange}
            onExitCompare={() => setActiveTab('overview')}
          />
        )}
      </main>
    </div>
  );
};
