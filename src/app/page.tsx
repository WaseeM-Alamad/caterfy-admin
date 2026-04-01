'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function RootPage() {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'ready') return;
    router.replace(user ? '/dashboard' : '/login');
  }, [status, user, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-lg" />
    </div>
  );
}
