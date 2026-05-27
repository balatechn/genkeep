'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/utils';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, KeyRound, Wand2, BarChart3, MoreHorizontal,
  Users, Settings, Database, LogOut, X,
} from 'lucide-react';

const mainNav = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vault',      label: 'Vault',     icon: KeyRound },
  { href: '/generator',  label: 'Generate',  icon: Wand2 },
  { href: '/reports',    label: 'Reports',   icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user, logout, refreshToken } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  }

  async function handleLogout() {
    try { if (refreshToken) await authApi.logout(refreshToken); } finally {
      logout(); router.replace('/login');
    }
  }

  return (
    <>
      {/* Slide-up overflow menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute bottom-16 left-0 right-0 bg-dark-800 border-t border-slate-700 rounded-t-2xl p-4 space-y-1"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <Link
              href="/entities"
              onClick={() => setMenuOpen(false)}
              className={cn('flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                isActive('/entities') ? 'bg-primary-600/20 text-primary-400' : 'text-slate-300 hover:bg-slate-700')}
            >
              <Database className="w-5 h-5" /> Entities
            </Link>

            {user?.role === 'ADMIN' && (
              <>
                <Link
                  href="/users"
                  onClick={() => setMenuOpen(false)}
                  className={cn('flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive('/users') ? 'bg-primary-600/20 text-primary-400' : 'text-slate-300 hover:bg-slate-700')}
                >
                  <Users className="w-5 h-5" /> Users
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className={cn('flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive('/settings') ? 'bg-primary-600/20 text-primary-400' : 'text-slate-300 hover:bg-slate-700')}
                >
                  <Settings className="w-5 h-5" /> Settings
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 w-full transition-colors"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-dark-800/95 backdrop-blur border-t border-slate-700/60 lg:hidden bottom-nav"
      >
        <div className="flex items-stretch h-16">
          {mainNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                isActive(href) ? 'text-primary-400' : 'text-slate-500'
              )}
            >
              <Icon className={cn('w-5 h-5 transition-transform', isActive(href) && 'scale-110')} />
              {label}
            </Link>
          ))}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
              menuOpen ? 'text-primary-400' : 'text-slate-500'
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            More
          </button>
        </div>
      </nav>
    </>
  );
}
