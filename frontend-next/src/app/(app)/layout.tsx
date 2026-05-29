'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/login');
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-dark-950 text-white overflow-hidden">
      <Sidebar />
      {/* pb-16 = bottom nav height on mobile; hidden on lg where sidebar is shown */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto pb-16 lg:pb-0">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
