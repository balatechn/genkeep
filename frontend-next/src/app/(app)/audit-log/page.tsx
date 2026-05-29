'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Topbar from '@/components/layout/Topbar';
import { ClipboardList, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { cn, timeAgo } from '@/utils';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ActivityLog } from '@/types';

const ACTION_COLORS: Record<string, string> = {
  LOGIN:    'bg-blue-900/30 text-blue-400 border border-blue-700/40',
  LOGOUT:   'bg-slate-800 text-slate-400 border border-slate-600/40',
  CREATE:   'bg-emerald-900/30 text-emerald-400 border border-emerald-700/40',
  UPDATE:   'bg-amber-900/30 text-amber-400 border border-amber-700/40',
  DELETE:   'bg-red-900/30 text-red-400 border border-red-700/40',
  REVEAL:   'bg-purple-900/30 text-purple-400 border border-purple-700/40',
};

function ActionBadge({ action }: { action: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold', ACTION_COLORS[action] ?? 'bg-slate-800 text-slate-400')}>
      {action}
    </span>
  );
}

const ACTIONS = ['ALL', 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'REVEAL'];
const PAGE_SIZE = 50;

export default function AuditLogPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [user, router]);

  const params: Record<string, string> = {
    page: String(page),
    limit: String(PAGE_SIZE),
    ...(actionFilter !== 'ALL' && { action: actionFilter }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', actionFilter, page],
    queryFn: () => reportsApi.logs(params).then(r => r.data),
    enabled: user?.role === 'ADMIN',
  });

  const logs: ActivityLog[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Topbar title="Audit Log" />
      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map(a => (
            <button
              key={a}
              onClick={() => { setActionFilter(a); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                actionFilter === a
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-slate-400 hover:text-white border border-slate-700'
              )}
            >
              {a}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500 self-center">
            {total} {total === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <Card>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No log entries found</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="bg-dark-900 border border-slate-700/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <ActionBadge action={log.action} />
                      <span className="text-xs text-slate-500">{timeAgo(log.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-sm text-slate-300 truncate">{log.user?.name ?? 'System'}</span>
                      <span className="text-xs text-slate-500 truncate">{log.user?.email}</span>
                    </div>
                    {log.targetType && (
                      <p className="text-xs text-slate-400">
                        <span className="text-slate-500">Target: </span>
                        <span className="capitalize">{log.targetType}</span>
                      </p>
                    )}
                    {log.description && (
                      <p className="text-xs text-slate-400 truncate">{log.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Time</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Target</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-xs">
                          <span title={new Date(log.createdAt).toLocaleString()}>{timeAgo(log.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-white text-sm font-medium">{log.user?.name ?? 'System'}</p>
                          <p className="text-xs text-slate-500">{log.user?.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="py-3 px-4 text-slate-400 capitalize text-xs">{log.targetType ?? '—'}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs max-w-xs truncate">
                          {log.description ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-700 mt-4">
                  <span className="text-sm text-slate-400">
                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                      icon={<ChevronLeft className="w-4 h-4" />}>Prev</Button>
                    <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                      icon={<ChevronRight className="w-4 h-4" />}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </main>
    </>
  );
}
