import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import { Card, Button, StatusBadge, Input } from './KinetixUI';
import { Kinetix } from '../lib/resources';

interface LoginScreenProps {
  onLogin?: (username: string) => void;
  onLoginSuccess?: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notifySuccess = (user: string) => {
    if (onLoginSuccess) {
      onLoginSuccess(user);
    } else if (onLogin) {
      onLogin(user);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedPass = password.trim();
    if (!trimmedPass) {
      setError('Please enter the operator admin token.');
      return;
    }

    setIsSubmitting(true);
    try {
      const r = await Kinetix.login(trimmedPass);
      notifySuccess(r.user || 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid gateway credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="p-6 space-y-5 border-[var(--border-strong)] bg-[var(--surface)] shadow-2xl">
          {/* Logo & Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-[#1a1a24] border border-[var(--primary)] flex items-center justify-center font-mono font-bold text-sm text-[var(--primary)] select-none">
                K
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                  KINETIX CONTROL PLANE
                </h1>
                <p className="text-[11px] font-mono text-[var(--text-muted)]">
                  Operator Session Ingress
                </p>
              </div>
            </div>

            <StatusBadge variant="info" size="sm">
              v0.5.2
            </StatusBadge>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--text-secondary)] mb-1.5">
                Admin Gateway Secret / Master Key
              </label>
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin token…"
                  autoFocus
                  mono
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono block mt-1">
                Default: type any admin password in standalone demo mode
              </span>
            </div>

            {error && (
              <div className="p-2.5 rounded-[4px] bg-[var(--danger-bg)] border border-[var(--danger-border)] text-xs font-mono text-[var(--danger)]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full font-mono text-xs"
            >
              <span>Authenticate Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          {/* Footer security note */}
          <div className="pt-3 border-t border-[var(--border)] text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--healthy)]" />
              Ingress Port 3000
            </span>
            <span>HTTP/2 • SQLite WAL</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
