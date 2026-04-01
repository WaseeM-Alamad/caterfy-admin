'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { AppBadge } from '@/components/Badge';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { VendorApplication } from '@/types';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle, XCircle, Search, Mail, Phone, MapPin, Globe, Building2, FileText, User, Calendar } from 'lucide-react';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { admin } = useAuth();
  const { show: showToast, node: toastNode } = useToast();

  const [app, setApp]         = useState<VendorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState<string | null>(null);
  const [notes, setNotes]     = useState('');
  const [confirming, setConfirming] = useState<'approved' | 'declined' | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from('vendor_applications')
        .select('*, reviewer:admins(id,full_name,email)')
        .eq('id', id)
        .single();
      if (!cancelled) {
        setApp(data ?? null);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const act = async (status: 'approved' | 'declined' | 'under_review') => {
    if ((status === 'approved' || status === 'declined') && !confirming) {
      setConfirming(status);
      return;
    }
    setBusy(status);
    const { error } = await supabase
      .from('vendor_applications')
      .update({ status, reviewed_by: admin?.id, review_notes: notes || null, reviewed_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      showToast('Something went wrong. Please try again.', 'error');
    } else {
      showToast(
        status === 'approved' ? 'Application approved! Vendor is now active.' :
        status === 'declined' ? 'Application declined.' :
        'Marked as in review.',
        'success'
      );
      setConfirming(null);
      setNotes('');
      // Refetch
      const { data } = await supabase
        .from('vendor_applications')
        .select('*, reviewer:admins(id,full_name,email)')
        .eq('id', id)
        .single();
      setApp(data ?? null);
    }
    setBusy(null);
  };

  const cancelConfirm = () => { setConfirming(null); setNotes(''); };

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
        </div>
      </AppShell>
    );
  }

  if (!app) {
    return (
      <AppShell>
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text3)', marginBottom: 12 }}>Application not found.</p>
          <button className="btn-ghost" onClick={() => router.back()}><ArrowLeft size={14} />Go back</button>
        </div>
      </AppShell>
    );
  }

  const isPending = app.status === 'pending' || app.status === 'under_review';

  return (
    <AppShell>
      {toastNode}
      <div style={{ padding: '2rem', maxWidth: 860 }}>
        <button className="btn-ghost" onClick={() => router.back()} style={{ marginBottom: '1.25rem', padding: '0.4375rem 0.75rem', fontSize: '0.8125rem' }}>
          <ArrowLeft size={13} /> Back
        </button>

        {/* Header card */}
        <div className="card animate-slide-up" style={{ padding: '1.375rem', marginBottom: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Left: avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 13, flexShrink: 0,
                background: 'linear-gradient(135deg,rgba(147,89,255,0.3),rgba(107,53,204,0.3))',
                border: '1px solid rgba(147,89,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: 700, color: '#C49BFF',
              }}>
                {app.store_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.015em' }}>{app.store_name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <AppBadge status={app.status} />
                  <span style={{ color: 'var(--text3)', fontSize: '0.8125rem' }}>· {app.business_type}</span>
                </div>
              </div>
            </div>

            {/* Right: action buttons */}
            {isPending && !confirming && (
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {app.status === 'pending' && (
                  <button className="btn-ghost" onClick={() => act('under_review')} disabled={!!busy} style={{ fontSize: '0.8125rem', padding: '0.4375rem 0.75rem' }}>
                    <Search size={13} /> Mark In Review
                  </button>
                )}
                <button className="btn-danger" onClick={() => act('declined')} disabled={!!busy} style={{ fontSize: '0.8125rem', padding: '0.4375rem 0.75rem' }}>
                  <XCircle size={13} /> Decline
                </button>
                <button className="btn-success" onClick={() => act('approved')} disabled={!!busy} style={{ fontSize: '0.8125rem', padding: '0.4375rem 0.75rem' }}>
                  <CheckCircle size={13} /> Approve
                </button>
              </div>
            )}
          </div>

          {/* Confirmation panel */}
          {confirming && (
            <div style={{ marginTop: '1.125rem', padding: '1.125rem', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text2)', marginBottom: 7 }}>
                {confirming === 'approved' ? 'Approval note (optional)' : 'Reason for declining (optional)'}
              </label>
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder={confirming === 'approved' ? 'Welcome message or notes…' : 'Reason for declining…'}
                className="input" style={{ resize: 'vertical', marginBottom: 10 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={confirming === 'approved' ? 'btn-success' : 'btn-danger'}
                  onClick={() => act(confirming)} disabled={!!busy}
                  style={{ fontSize: '0.8125rem' }}
                >
                  {busy ? <><div className="spinner" style={{ width: 13, height: 13 }} />Processing…</> : `Confirm ${confirming === 'approved' ? 'Approval' : 'Decline'}`}
                </button>
                <button className="btn-ghost" onClick={cancelConfirm} style={{ fontSize: '0.8125rem' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Review info */}
          {app.reviewed_at && (
            <div style={{ marginTop: '1rem', padding: '0.75rem 0.875rem', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.8125rem', color: 'var(--text3)' }}>
              Reviewed by <strong style={{ color: 'var(--text2)' }}>{(app.reviewer as any)?.full_name ?? 'Admin'}</strong> · {format(new Date(app.reviewed_at), 'MMM d, yyyy · HH:mm')}
              {app.review_notes && <div style={{ marginTop: 5, color: 'var(--text2)', fontStyle: 'italic' }}>"{app.review_notes}"</div>}
            </div>
          )}
        </div>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.125rem' }}>
          <DetailCard title="Contact" icon={<User size={13} style={{ color: 'var(--brand)' }} />}>
            <Row icon={<User size={12} />}    label="Owner"   value={app.owner_name} />
            <Row icon={<Mail size={12} />}    label="Email"   value={app.email} />
            <Row icon={<Phone size={12} />}   label="Phone"   value={app.phone} />
            {app.website_url && <Row icon={<Globe size={12} />} label="Website" value={app.website_url} link />}
          </DetailCard>

          <DetailCard title="Location & Business" icon={<MapPin size={13} style={{ color: 'var(--brand)' }} />}>
            <Row icon={<Building2 size={12} />} label="Type"    value={app.business_type} />
            <Row icon={<MapPin size={12} />}    label="Address" value={app.address} />
            <Row icon={<MapPin size={12} />}    label="City"    value={app.city ?? '—'} />
            <Row icon={<Calendar size={12} />}  label="Applied" value={format(new Date(app.created_at), 'MMM d, yyyy')} />
          </DetailCard>

          {app.description && (
            <div className="card" style={{ padding: '1.125rem', gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text2)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={13} style={{ color: 'var(--brand)' }} /> Description
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.65, opacity: 0.85 }}>{app.description}</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function DetailCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '1.125rem' }}>
      <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon} {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

function Row({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <span style={{ color: 'var(--text3)', marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 1 }}>{label}</div>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: 'var(--brand)', wordBreak: 'break-all' }}>{value}</a>
        ) : (
          <div style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{value}</div>
        )}
      </div>
    </div>
  );
}
