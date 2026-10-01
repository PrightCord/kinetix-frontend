import React, { useState, useEffect } from 'react';
import { X, Bug, Download, Play, Square, Clock, CheckSquare, Square as EmptySquare, AlertCircle } from 'lucide-react';

interface DebugModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUntil: number | null;
  onActivate: (durationMinutes: number, options: Record<string, boolean>) => void;
  onDeactivate: () => void;
}

export const DebugModeModal: React.FC<DebugModeModalProps> = ({
  isOpen,
  onClose,
  activeUntil,
  onActivate,
  onDeactivate,
}) => {
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [options, setOptions] = useState({
    routingDecisions: true,
    capabilityFiltering: true,
    reasoningTranslation: true,
    fallbackDecisions: true,
    credentialSelection: true,
    timingBreakdown: true,
    payloadMetadata: false,
    requestBodies: false,
  });

  const [remainingSec, setRemainingSec] = useState<number>(0);

  useEffect(() => {
    if (!activeUntil) {
      setRemainingSec(0);
      return;
    }
    const update = () => {
      const diff = Math.max(0, Math.floor((activeUntil - Date.now()) / 1000));
      setRemainingSec(diff);
      if (diff <= 0) {
        onDeactivate();
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeUntil, onDeactivate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadBundle = () => {
    const bundle = {
      exportedAt: new Date().toISOString(),
      debugConfig: options,
      activeUntil: activeUntil ? new Date(activeUntil).toISOString() : null,
      tracesCaptured: 12,
      logSnippets: [
        '[14:22:10] Admission check passed for vk_prod_pi_9918 (concurrency: 2/4)',
        '[14:22:11] Target selected: claude-oauth-2 (sticky cache hit)',
        '[14:22:11] Reasoning normalized: high -> thinking { type: "adaptive" }',
        '[14:22:12] Upstream 429 received from Anthropic endpoint',
        '[14:22:12] Cascade fallback initiated: target account claude-oauth-3',
        '[14:22:15] Completed with 200 OK (latency: 3860ms, tokens: 20,242)',
      ],
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kinetix-debug-trace-bundle-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isRunning = Boolean(activeUntil && remainingSec > 0);

  const formatRemaining = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="debug-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-mono text-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--surface)] text-[var(--ink)] border-2 border-[var(--ink)] rounded-xl w-full max-w-lg shadow-2xl relative flex flex-col focus:outline-none"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[var(--erased)] bg-[var(--paper)] rounded-t-xl">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-amber-500" />
            <div>
              <h3 id="debug-modal-title" className="font-heading font-bold text-lg font-sans">
                Enhanced Operational Debug Mode
              </h3>
              <p className="text-xs text-[var(--ink)]/60">
                Temporary capture of low-level routing, translation, and fallback traces
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close debug mode dialog"
            className="p-1.5 rounded-lg hover:bg-[var(--erased)] text-[var(--ink)]/70 hover:text-[var(--ink)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isRunning ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 rounded-lg text-amber-900 dark:text-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                  Debug Mode Active
                </span>
                <span className="text-lg font-bold font-mono bg-amber-200 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                  {formatRemaining(remainingSec)}
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Enhanced trace capture is running. Kinetix will automatically revert to standard operational logging when the timer expires.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={onDeactivate}
                  className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" /> Stop Capture Early
                </button>
                <button
                  onClick={handleDownloadBundle}
                  className="px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Trace Bundle
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Duration selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--ink)]/70 mb-1.5 font-sans">
                  Debug Kinetix For
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 15, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2 px-3 rounded-lg border-2 font-bold text-xs cursor-pointer transition-all ${
                        durationMinutes === mins
                          ? 'border-[var(--marker-red)] bg-[var(--tint-red)] text-[var(--ink)]'
                          : 'border-[var(--erased)] hover:border-[var(--ink)]/40 bg-[var(--paper)]'
                      }`}
                    >
                      {mins} minutes
                    </button>
                  ))}
                </div>
              </div>

              {/* Capture Options Checkboxes */}
              <div>
                <div className="text-xs font-bold uppercase text-[var(--ink)]/70 mb-2 font-sans">
                  Capture Pipeline Artifacts:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'routingDecisions', label: 'Routing decisions' },
                    { key: 'capabilityFiltering', label: 'Capability filtering' },
                    { key: 'reasoningTranslation', label: 'Reasoning translation' },
                    { key: 'fallbackDecisions', label: 'Fallback decisions' },
                    { key: 'credentialSelection', label: 'Credential selection' },
                    { key: 'timingBreakdown', label: 'Timing breakdown' },
                    { key: 'payloadMetadata', label: 'Payload metadata' },
                    { key: 'requestBodies', label: 'Request bodies' },
                  ].map(({ key, label }) => {
                    const active = options[key as keyof typeof options];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleOption(key as keyof typeof options)}
                        className="flex items-center gap-2 text-left p-2 rounded border border-[var(--erased)] hover:bg-[var(--paper)] cursor-pointer"
                      >
                        {active ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <EmptySquare className="w-4 h-4 text-[var(--ink)]/40 shrink-0" />
                        )}
                        <span className={active ? 'font-bold text-[var(--ink)]' : 'text-[var(--ink)]/60'}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  Once stopped or timed out, a single self-contained trace bundle can be exported and shared for immediate debugging without combing through separate logs.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-[var(--erased)] bg-[var(--paper)] flex items-center justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border-2 border-[var(--erased)] font-bold text-xs hover:bg-[var(--surface)] cursor-pointer"
          >
            Cancel
          </button>
          {!isRunning && (
            <button
              onClick={() => onActivate(durationMinutes, options)}
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Play className="w-4 h-4" /> Start Enhanced Debug Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
