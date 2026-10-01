import React, { useState } from 'react';
import { DesignId } from '../types';
import { DESIGN_LIST, getDesign } from '../registry';
import App from '../../App';
import { TerminalShell } from '../designs/terminal/TerminalShell';
import { Columns, Eye, Sparkles } from 'lucide-react';
import { demoStore } from '../../demo/backend/store';

interface ComparisonViewProps {
  experimentalDesignId: DesignId;
  onSelectExperiment: (id: DesignId) => void;
  onExitCompare: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  experimentalDesignId,
  onSelectExperiment,
  onExitCompare,
}) => {
  const [splitRatio, setSplitRatio] = useState<'50-50' | 'left-focused' | 'right-focused'>('50-50');
  const experiment = getDesign(experimentalDesignId);
  const scenario = demoStore.getState();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Comparison Header Bar */}
      <div className="h-12 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold">
            <Columns className="w-3.5 h-3.5" />
            <span>SIDE-BY-SIDE COMPARISON MODE</span>
          </div>
          <span className="text-zinc-400 text-xs hidden sm:inline">
            Same scenario: <strong className="text-amber-300 font-mono">{scenario.name}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 font-mono hidden md:inline">Experiment:</span>
          <select
            value={experimentalDesignId}
            onChange={(e) => onSelectExperiment(e.target.value as DesignId)}
            className="bg-zinc-900 text-white border border-zinc-700 rounded px-2 py-1 font-mono cursor-pointer"
          >
            {DESIGN_LIST.filter((d) => d.id !== 'current').map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            onClick={onExitCompare}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-mono cursor-pointer transition-colors"
          >
            Exit Compare
          </button>
        </div>
      </div>

      {/* Split Pane View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Current (Canonical Baseline) */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-800 overflow-hidden relative">
          <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-1.5 flex items-center justify-between text-xs font-mono shrink-0">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              BASELINE: Current (Canonical Production HEAD)
            </span>
            <span className="text-zinc-400 text-[10px]">Reference</span>
          </div>
          <div className="flex-1 overflow-auto design-current">
            <App />
          </div>
        </div>

        {/* Right Side: Experimental Variant */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-1.5 flex items-center justify-between text-xs font-mono shrink-0">
            <span className="font-bold text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              EXPERIMENT: {experiment.name}
            </span>
            <span className="text-zinc-400 text-[10px]">{experiment.tagline}</span>
          </div>
          <div className={`flex-1 overflow-auto ${experiment.cssClass}`}>
            {experiment.id === 'terminal' ? (
              <TerminalShell
                onSwitchDesign={onSelectExperiment}
                onSwitchScenario={() => {}}
              />
            ) : (
              <App />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
