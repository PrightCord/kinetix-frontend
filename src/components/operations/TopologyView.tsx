import React, { useState, useEffect } from 'react';
import { Network, Server, Users, Key, Zap, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';
import type { Route, Account, Provider, VirtualKey } from '../../types';

interface TopologyViewProps {
  routes: Route[];
  accounts: Account[];
  providers: Provider[];
  keys: VirtualKey[];
}

export const TopologyView: React.FC<TopologyViewProps> = ({
  routes,
  accounts,
  providers,
  keys,
}) => {
  const [selectedNode, setSelectedNode] = useState<{
    type: 'client' | 'route' | 'account';
    name: string;
    details: Record<string, any>;
  } | null>(null);

  useEffect(() => {
    if (!selectedNode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedNode(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Header */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 flex items-center justify-center font-bold">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-[var(--ink)]">
              Credential &amp; Account Topology Graph
            </h2>
            <p className="text-xs text-[var(--ink)]/60 font-mono">
              End-to-end visual mapping of Client Virtual Keys → Executable Routes → Upstream Accounts and Failover Paths
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Topology Graph Canvas */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-6 shadow-sketch space-y-8">
        <div className="text-xs font-bold uppercase text-[var(--ink)]/60 tracking-wider flex items-center justify-between border-b-2 border-[var(--erased)] pb-3">
          <span>Active Pipeline Topologies:</span>
          <span>Click any node to inspect health &amp; concurrency</span>
        </div>

        {/* Tree 1: Pi -> sonnet route -> 4 accounts */}
        <div className="p-5 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Client Node */}
            <button
              onClick={() =>
                setSelectedNode({
                  type: 'client',
                  name: 'Pi Agent Worker',
                  details: {
                    keyId: 'vk_prod_pi_9918',
                    rpmLimit: '1,000 req/min',
                    tpmLimit: '100,000 tok/min',
                    currentSpend: '$14.20',
                    ip: '10.244.1.88',
                  },
                })
              }
              className="p-3 bg-[var(--surface)] border-2 border-blue-500 rounded-lg text-left hover:scale-[1.02] transition-transform cursor-pointer shadow-sm shrink-0 md:w-48"
            >
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase font-sans">
                <Key className="w-3.5 h-3.5" /> Client Key
              </div>
              <div className="font-bold text-sm text-[var(--ink)] mt-1">Pi Agent Worker</div>
              <div className="text-[10px] text-[var(--ink)]/60 font-mono">vk_prod_pi_9918</div>
            </button>

            <span className="text-[var(--ink)]/40 font-bold hidden md:inline text-lg">─────────►</span>

            {/* Route Node */}
            <button
              onClick={() =>
                setSelectedNode({
                  type: 'route',
                  name: 'sonnet route',
                  details: {
                    strategy: 'priority',
                    totalHops: 4,
                    cacheAffinity: 'Enabled (91.7% hit)',
                    fallbackTriggers: 'on429, on5xx, onTimeout',
                  },
                })
              }
              className="p-3 bg-[var(--surface)] border-2 border-purple-500 rounded-lg text-left hover:scale-[1.02] transition-transform cursor-pointer shadow-sm shrink-0 md:w-52"
            >
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase font-sans">
                <Zap className="w-3.5 h-3.5" /> Route
              </div>
              <div className="font-bold text-sm text-[var(--ink)] mt-1">sonnet route</div>
              <div className="text-[10px] text-[var(--ink)]/60 font-mono">strategy: priority</div>
            </button>

            <span className="text-[var(--ink)]/40 font-bold hidden md:inline text-lg">──────┬──►</span>

            {/* Target Accounts Cascade */}
            <div className="flex-1 space-y-2">
              {[
                {
                  id: 'claude-oauth-1',
                  name: 'Claude OAuth A (Primary)',
                  status: 'healthy',
                  concurrency: '1/4',
                  latency: '620ms',
                  details: 'Anthropic OAuth Token • Active (hot cache)',
                },
                {
                  id: 'claude-oauth-2',
                  name: 'Claude OAuth B (Secondary)',
                  status: 'healthy',
                  concurrency: '0/4',
                  latency: '710ms',
                  details: 'Anthropic BYOK Tier 4 • Ready for failover',
                },
                {
                  id: 'claude-oauth-3',
                  name: 'Claude OAuth C (Rate limited)',
                  status: 'cooldown',
                  concurrency: '0/4',
                  latency: 'cooldown',
                  details: '429 rate limit exceeded; cooling down 02:40',
                },
                {
                  id: 'antigravity-1',
                  name: 'Antigravity Enterprise Pool',
                  status: 'healthy',
                  concurrency: '0/6',
                  latency: '840ms',
                  details: 'Cross-region failover cluster',
                },
              ].map((acc, idx) => (
                <button
                  key={acc.id}
                  onClick={() =>
                    setSelectedNode({
                      type: 'account',
                      name: acc.name,
                      details: {
                        status: acc.status,
                        concurrency: acc.concurrency,
                        latency: acc.latency,
                        details: acc.details,
                      },
                    })
                  }
                  className={`w-full p-2.5 rounded-lg border-2 text-left flex items-center justify-between hover:scale-[1.01] transition-all cursor-pointer ${
                    acc.status === 'cooldown'
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500'
                      : 'bg-[var(--surface)] border-[var(--erased)] hover:border-[var(--ink)]/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--ink)]/40 font-bold text-xs">
                      {idx === 3 ? '└──' : '├──'}
                    </span>
                    <span className="font-bold text-xs text-[var(--ink)]">{acc.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[var(--ink)]/60 font-mono">
                      concurrency: {acc.concurrency}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                        acc.status === 'healthy'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {acc.status === 'healthy' ? '● healthy' : '◐ cooldown'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tree 2: Cursor IDE -> gemini route -> 2 accounts */}
        <div className="p-5 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Client Node */}
            <button
              onClick={() =>
                setSelectedNode({
                  type: 'client',
                  name: 'Cursor IDE',
                  details: {
                    keyId: 'vk_dev_cursor_44',
                    rpmLimit: '500 req/min',
                    tpmLimit: '50,000 tok/min',
                    currentSpend: '$3.80',
                    ip: '192.168.1.14',
                  },
                })
              }
              className="p-3 bg-[var(--surface)] border-2 border-blue-500 rounded-lg text-left hover:scale-[1.02] transition-transform cursor-pointer shadow-sm shrink-0 md:w-48"
            >
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase font-sans">
                <Key className="w-3.5 h-3.5" /> Client Key
              </div>
              <div className="font-bold text-sm text-[var(--ink)] mt-1">Cursor Editor IDE</div>
              <div className="text-[10px] text-[var(--ink)]/60 font-mono">vk_dev_cursor_44</div>
            </button>

            <span className="text-[var(--ink)]/40 font-bold hidden md:inline text-lg">─────────►</span>

            {/* Route Node */}
            <button
              onClick={() =>
                setSelectedNode({
                  type: 'route',
                  name: 'gemini-flash route',
                  details: {
                    strategy: 'round-robin',
                    totalHops: 2,
                    cacheAffinity: 'Enabled (94.2% hit)',
                    fallbackTriggers: 'on5xx, onTimeout',
                  },
                })
              }
              className="p-3 bg-[var(--surface)] border-2 border-cyan-500 rounded-lg text-left hover:scale-[1.02] transition-transform cursor-pointer shadow-sm shrink-0 md:w-52"
            >
              <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase font-sans">
                <Zap className="w-3.5 h-3.5" /> Route
              </div>
              <div className="font-bold text-sm text-[var(--ink)] mt-1">gemini-flash</div>
              <div className="text-[10px] text-[var(--ink)]/60 font-mono">strategy: round-robin</div>
            </button>

            <span className="text-[var(--ink)]/40 font-bold hidden md:inline text-lg">──────┬──►</span>

            {/* Target Accounts Cascade */}
            <div className="flex-1 space-y-2">
              {[
                {
                  id: 'gemini-byok-1',
                  name: 'Vertex Gemini BYOK Primary',
                  status: 'healthy',
                  concurrency: '2/8',
                  latency: '240ms',
                  details: 'Google Vertex AI • Service account credential verified',
                },
                {
                  id: 'ai-studio-1',
                  name: 'Google AI Studio Failover',
                  status: 'healthy',
                  concurrency: '0/5',
                  latency: '310ms',
                  details: 'Google AI Studio API Key tier',
                },
              ].map((acc, idx) => (
                <button
                  key={acc.id}
                  onClick={() =>
                    setSelectedNode({
                      type: 'account',
                      name: acc.name,
                      details: {
                        status: acc.status,
                        concurrency: acc.concurrency,
                        latency: acc.latency,
                        details: acc.details,
                      },
                    })
                  }
                  className="w-full p-2.5 rounded-lg border-2 bg-[var(--surface)] border-[var(--erased)] hover:border-[var(--ink)]/60 text-left flex items-center justify-between hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--ink)]/40 font-bold text-xs">
                      {idx === 1 ? '└──' : '├──'}
                    </span>
                    <span className="font-bold text-xs text-[var(--ink)]">{acc.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[var(--ink)]/60 font-mono">
                      concurrency: {acc.concurrency}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      ● healthy
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Node Detail Inspection Modal */}
      {selectedNode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="node-inspector-title"
          onClick={() => setSelectedNode(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-mono text-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--surface)] text-[var(--ink)] border-2 border-[var(--ink)] rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4 focus:outline-none"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between border-b-2 border-[var(--erased)] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--ink)]/60">
                  Topology Node Inspector
                </span>
                <h3 id="node-inspector-title" className="font-heading font-bold text-base text-[var(--ink)] font-sans">
                  {selectedNode.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                aria-label="Close node inspector"
                className="p-1 rounded hover:bg-[var(--erased)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg space-y-2 text-xs">
              {Object.entries(selectedNode.details).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-[var(--ink)]/60 capitalize">{key}:</span>
                  <span className="font-bold text-[var(--ink)] font-mono">{String(val)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNode(null)}
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
