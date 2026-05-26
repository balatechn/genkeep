import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate, isExpired, isExpiringSoon } from '@/utils';
import { AlertTriangle } from 'lucide-react';

export default function ReportsPage() {
  const { data: expiry = [], isLoading } = useQuery({
    queryKey: ['expiry-report'],
    queryFn: () => reportsApi.expiry(60).then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportsApi.dashboard().then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Entities',    value: stats?.totalEntities ?? 0 },
          { label: 'Total Credentials', value: stats?.totalCredentials ?? 0 },
          { label: 'Expiring (30d)',    value: stats?.expiringSoon ?? 0 },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <Card title="Credential Expiry (next 60 days)">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : expiry.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            No expiring credentials in the next 60 days
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Title</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Entity</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Username</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Expiry</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {expiry.map(c => (
                  <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-white">{c.title}</td>
                    <td className="py-3 px-4 text-slate-300">{c.entity?.name}</td>
                    <td className="py-3 px-4 text-slate-300">{c.username}</td>
                    <td className="py-3 px-4 text-slate-300">{formatDate(c.expiryDate)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={isExpired(c.expiryDate) ? 'danger' : isExpiringSoon(c.expiryDate, 7) ? 'warning' : 'info'}>
                        {isExpired(c.expiryDate) ? 'Expired' : isExpiringSoon(c.expiryDate, 7) ? 'Critical' : 'Upcoming'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
