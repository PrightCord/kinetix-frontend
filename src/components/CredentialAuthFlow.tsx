import { useEffect, useRef, useState } from 'react';
import { LogIn, X, ExternalLink } from 'lucide-react';
import { Kinetix } from '../lib/resources';
import { Button, Card } from './KinetixUI';

export interface AuthEnrollmentStart {
  authorize_url: string;
  redirect_uri: string;
  state: string;
  expires_in_secs: number;
  manual_callback_supported: boolean;
}

interface AuthSession {
  authorizeUrl: string;
  callbackUrl: string;
  providerId: string;
  state: string;
  redirectUri: string;
  showFallback: boolean;
}

interface UseAuthEnrollmentOptions {
  onSuccess: (providerId: string) => void | Promise<void>;
  onError: (message: string) => void;
}

export function useAuthEnrollment({ onSuccess, onError }: UseAuthEnrollmentOptions) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [busy, setBusy] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const begin = async (
    providerId: string,
    start: () => Promise<AuthEnrollmentStart>,
  ) => {
    setBusy(true);
    try {
      const started = await start();
      if (started.manual_callback_supported) {
        setSession({
          authorizeUrl: started.authorize_url,
          callbackUrl: '',
          providerId,
          state: started.state,
          redirectUri: started.redirect_uri,
          showFallback: false,
        });
        window.open(started.authorize_url, '_blank', 'noopener,noreferrer');
        setBusy(false);
      } else {
        window.location.assign(started.authorize_url);
      }
    } catch (error) {
      onErrorRef.current(error instanceof Error ? error.message : String(error));
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const status = await Kinetix.pluginAuthStatus(session.state);
        if (cancelled || status.result === 'pending') return;
        if (status.result === 'success') {
          const providerId = session.providerId;
          setSession(null);
          await onSuccessRef.current(providerId);
          return;
        }
        setSession(null);
        onErrorRef.current(
          status.result === 'cancelled'
            ? 'Account authorization was cancelled.'
            : status.result === 'binding_changed'
              ? 'Provider binding changed during authorization.'
              : status.result === 'reauthorization_required'
                ? 'The provider rejected the new credential. Reauthorize the account and try again.'
                : 'Account authorization failed during token exchange.',
        );
      } catch {
        // The callback can briefly move between the one-time session and
        // completion ledger. Keep polling until it resolves.
      }
    };

    void poll();
    const timer = window.setInterval(() => void poll(), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [session?.state, session?.providerId]);

  const completeManual = async () => {
    if (!session?.callbackUrl.trim()) return;
    setBusy(true);
    try {
      const result = await Kinetix.completePluginAuth(session.callbackUrl.trim());
      if (!result.ok || result.result !== 'success') {
        throw new Error(
          result.result === 'cancelled'
            ? 'Account authorization was cancelled.'
            : result.result === 'binding_changed'
              ? 'Provider binding changed during authorization.'
              : result.result === 'reauthorization_required'
                ? 'The provider rejected the new credential. Reauthorize the account and try again.'
                : 'Account authorization failed during token exchange.',
        );
      }
      const providerId = session.providerId;
      setSession(null);
      await onSuccessRef.current(providerId);
    } catch (error) {
      onErrorRef.current(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const modal = session ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credential-auth-waiting-title"
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <Card className="p-5 bg-[var(--surface)] border border-[var(--border-strong)] rounded-[6px] shadow-2xl relative space-y-4">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-[var(--primary-bg)] border border-[var(--primary-border)] flex items-center justify-center text-[var(--primary)] shrink-0">
                <LogIn className="w-4 h-4" />
              </div>
              <div>
                <h3 id="credential-auth-waiting-title" className="text-sm font-semibold text-[var(--text-primary)]">
                  Waiting for Account Authorization
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Complete authorization in the upstream provider tab. Status polls automatically.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSession(null)}
              disabled={busy}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer disabled:opacity-50"
              aria-label="Cancel account authorization"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 flex-wrap text-xs">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(session.authorizeUrl, '_blank', 'noopener,noreferrer')}
              disabled={busy}
            >
              <ExternalLink className="w-3.5 h-3.5 text-[var(--primary)]" />
              Reopen Authorization Tab
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSession((current) =>
                  current ? { ...current, showFallback: !current.showFallback } : current,
                )
              }
              disabled={busy}
            >
              {session.showFallback ? 'Hide Manual Fallback' : 'Loopback Did Not Load?'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSession(null)} disabled={busy}>
              Cancel
            </Button>
          </div>

          {session.showFallback && (
            <div className="mt-3 p-3 bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] space-y-2 text-xs">
              <p className="text-[11px] text-[var(--text-muted)]">
                Paste the final callback URL from your browser address bar. It must match the configured redirect URI:
              </p>
              <code className="block text-[11px] font-mono break-all bg-[var(--surface)] p-2 rounded border border-[var(--border-subtle)] text-[var(--primary)]">
                {session.redirectUri}
              </code>
              <textarea
                rows={3}
                value={session.callbackUrl}
                onChange={(event) =>
                  setSession((current) =>
                    current ? { ...current, callbackUrl: event.target.value } : current,
                  )
                }
                placeholder="https://.../callback?code=..."
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] font-mono text-xs text-[var(--text-primary)] focus:border-[var(--primary)] focus-visible:outline-none"
              />
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => void completeManual()}
                  disabled={busy || !session.callbackUrl.trim()}
                  isLoading={busy}
                >
                  Complete Authorization
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  ) : null;

  return { begin, busy, modal };
}
