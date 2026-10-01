import React, { useState } from 'react';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle2, RotateCw, Filter, Shield } from 'lucide-react';
import { INCIDENT_EVENTS, IncidentEvent } from '../../demo/operationalData';

export const IncidentTimelineView: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [events, setEvents] = useState<IncidentEvent[]>(INCIDENT_EVENTS);

  const filtered = events.filter((e) => {
    if (filterSeverity !== 'all' && e.severity !== filterSeverity) return false;
    return true;
  });

  const handleResolve = (id: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, resolved: true, resolvedAt: new Date().toISOString() }
          : e
      )
    );
  };

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Header */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-[var(--ink)]">
                Operational Incident &amp; Disruption Timeline
              </h2>
              <p className="text-xs text-[var(--ink)]/60 font-mono">
                Log of credential failures, provider outages, fallback storms, cooldown triggers, and plugin restarts
              </p>
            </div>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-[var(--ink)]/60 font-sans">Filter:</span>
            {['all', 'critical', 'warning', 'info'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`py-1 px-2.5 rounded-lg border text-xs font-bold uppercase cursor-pointer transition-all ${
                  filterSeverity === sev
                    ? 'border-[var(--marker-red)] bg-[var(--tint-red)] text-[var(--ink)]'
                    : 'border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)]/70 hover:bg-[var(--erased)]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const isCritical = item.severity === 'critical';
          const isWarning = item.severity === 'warning';

          return (
            <div
              key={item.id}
              className={`bg-[var(--surface)] border-2 rounded-xl p-5 shadow-sketch space-y-3 font-mono transition-all ${
                !item.resolved
                  ? isCritical
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : isWarning
                    ? 'border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-[var(--ink)]'
                  : 'border-[var(--erased)] opacity-85'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--erased)] pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                  ></span>
                  <span className="font-bold text-base text-[var(--ink)]">{item.title}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--erased)] text-[var(--ink)]/70">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--ink)]/60 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  {item.resolved ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolve(item.id)}
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-emerald-100 hover:text-emerald-800 cursor-pointer transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-[var(--ink)]/80 leading-relaxed">
                {item.details}
              </div>

              <div className="pt-2 border-t border-[var(--erased)] flex items-center justify-between text-[11px] text-[var(--ink)]/60">
                <span>Target: <code className="font-bold text-[var(--ink)]">{item.affectedTarget}</code></span>
                {item.resolvedAt && <span>Resolved at {new Date(item.resolvedAt).toLocaleTimeString()}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
