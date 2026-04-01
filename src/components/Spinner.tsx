export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'spinner spinner-lg' : 'spinner';
  return <div className={cls} />;
}

export function PageSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
      <div className="spinner spinner-lg" />
      <p style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>Loading…</p>
    </div>
  );
}
