import React, { useState } from 'react';
import { DollarSign, BarChart3, PieChart, Layers, Download, Calendar } from 'lucide-react';
import type { RequestLog, VirtualKey, Route } from '../../types';

interface CostExplorerViewProps {
  requests: RequestLog[];
  keys: VirtualKey[];
  routes: Route[];
}

export const CostExplorerView: React.FC<CostExplorerViewProps> = ({
  requests,
  keys,
  routes,
}) => {
  const [groupBy, setGroupBy] = useState<'route' | 'model' | 'account' | 'client'>('route');

  // Realistic mock spend totals and breakdown
  const breakdownData = [
    {
      name: groupBy === 'route' ? 'sonnet' : groupBy === 'model' ? 'claude-3-5-sonnet' : groupBy === 'account' ? 'claude-oauth-2' : 'Pi Agent Worker',
      inputTokens: 14200000,
      cachedTokens: 12800000,
      outputTokens: 1840000,
      thinkingTokens: 1200000,
      totalTokens: 17240000,
      spendUsd: 84.20,
      pctTotal: 67.8,
    },
    {
      name: groupBy === 'route' ? 'gemini-flash' : groupBy === 'model' ? 'gemini-3.8-flash' : groupBy === 'account' ? 'google-ai-studio-primary' : 'Cursor Editor IDE',
      inputTokens: 8400000,
      cachedTokens: 7100000,
      outputTokens: 890000,
      thinkingTokens: 410000,
      totalTokens: 9700000,
      spendUsd: 28.50,
      pctTotal: 22.9,
    },
    {
      name: groupBy === 'route' ? 'deepseek-fast' : groupBy === 'model' ? 'deepseek-chat' : groupBy === 'account' ? 'deepseek-direct-1' : 'Analytics Batch Ingest',
      inputTokens: 4200000,
      cachedTokens: 1400000,
      outputTokens: 620000,
      thinkingTokens: 0,
      totalTokens: 4820000,
      spendUsd: 11.62,
      pctTotal: 9.3,
    },
  ];

  const totalSpend = breakdownData.reduce((acc, curr) => acc + curr.spendUsd, 0);

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Header */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-[var(--ink)]">
                Token &amp; Spend Cost Explorer
              </h2>
              <p className="text-xs text-[var(--ink)]/60 font-mono">
                Granular multi-dimensional token accounting: input, prompt cache reuse, output, and reasoning spend
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--ink)]/60">Total Estimated Cost:</span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ${totalSpend.toFixed(2)} USD
            </span>
          </div>
        </div>
      </div>

      {/* Dimensional Grouping Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-[var(--ink)]/60 font-sans">Group Breakdown By:</span>
          {(['route', 'model', 'account', 'client'] as const).map((dim) => (
            <button
              key={dim}
              onClick={() => setGroupBy(dim)}
              className={`py-1 px-3 rounded-lg border-2 text-xs font-bold uppercase cursor-pointer transition-all ${
                groupBy === dim
                  ? 'border-[var(--marker-red)] bg-[var(--tint-red)] text-[var(--ink)]'
                  : 'border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)]/70 hover:bg-[var(--erased)]'
              }`}
            >
              {dim}
            </button>
          ))}
        </div>
      </div>

      {/* Breakdown Cards & Table */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl shadow-sketch overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b-2 border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)]/80 uppercase text-[11px] font-sans">
                <th className="p-3.5 pl-5">{groupBy.toUpperCase()} NAME</th>
                <th className="p-3.5 text-right">INPUT TOKENS</th>
                <th className="p-3.5 text-right">CACHED TOKENS</th>
                <th className="p-3.5 text-right">REASONING TOKENS</th>
                <th className="p-3.5 text-right">OUTPUT TOKENS</th>
                <th className="p-3.5 text-right">TOTAL SPEND</th>
                <th className="p-3.5 pr-5 text-right">% OF TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--erased)]">
              {breakdownData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[var(--paper)]/60 transition-colors">
                  <td className="p-3.5 pl-5 font-bold text-[var(--ink)]">
                    {row.name}
                  </td>
                  <td className="p-3.5 text-right font-mono text-[var(--ink)]/80">
                    {row.inputTokens.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                    {row.cachedTokens.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-mono text-purple-600 dark:text-purple-400">
                    {row.thinkingTokens.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-mono text-[var(--ink)]/80">
                    {row.outputTokens.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ${row.spendUsd.toFixed(2)}
                  </td>
                  <td className="p-3.5 pr-5 text-right font-mono text-[var(--ink)]/60">
                    {row.pctTotal}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
