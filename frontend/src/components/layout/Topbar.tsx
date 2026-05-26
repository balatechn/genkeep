import { Menu, Sun, Moon, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authApi } from '@/api';

interface TopbarProps { title: string; }

export default function Topbar({ title }: TopbarProps) {
  const { user, logout, refreshToken } = useAuthStore();
  const { toggleSidebar, toggleTheme, theme } = useUIStore();

  async function handleLogout() {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      logout();
    }
  }

  return (
    <header className="h-16 bg-dark-800/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-slate-400 hover:text-white lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-slate-700 mx-1" />
        <span className="text-sm text-slate-400 hidden sm:block">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
