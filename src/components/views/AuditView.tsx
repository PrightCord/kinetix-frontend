import React, { useState } from 'react';
import { History, Shield, Clock, Search, X } from 'lucide-react';
import { AuditLog } from '../../types';
import { Card, StatusBadge, Input } from '../KinetixUI';

interface AuditViewProps {
  logs: AuditLog[];
}

export const AuditView: React.FC<AuditViewProps> = ({ logs }) => {
  const [filterText, setFilterText] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return (
      log.actor.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.targetName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Security &amp; Operations Audit Trail
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Immutable log of key issuances, limit adjustments, quota cooldown transitions, and configuration edits.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter actor, action, target…"
            icon={<Search className="w-3.5 h-3.5" />}
            mono
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="kinetix-table font-mono text-xs">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action Type</th>
                <th>Target Object</th>
                <th>Event Details &amp; Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredLogs.map((log) => {
                const isSystem = log.actor === 'system';

                return (
                  <tr key={log.id} className="hover:bg-[var(--surface-raised)]">
                    <td className="text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      {isSystem ? (
                        <StatusBadge variant="neutral" size="sm">
                          daemon
                        </StatusBadge>
                      ) : (
                        <StatusBadge variant="info" size="sm">
                          {log.actor}
                        </StatusBadge>
                      )}
                    </td>
                    <td className="font-semibold text-[var(--text-primary)] whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
                        {log.targetName}
                      </span>
                    </td>
                    <td className="font-sans text-[var(--text-secondary)] text-xs">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-[var(--text-muted)] font-sans">
                    No audit records match the active filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
