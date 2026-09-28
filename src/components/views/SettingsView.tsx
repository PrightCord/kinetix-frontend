import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, KeyRound, LogOut, Info, Globe2, Save, Terminal } from 'lucide-react';
import { Card, Button, StatusBadge, Input, TerminalPanel } from '../KinetixUI';
import { Kinetix } from '../../lib/resources';

interface SettingsViewProps {
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onLogout }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [publicBaseUrl, setPublicBaseUrl] = useState('');
  const [publicBaseSource, setPublicBaseSource] = useState<'dashboard' | 'environment'>('environment');
  const [environmentDefault, setEnvironmentDefault] = useState('');
  const [publicBaseBusy, setPublicBaseBusy] = useState(false);
  const [publicBaseError, setPublicBaseError] = useState<string | null>(null);
  const [publicBaseDone, setPublicBaseDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Kinetix.publicBaseUrl()
      .then((result) => {
        if (cancelled) return;
        setPublicBaseUrl(result.public_base_url);
        setPublicBaseSource(result.source);
        setEnvironmentDefault(result.environment_default);
      })
      .catch((err) => {
        if (!cancelled) {
          setPublicBaseError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (next !== confirmPw) {
      setError('New password and confirmation do not match.');
      return;
    }
    setBusy(true);
    try {
      await Kinetix.changePassword(current, next);
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirmPw('');
      setTimeout(() => onLogout?.(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const savePublicBaseUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublicBaseError(null);
    setPublicBaseDone(false);
    setPublicBaseBusy(true);
    try {
      const result = await Kinetix.updatePublicBaseUrl(publicBaseUrl);
      setPublicBaseUrl(result.public_base_url);
      setPublicBaseSource(result.source);
      setPublicBaseDone(true);
    } catch (err) {
      setPublicBaseError(err instanceof Error ? err.message : String(err));
    } finally {
      setPublicBaseBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Control Plane Settings &amp; Security
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Network origin, operator session policies, and cryptographic master credentials.
          </p>
        </div>

        {onLogout && (
          <Button variant="danger" size="sm" onClick={onLogout}>
            <LogOut className="w-3.5 h-3.5" />
            Sign Out Session
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Public Base URL */}
        <Card
          title="Public Base URL & Callback Origin"
          subtitle="Externally reachable gateway URL for client SDKs and OAuth redirection"
        >
          <form onSubmit={savePublicBaseUrl} className="space-y-3 text-xs">
            <div>
              <label className="block text-[var(--text-muted)] font-mono mb-1">
                External Ingress Base URL
              </label>
              <Input
                type="url"
                value={publicBaseUrl}
                onChange={(e) => setPublicBaseUrl(e.target.value)}
                placeholder="https://kinetix.example.com"
                mono
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1 font-sans">
                Used to generate client profiles and public callbacks. Desktop OAuth uses local loopback.
              </p>
            </div>

            <div className="text-[11px] font-mono text-[var(--text-muted)] p-2 rounded bg-[var(--surface-raised)] border border-[var(--border)]">
              Active Source: <b>{publicBaseSource}</b>
              {environmentDefault && <div className="mt-0.5">Default: {environmentDefault}</div>}
            </div>

            {publicBaseError && (
              <div className="p-2 rounded bg-[var(--danger-bg)] border border-[var(--danger-border)] text-xs font-mono text-[var(--danger)]">
                {publicBaseError}
              </div>
            )}
            {publicBaseDone && (
              <div className="p-2 rounded bg-[var(--healthy-bg)] border border-[var(--healthy-border)] text-xs font-mono text-[var(--healthy)]">
                Public base URL updated successfully.
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm" isLoading={publicBaseBusy}>
                <Save className="w-3.5 h-3.5" />
                Save Public URL
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password */}
        <Card
          title="Administrator Password"
          subtitle="Stored as salted Argon2id/bcrypt hash. Invalidation terminates active sessions."
        >
          <form onSubmit={submit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[var(--text-muted)] font-mono mb-1">Current Password</label>
              <Input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoComplete="current-password"
                required
                mono
              />
            </div>

            <div>
              <label className="block text-[var(--text-muted)] font-mono mb-1">New Password (min 8 chars)</label>
              <Input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                required
                mono
              />
            </div>

            <div>
              <label className="block text-[var(--text-muted)] font-mono mb-1">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
                required
                mono
              />
            </div>

            {error && (
              <div className="p-2 rounded bg-[var(--danger-bg)] border border-[var(--danger-border)] text-xs font-mono text-[var(--danger)]">
                {error}
              </div>
            )}
            {done && (
              <div className="p-2 rounded bg-[var(--healthy-bg)] border border-[var(--healthy-border)] text-xs font-mono text-[var(--healthy)]">
                Password updated. Re-authenticating session…
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm" isLoading={busy}>
                <ShieldCheck className="w-3.5 h-3.5" />
                Update Master Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Session Security Notes */}
        <Card title="Session & Architectural Policies" subtitle="High-security operational invariants">
          <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--healthy)] mt-1.5 shrink-0" />
              <span>
                <b>Stateless Key Storage:</b> Virtual keys are verified against SHA-256 hashes in SQLite WAL; plaintext secrets are never retained.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--healthy)] mt-1.5 shrink-0" />
              <span>
                <b>Ephemeral Operator Sessions:</b> Signed HTTP-only session cookies with 12-hour TTL. Server restart immediately purges session caches.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--healthy)] mt-1.5 shrink-0" />
              <span>
                <b>Zero Outbound Leakage:</b> Upstream provider API keys and bearer tokens are injected in server proxy memory only.
              </span>
            </li>
          </ul>
        </Card>

        {/* CLI Equivalent */}
        <TerminalPanel title="COMMAND LINE EQUIVALENT (CLI)" copyText="kinetix password set 'new-secret-key'">
          <div className="space-y-1">
            <div className="text-[var(--text-muted)]"># Update master password while daemon is active or stopped:</div>
            <div className="text-[var(--terminal-green)]">kinetix password set 'new-secret-key'</div>
            <div className="text-[var(--text-muted)]"># Verify status:</div>
            <div className="text-[var(--terminal-green)]">kinetix status --json</div>
          </div>
        </TerminalPanel>
      </div>
    </div>
  );
};
