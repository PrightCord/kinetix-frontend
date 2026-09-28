import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Download, FileCode2, KeyRound, WandSparkles, X } from 'lucide-react';
import { VirtualKey } from '../../types';
import {
  ClientProfileClient,
  ClientProfileFile,
  GeneratedClientProfile,
  Kinetix,
} from '../../lib/resources';
import { Card, Button, StatusBadge, Input, Select, TerminalPanel } from '../KinetixUI';

interface ClientProfileGeneratorProps {
  keys?: VirtualKey[];
  newlyCreatedKey?: { id: string; name: string; key: string } | null;
  keyId?: string;
  onClose?: () => void;
}

const clients: Array<{
  id: ClientProfileClient;
  name: string;
  description: string;
}> = [
  { id: 'pi', name: 'Pi Coding Assistant', description: 'OpenAI Chat Completions endpoint via Kinetix.' },
  { id: 'claude_code', name: 'Claude Code', description: 'Anthropic Messages format via Kinetix.' },
  { id: 'codex', name: 'Codex CLI', description: 'OpenAI Responses API via Kinetix.' },
  { id: 'open_code', name: 'OpenCode Agent', description: 'OpenAI-compatible Chat Completions via Kinetix.' },
];

export const ClientProfileGenerator: React.FC<ClientProfileGeneratorProps> = ({
  keys = [],
  newlyCreatedKey,
  keyId: initialKeyId,
  onClose,
}) => {
  const activeKeys = useMemo(() => keys.filter((key) => key.status === 'active'), [keys]);
  const [keyId, setKeyId] = useState(initialKeyId || newlyCreatedKey?.id || activeKeys[0]?.id || '');
  const [client, setClient] = useState<ClientProfileClient>('pi');
  const [apiKey, setApiKey] = useState(newlyCreatedKey?.key || '');
  const [models, setModels] = useState<Array<{ id: string }>>([]);
  const [model, setModel] = useState('');
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GeneratedClientProfile | null>(null);
  const [activeFilename, setActiveFilename] = useState('');
  const [copiedFilename, setCopiedFilename] = useState<string | null>(null);

  useEffect(() => {
    if (initialKeyId) setKeyId(initialKeyId);
  }, [initialKeyId]);

  useEffect(() => {
    if (newlyCreatedKey) {
      setKeyId(newlyCreatedKey.id);
      setApiKey(newlyCreatedKey.key);
      setProfile(null);
    }
  }, [newlyCreatedKey]);

  useEffect(() => {
    if (!keyId) {
      setModels([]);
      setModel('');
      setModelsError(null);
      return;
    }
    let current = true;
    setLoadingModels(true);
    setModelsError(null);
    setModels([]);
    setModel('');
    Kinetix.clientProfileModels(keyId)
      .then(({ models: available }) => {
        if (!current) return;
        setModels(available);
        setModel(available[0]?.id ?? '');
      })
      .catch((cause: unknown) => {
        if (!current) return;
        setModelsError(cause instanceof Error ? cause.message : 'Could not load authorized models.');
      })
      .finally(() => {
        if (current) setLoadingModels(false);
      });
    return () => {
      current = false;
    };
  }, [keyId]);

  const activeFile =
    profile?.files.find((file) => file.filename === activeFilename) ??
    profile?.files[0] ??
    null;

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!keyId || !model) return;
    setGenerating(true);
    setError(null);
    setProfile(null);
    try {
      const generated = await Kinetix.generateClientProfile({
        key_id: keyId,
        client,
        model,
        api_key: apiKey.trim() || undefined,
      });
      setProfile(generated);
      setActiveFilename(generated.files[0]?.filename ?? '');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not generate this profile.');
    } finally {
      setGenerating(false);
    }
  };

  const copyFile = async (file: ClientProfileFile) => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopiedFilename(file.filename);
      window.setTimeout(() => setCopiedFilename(null), 1800);
    } catch {
      setError('Clipboard access failed. Select and copy the profile text instead.');
    }
  };

  const downloadFile = (file: ClientProfileFile) => {
    const blob = new Blob([file.content], { type: `${file.content_type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <WandSparkles className="w-4 h-4 text-[var(--primary)]" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Client Connection Profile Generator
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Auto-generate client-ready configurations for Pi, Claude Code, Codex, or OpenCode.
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {activeKeys.length > 0 && (
          <div>
            <label className="block text-[var(--text-muted)] font-mono mb-1">Virtual Key</label>
            <Select
              value={keyId}
              onChange={(e) => {
                setKeyId(e.target.value);
                setProfile(null);
              }}
              className="w-full"
              mono
            >
              <option value="">Select an active key</option>
              {activeKeys.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name} ({k.id})
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <label className="block text-[var(--text-muted)] font-mono mb-1">Target Client</label>
          <Select
            value={client}
            onChange={(e) => {
              setClient(e.target.value as ClientProfileClient);
              setProfile(null);
            }}
            className="w-full"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-[var(--text-muted)] font-mono mb-1">Authorized Target Model</label>
          <Select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={loadingModels || models.length === 0}
            className="w-full"
            mono
          >
            {loadingModels ? (
              <option>Loading models…</option>
            ) : models.length === 0 ? (
              <option>No models available</option>
            ) : (
              models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id}
                </option>
              ))
            )}
          </Select>
          {modelsError && <p className="text-[var(--danger)] text-[10px] mt-1">{modelsError}</p>}
        </div>

        <div>
          <label className="block text-[var(--text-muted)] font-mono mb-1">Secret Key (Optional injection)</label>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Inject sk-kinetix-... or leave placeholder"
            mono
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
          {onClose && (
            <Button size="sm" variant="ghost" type="button" onClick={onClose}>
              Close
            </Button>
          )}
          <Button size="sm" variant="primary" type="submit" isLoading={generating} disabled={!keyId || !model}>
            Generate Profile
          </Button>
        </div>
      </form>

      {error && (
        <div className="p-2.5 rounded bg-[var(--danger-bg)] border border-[var(--danger-border)] text-xs font-mono text-[var(--danger)]">
          {error}
        </div>
      )}

      {/* Generated Result Output */}
      {profile && activeFile && (
        <div className="space-y-3 pt-3 border-t border-[var(--border)]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              {profile.files.map((file) => (
                <button
                  key={file.filename}
                  onClick={() => setActiveFilename(file.filename)}
                  className={`px-2 py-1 rounded-[4px] border text-xs cursor-pointer transition-colors ${
                    activeFile.filename === file.filename
                      ? 'bg-[var(--surface-raised)] border-[var(--primary)] text-[var(--text-primary)] font-semibold'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {file.filename}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <Button size="xs" variant="secondary" onClick={() => void copyFile(activeFile)}>
                {copiedFilename === activeFile.filename ? (
                  <Check className="w-3 h-3 text-[var(--healthy)]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copiedFilename === activeFile.filename ? 'Copied' : 'Copy'}
              </Button>
              <Button size="xs" variant="secondary" onClick={() => downloadFile(activeFile)}>
                <Download className="w-3 h-3" />
                Download
              </Button>
            </div>
          </div>

          <TerminalPanel title={activeFile.filename} copyText={activeFile.content} maxHeight="max-h-60">
            {activeFile.content}
          </TerminalPanel>

          {activeFile.destination && (
            <div className="text-[11px] font-mono text-[var(--text-muted)]">
              Suggested destination: <code className="text-[var(--text-secondary)]">{activeFile.destination}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-[6px] max-w-2xl w-full p-5 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return <Card className="p-4">{content}</Card>;
};

export default ClientProfileGenerator;
