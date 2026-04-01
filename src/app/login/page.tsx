'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { signIn, status, user } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'ready' && user) router.replace('/dashboard');
  }, [status, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError('Invalid email or password.');
      setLoading(false);
    }
    // On success, onAuthStateChange fires → status becomes ready → useEffect above redirects
  };

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Glow blobs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(147,89,255,0.1) 0%,transparent 70%)', top: -80, left: -80, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(147,89,255,0.07) 0%,transparent 70%)', bottom: 0, right: 0, pointerEvents: 'none' }} />

      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 400, padding: '0 1rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: 14, marginBottom: 14,
            background: 'linear-gradient(135deg,#9359FF,#6B35CC)',
            boxShadow: '0 8px 28px rgba(147,89,255,0.4)',
          }}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <path d="M14 3L25 9V19L14 25L3 19V9L14 3Z" stroke="white" strokeWidth="2.5" fill="rgba(255,255,255,0.1)" />
              <path d="M14 8L20 11.5V18.5L14 22L8 18.5V11.5L14 8Z" fill="white" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Caterfy Admin
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>Sign in to manage your platform</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(19,13,33,0.9)', border: '1px solid rgba(147,89,255,0.18)',
          borderRadius: 16, padding: '1.75rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text2)', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@caterfy.com" required autoComplete="email"
                  className="input" style={{ paddingLeft: '2.125rem' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text2)', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  className="input" style={{ paddingLeft: '2.125rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 2 }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 0.875rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#F87171', fontSize: '0.8125rem' }}>
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', padding: '0.6875rem', fontSize: '0.9375rem', marginTop: 4 }}>
              {loading ? <><div className="spinner" style={{ width: 15, height: 15 }} />Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '0.75rem', marginTop: '1.25rem' }}>
          Admin access only · Caterfy © 2025
        </p>
      </div>
    </div>
  );
}
