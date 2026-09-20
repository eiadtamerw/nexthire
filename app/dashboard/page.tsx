'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Candidate = any;
type DashboardData = {
  totalCandidates: number;
  totalOffers: number;
  openOffers: number;
  scheduledInterviews: number;
  candidates: Candidate[];
  offers: any[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'candidates' | 'offers'>('candidates');
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('staffToken');
    const exp = Number(localStorage.getItem('staffExpires') || 0);
    if (!t || exp < Date.now()) {
      router.push('/login');
      return;
    }

    fetch('/api/dashboard', {
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
        <div style={{ textAlign: 'center', padding: 80 }}>
          <p style={{ color: 'var(--muted)' }}>Loading dashboard…</p>
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
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em' }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Real-time statistics from Google Sheets</p>
      </div>

      <div className="grid grid-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard icon="👥" value={data.totalCandidates} label="Candidates" />
        <KpiCard icon="📅" value={data.scheduledInterviews} label="Scheduled Interviews" />
        <KpiCard icon="💼" value={data.openOffers} label="Open Offers" />
        <KpiCard icon="📊" value={data.totalOffers} label="Total Offers" />
      </div>

      <div className="tabs" style={{ marginTop: 44 }}>
        <button
          className={'tab' + (activeTab === 'candidates' ? ' on' : '')}
          onClick={() => setActiveTab('candidates')}
        >
          Candidates ({data.totalCandidates})
        </button>
        <button
          className={'tab' + (activeTab === 'offers' ? ' on' : '')}
          onClick={() => setActiveTab('offers')}
        >
          Offers ({data.openOffers})
        </button>
      </div>

      {activeTab === 'candidates' && <CandidatesTab candidates={data.candidates} />}
      {activeTab === 'offers' && <OffersTab offers={data.offers} />}
    </div>
  );
}

function KpiCard({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="kpi">
      <div className="icon">{icon}</div>
      <div className="num">{value}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}

function CandidatesTab({ candidates }: { candidates: Candidate[] }) {
  if (candidates.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
        <p style={{ fontSize: 44, marginBottom: 12 }}>👥</p>
        <p>No candidates yet.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Applied For</th>
            <th>Phone</th>
            <th>Nationality</th>
            <th>Status</th>
            <th>Age</th>
            <th>Interview</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c, i) => {
            const parts: string[] = [];
            if (c.interviewDate) parts.push('📅 ' + c.interviewDate);
            if (c.interviewTime) parts.push('🕒 ' + c.interviewTime);

            return (
              <tr key={c.rowIndex}>
                <td>{i + 1}</td>
                <td><strong>{c.tripleName}</strong></td>
                <td>{c.appliedOfferTitle || '—'}</td>
                <td>{c.phone}</td>
                <td>{c.nationality}</td>
                <td>{c.status}</td>
                <td>{c.age}</td>
                <td>
                  {parts.length > 0 ? (
                    <span style={{
                      display: 'inline-flex',
                      gap: 6,
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: 'rgba(198,232,45,0.15)',
                      border: '1px solid rgba(198,232,45,0.4)',
                      color: 'var(--neon)',
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {parts.join('  ·  ')}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>Not set</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="score-bar">
                      <div style={{ width: `${c.score}%` }}></div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--neon)' }}>{c.score}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OffersTab({ offers }: { offers: any[] }) {
  if (offers.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
        <p style={{ fontSize: 44, marginBottom: 12 }}>💼</p>
        <p>No open offers yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-3">
      {offers.map((o) => (
        <div key={o.id} className="card offer-card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{o.jobTitle}</h3>
          <div style={{ color: 'var(--neon)', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
            {o.companyName}
          </div>
          <div className="offer-meta">
            {o.site && <span>📍 {o.site}</span>}
            {o.requiredLanguage && (
              <span>🗣 {o.requiredLanguage}{o.requiredLevel && ` · ${o.requiredLevel}`}</span>
            )}
            {(o.minAge || o.maxAge) && <span>🎂 {o.minAge}–{o.maxAge}</span>}
          </div>
          {o.interviewSlots && o.interviewSlots.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {o.interviewSlots.map((s: string, i: number) => (
                <span key={i} className="offer-slot-chip">{s}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}