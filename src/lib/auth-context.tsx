'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Admin } from '@/types';

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  // 'loading' = haven't checked session yet
  // 'ready'   = check done, user may or may not be logged in
  status: 'loading' | 'ready';
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  // Prevents a stale async fetchAdmin from overwriting newer state
  const fetchIdRef = useRef(0);

  async function loadAdmin(userId: string) {
    const fetchId = ++fetchIdRef.current;
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userId)
        .single();
      // Only apply if this is still the latest fetch
      if (fetchId !== fetchIdRef.current) return;
      if (!error && data) setAdmin(data as Admin);
    } catch {
      // Silently ignore — admin stays null, user is still logged in
    }
  }

  useEffect(() => {
    let mounted = true;

    // Step 1: get current session once on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadAdmin(u.id).finally(() => {
          if (mounted) setStatus('ready');
        });
      } else {
        setStatus('ready');
      }
    });

    // Step 2: listen for future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        const u = session?.user ?? null;
        setUser(u);
        if (!u) {
          setAdmin(null);
          setStatus('ready');
        } else {
          loadAdmin(u.id).finally(() => {
            if (mounted) setStatus('ready');
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    setAdmin(null);
    setUser(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, admin, status, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
