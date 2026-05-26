import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles: Record<string, string> = {
  '/':          'Dashboard',
  '/entities':  'Entities',
  '/vault':     'Password Vault',
  '/generator': 'Password Generator',
  '/reports':   'Reports',
  '/users':     'User Management',
  '/settings':  'Settings',
};

export default function AppLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? 'GenKeep';

  return (
    <div className="flex h-screen bg-dark-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <Topbar title={title} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
