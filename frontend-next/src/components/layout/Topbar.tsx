'use client';

import { Menu, Sun, Moon, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authApi } from '@/api';
import { useRouter } from 'next/navigation';

export default function Topbar({ title }: { title: string }) {
  const { user, logout, refreshToken } = useAuthStore();
  const { toggleSidebar, toggleTheme, theme } = useUIStore();
  const router = useRouter();

  async function handleLogout() {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      logout();
      router.replace('/login');
    }
  }

  return (
    <header className="h-14 sm:h-16 bg-dark-800/90 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shrink-0">
      {/* Left: hamburger (desktop) or logo (mobile) */}
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="text-slate-400 hover:text-white hidden lg:flex p-1">
          <Menu className="w-5 h-5" />
        </button>
        {/* Mobile: show app logo instead of hamburger (bottom nav handles nav) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">GenKeep</span>
        </div>
        <h1 className="text-base sm:text-lg font-semibold text-white lg:block hidden">{title}</h1>
        <h1 className="text-sm font-medium text-slate-300 lg:hidden">{title}</h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="w-px h-5 bg-slate-700 mx-0.5 hidden sm:block" />
        <span className="text-sm text-slate-400 hidden md:block max-w-[140px] truncate">{user?.email}</span>
        {/* Logout only visible on desktop; mobile uses BottomNav More menu */}
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors hidden lg:flex"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
