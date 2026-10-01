import React, { useState } from 'react';
import { ShieldCheck, Clock, RefreshCw, AlertTriangle, CheckCircle2, RotateCw, Lock, Zap, Server } from 'lucide-react';
import { ACCOUNT_HEALTH_ITEMS, AccountHealthItem } from '../../demo/operationalData';

interface AccountHealthViewProps {
  onRefresh?: () => void;
}

export const AccountHealthView: React.FC<AccountHealthViewProps> = ({ onRefresh }) => {
  const [items, setItems] = useState<AccountHealthItem[]>(ACCOUNT_HEALTH_ITEMS);
  const [actingId, setActingId] = useState<string | null>(null);

  const handleClearCooldown = (id: string) => {
    setActingId(id);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: 'healthy', cooldownRemainingSec: undefined, recentFailures: 0 }
            : item
        )
      );
      setActingId(null);
    }, 400);
  };

  const handleRotateCredential = (id: string) => {
    setActingId(id);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                rotationCount: item.rotationCount + 1,
                lastRotated: new Date().toISOString(),
                tokenValid: true,
              }
            : item
        )
      );
      setActingId(null);
    }, 400);
  };

  const coolingCount = items.filter((i) => i.status === 'cooldown').length;
  const healthyCount = items.filter((i) => i.status === 'healthy').length;

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Header */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-[var(--ink)]">
                Upstream Account &amp; Credential Health
              </h2>
              <p className="text-xs text-[var(--ink)]/60 font-mono">
                Live monitoring of OAuth token lifecycles, active cooldown countdowns, and concurrency limits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {healthyCount} Active / Healthy
            </div>
            {coolingCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                {coolingCount} In Cooldown
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((acc) => {
          const isCooldown = acc.status === 'cooldown';
          const isDegraded = acc.status === 'degraded';
          const isHealthy = acc.status === 'healthy';

          return (
            <div
              key={acc.id}
              className={`bg-[var(--surface)] border-2 rounded-xl p-5 shadow-sketch flex flex-col justify-between transition-all ${
                isCooldown
                  ? 'border-amber-500 ring-2 ring-amber-500/20'
                  : isDegraded
                  ? 'border-purple-500'
                  : 'border-[var(--ink)]'
              }`}
            >
              <div>
                {/* Card Title & Status Badge */}
                <div className="flex items-start justify-between gap-2 border-b-2 border-[var(--erased)] pb-3 mb-3">
                  <div>
                    <h3 className="font-heading font-bold text-base text-[var(--ink)]">
                      {acc.label}
                    </h3>
                    <div className="text-[11px] text-[var(--ink)]/60 font-mono mt-0.5">
                      {acc.provider} • <span className="uppercase">{acc.authType}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                      isHealthy
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isCooldown
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {isHealthy && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {isCooldown && <Clock className="w-3 h-3 text-amber-600 animate-spin" />}
                    {acc.status}
                  </span>
                </div>

                {/* Cooldown Timer Alert if cooling */}
                {isCooldown && acc.cooldownRemainingSec && (
                  <div className="p-2.5 mb-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-center justify-between font-bold">
                      <span>Cooldown active:</span>
                      <span className="font-mono bg-amber-200 dark:bg-amber-900/80 px-1.5 py-0.5 rounded text-[11px]">
                        04:14 remaining
                      </span>
                    </div>
                    <div className="text-[11px] mt-1 text-amber-800 dark:text-amber-300">
                      {acc.lastFailureMessage}
                    </div>
                  </div>
                )}

                {/* Metrics detail lines */}
                <div className="space-y-2 text-xs">
                  {/* Concurrency slots */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--ink)]/70 mb-1">
                      <span>In-Flight Concurrency:</span>
                      <span className="font-bold font-mono">
                        {acc.concurrency.active} / {acc.concurrency.max} slots
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--erased)] overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{
                          width: `${(acc.concurrency.active / acc.concurrency.max) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--erased)] space-y-1 text-[11px] text-[var(--ink)]/70">
                    <div className="flex justify-between">
                      <span>OAuth Token State:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Valid &amp; Authorized</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rotation Cycles:</span>
                      <span className="font-mono">{acc.rotationCount} rotations</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recent Rejections:</span>
                      <span className={`font-mono ${acc.recentFailures > 0 ? 'text-rose-600 font-bold' : ''}`}>
                        {acc.recentFailures} failures
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t-2 border-[var(--erased)] mt-4 flex items-center justify-between gap-2">
                {isCooldown ? (
                  <button
                    onClick={() => handleClearCooldown(acc.id)}
                    disabled={actingId === acc.id}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${actingId === acc.id ? 'animate-spin' : ''}`} />
                    Clear Cooldown
                  </button>
                ) : (
                  <button
                    onClick={() => handleRotateCredential(acc.id)}
                    disabled={actingId === acc.id}
                    className="flex-1 py-1.5 px-2 rounded-lg border-2 border-[var(--erased)] hover:bg-[var(--paper)] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer text-[var(--ink)]/80"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${actingId === acc.id ? 'animate-spin' : ''}`} />
                    Rotate Token
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
