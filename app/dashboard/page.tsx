'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('staffToken');
    const exp = Number(localStorage.getItem('staffExpires') || 0);
    if (!t || exp < Date.now()) {
      router.push('/login');
      return;
    }
    setAuthorized(true);
    setLoading(false);
  }, [router]);

  function logoutNow() {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffExpires');
    router.push('/');
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="section">
      <div style={{ marginBottom: 34 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Welcome back! You are logged in.
        </p>
      </div>

      <div className="grid grid-3">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--neon)' }}>0</div>
          <div style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
            Candidates
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>💼</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--neon)' }}>0</div>
          <div style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
            Open Offers
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--neon)' }}>0</div>
          <div style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
            Qualified Matches
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={logoutNow} className="btn btn-ghost">
          Logout
        </button>
      </div>
    </div>
  );
}