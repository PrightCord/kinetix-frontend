import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowDown, Copy, Download, HelpCircle, Shield, Cpu, Zap, Activity, Check } from 'lucide-react';
import type { OperationalRequestTrace } from '../../demo/operationalData';

interface RequestTraceModalProps {
  trace: OperationalRequestTrace | null;
  isOpen: boolean;
  onClose: () => void;
  onExplainTarget?: (routeName: string, targetName: string) => void;
}

export const RequestTraceModal: React.FC<RequestTraceModalProps> = ({
  trace,
  isOpen,
  onClose,
  onExplainTarget,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !trace) return null;

  const copyTraceJson = () => {
    navigator.clipboard.writeText(JSON.stringify(trace, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTrace = () => {
    const blob = new Blob([JSON.stringify(trace, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kinetix-trace-${trace.requestId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trace-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--surface)] text-[var(--ink)] border-2 border-[var(--ink)] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative my-auto focus:outline-none"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[var(--erased)] bg-[var(--paper)] rounded-t-xl">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="trace-modal-title" className="font-heading font-bold text-lg">
                  Request Lifecycle Trace
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--erased)] font-bold text-[var(--ink)]">
                  {trace.requestId}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                  trace.finalOutcome.statusCode === 200 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'
                }`}>
                  {trace.finalOutcome.statusCode} OK
                </span>
              </div>
              <p className="text-xs text-[var(--ink)]/60 font-mono mt-0.5">
                Timestamp: {new Date(trace.timestamp).toLocaleTimeString()} • Client: {trace.client.name} ({trace.client.keyId})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyTraceJson}
              aria-label="Copy JSON trace"
              title="Copy JSON"
              className="p-1.5 rounded hover:bg-[var(--erased)] text-[var(--ink)]/70 hover:text-[var(--ink)] cursor-pointer flex items-center gap-1 text-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied && <span className="font-bold text-emerald-600">Copied</span>}
            </button>
            <button
              onClick={downloadTrace}
              aria-label="Download trace file"
              title="Download Trace"
              className="p-1.5 rounded hover:bg-[var(--erased)] text-[var(--ink)]/70 hover:text-[var(--ink)] cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg hover:bg-[var(--erased)] text-[var(--ink)]/70 hover:text-[var(--ink)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm">
          {/* Visual Lifecycle Pipeline */}
          <div className="bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg p-5 space-y-4">
            {/* Step 1: Client Admission */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--ink)]">{trace.client.name}</span>
                  <span className="text-xs text-[var(--ink)]/60">{trace.client.ip}</span>
                </div>
                <div className="text-xs text-[var(--ink)]/70 mt-0.5">
                  Virtual Key: <code className="font-bold">{trace.client.keyId}</code>
                </div>
              </div>
            </div>

            <div className="flex justify-center my-0 text-[var(--ink)]/40">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 2: Route Resolution */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    route: {trace.route.name}
                  </span>
                  <span className="text-xs uppercase bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                    strategy: {trace.route.strategy}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center my-0 text-[var(--ink)]/40">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 3: Capability Filtering */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div className="flex-1">
                <div className="font-bold text-[var(--ink)]">capability filtering</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>streaming</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>tools support</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>reasoning ({trace.capabilities.reasoning})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>vision ({trace.capabilities.vision ? 'yes' : 'no'})</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center my-0 text-[var(--ink)]/40">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 4: Eligible Accounts */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--ink)]">{trace.eligibleAccountsCount} eligible accounts</span>
                  {onExplainTarget && (
                    <button
                      onClick={() => onExplainTarget(trace.route.name, trace.primaryAttempt.account)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Why this target?
                    </button>
                  )}
                </div>
                {trace.excludedAccounts.length > 0 && (
                  <div className="mt-1 text-xs text-[var(--ink)]/60 space-y-0.5">
                    {trace.excludedAccounts.map((ex, i) => (
                      <div key={i} className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <span>✗</span>
                        <span>{ex.name} ({ex.reason})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center my-0 text-[var(--ink)]/40">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 5: Sticky Affinity */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 flex items-center justify-center font-bold text-xs shrink-0">
                5
              </div>
              <div className="flex-1">
                <div className="font-bold text-[var(--ink)]">sticky cache affinity</div>
                <div className="text-xs text-cyan-700 dark:text-cyan-300 mt-0.5">
                  → account <span className="font-bold">{trace.stickyAffinity.targetAccount}</span>
                  {trace.stickyAffinity.cacheTokensReused ? (
                    <span className="ml-2 text-emerald-600 font-bold">
                      (hot prompt cache: {trace.stickyAffinity.cacheTokensReused.toLocaleString()} tokens reused)
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex justify-center my-0 text-[var(--ink)]/40">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 6: Admission Control */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                6
              </div>
              <div className="flex-1">
                <div className="font-bold text-[var(--ink)]">admission control</div>
                <div className="text-xs text-[var(--ink)]/70 mt-0.5">
                  active concurrency: <span className="font-bold text-[var(--ink)]">{trace.admission.activeConcurrency}</span> / limit:{' '}
                  <span className="font-bold text-[var(--ink)]">{trace.admission.maxLimit}</span> (queue: {trace.admission.queueTimeMs}ms)
                </div>
              </div>
            </div>

            <div className="flex justify-center my-0 text-[var(--ink)]/40">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 7: Upstream Request */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                7
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--ink)]">upstream dispatch: {trace.primaryAttempt.model}</span>
                  <span className="text-xs text-[var(--ink)]/60">{trace.primaryAttempt.provider}</span>
                </div>
                <div className="text-xs text-[var(--ink)]/70 mt-1 bg-[var(--erased)]/50 p-2 rounded">
                  <div>Reasoning translation: <span className="font-bold">{trace.primaryAttempt.reasoningTranslation.from} → {trace.primaryAttempt.reasoningTranslation.to}</span></div>
                  <pre className="text-[11px] text-[var(--ink)]/80 mt-1 font-mono">
                    {JSON.stringify(trace.primaryAttempt.reasoningTranslation.wirePayload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 8 & 9: Fallback if triggered */}
            {trace.fallbackCascade && (
              <>
                <div className="flex justify-center my-0 text-amber-500">
                  <ArrowDown className="w-4 h-4" />
                </div>

                <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded border border-amber-300 dark:border-amber-800">
                  <div className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-xs shrink-0">
                    !
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-amber-900 dark:text-amber-200">
                      <span className="font-bold">429 rate_limit exceeded</span>
                      <span className="text-xs font-mono">{trace.primaryAttempt.latencyMs}ms</span>
                    </div>
                    <div className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                      Fallback transition triggered: hop to <span className="font-bold">{trace.fallbackCascade.targetAccount}</span> ({trace.fallbackCascade.targetProvider})
                    </div>
                  </div>
                </div>

                <div className="flex justify-center my-0 text-emerald-500">
                  <ArrowDown className="w-4 h-4" />
                </div>

                <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded border border-emerald-300 dark:border-emerald-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200">
                      <span className="font-bold">Fallback Success: {trace.fallbackCascade.targetModel}</span>
                      <span className="text-xs font-mono">{trace.fallbackCascade.statusCode} OK ({trace.fallbackCascade.latencyMs}ms)</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Metrics Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="p-3 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
              <div className="text-xs text-[var(--ink)]/60 font-sans">TTFT</div>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {trace.finalOutcome.ttftMs} ms
              </div>
            </div>
            <div className="p-3 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
              <div className="text-xs text-[var(--ink)]/60 font-sans">Total Duration</div>
              <div className="text-lg font-bold font-mono text-[var(--ink)] mt-0.5">
                {(trace.finalOutcome.totalDurationMs / 1000).toFixed(1)} s
              </div>
            </div>
            <div className="p-3 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
              <div className="text-xs text-[var(--ink)]/60 font-sans">Input Tokens</div>
              <div className="text-lg font-bold font-mono text-[var(--ink)] mt-0.5">
                {trace.finalOutcome.inputTokens.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
              <div className="text-xs text-[var(--ink)]/60 font-sans">Cached Tokens</div>
              <div className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                {trace.finalOutcome.cachedTokens.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
              <div className="text-xs text-[var(--ink)]/60 font-sans">Output Tokens</div>
              <div className="text-lg font-bold font-mono text-[var(--ink)] mt-0.5">
                {trace.finalOutcome.outputTokens.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t-2 border-[var(--erased)] bg-[var(--paper)] flex items-center justify-between text-xs text-[var(--ink)]/60 rounded-b-xl">
          <span>Cost: ${(trace.finalOutcome.costUsd).toFixed(4)} USD • Total Tokens: {trace.finalOutcome.totalTokens.toLocaleString()}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--ink)] text-[var(--paper)] font-bold hover:opacity-90 cursor-pointer"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
