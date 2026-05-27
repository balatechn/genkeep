'use client';

import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Topbar from '@/components/layout/Topbar';
import { Shield, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();

  return (
    <>
      <Topbar title="Settings" />
      <main className="flex-1 p-6">
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
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </Card>

          <Card title="About">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">GenKeep v1.0</p>
                <p className="text-xs text-slate-500">Secure password generator &amp; keeper · Internal use only</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
