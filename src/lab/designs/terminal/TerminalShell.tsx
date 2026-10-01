import React, { useEffect, useState, useCallback } from 'react';
import { Kinetix } from '../../../lib/resources';
import {
  VirtualKey,
  Route,
  Provider,
  Account,
  ModelConfig,
  ProxyMetrics,
  RequestLog,
  AuditLog,
} from '../../../types';
import { EMPTY_METRICS } from '../../../lib/mappers';
import { LiveTesterModal } from '../../../components/LiveTesterModal';
import { demoStore } from '../../../demo/backend/store';
import { SCENARIO_LIST } from '../../../demo/scenarios';
import { ScenarioId } from '../../../demo/types';

interface TerminalShellProps {
  onSwitchDesign: (id: any) => void;
  onSwitchScenario: (id: ScenarioId) => void;
}

type TerminalTab = 'keys' | 'routes' | 'providers' | 'accounts' | 'health' | 'usage' | 'requests' | 'plugins' | 'audit' | 'settings';

export const TerminalShell: React.FC<TerminalShellProps> = ({
  onSwitchDesign,
  onSwitchScenario,
}) => {
  const [tab, setTab] = useState<TerminalTab>('keys');
  const [keys, setKeys] = useState<VirtualKey[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<ProxyMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [cmdInput, setCmdInput] = useState('');
  const [cliOutput, setCliOutput] = useState<string[]>([
    'Kinetix Gateway Terminal System initialized.',
    'Type :help for operator commands or press [1]-[9], [0] to switch screens.',
  ]);
  const [isTesterOpen, setIsTesterOpen] = useState(false);
  const [runtimeHealth, setRuntimeHealth] = useState<any>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [k, r, p, a, m, req, aud, met, hl] = await Promise.all([
        Kinetix.keys(),
        Kinetix.routes(),
        Kinetix.providers(),
        Kinetix.accounts(),
        Kinetix.models(),
        Kinetix.requests(),
        Kinetix.audit(),
        Kinetix.overview(),
        fetch('/admin/api/health/runtime').then((res) => res.json()).catch(() => null),
      ]);
      setKeys(k);
      setRoutes(r);
      setProviders(p);
      setAccounts(a);
      setModels(m);
      setRequests(req);
      setAuditLogs(aud);
      setMetrics(met);
      setRuntimeHealth(hl);
    } catch (e) {
      console.error('Terminal load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsub = demoStore.subscribe(loadData);
    return () => unsub();
  }, [loadData]);

  // Keyboard navigation hotkeys: 1-0 for tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      const map: Record<string, TerminalTab> = {
        '1': 'keys',
        '2': 'routes',
        '3': 'providers',
        '4': 'accounts',
        '5': 'health',
        '6': 'usage',
        '7': 'requests',
        '8': 'plugins',
        '9': 'audit',
        '0': 'settings',
      };
      if (e.key in map) {
        setTab(map[e.key]);
      } else if (e.key === 't' || e.key === 'T') {
        setIsTesterOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cmdInput.trim();
    if (!cmd) return;

    const newLogs = [...cliOutput, `kinetix> ${cmd}`];

    if (cmd === ':help') {
      newLogs.push(
        'Available commands:',
        '  :keys, :routes, :providers, :accounts, :health, :usage, :requests, :plugins, :audit, :settings',
        '  :test                - Open live streaming tester',
        '  :scenario <id>       - Switch scenario (e.g. :scenario oauth-expired, :scenario healthy)',
        '  :scenarios           - List all available demo scenarios',
        '  :design <id>         - Switch design (:design current, flat, glass, brutalist)',
        '  :refresh             - Sync gateway telemetry',
        '  :clear               - Clear terminal output',
      );
    } else if (cmd === ':clear') {
      setCliOutput([]);
      setCmdInput('');
      return;
    } else if (cmd === ':refresh') {
      loadData();
      newLogs.push('Gateway state synced.');
    } else if (cmd === ':test') {
      setIsTesterOpen(true);
      newLogs.push('Opened live tester modal.');
    } else if (cmd === ':scenarios') {
      newLogs.push('Available scenarios: ' + SCENARIO_LIST.map((s) => s.id).join(', '));
    } else if (cmd.startsWith(':scenario ')) {
      const target = cmd.replace(':scenario ', '').trim() as ScenarioId;
      if (SCENARIO_LIST.some((s) => s.id === target)) {
        onSwitchScenario(target);
        newLogs.push(`Switched to scenario: [${target}]`);
      } else {
        newLogs.push(`Unknown scenario: ${target}. Type :scenarios for list.`);
      }
    } else if (cmd.startsWith(':design ')) {
      const target = cmd.replace(':design ', '').trim();
      onSwitchDesign(target);
      newLogs.push(`Switched to design: [${target}]`);
    } else if (cmd.startsWith(':') && cmd.slice(1) in {
      keys: 1, routes: 1, providers: 1, accounts: 1, health: 1, usage: 1, requests: 1, plugins: 1, audit: 1, settings: 1,
    }) {
      setTab(cmd.slice(1) as TerminalTab);
      newLogs.push(`Switched view to [${cmd.slice(1)}]`);
    } else {
      newLogs.push(`Command not recognized: "${cmd}". Type :help for manual.`);
    }

    setCliOutput(newLogs);
    setCmdInput('');
  };

  const currentScenarioId = demoStore.getScenarioId();

  return (
    <div className="min-h-screen bg-[#060907] text-[#33ff77] font-mono p-2 md:p-4 text-xs md:text-sm select-none flex flex-col justify-between selection:bg-[#33ff77] selection:text-[#060907]">
      <div className="space-y-3">
        {/* Top Header & Telemetry Ribbon */}
        <div className="border border-[#228844] p-2 bg-[#09140c] shadow-[0_0_15px_rgba(51,255,119,0.1)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b5e32] pb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-widest text-[#55ff99]">┌─[ KINETIX GATEWAY TUI ]─┐</span>
              <span className="text-[#88cc99]">v0.5.2</span>
              <span className="bg-[#10381e] px-1.5 py-0.2 rounded border border-[#228844] text-[10px] text-[#88ffaa]">
                SCENARIO: {currentScenarioId.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span>LAT: <span className="text-white font-bold">{metrics.p50LatencyMs || 0}ms</span></span>
              <span>•</span>
              <span>TUNNEL: <span className="text-[#55ff99] uppercase">{metrics.tunnelStatus}</span></span>
              <span>•</span>
              <span>CIRCUITS: <span className="text-white">{runtimeHealth?.provider_circuits?.filter((c: any) => c.state !== 'closed')?.length || 0} OPEN</span></span>
              <span>•</span>
              <span>TODAY: <span className="text-[#ffee66]">${metrics.totalSpendUsd.toFixed(2)}</span></span>
              <button
                onClick={() => setIsTesterOpen(true)}
                className="bg-[#1b5e32] hover:bg-[#258546] text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
              >
                [TEST LIVE STREAM]
              </button>
            </div>
          </div>

          {/* Navigation Bar Hotkeys */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
            {(
              [
                ['1', 'keys', 'KEYS'],
                ['2', 'routes', 'ROUTES'],
                ['3', 'providers', 'PROVIDERS'],
                ['4', 'accounts', 'ACCOUNTS'],
                ['5', 'health', 'HEALTH'],
                ['6', 'usage', 'USAGE'],
                ['7', 'requests', 'REQUESTS'],
                ['8', 'plugins', 'PLUGINS'],
                ['9', 'audit', 'AUDIT'],
                ['0', 'settings', 'SETTINGS'],
              ] as const
            ).map(([hotkey, key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  tab === key
                    ? 'bg-[#33ff77] text-[#060907] font-bold shadow-[0_0_8px_rgba(51,255,119,0.4)]'
                    : 'text-[#88cc99] hover:bg-[#122818] hover:text-[#55ff99]'
                }`}
              >
                <span className="opacity-70 mr-1">[{hotkey}]</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="border border-[#228844] bg-[#08130b] p-3 min-h-[480px]">
          {loading ? (
            <div className="p-8 text-center text-[#88cc99] animate-pulse">
              [ READING GATEWAY TELEMETRY STATE... ]
            </div>
          ) : (
            <>
              {/* KEYS VIEW */}
              {tab === 'keys' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1b5e32] pb-2">
                    <span className="font-bold text-white uppercase">Active Virtual Keys ({keys.length})</span>
                    <button
                      onClick={() => {
                        const name = prompt('Key Name:');
                        if (name) Kinetix.createKey({ name, owner: 'Operator', tag: 'tui', allowed_models: ['*'] });
                      }}
                      className="px-2 py-0.5 bg-[#1b5e32] hover:bg-[#258546] text-white rounded text-xs cursor-pointer"
                    >
                      + CREATE VIRTUAL KEY
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#228844] text-[#88cc99] text-xs">
                          <th className="p-1.5">ID / NAME</th>
                          <th className="p-1.5">KEY MASK</th>
                          <th className="p-1.5">OWNER / TAG</th>
                          <th className="p-1.5">MODELS</th>
                          <th className="p-1.5">RATE LIMIT</th>
                          <th className="p-1.5">SPEND TODAY</th>
                          <th className="p-1.5">STATUS</th>
                          <th className="p-1.5 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {keys.map((k) => (
                          <tr key={k.id} className="border-b border-[#122818] hover:bg-[#0e2214]">
                            <td className="p-1.5 font-bold text-white">{k.name} <span className="text-[10px] text-[#88cc99] block font-normal">{k.id}</span></td>
                            <td className="p-1.5 font-mono text-[#55ff99]">{k.key}</td>
                            <td className="p-1.5">{k.owner} <span className="text-[#88cc99] text-xs">#{k.tag}</span></td>
                            <td className="p-1.5 font-mono text-xs">{k.allowedModels.join(', ')}</td>
                            <td className="p-1.5 text-xs">{k.rpmLimit} RPM / {k.tpmLimit} TPM</td>
                            <td className="p-1.5 text-white font-mono">${k.currentDailySpend.toFixed(2)}</td>
                            <td className="p-1.5">
                              <span className={`px-1 rounded text-[10px] uppercase font-bold ${k.status === 'active' ? 'bg-[#10381e] text-[#55ff99]' : 'bg-[#3d1212] text-[#ff8888]'}`}>
                                {k.status}
                              </span>
                            </td>
                            <td className="p-1.5 text-right">
                              <button
                                onClick={() => Kinetix.deleteKey(k.id)}
                                className="text-[#ff5555] hover:underline text-xs cursor-pointer ml-2"
                              >
                                [REVOKE]
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ROUTES VIEW */}
              {tab === 'routes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1b5e32] pb-2">
                    <span className="font-bold text-white uppercase">Executable Routes &amp; Fallbacks ({routes.length})</span>
                    <button
                      onClick={() => {
                        const name = prompt('Route Name:');
                        if (name) {
                          Kinetix.createRoute({
                            name,
                            strategy: 'priority',
                            fallback_triggers: { on429: true, onQuota: true, on5xx: true, onTimeout: true },
                            portability_policy: 'strip_with_warning',
                            targets: [],
                          });
                        }
                      }}
                      className="px-2 py-0.5 bg-[#1b5e32] hover:bg-[#258546] text-white rounded text-xs cursor-pointer"
                    >
                      + ADD ROUTE
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {routes.map((r) => (
                      <div key={r.id} className="border border-[#1b5e32] p-2.5 bg-[#09160e]">
                        <div className="flex items-center justify-between border-b border-[#122818] pb-1.5 mb-2">
                          <div>
                            <span className="font-bold text-[#55ff99] text-base">{r.name}</span>
                            <span className="text-[10px] text-[#88cc99] ml-2">STRATEGY: {r.selectionStrategy.toUpperCase()}</span>
                          </div>
                          <button onClick={() => Kinetix.deleteRoute(r.id)} className="text-[#ff5555] text-xs hover:underline cursor-pointer">
                            [DEL]
                          </button>
                        </div>
                        <p className="text-xs text-[#a0d8b0] mb-2">{r.description || 'No description provided.'}</p>
                        <div className="text-xs text-[#88cc99] mb-1 font-bold">FALLBACK TARGET CASCADE ({r.targets.length} HOPS):</div>
                        <div className="space-y-1">
                          {r.targets.map((t, idx) => (
                            <div key={idx} className="bg-[#0c1f13] border border-[#163d23] px-2 py-1 text-xs flex items-center justify-between">
                              <span className="text-white">
                                <span className="text-[#55ff99] font-bold mr-1">#{idx + 1}</span>
                                {t.modelDisplayName || t.modelId}
                              </span>
                              <span className="text-[10px] text-[#88cc99]">
                                WEIGHT: {t.weight ?? 100}% │ PRIORITY: #{t.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PROVIDERS VIEW */}
              {tab === 'providers' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1b5e32] pb-2">
                    <span className="font-bold text-white uppercase">Upstream Inference Providers ({providers.length})</span>
                    <button
                      onClick={() => {
                        const name = prompt('Provider Name:');
                        const url = prompt('Base URL:');
                        if (name && url) Kinetix.createProvider({ name, base_url: url, wire_format: 'openai' });
                      }}
                      className="px-2 py-0.5 bg-[#1b5e32] hover:bg-[#258546] text-white rounded text-xs cursor-pointer"
                    >
                      + ENROLL PROVIDER
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {providers.map((p) => (
                      <div key={p.id} className="border border-[#1b5e32] p-2 bg-[#09160e]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white">{p.name}</span>
                          <span className={`px-1 py-0.2 rounded text-[10px] uppercase font-bold ${p.status === 'healthy' ? 'bg-[#10381e] text-[#55ff99]' : 'bg-[#3d1212] text-[#ff8888]'}`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#88cc99] truncate font-mono mb-2">{p.baseUrl}</div>
                        <div className="text-xs text-[#a0d8b0] space-y-0.5 border-t border-[#122818] pt-1.5">
                          <div>FORMAT: <span className="text-white">{p.wireFormat}</span></div>
                          <div>MODELS: <span className="text-white">{p.modelsCount} registered</span></div>
                          <div>ACCOUNTS: <span className="text-white">{p.accountsCount} active</span></div>
                          <div>PING: <span className="text-white">{p.lastPingMs}ms</span></div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[#122818] mt-2 text-xs">
                          <button
                            onClick={() => Kinetix.test(p.id, 'default')}
                            className="text-[#55ff99] hover:underline cursor-pointer"
                          >
                            [PROBE]
                          </button>
                          <button
                            onClick={() => Kinetix.deleteProvider(p.id)}
                            className="text-[#ff5555] hover:underline cursor-pointer"
                          >
                            [DEL]
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACCOUNTS VIEW */}
              {tab === 'accounts' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1b5e32] pb-2">
                    <span className="font-bold text-white uppercase">Credential Account Pools ({accounts.length})</span>
                    <button
                      onClick={() => {
                        const label = prompt('Account Label:');
                        if (label && providers[0]) Kinetix.createAccount({ provider_id: providers[0].id, label });
                      }}
                      className="px-2 py-0.5 bg-[#1b5e32] hover:bg-[#258546] text-white rounded text-xs cursor-pointer"
                    >
                      + ADD ACCOUNT
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#228844] text-[#88cc99]">
                          <th className="p-1.5">LABEL</th>
                          <th className="p-1.5">PROVIDER</th>
                          <th className="p-1.5">CREDENTIAL</th>
                          <th className="p-1.5">WEIGHT</th>
                          <th className="p-1.5">PRIORITY</th>
                          <th className="p-1.5">STATUS</th>
                          <th className="p-1.5 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map((a) => (
                          <tr key={a.id} className="border-b border-[#122818] hover:bg-[#0e2214]">
                            <td className="p-1.5 font-bold text-white">{a.label}</td>
                            <td className="p-1.5 text-[#88cc99]">{a.providerName}</td>
                            <td className="p-1.5 font-mono text-[#55ff99]">{a.keyMasked}</td>
                            <td className="p-1.5 text-white">{a.weight}%</td>
                            <td className="p-1.5 text-white">P{a.priority}</td>
                            <td className="p-1.5">
                              <span className={`px-1 py-0.2 rounded text-[10px] uppercase font-bold ${a.status === 'healthy' ? 'bg-[#10381e] text-[#55ff99]' : 'bg-[#3d1212] text-[#ff8888]'}`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="p-1.5 text-right">
                              <button onClick={() => Kinetix.resetAccount(a.id)} className="text-[#55ff99] hover:underline mr-2 cursor-pointer">[RESET]</button>
                              <button onClick={() => Kinetix.deleteAccount(a.id)} className="text-[#ff5555] hover:underline cursor-pointer">[DEL]</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* HEALTH VIEW */}
              {tab === 'health' && (
                <div className="space-y-4">
                  <div className="border-b border-[#1b5e32] pb-2 font-bold text-white uppercase">
                    Runtime Health &amp; Circuit Breakers
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border border-[#1b5e32] p-3 bg-[#09160e]">
                      <div className="font-bold text-white mb-2">PROVIDER CIRCUIT STATES:</div>
                      {runtimeHealth?.provider_circuits?.length ? (
                        <div className="space-y-1.5">
                          {runtimeHealth.provider_circuits.map((c: any) => (
                            <div key={c.provider_id} className="flex items-center justify-between border-b border-[#122818] pb-1">
                              <div>
                                <span className="font-bold text-white">{c.provider_name || c.provider_id}</span>
                                <span className="text-[10px] text-[#88cc99] ml-2">FAILURES: {c.failure_count}</span>
                              </div>
                              <span className={`px-1.5 py-0.2 rounded text-xs uppercase font-bold ${c.state === 'closed' ? 'bg-[#10381e] text-[#55ff99]' : 'bg-[#3d1212] text-[#ff8888]'}`}>
                                {c.state}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-[#88cc99]">All provider circuits closed (nominal).</div>
                      )}
                    </div>
                    <div className="border border-[#1b5e32] p-3 bg-[#09160e]">
                      <div className="font-bold text-white mb-2">LATENCY PROFILE:</div>
                      <div className="space-y-1 text-xs">
                        <div>P50 DURATION: <span className="text-white font-bold">{metrics.p50LatencyMs || 0}ms</span></div>
                        <div>P99 DURATION: <span className="text-white font-bold">{metrics.p99LatencyMs || 0}ms</span></div>
                        <div>ACTIVE IN-FLIGHT STREAMS: <span className="text-[#55ff99] font-bold">{metrics.activeStreams}</span></div>
                        <div>ERROR RATE: <span className="text-white">{metrics.fallbackRate.toFixed(2)}%</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* REQUESTS VIEW */}
              {tab === 'requests' && (
                <div className="space-y-3">
                  <div className="border-b border-[#1b5e32] pb-2 font-bold text-white uppercase">
                    Live Request Inspector ({requests.length} logged)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#228844] text-[#88cc99]">
                          <th className="p-1">REQ ID</th>
                          <th className="p-1">TIME</th>
                          <th className="p-1">MODEL / ROUTE</th>
                          <th className="p-1">UPSTREAM SERVED</th>
                          <th className="p-1">TOKENS</th>
                          <th className="p-1">LATENCY</th>
                          <th className="p-1">HOPS</th>
                          <th className="p-1">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.slice(0, 15).map((r) => (
                          <tr key={r.requestId} className="border-b border-[#122818] hover:bg-[#0e2214]">
                            <td className="p-1 font-mono text-[11px] text-[#55ff99]">{r.requestId}</td>
                            <td className="p-1 text-[11px] text-[#88cc99]">{new Date(r.timestamp).toLocaleTimeString()}</td>
                            <td className="p-1 text-white font-bold">{r.requestedModel}</td>
                            <td className="p-1 text-[#88cc99]">{r.servingProvider || r.effectiveTarget}</td>
                            <td className="p-1 font-mono text-white">{r.inputTokens + r.outputTokens}</td>
                            <td className="p-1 font-mono text-white">{r.latencyMs}ms</td>
                            <td className="p-1 font-mono">{r.fallbackHops > 0 ? <span className="text-[#ffee66] font-bold">+{r.fallbackHops} hops</span> : '0'}</td>
                            <td className="p-1"><span className={`px-1 rounded text-[10px] font-bold ${r.status === 'success' || r.statusCode === 200 ? 'bg-[#10381e] text-[#55ff99]' : 'bg-[#3d1212] text-[#ff8888]'}`}>{r.statusCode}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AUDIT VIEW */}
              {tab === 'audit' && (
                <div className="space-y-3">
                  <div className="border-b border-[#1b5e32] pb-2 font-bold text-white uppercase">
                    Security &amp; Mutation Audit Log
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {auditLogs.map((a) => (
                      <div key={a.id} className="border-b border-[#122818] pb-1 flex items-start gap-2">
                        <span className="text-[#88cc99] text-[11px] shrink-0">{new Date(a.timestamp).toLocaleTimeString()}</span>
                        <span className="text-[#55ff99] font-bold shrink-0">[{a.action}]</span>
                        <span className="text-white flex-1">{a.details}</span>
                        <span className="text-[10px] text-[#88cc99]">{a.actor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* USAGE VIEW */}
              {tab === 'usage' && (
                <div className="space-y-3">
                  <div className="border-b border-[#1b5e32] pb-2 font-bold text-white uppercase">
                    Spend &amp; Token Accounting
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border border-[#1b5e32] p-2 bg-[#09160e]">
                      <div className="text-[#88cc99] text-xs">TOTAL TOKENS</div>
                      <div className="text-lg font-bold text-white mt-1">{metrics.totalTokens.toLocaleString()}</div>
                    </div>
                    <div className="border border-[#1b5e32] p-2 bg-[#09160e]">
                      <div className="text-[#88cc99] text-xs">TOTAL REQUESTS</div>
                      <div className="text-lg font-bold text-white mt-1">{metrics.totalRequests.toLocaleString()}</div>
                    </div>
                    <div className="border border-[#1b5e32] p-2 bg-[#09160e]">
                      <div className="text-[#88cc99] text-xs">TOTAL SPEND (USD)</div>
                      <div className="text-lg font-bold text-[#ffee66] mt-1">${metrics.totalSpendUsd.toFixed(2)}</div>
                    </div>
                    <div className="border border-[#1b5e32] p-2 bg-[#09160e]">
                      <div className="text-[#88cc99] text-xs">CACHE HIT RATIO</div>
                      <div className="text-lg font-bold text-white mt-1">{(metrics.cacheHitRatio * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* PLUGINS & SETTINGS VIEWS */}
              {(tab === 'plugins' || tab === 'settings') && (
                <div className="space-y-3">
                  <div className="border-b border-[#1b5e32] pb-2 font-bold text-white uppercase">
                    {tab.toUpperCase()} PANEL
                  </div>
                  <div className="text-xs text-[#88cc99]">
                    System operational settings and dynamic plugin adapters active.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Interactive Operator CLI */}
        <div className="border border-[#228844] bg-[#09140c] p-2">
          <div className="h-24 overflow-y-auto font-mono text-xs text-[#88cc99] space-y-0.5 mb-2 select-text">
            {cliOutput.slice(-10).map((line, idx) => (
              <div key={idx} className={line.startsWith('kinetix>') ? 'text-white font-bold' : ''}>
                {line}
              </div>
            ))}
          </div>
          <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 border-t border-[#1b5e32] pt-2">
            <span className="text-[#55ff99] font-bold text-xs select-none">kinetix&gt;</span>
            <input
              type="text"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              placeholder="Type :help, :keys, :scenario <id>, :test..."
              className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-[#337744]"
            />
            <button
              type="submit"
              className="bg-[#1b5e32] hover:bg-[#258546] text-white px-2 py-0.5 rounded text-xs cursor-pointer"
            >
              EXECUTE
            </button>
          </form>
        </div>
      </div>

      {/* Live Tester Modal instance */}
      <LiveTesterModal
        isOpen={isTesterOpen}
        onClose={() => setIsTesterOpen(false)}
        keys={keys}
        routes={routes}
        models={models}
      />
    </div>
  );
};
