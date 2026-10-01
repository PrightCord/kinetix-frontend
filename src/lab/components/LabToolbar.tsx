import React, { useState } from 'react';
import { DesignId } from '../types';
import { DESIGN_LIST } from '../registry';
import { SCENARIO_LIST } from '../../demo/scenarios';
import { ScenarioId } from '../../demo/types';
import {
  Layers,
  FlaskConical,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  Columns,
  Maximize2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { ThemeMode } from '../../lib/theme';

interface LabToolbarProps {
  currentDesignId: DesignId;
  currentScenarioId: ScenarioId;
  density: 'comfortable' | 'compact';
  themeMode: ThemeMode;
  isCompareMode: boolean;
  onDesignChange: (id: DesignId) => void;
  onScenarioChange: (id: ScenarioId) => void;
  onDensityChange: (d: 'comfortable' | 'compact') => void;
  onThemeChange: (m: ThemeMode) => void;
  onToggleCompare: () => void;
  onResetScenario: () => void;
  onOpenLab: () => void;
}

export const LabToolbar: React.FC<LabToolbarProps> = ({
  currentDesignId,
  currentScenarioId,
  density,
  themeMode,
  isCompareMode,
  onDesignChange,
  onScenarioChange,
  onDensityChange,
  onThemeChange,
  onToggleCompare,
  onResetScenario,
  onOpenLab,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const currentScenario = SCENARIO_LIST.find((s) => s.id === currentScenarioId);
  const currentDesign = DESIGN_LIST.find((d) => d.id === currentDesignId);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-3 right-3 z-50 flex items-center gap-2 px-3 py-1.5 bg-[#090d16] text-white border border-[#2b3345] shadow-2xl rounded-full text-xs font-mono hover:bg-[#151c2e] cursor-pointer transition-transform hover:scale-105"
        title="Open Kinetix Design Lab Toolbar"
      >
        <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
        <span className="font-bold">LAB</span>
        <span className="text-[10px] text-zinc-400 font-sans">({currentDesign?.name})</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Kinetix Design Lab"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl bg-[#090d16]/95 backdrop-blur-md text-zinc-200 border border-[#2b3345] shadow-2xl rounded-xl px-3 py-2 text-xs font-mono transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Brand Badge & Lab Route Link */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenLab}
            className="flex items-center gap-1.5 px-2 py-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 rounded hover:bg-indigo-600/30 transition-colors cursor-pointer font-bold"
            title="Open Full Design Lab (/lab)"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>LAB WORKBENCH</span>
          </button>
        </div>

        {/* Center: Design Selector, Scenario Selector, Density, Compare */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Design Switcher */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2 py-1 rounded border border-zinc-800">
            <Layers className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-400 text-[11px]">Design:</span>
            <select
              value={currentDesignId}
              onChange={(e) => onDesignChange(e.target.value as DesignId)}
              className="bg-transparent text-white font-semibold cursor-pointer focus:outline-none"
            >
              {DESIGN_LIST.map((d) => (
                <option key={d.id} value={d.id} className="bg-zinc-900 text-white">
                  {d.name} {d.level === 3 ? '(Full Shell)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Scenario Switcher */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2 py-1 rounded border border-zinc-800">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-zinc-400 text-[11px]">Scenario:</span>
            <select
              value={currentScenarioId}
              onChange={(e) => onScenarioChange(e.target.value as ScenarioId)}
              className="bg-transparent text-amber-200 font-semibold cursor-pointer focus:outline-none max-w-[150px] truncate"
            >
              {SCENARIO_LIST.map((s) => (
                <option key={s.id} value={s.id} className="bg-zinc-900 text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Compare Toggle */}
          <button
            onClick={onToggleCompare}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors cursor-pointer ${
              isCompareMode
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/60 font-bold'
                : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Toggle side-by-side comparison with Current (Canonical)"
          >
            <Columns className="w-3 h-3" />
            <span>Compare: {isCompareMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Density Toggle */}
          <button
            onClick={() => onDensityChange(density === 'comfortable' ? 'compact' : 'comfortable')}
            className="hidden sm:flex items-center gap-1 px-2 py-1 bg-zinc-900/90 text-zinc-300 border border-zinc-800 rounded hover:text-white cursor-pointer"
            title="Toggle UI Spacing Density"
          >
            <span className="text-zinc-400 text-[10px]">Density:</span>
            <span className="capitalize">{density}</span>
          </button>
        </div>

        {/* Right: Theme Toggle, Reset, Collapse */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme switcher */}
          <button
            onClick={() => onThemeChange(themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'system' : 'dark')}
            className="p-1.5 bg-zinc-900/90 border border-zinc-800 rounded text-zinc-300 hover:text-white cursor-pointer"
            title={`Theme: ${themeMode}`}
          >
            {themeMode === 'light' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : themeMode === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Monitor className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>

          {/* Reset Scenario */}
          <button
            onClick={onResetScenario}
            className="flex items-center gap-1 px-2 py-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded cursor-pointer transition-colors"
            title="Reset active scenario mutations back to initial seed"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Collapse */}
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
            title="Minimize toolbar"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
