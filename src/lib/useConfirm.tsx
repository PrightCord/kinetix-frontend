import React, { useCallback, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../components/KinetixUI';

interface ConfirmRequest {
  title: string;
  message: string;
  detail?: string;
  confirmLabel: string;
  danger: boolean;
  resolve: (ok: boolean) => void;
}

/**
 * Promise-based confirmation for destructive actions. Every irreversible
 * operation (delete, revoke, clear) gates on this modal.
 */
export function useConfirm() {
  const [req, setReq] = useState<ConfirmRequest | null>(null);

  const confirm = useCallback(
    (opts: Omit<ConfirmRequest, 'resolve' | 'danger' | 'confirmLabel'> & {
      confirmLabel?: string;
      danger?: boolean;
    }) =>
      new Promise<boolean>((resolve) => {
        setReq({
          title: opts.title,
          message: opts.message,
          detail: opts.detail,
          confirmLabel: opts.confirmLabel || 'Confirm',
          danger: opts.danger ?? true,
          resolve,
        });
      }),
    [],
  );

  const close = (ok: boolean) => {
    req?.resolve(ok);
    setReq(null);
  };

  const confirmNode = req ? (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border-strong)] rounded-[6px] p-5 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[4px] bg-[var(--danger-bg)] border border-[var(--danger-border)] flex items-center justify-center text-[var(--danger)] shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {req.title}
          </h3>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {req.message}
        </p>

        {req.detail && (
          <p className="p-2.5 rounded-[4px] text-xs font-mono bg-[var(--surface-raised)] border border-[var(--warning-border)] text-[var(--warning)] break-all">
            {req.detail}
          </p>
        )}

        <div className="pt-2 flex justify-end gap-2 border-t border-[var(--border)]">
          <Button variant="secondary" size="sm" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button
            variant={req.danger ? 'danger' : 'primary'}
            size="sm"
            onClick={() => close(true)}
          >
            {req.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, confirmNode };
}
