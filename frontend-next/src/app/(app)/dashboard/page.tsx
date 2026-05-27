'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Topbar from '@/components/layout/Topbar';
import { Database, KeyRound, AlertTriangle, Clock } from 'lucide-react';
import { formatDate, timeAgo, isExpiringSoon, isExpired } from '@/utils';
import type { Credential } from '@/types';

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportsApi.dashboard().then(r => r.data),
    refetchInterval: 60000,
  });

  const { data: expiryData } = useQuery({
    queryKey: ['expiry'],
    queryFn: () => reportsApi.expiry(30).then(r => r.data),
  });

  if (isLoading) {
    return (
      <>
        <Topbar title="Dashboard" />
        <main className="flex-1 p-6 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Database}      label="Total Entities"     value={data?.totalEntities ?? 0}     color="bg-primary-600" />
          <StatCard icon={KeyRound}      label="Total Credentials"  value={data?.totalCredentials ?? 0}  color="bg-emerald-600" />
          <StatCard icon={AlertTriangle} label="Expiring (30 days)" value={data?.expiringSoon ?? 0}      color="bg-amber-600" />
          <StatCard icon={Clock}         label="Recently Updated"   value={data?.recentlyUpdated?.length ?? 0} color="bg-blue-600" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card title="Recently Updated">
            {data?.recentlyUpdated?.length ? (
              <div className="space-y-3">
                {data.recentlyUpdated.map((c: Credential) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{c.title}</p>
                      <p className="text-xs text-slate-500">{c.entity?.name}</p>
                    </div>
                    <span className="text-xs text-slate-400">{timeAgo(c.updatedAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No credentials yet</p>
            )}
          </Card>

          <Card title="Expiring Soon">
            {expiryData?.length ? (
              <div className="space-y-2">
                {expiryData.slice(0, 5).map((c: Credential) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{c.title}</p>
                      <p className="text-xs text-slate-500">{c.entity?.name}</p>
                    </div>
                    <Badge variant={isExpired(c.expiryDate) ? 'danger' : isExpiringSoon(c.expiryDate, 7) ? 'warning' : 'success'}>
                      {formatDate(c.expiryDate)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No expiring credentials</p>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
