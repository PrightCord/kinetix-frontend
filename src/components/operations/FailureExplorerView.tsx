import React, { useState } from 'react';
import { AlertOctagon, ChevronRight, Filter, ShieldAlert, AlertTriangle, RefreshCw, Server, Users, ArrowRight } from 'lucide-react';
import { FAILURE_CATEGORIES, FailureCategory } from '../../demo/operationalData';

interface FailureExplorerViewProps {
  onInspectTrace?: (requestId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const FailureExplorerView: React.FC<FailureExplorerViewProps> = ({
  onInspectTrace,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FailureCategory>(FAILURE_CATEGORIES[0]);
  const [filterQuery, setFilterQuery] = useState('');

  const filteredCategories = FAILURE_CATEGORIES.filter((c) =>
    c.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const totalFailures = FAILURE_CATEGORIES.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Header */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center font-bold">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-[var(--ink)]">
                Failure Explorer &amp; Terminal Outcome Classifier
              </h2>
              <p className="text-xs text-[var(--ink)]/60 font-mono">
                Classifies upstream rejection and gateway failure semantics beyond generic 500 errors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--ink)]/60">Total Captured Outliers:</span>
            <span className="px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-xs">
              {totalFailures} terminal events
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Categories Tree vs Drilldown Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Terminal Outcome Tree */}
        <div className="lg:col-span-5 bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
          <div className="border-b-2 border-[var(--erased)] pb-3 mb-3 flex items-center justify-between">
            <h3 className="font-heading font-bold text-xs uppercase text-[var(--ink)] tracking-wider">
              Terminal Outcome Class
            </h3>
            <span className="text-[11px] text-[var(--ink)]/60">Click class to drill down</span>
          </div>

          {/* Quick Search */}
          <div className="mb-3">
            <label htmlFor="failure-search" className="sr-only">Search terminal outcomes</label>
            <div className="relative">
              <input
                id="failure-search"
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search outcomes (e.g. rate, quota, 500)..."
                className="w-full pl-3 pr-8 py-1.5 rounded-lg border-2 border-[var(--erased)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:border-[var(--ink)] outline-none"
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1.5 text-xs text-[var(--ink)]/50 hover:text-[var(--ink)] font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {filteredCategories.map((cat, idx) => {
              const isSelected = selectedCategory.id === cat.id;
              const isLast = idx === filteredCategories.length - 1;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left p-3 rounded-lg border-2 text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[var(--marker-red)] bg-[var(--tint-red)] text-[var(--ink)] shadow-sm'
                      : 'border-[var(--erased)] hover:border-[var(--ink)]/40 bg-[var(--paper)] text-[var(--ink)]/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[var(--ink)]/40 font-bold">{isLast ? '└──' : '├──'}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span className="font-bold">{cat.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--erased)]">
                      {cat.count}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--ink)]/40" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Drilldown Detail Panel */}
        <div className="lg:col-span-7 bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-[var(--erased)] pb-3 mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  ></span>
                  <h3 className="font-heading font-bold text-base text-[var(--ink)]">
                    {selectedCategory.title} ({selectedCategory.count} occurrences)
                  </h3>
                </div>
                <p className="text-xs text-[var(--ink)]/65 mt-0.5">
                  {selectedCategory.description}
                </p>
              </div>
            </div>

            {/* Drilldown items */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase text-[var(--ink)]/70 tracking-wider">
                Upstream Provider Breakdown:
              </div>

              {selectedCategory.drilldown.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--ink)]">{item.provider}</span>
                      <span className="text-[10px] bg-[var(--erased)] px-1.5 py-0.5 rounded text-[var(--ink)]/60 font-mono">
                        account: {item.affectedAccount}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                      {item.count} events
                    </span>
                  </div>

                  <div className="p-2 bg-[var(--surface)] border border-[var(--erased)] rounded font-mono text-[11px] text-rose-700 dark:text-rose-300">
                    {item.recentError}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--ink)]/60 pt-1">
                    <span>Recent occurrence: {item.time}</span>
                    <button
                      onClick={() => onInspectTrace && onInspectTrace('req-01HX89Z2PA')}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      Inspect Trace →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--erased)] flex items-center justify-between text-xs text-[var(--ink)]/60">
            <span>Fallback recovery handled 96.4% of these without client errors</span>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('account-health')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                Review Cooldown Statuses →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
