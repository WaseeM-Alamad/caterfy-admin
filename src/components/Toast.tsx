'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isSuccess = type === 'success';
  return (
    <div
      className="animate-slide-right"
      style={{
        position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 200,
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '0.75rem 1rem',
        background: isSuccess ? 'rgba(20,40,28,0.95)' : 'rgba(40,18,18,0.95)',
        border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        borderRadius: '10px', maxWidth: '360px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {isSuccess
        ? <CheckCircle size={15} style={{ color: '#4ADE80', flexShrink: 0 }} />
        : <XCircle    size={15} style={{ color: '#F87171', flexShrink: 0 }} />}
      <span style={{ fontSize: '0.875rem', color: isSuccess ? '#86EFAC' : '#FCA5A5', flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '2px', display: 'flex' }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

// Lightweight hook — no external lib needed
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const show = (message: string, type: ToastType = 'success') => setToast({ message, type });
  const dismiss = () => setToast(null);
  const node = toast ? <Toast message={toast.message} type={toast.type} onDismiss={dismiss} /> : null;
  return { show, node };
}
