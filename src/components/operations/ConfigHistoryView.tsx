import React, { useState, useEffect } from 'react';
import { History, RotateCcw, FileText, Check, X, ArrowRight, ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';
import { CONFIG_HISTORY_ENTRIES, ConfigHistoryEntry } from '../../demo/operationalData';

export const ConfigHistoryView: React.FC = () => {
  const [entries, setEntries] = useState<ConfigHistoryEntry[]>(CONFIG_HISTORY_ENTRIES);
  const [selectedDiff, setSelectedDiff] = useState<ConfigHistoryEntry | null>(null);
  const [restoredId, setRestoredId] = useState<string | null>(null);
  const [confirmEntry, setConfirmEntry] = useState<ConfigHistoryEntry | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDiff && !confirmEntry) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDiff(null);
        setConfirmEntry(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDiff, confirmEntry]);

  const executeRestore = () => {
    if (!confirmEntry) return;
    const entry = confirmEntry;
    setConfirmEntry(null);
    setRestoredId(entry.id);
    setTimeout(() => {
      setNotification(`Configuration successfully rolled back to snapshot: ${entry.id}!`);
      setRestoredId(null);
      setTimeout(() => setNotification(null), 4000);
    }, 400);
  };

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Header */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-[var(--ink)]">
                Configuration History &amp; Point-in-Time Rollback
              </h2>
              <p className="text-xs text-[var(--ink)]/60 font-mono">
                Audit every route update, plugin bump, credential refresh, and discovery modification with one-click diff inspection and rollback
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-lg text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between animate-fade-in text-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="cursor-pointer font-bold">✕</button>
        </div>
      )}

      {/* History Log */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch space-y-3 font-mono"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--erased)] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--ink)]/70 bg-[var(--erased)] px-2 py-0.5 rounded uppercase">
                  {entry.category}
                </span>
                <span className="font-bold text-base text-[var(--ink)]">{entry.summary}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--ink)]/60">
                  {new Date(entry.timestamp).toLocaleTimeString()} • Operator: <span className="font-bold text-[var(--ink)]">{entry.operator}</span>
                </span>
                <button
                  onClick={() => setSelectedDiff(entry)}
                  className="px-2.5 py-1 rounded border border-[var(--erased)] hover:bg-[var(--paper)] text-xs font-bold flex items-center gap-1 cursor-pointer text-blue-600 dark:text-blue-400"
                >
                  <FileText className="w-3.5 h-3.5" /> View Diff
                </button>
                <button
                  onClick={() => setConfirmEntry(entry)}
                  disabled={restoredId === entry.id}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${restoredId === entry.id ? 'animate-spin' : ''}`} /> Restore
                </button>
              </div>
            </div>

            {/* Diff Preview Lines */}
            <div className="space-y-1.5 pt-1 text-xs">
              {entry.diff.map((d, dIdx) => (
                <div
                  key={dIdx}
                  className="p-2 bg-[var(--paper)] border border-[var(--erased)] rounded flex items-center justify-between font-mono"
                >
                  <span className="font-bold text-[var(--ink)]">{d.field}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-600 line-through">{String(d.before)}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--ink)]/40" />
                    <span className="text-emerald-600 font-bold">{String(d.after)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmEntry && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmEntry(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-mono text-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--surface)] text-[var(--ink)] border-2 border-[var(--ink)] rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-lg font-sans">Confirm Snapshot Rollback</h3>
                <p className="text-xs text-[var(--ink)]/60">
                  {new Date(confirmEntry.timestamp).toLocaleTimeString()} ({confirmEntry.target})
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--ink)]/80 leading-relaxed">
              Are you sure you want to restore configuration state from snapshot{' '}
              <code className="font-bold text-[var(--ink)]">{confirmEntry.id}</code>?
              Active routing and policies will immediately revert to this state.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmEntry(null)}
                className="px-4 py-1.5 rounded-lg border-2 border-[var(--erased)] text-xs font-bold hover:bg-[var(--paper)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeRestore}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Confirm Rollback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diff Modal */}
      {selectedDiff && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="diff-modal-title"
          onClick={() => setSelectedDiff(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-mono text-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--surface)] text-[var(--ink)] border-2 border-[var(--ink)] rounded-xl w-full max-w-lg shadow-2xl p-5 space-y-4 focus:outline-none"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between border-b-2 border-[var(--erased)] pb-3">
              <div>
                <h3 id="diff-modal-title" className="font-heading font-bold text-base font-sans">
                  Configuration Diff
                </h3>
                <p className="text-xs text-[var(--ink)]/60">{selectedDiff.summary}</p>
              </div>
              <button
                onClick={() => setSelectedDiff(null)}
                aria-label="Close diff modal"
                className="p-1 rounded hover:bg-[var(--erased)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-black/90 text-emerald-400 rounded font-mono text-xs overflow-x-auto max-h-72">
              <pre>{JSON.stringify(selectedDiff.snapshot, null, 2)}</pre>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-[var(--ink)]/60">Snapshot verified against persistence WAL</span>
              <button
                onClick={() => setSelectedDiff(null)}
                className="px-4 py-1.5 rounded-lg bg-[var(--ink)] text-[var(--paper)] font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
