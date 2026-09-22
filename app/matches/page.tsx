'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MatchesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('staffToken');
    const exp = Number(localStorage.getItem('staffExpires') || 0);
    if (!t || exp < Date.now()) {
      router.push('/login');
      return;
    }

    fetch('/api/matches', {
      headers: { Authorization: 'Bearer ' + t },
    })
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem('staffToken');
          localStorage.removeItem('staffExpires');
          router.push('/login');
          throw new Error('Unauthorized');
        }
        return r.json();
      })
      .then((res) => {
        if (res.ok) setData(res);
        else setError(res.error || 'Failed');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="section">
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
          Loading matches…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="alert alert-error" style={{ maxWidth: 600, margin: '60px auto' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="section">
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em' }}>
          Auto <span className="grad">Matches</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Candidates matched to open offers based on requirements
        </p>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 30 }}>
        <KpiCard icon="users" value={data.totalCandidates} label="Total Candidates" />
        <KpiCard icon="briefcase" value={data.totalOpenOffers} label="Open Offers" />
        <KpiCard icon="target" value={data.totalMatches} label="Total Matches" />
      </div>

      {data.offerMatches.length === 0 && (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
          <p style={{ fontSize: 44, marginBottom: 12 }}>🎯</p>
          <p>No matches yet.</p>
        </div>
      )}

      {data.offerMatches.map((om: any) => (
        <div key={om.offer.id} style={{ marginBottom: 30 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              background:
                'linear-gradient(135deg, rgba(198,232,45,0.1), rgba(198,232,45,0.03))',
              border: '1px solid rgba(198,232,45,0.3)',
              borderRadius: '14px 14px 0 0',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                {om.offer.jobTitle}
              </h3>
              <div style={{ color: 'var(--neon)', fontSize: 13, fontWeight: 700 }}>
                {om.offer.companyName} · {om.offer.site || ''}
              </div>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                background: 'rgba(198,232,45,0.15)',
                border: '1px solid rgba(198,232,45,0.4)',
                borderRadius: 999,
                color: 'var(--neon)',
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 4px rgba(198,232,45,0.6))' }}
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              {om.qualifiedCount} qualified
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--border)',
              borderTop: 'none',
              borderRadius: '0 0 14px 14px',
              background: 'var(--card)',
              padding: om.candidates.length === 0 ? 40 : 0,
            }}
          >
            {om.candidates.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                No qualified candidates yet.
              </p>
            ) : (
              om.candidates.map((m: any, i: number) => (
                <div
                  key={`${om.offer.id}-${m.candidate.rowIndex}`}
                  style={{
                    padding: '16px 20px',
                    borderBottom:
                      i < om.candidates.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                      {m.candidate.tripleName}
                    </div>
                    <div
                      style={{
                        color: 'var(--muted)',
                        fontSize: 12,
                        display: 'flex',
                        gap: 14,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {m.candidate.phone}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {m.candidate.age}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        {m.candidate.nationality}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                        {m.candidate.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="score-bar" style={{ width: 80, height: 8 }}>
                      <div style={{ width: `${m.score}%` }} />
                    </div>
                    <span
                      style={{
                        fontWeight: 800,
                        color: 'var(--neon)',
                        fontSize: 15,
                        minWidth: 44,
                        textAlign: 'right',
                      }}
                    >
                      {m.score}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function KpiCard({
  icon,
  value,
  label,
}: {
  icon: 'users' | 'briefcase' | 'target';
  value: number;
  label: string;
}) {
  const icons: Record<string, React.ReactElement> = {
    users: (
      <svg viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    briefcase: (
      <svg viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    target: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  };

  return (
    <div className="kpi">
      <div className="icon-svg">{icons[icon]}</div>
      <div className="num">{value}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}