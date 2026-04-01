'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { PageSpinner } from '@/components/Spinner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'ready' && !user) {
      router.replace('/login');
    }
  }, [status, user, router]);

  // Still checking auth
  if (status === 'loading') return <PageSpinner />;

  // Auth done but no user — blank while redirect happens
  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
