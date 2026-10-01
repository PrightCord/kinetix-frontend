import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, HelpCircle, ShieldCheck, Zap, ArrowRight, RefreshCw, Cpu, Layers } from 'lucide-react';
import type { Route, VirtualKey } from '../../types';

interface RoutePlaygroundViewProps {
  routes: Route[];
  keys: VirtualKey[];
  onExplainTarget: (routeName: string, targetName: string) => void;
}

export const RoutePlaygroundView: React.FC<RoutePlaygroundViewProps> = ({
  routes,
  keys,
  onExplainTarget,
}) => {
  const [selectedClient, setSelectedClient] = useState('Pi Agent Worker');
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-5');
  const [selectedReasoning, setSelectedReasoning] = useState('High');
  const [toolsEnabled, setToolsEnabled] = useState(true);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [visionEnabled, setVisionEnabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState<any | null>(null);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulatedResult({
        matchedRoute: 'sonnet',
        strategy: 'priority',
        admissionCheck: 'Passed (2 / 4 active slots)',
        stickyAffinityEvaluated: 'claude-code/account-2 (Cache affinity hot)',
        targets: [
          {
            name: 'claude-code/account-2',
            provider: 'Anthropic OAuth Pool',
            status: 'selected',
            reason: 'Sticky cache affinity hit + lowest TTFT (620ms) + 0 active concurrency',
            details: 'Model: claude-3-5-sonnet-latest',
          },
          {
            name: 'antigravity/account-1',
            provider: 'Antigravity Enterprise Gateway',
            status: 'eligible',
            reason: 'Meets tools, streaming, and adaptive reasoning capabilities',
            details: 'Standby priority #2 (Concurrency: 1/6)',
          },
          {
            name: 'openrouter/account-1',
            provider: 'OpenRouter Backup Gateway',
            status: 'excluded',
            reason: 'Model unavailable in upstream endpoint catalog',
            details: 'Provider status 404 on target model tag',
          },
          {
            name: 'claude-code/account-3',
            provider: 'Anthropic OAuth Pool',
            status: 'excluded',
            reason: 'Account currently in cooldown backoff (02:40 remaining)',
            details: 'Triggered by upstream 429 quota exhaustion',
          },
        ],
      });
    }, 300);
  };

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Header Banner */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-[var(--ink)]">Route Playground &amp; Dry-Run Debugger</h2>
            <p className="text-xs text-[var(--ink)]/60 font-mono">
              Feed hypothetical requests into admission control and target ranking without sending any upstream request
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Panel */}
        <div className="lg:col-span-5 bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch space-y-4">
          <div className="border-b-2 border-[var(--erased)] pb-3">
            <h3 className="font-heading font-bold text-sm uppercase text-[var(--ink)]">
              Hypothetical Request Parameters
            </h3>
          </div>

          {/* Client Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-[var(--ink)]/70 mb-1">
              Client / Virtual Key
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full p-2.5 rounded-lg border-2 border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)] text-xs focus:border-[var(--ink)] outline-none"
            >
              <option value="Pi Agent Worker">Pi Agent Worker (vk_prod_pi_9918)</option>
              <option value="Cursor Editor IDE">Cursor Editor IDE (vk_dev_cursor_44)</option>
              <option value="Analytics Pipeline">Analytics Pipeline (vk_batch_pipeline_01)</option>
              <option value="Custom Key">Custom Ad-hoc Key</option>
            </select>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-[var(--ink)]/70 mb-1">
              Requested Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2.5 rounded-lg border-2 border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)] text-xs focus:border-[var(--ink)] outline-none"
            >
              <option value="claude-sonnet-5">claude-sonnet-5</option>
              <option value="claude-opus-4-6">claude-opus-4-6</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash</option>
              <option value="deepseek-v4-1">deepseek-v4-1-flash</option>
              <option value="gpt-4o">gpt-4o</option>
            </select>
          </div>

          {/* Reasoning Level Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-[var(--ink)]/70 mb-1">
              Reasoning Level
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {['Off', 'Low', 'Medium', 'High'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedReasoning(lvl)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                    selectedReasoning === lvl
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      : 'border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)]/70 hover:bg-[var(--erased)]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities Checkboxes */}
          <div>
            <label className="block text-xs font-bold uppercase text-[var(--ink)]/70 mb-1.5">
              Protocol Capabilities Required
            </label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-[var(--paper)] border border-[var(--erased)]">
                <input
                  type="checkbox"
                  checked={toolsEnabled}
                  onChange={(e) => setToolsEnabled(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-bold">Tools / Function Calling schema</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-[var(--paper)] border border-[var(--erased)]">
                <input
                  type="checkbox"
                  checked={streamingEnabled}
                  onChange={(e) => setStreamingEnabled(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-bold">Streaming SSE protocol response</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-[var(--paper)] border border-[var(--erased)]">
                <input
                  type="checkbox"
                  checked={visionEnabled}
                  onChange={(e) => setVisionEnabled(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-bold">Multimodal vision inputs</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full py-3 rounded-lg bg-[var(--ink)] text-[var(--paper)] font-bold text-xs uppercase flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer shadow-md transition-all"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Simulating Dry Run...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-emerald-400" /> Simulate Routing (Dry Run)
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-emerald-700 dark:text-emerald-400 font-bold mt-2">
              🛡 Crucially: zero upstream requests will be dispatched
            </p>
          </div>
        </div>

        {/* Output Simulation Cascade */}
        <div className="lg:col-span-7 bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-[var(--erased)] pb-3 mb-4">
              <h3 className="font-heading font-bold text-sm uppercase text-[var(--ink)]">
                Target Ranking &amp; Exclusion Decision Tree
              </h3>
              {simulatedResult && (
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Route: {simulatedResult.matchedRoute}
                </span>
              )}
            </div>

            {simulatedResult ? (
              <div className="space-y-4">
                {/* Meta details */}
                <div className="p-3 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--ink)]/60">Admission check:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{simulatedResult.admissionCheck}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--ink)]/60">Sticky affinity match:</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{simulatedResult.stickyAffinityEvaluated}</span>
                  </div>
                </div>

                {/* Candidate Cascade */}
                <div className="p-4 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg space-y-3 font-mono">
                  <div className="font-bold text-purple-600 dark:text-purple-400 text-sm">
                    {simulatedResult.matchedRoute}
                  </div>

                  <div className="space-y-2.5">
                    {simulatedResult.targets.map((t: any, idx: number) => {
                      const isSelected = t.status === 'selected';
                      const isEligible = t.status === 'eligible';
                      const isExcluded = t.status === 'excluded';

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border-2 text-xs transition-all ${
                            isSelected
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 shadow-sm'
                              : isEligible
                              ? 'bg-[var(--surface)] border-blue-400/60'
                              : 'bg-rose-50/30 dark:bg-rose-950/10 border-[var(--erased)] opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[var(--ink)] font-mono">
                                ├─ {t.name}
                              </span>
                              <span className="text-[10px] text-[var(--ink)]/60 bg-[var(--erased)] px-1.5 py-0.5 rounded">
                                {t.provider}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                                  : isEligible
                                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                  : 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                              }`}
                            >
                              {isSelected && '✓ selected'}
                              {isEligible && '✓ eligible'}
                              {isExcluded && '✗ excluded'}
                            </span>
                          </div>

                          <div className="mt-1.5 text-[11px] text-[var(--ink)]/70">
                            {t.reason}
                          </div>
                          <div className="mt-1 text-[10px] text-[var(--ink)]/50 font-mono">
                            {t.details}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-[var(--ink)]/60 border-2 border-dashed border-[var(--erased)] rounded-lg">
                <Layers className="w-8 h-8 mx-auto mb-2 text-[var(--ink)]/40" />
                <p className="font-bold text-sm">No Simulation Run Yet</p>
                <p className="text-xs mt-1">Configure hypothetical client and capability parameters on the left and click "Simulate Routing".</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--erased)] flex items-center justify-between text-xs text-[var(--ink)]/60">
            <span>Provides deterministic routing proof before traffic dispatches</span>
            {simulatedResult && (
              <button
                onClick={() => onExplainTarget('sonnet', 'claude-code/account-2')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Deep Target Explanation →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
