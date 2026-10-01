import React, { useState, useEffect } from 'react';
import { Table, Check, Minus, Info, X, ShieldCheck, Database, Layers } from 'lucide-react';
import { CAPABILITY_MATRIX_DATA, CapabilityMatrixRow } from '../../demo/operationalData';

export const CapabilityMatrixView: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<{
    model: CapabilityMatrixRow;
    capability: string;
    value: string;
  } | null>(null);

  useEffect(() => {
    if (!selectedCell) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCell(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell]);

  const handleCellClick = (model: CapabilityMatrixRow, capability: string, value: string) => {
    setSelectedCell({ model, capability, value });
  };

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Header */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-bold">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-[var(--ink)]">
                Upstream Provider Capability &amp; Provenance Matrix
              </h2>
              <p className="text-xs text-[var(--ink)]/60 font-mono">
                Cross-provider feature validation, reasoning support, and manifest declaration provenance
              </p>
            </div>
          </div>
          <span className="text-xs text-[var(--ink)]/60 font-mono">
            Click any capability cell to inspect provenance &amp; verification details
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl shadow-sketch overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b-2 border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)]/80 uppercase text-[11px] font-sans">
                <th className="p-3.5 pl-5">Model</th>
                <th className="p-3.5">Provider</th>
                <th className="p-3.5 text-center">Tools</th>
                <th className="p-3.5 text-center">Images</th>
                <th className="p-3.5">Reasoning</th>
                <th className="p-3.5">Levels</th>
                <th className="p-3.5 text-center">Streaming</th>
                <th className="p-3.5">Context</th>
                <th className="p-3.5 pr-5">Source / Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--erased)]">
              {CAPABILITY_MATRIX_DATA.map((row) => (
                <tr key={row.modelId} className="hover:bg-[var(--paper)]/60 transition-colors">
                  <td className="p-3.5 pl-5 font-bold text-[var(--ink)]">
                    <div>{row.displayName}</div>
                    <div className="text-[10px] text-[var(--ink)]/50 font-mono">{row.modelId}</div>
                  </td>
                  <td className="p-3.5 text-[var(--ink)]/70">{row.provider}</td>

                  {/* Tools */}
                  <td
                    onClick={() => handleCellClick(row, 'tools', row.tools ? 'Supported' : 'Unsupported')}
                    className="p-3.5 text-center cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                  >
                    {row.tools ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                        ✓
                      </span>
                    ) : (
                      <Minus className="w-4 h-4 mx-auto text-[var(--ink)]/40" />
                    )}
                  </td>

                  {/* Images */}
                  <td
                    onClick={() => handleCellClick(row, 'images', row.images ? 'Supported' : 'Unsupported')}
                    className="p-3.5 text-center cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                  >
                    {row.images ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="text-[var(--ink)]/40 font-bold">—</span>
                    )}
                  </td>

                  {/* Reasoning */}
                  <td
                    onClick={() => handleCellClick(row, 'reasoning', row.reasoning)}
                    className="p-3.5 cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
                  >
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        row.reasoning === 'Adaptive'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : row.reasoning === 'Budget'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : row.reasoning === 'Tiered'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-[var(--erased)] text-[var(--ink)]/60'
                      }`}
                    >
                      {row.reasoning}
                    </span>
                  </td>

                  {/* Levels */}
                  <td
                    onClick={() => handleCellClick(row, 'levels', row.reasoningLevels)}
                    className="p-3.5 text-[var(--ink)]/80 text-[11px] cursor-pointer"
                  >
                    {row.reasoningLevels}
                  </td>

                  {/* Streaming */}
                  <td
                    onClick={() => handleCellClick(row, 'streaming', row.streaming ? 'Supported' : 'Unsupported')}
                    className="p-3.5 text-center cursor-pointer"
                  >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      ✓
                    </span>
                  </td>

                  {/* Context */}
                  <td className="p-3.5 font-mono text-[var(--ink)]/80">{row.contextWindow}</td>

                  {/* Source */}
                  <td
                    onClick={() => handleCellClick(row, 'source', row.source)}
                    className="p-3.5 pr-5 cursor-pointer"
                  >
                    <span className="px-2 py-0.5 rounded bg-[var(--paper)] border border-[var(--erased)] font-bold text-[10px] uppercase text-[var(--ink)]/80 hover:border-blue-500">
                      {row.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provenance Detail Modal */}
      {selectedCell && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="capability-modal-title"
          onClick={() => setSelectedCell(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-mono text-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--surface)] text-[var(--ink)] border-2 border-[var(--ink)] rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4 focus:outline-none"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between border-b-2 border-[var(--erased)] pb-3">
              <div>
                <h3 id="capability-modal-title" className="font-heading font-bold text-base font-sans">
                  Capability Provenance
                </h3>
                <p className="text-xs text-[var(--ink)]/60">
                  {selectedCell.model.displayName} • {selectedCell.capability}
                </p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                aria-label="Close provenance details"
                className="p-1 rounded hover:bg-[var(--erased)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--ink)]/60">Capability:</span>
                <span className="font-bold text-[var(--ink)] uppercase">{selectedCell.capability}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink)]/60">Declared Value:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{selectedCell.value}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink)]/60">Source Origin:</span>
                <span className="font-bold text-[var(--ink)]">
                  {selectedCell.model.provenance.pluginId || selectedCell.model.source}
                </span>
              </div>
              {selectedCell.model.provenance.version && (
                <div className="flex justify-between">
                  <span className="text-[var(--ink)]/60">Plugin Version:</span>
                  <span className="font-mono">{selectedCell.model.provenance.version}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--ink)]/60">Manifest Reference:</span>
                <span className="font-mono text-[11px] text-[var(--ink)]/80">
                  {selectedCell.model.provenance.manifestRef}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink)]/60">Last Verified Date:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {selectedCell.model.provenance.lastVerified}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink)]/60">Probe Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  {selectedCell.model.provenance.probeStatus}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-1.5 rounded-lg bg-[var(--ink)] text-[var(--paper)] font-bold text-xs cursor-pointer hover:opacity-90"
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
