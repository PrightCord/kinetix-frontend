import React, { useEffect, useState, useCallback } from 'react';
import App from '../App';
import { DesignId } from './types';
import { DESIGNS, getDesign } from './registry';
import { ScenarioId } from '../demo/types';
import { SCENARIOS } from '../demo/scenarios';
import { demoStore } from '../demo/backend/store';
import { LabToolbar } from './components/LabToolbar';
import { LabShell } from './LabShell';
import { ComparisonView } from './components/ComparisonView';
import { TerminalShell } from './designs/terminal/TerminalShell';
import { useTheme } from '../lib/theme';
import './designs.css';

function getInitialDesign(): DesignId {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const d = params.get('design') as DesignId;
    if (d && d in DESIGNS) return d;
    const stored = localStorage.getItem('kinetix_design') as DesignId;
    if (stored && stored in DESIGNS) return stored;
  }
  return 'current';
}

function getInitialScenario(): ScenarioId {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('scenario') as ScenarioId;
    if (s && s in SCENARIOS) return s;
    const stored = localStorage.getItem('kinetix_scenario') as ScenarioId;
    if (stored && stored in SCENARIOS) return stored;
  }
  return 'healthy';
}

function getInitialDensity(): 'comfortable' | 'compact' {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('kinetix_density');
    if (stored === 'compact') return 'compact';
  }
  return 'comfortable';
}

function isLabPath(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.pathname.startsWith('/lab');
  }
  return false;
}

export const Workbench: React.FC = () => {
  const [designId, setDesignId] = useState<DesignId>(getInitialDesign);
  const [scenarioId, setScenarioId] = useState<ScenarioId>(getInitialScenario);
  const [density, setDensity] = useState<'comfortable' | 'compact'>(getInitialDensity);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isLabActive, setIsLabActive] = useState(isLabPath);
  const { mode: themeMode, setTheme } = useTheme();

  // Apply design and density attributes to html root for instant hot-swapping
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-design', designId);
    root.setAttribute('data-density', density);
    localStorage.setItem('kinetix_design', designId);
  }, [designId, density]);

  // Sync scenario with demoStore
  useEffect(() => {
    demoStore.setScenario(scenarioId);
  }, [scenarioId]);

  // Listen to popstate for /lab route
  useEffect(() => {
    const handlePopState = () => {
      setIsLabActive(isLabPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleDesignChange = useCallback((id: DesignId) => {
    const valid = id in DESIGNS ? id : 'current';
    setDesignId(valid);
    const url = new URL(window.location.href);
    url.searchParams.set('design', valid);
    window.history.replaceState({}, '', url.toString());
  }, []);

  const handleScenarioChange = useCallback((id: ScenarioId) => {
    const valid = id in SCENARIOS ? id : 'healthy';
    setScenarioId(valid);
    demoStore.setScenario(valid);
    const url = new URL(window.location.href);
    url.searchParams.set('scenario', valid);
    window.history.replaceState({}, '', url.toString());
  }, []);

  const handleDensityChange = useCallback((d: 'comfortable' | 'compact') => {
    setDensity(d);
    localStorage.setItem('kinetix_density', d);
  }, []);

  const handleOpenLab = useCallback(() => {
    setIsLabActive(true);
    if (!window.location.pathname.startsWith('/lab')) {
      window.history.pushState({}, '', '/lab');
    }
  }, []);

  const handleExitLab = useCallback(() => {
    setIsLabActive(false);
    window.history.pushState({}, '', '/admin/keys');
  }, []);

  const handleResetScenario = useCallback(() => {
    demoStore.resetCurrentScenario();
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* View routing */}
      {isLabActive ? (
        <LabShell
          currentDesignId={designId}
          currentScenarioId={scenarioId}
          onDesignChange={handleDesignChange}
          onScenarioChange={handleScenarioChange}
          onExitLab={handleExitLab}
        />
      ) : isCompareMode ? (
        <ComparisonView
          experimentalDesignId={designId === 'current' ? 'flat' : designId}
          onSelectExperiment={handleDesignChange}
          onExitCompare={() => setIsCompareMode(false)}
        />
      ) : designId === 'terminal' ? (
        <TerminalShell
          onSwitchDesign={handleDesignChange}
          onSwitchScenario={handleScenarioChange}
        />
      ) : (
        <App />
      )}

      {/* Persistent Lab Toolbar */}
      <LabToolbar
        currentDesignId={designId}
        currentScenarioId={scenarioId}
        density={density}
        themeMode={themeMode}
        isCompareMode={isCompareMode}
        onDesignChange={handleDesignChange}
        onScenarioChange={handleScenarioChange}
        onDensityChange={handleDensityChange}
        onThemeChange={setTheme}
        onToggleCompare={() => setIsCompareMode((prev) => !prev)}
        onResetScenario={handleResetScenario}
        onOpenLab={handleOpenLab}
      />
    </div>
  );
};
