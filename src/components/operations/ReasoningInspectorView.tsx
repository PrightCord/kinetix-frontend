import React, { useState } from 'react';
import { Cpu, ArrowDown, Check, Copy, Code2, Sparkles, Sliders } from 'lucide-react';
import { REASONING_TRANSLATIONS, ReasoningTranslationRule } from '../../demo/operationalData';

export const ReasoningInspectorView: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<'off' | 'low' | 'medium' | 'high' | 'max'>('high');
  const [selectedIntegration, setSelectedIntegration] = useState('Claude Code OAuth (Anthropic)');

  const availableIntegrations = Array.from(
    new Set(REASONING_TRANSLATIONS.map((r) => r.integration))
  );

  const matchedRule =
    REASONING_TRANSLATIONS.find(
      (r) => r.level === selectedLevel && r.integration === selectedIntegration
    ) ||
    REASONING_TRANSLATIONS.find((r) => r.integration === selectedIntegration) ||
    REASONING_TRANSLATIONS[0];

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(matchedRule.wirePayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono text-sm">
      {/* Header */}
      <div className="bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-[var(--ink)]">
              Reasoning &amp; Thinking Normalization Inspector
            </h2>
            <p className="text-xs text-[var(--ink)]/60 font-mono">
              Inspect how canonical Kinetix reasoning levels translate into provider-specific wire schemas and plugin filters
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch space-y-5">
          <div className="border-b-2 border-[var(--erased)] pb-3">
            <h3 className="font-heading font-bold text-xs uppercase text-[var(--ink)] tracking-wider">
              1. Input Parameters
            </h3>
          </div>

          {/* Level Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase text-[var(--ink)]/70 mb-2 font-sans">
              Canonical Kinetix Reasoning Level
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['off', 'low', 'medium', 'high', 'max'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`py-2 px-1 text-center rounded-lg border-2 text-xs font-bold uppercase cursor-pointer transition-all ${
                    selectedLevel === lvl
                      ? 'border-purple-600 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200'
                      : 'border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)]/70 hover:bg-[var(--erased)]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Integration Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase text-[var(--ink)]/70 mb-2 font-sans">
              Target Upstream Provider / Integration
            </label>
            <select
              value={selectedIntegration}
              onChange={(e) => setSelectedIntegration(e.target.value)}
              className="w-full p-2.5 rounded-lg border-2 border-[var(--erased)] bg-[var(--paper)] text-[var(--ink)] text-xs focus:border-[var(--ink)] outline-none"
            >
              {availableIntegrations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Info Box */}
          <div className="p-3.5 bg-purple-50/50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-900 rounded-lg text-xs space-y-2">
            <div className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 font-sans">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Plugin-Owned Normalization
            </div>
            <p className="text-[var(--ink)]/80 text-[11px] leading-relaxed">
              Kinetix decouples client prompt intent from divergent upstream wire protocols. Clients send a standardized reasoning intensity, and the target adapter generates exact API fields.
            </p>
          </div>
        </div>

        {/* Translation Flow Column */}
        <div className="lg:col-span-7 bg-[var(--surface)] border-2 border-[var(--ink)] rounded-xl p-5 shadow-sketch flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-[var(--erased)] pb-3 mb-4 flex items-center justify-between">
              <h3 className="font-heading font-bold text-xs uppercase text-[var(--ink)] tracking-wider">
                2. Normalization Pipeline &amp; Wire Translation
              </h3>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-[var(--erased)] hover:bg-[var(--ink)] hover:text-[var(--paper)] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            {/* Visual Step Pipeline */}
            <div className="p-4 bg-[var(--paper)] border-2 border-[var(--erased)] rounded-lg space-y-3 font-mono">
              {/* Step 1 */}
              <div className="flex items-center justify-between p-2.5 bg-[var(--surface)] border border-[var(--erased)] rounded">
                <span className="text-xs text-[var(--ink)]/60">Kinetix Client Request:</span>
                <span className="font-bold font-mono text-purple-600 dark:text-purple-400">
                  reasoning = "{selectedLevel}"
                </span>
              </div>

              <div className="flex justify-center text-[var(--ink)]/40">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* Step 2 */}
              <div className="flex items-center justify-between p-2.5 bg-[var(--surface)] border border-[var(--erased)] rounded">
                <span className="text-xs text-[var(--ink)]/60">Resolved Integration:</span>
                <span className="font-bold text-[var(--ink)]">{selectedIntegration}</span>
              </div>

              <div className="flex justify-center text-[var(--ink)]/40">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* Step 3 */}
              <div className="flex items-center justify-between p-2.5 bg-[var(--surface)] border border-[var(--erased)] rounded">
                <span className="text-xs text-[var(--ink)]/60">Matched Protocol Capability:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{matchedRule.capability}</span>
              </div>

              <div className="flex justify-center text-[var(--ink)]/40">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* Step 4: JSON Wire Payload */}
              <div className="p-3 bg-[var(--surface)] border-2 border-purple-500/50 rounded-lg">
                <div className="text-[11px] text-[var(--ink)]/60 mb-1 flex items-center gap-1 font-bold">
                  <Code2 className="w-3.5 h-3.5 text-purple-600" />
                  Generated Outbound Wire Payload:
                </div>
                <pre className="p-3 bg-black/90 text-emerald-400 rounded font-mono text-xs overflow-x-auto">
                  {JSON.stringify(matchedRule.wirePayload, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--erased)] text-xs text-[var(--ink)]/60 flex items-center justify-between">
            <span>Behavior Note: {matchedRule.notes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
