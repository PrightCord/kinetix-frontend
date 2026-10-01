import React, { useEffect } from 'react';
import { X, CheckCircle2, XCircle, ArrowUpRight, Zap, Clock, ShieldCheck, HelpCircle } from 'lucide-react';
import { TARGET_EXPLANATIONS, TargetExplanation } from '../../demo/operationalData';

interface WhyThisTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeName?: string;
  targetName?: string;
}

export const WhyThisTargetModal: React.FC<WhyThisTargetModalProps> = ({
  isOpen,
  onClose,
  routeName = 'sonnet',
  targetName,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const explanation: TargetExplanation = TARGET_EXPLANATIONS[routeName] || TARGET_EXPLANATIONS['sonnet'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="why-target-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--surface)] text-[var(--ink)] border-2 border-[var(--ink)] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative focus:outline-none"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[var(--erased)] bg-[var(--paper)] rounded-t-xl">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 id="why-target-title" className="font-heading font-bold text-lg">
                Why was this account selected?
              </h3>
              <p className="text-xs text-[var(--ink)]/60 font-mono">
                Route: <span className="font-bold text-[var(--ink)]">{explanation.routeName}</span> • Selected:{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{targetName || explanation.selectedTarget.account}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close explanation dialog"
            className="p-1.5 rounded-lg hover:bg-[var(--erased)] text-[var(--ink)]/70 hover:text-[var(--ink)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 font-mono text-sm">
          {/* Summary Box */}
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500/40 rounded-lg text-xs leading-relaxed">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1 text-sm font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Optimal Target Selection Criteria Met
            </div>
            <div className="text-[var(--ink)]/80">
              {explanation.selectedTarget.reason}
            </div>
          </div>

          {/* Counts Overview */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
              <div className="text-xs text-[var(--ink)]/60 font-sans">Eligible Targets Evaluated</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                {explanation.eligibleCount}
              </div>
            </div>
            <div className="p-3 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg">
              <div className="text-xs text-[var(--ink)]/60 font-sans">Filtered / Excluded</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                {explanation.excludedCount}
              </div>
            </div>
          </div>

          {/* Excluded Section */}
          <div>
            <div className="text-xs uppercase font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              Excluded from Candidate Pool ({explanation.excluded.length}):
            </div>
            <div className="space-y-2">
              {explanation.excluded.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg text-xs"
                >
                  <div className="font-bold text-rose-700 dark:text-rose-300">{item.target}</div>
                  <div className="text-[var(--ink)]/70 mt-0.5 flex items-center gap-1">
                    <span className="text-rose-600 font-bold">✗</span>
                    <span>{item.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranked Candidates */}
          <div>
            <div className="text-xs uppercase font-bold text-[var(--ink)]/70 mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-500" />
              Scored &amp; Ranked Target Pipeline:
            </div>
            <div className="space-y-2.5">
              {explanation.ranked.map((target) => (
                <div
                  key={target.rank}
                  className={`p-3.5 rounded-lg border-2 text-xs transition-all ${
                    target.selected
                      ? 'bg-[var(--paper)] border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-[var(--paper)] border-[var(--erased)] opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                          target.selected ? 'bg-emerald-500 text-white' : 'bg-[var(--erased)] text-[var(--ink)]'
                        }`}
                      >
                        {target.rank}
                      </span>
                      <span className="font-bold text-sm text-[var(--ink)]">{target.target}</span>
                      <span className="text-[10px] text-[var(--ink)]/60 bg-[var(--erased)] px-1.5 py-0.5 rounded">
                        {target.provider}
                      </span>
                    </div>
                    {target.selected && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold uppercase text-[10px]">
                        ✓ Selected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[var(--erased)] text-[11px] text-[var(--ink)]/70">
                    <div>
                      Concurrency:{' '}
                      <span className="font-bold text-[var(--ink)]">{target.concurrency}</span>
                    </div>
                    <div>
                      P50 TTFT:{' '}
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{target.ttftMs}ms</span>
                    </div>
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {target.details.map((detail, dIdx) => (
                      <span
                        key={dIdx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--erased)] text-[var(--ink)]/80"
                      >
                        • {detail}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t-2 border-[var(--erased)] bg-[var(--paper)] flex items-center justify-between text-xs text-[var(--ink)]/60 rounded-b-xl">
          <span>Ranking refreshed dynamically on each dispatch interval</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--ink)] text-[var(--paper)] font-bold hover:opacity-90 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
