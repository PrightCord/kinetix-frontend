import React, { useState } from 'react';
import { DesignId } from '../types';
import { DESIGN_LIST, getDesign } from '../registry';
import { SCENARIO_LIST } from '../../demo/scenarios';
import { ScenarioId } from '../../demo/types';
import { demoStore } from '../../demo/backend/store';
import App from '../../App';
import { TerminalShell } from '../designs/terminal/TerminalShell';
import { Monitor, Smartphone, Tablet, Layers, Sparkles } from 'lucide-react';

interface ScreenPreviewProps {
  currentDesignId: DesignId;
  currentScenarioId: ScenarioId;
  onDesignChange: (id: DesignId) => void;
  onScenarioChange: (id: ScenarioId) => void;
}

export const ScreenPreview: React.FC<ScreenPreviewProps> = ({
  currentDesignId,
  currentScenarioId,
  onDesignChange,
  onScenarioChange,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const design = getDesign(currentDesignId);

  const viewportWidth =
    viewport === 'mobile' ? 'max-w-sm' : viewport === 'tablet' ? 'max-w-2xl' : 'w-full';

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)] p-3 border border-[var(--erased)] rounded-lg text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[var(--ink)]/60">Design:</span>
            <select
              value={currentDesignId}
              onChange={(e) => onDesignChange(e.target.value as DesignId)}
              className="bg-transparent font-bold text-[var(--ink)] border-b border-[var(--ink)]/30 focus:outline-none cursor-pointer"
            >
              {DESIGN_LIST.map((d) => (
                <option key={d.id} value={d.id} className="bg-zinc-900 text-white">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[var(--ink)]/60">Scenario:</span>
            <select
              value={currentScenarioId}
              onChange={(e) => onScenarioChange(e.target.value as ScenarioId)}
              className="bg-transparent font-bold text-[var(--ink)] border-b border-[var(--ink)]/30 focus:outline-none cursor-pointer"
            >
              {SCENARIO_LIST.map((s) => (
                <option key={s.id} value={s.id} className="bg-zinc-900 text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Viewport switch */}
        <div className="flex items-center gap-1 border border-[var(--erased)] p-0.5 rounded bg-[var(--paper)]">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded cursor-pointer ${
              viewport === 'desktop' ? 'bg-[var(--surface)] font-bold text-[var(--ink)] shadow-xs' : 'text-[var(--ink)]/50'
            }`}
            title="Desktop Resolution"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded cursor-pointer ${
              viewport === 'tablet' ? 'bg-[var(--surface)] font-bold text-[var(--ink)] shadow-xs' : 'text-[var(--ink)]/50'
            }`}
            title="Tablet Resolution"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded cursor-pointer ${
              viewport === 'mobile' ? 'bg-[var(--surface)] font-bold text-[var(--ink)] shadow-xs' : 'text-[var(--ink)]/50'
            }`}
            title="Mobile Resolution"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen Frame */}
      <div className="flex-1 flex justify-center overflow-auto pb-12">
        <div
          className={`${viewportWidth} w-full transition-all duration-300 border-2 border-[var(--erased)] rounded-xl shadow-xl overflow-hidden bg-[var(--paper)] min-h-[700px]`}
        >
          <div className={design.cssClass}>
            {design.id === 'terminal' ? (
              <TerminalShell
                onSwitchDesign={onDesignChange}
                onSwitchScenario={onScenarioChange}
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
