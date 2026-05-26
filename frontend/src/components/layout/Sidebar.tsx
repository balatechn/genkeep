import { NavLink } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/store/auth.store';
import {
  LayoutDashboard, Database, KeyRound, Wand2, BarChart3, Settings, Users, Shield, X,
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

const navItems = [
  { to: '/',           label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/entities',   label: 'Entities',    icon: Database },
  { to: '/vault',      label: 'Password Vault', icon: KeyRound },
  { to: '/generator',  label: 'Generator',   icon: Wand2 },
  { to: '/reports',    label: 'Reports',     icon: BarChart3 },
];

const adminItems = [
  { to: '/users',    label: 'Users',    icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-dark-900 border-r border-slate-800 z-30 flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:z-auto'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">GenKeep</span>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}

          {user?.role === 'ADMIN' && (
            <>
              <p className="px-3 py-2 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin</p>
              {adminItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
