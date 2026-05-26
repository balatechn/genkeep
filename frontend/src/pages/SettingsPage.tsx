import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Shield, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();

  return (
    <div className="max-w-2xl space-y-6">
      <Card title="Profile">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Name</span>
            <span className="text-white text-sm font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Email</span>
            <span className="text-white text-sm">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Role</span>
            <Badge variant={user?.role === 'ADMIN' ? 'info' : 'default'}>{user?.role}</Badge>
          </div>
        </div>
      </Card>

      <Card title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Theme</p>
            <p className="text-xs text-slate-500">Toggle between dark and light mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </Card>

      <Card title="Security">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-emerald-900/20 border border-emerald-800/50 rounded-lg">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-emerald-400">AES-256-GCM encryption active</p>
              <p className="text-xs text-slate-400">All passwords encrypted at rest with per-record IV</p>
            </div>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <p>• Session timeout: {import.meta.env.VITE_SESSION_TIMEOUT || 30} minutes</p>
            <p>• Access tokens expire every 15 minutes</p>
            <p>• All reveal actions are audit-logged</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
