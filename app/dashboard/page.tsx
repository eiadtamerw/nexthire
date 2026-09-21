'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Candidate = {
  rowIndex: number;
  timestamp: string;
  tripleName: string;
  phone: string;
  whatsapp: string;
  gmail: string;
  nationality: string;
  site: string;
  language: string;
  age: string;
  college: string;
  status: string;
  military: string;
  appliedLast3Months: string;
  experience: string;
  nationalId: string;
  companyName: string;
  interviewDate: string;
  vocaroo: string;
  cv: string;
  score: number;
  appliedOfferId: string;
  appliedOfferTitle: string;
  interviewTime: string;
};

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
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
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
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Real-time statistics from Google Sheets
        </p>
      </div>

      <div className="grid grid-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard icon="users" value={data.totalCandidates} label="Candidates" />
        <KpiCard
          icon="calendar"
          value={data.scheduledInterviews}
          label="Scheduled Interviews"
        />
        <KpiCard icon="briefcase" value={data.openOffers} label="Open Offers" />
        <KpiCard icon="chart" value={data.totalOffers} label="Total Offers" />
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

      {activeTab === 'candidates' && (
        <CandidatesTab
          candidates={data.candidates}
          onView={(c) => setSelectedCandidate(c)}
        />
      )}
      {activeTab === 'offers' && <OffersTab offers={data.offers} />}

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          offers={data.offers}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}

function KpiCard({
  icon,
  value,
  label,
}: {
  icon: 'users' | 'calendar' | 'briefcase' | 'chart';
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
    calendar: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
        <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    briefcase: (
      <svg viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24">
        <line x1="3" y1="21" x2="21" y2="21" />
        <rect x="5" y="13" width="3" height="7" rx="1" />
        <rect x="10.5" y="8" width="3" height="12" rx="1" />
        <rect x="16" y="3" width="3" height="17" rx="1" />
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

function CandidatesTab({
  candidates,
  onView,
}: {
  candidates: Candidate[];
  onView: (c: Candidate) => void;
}) {
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
            <th>Actions</th>
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
                <td>
                  <strong>{c.tripleName}</strong>
                </td>
                <td>{c.appliedOfferTitle || '—'}</td>
                <td>{c.phone}</td>
                <td>{c.nationality}</td>
                <td>{c.status}</td>
                <td>{c.age}</td>
                <td>
                  {parts.length > 0 ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        gap: 6,
                        padding: '5px 10px',
                        borderRadius: 8,
                        background: 'rgba(198,232,45,0.15)',
                        border: '1px solid rgba(198,232,45,0.4)',
                        color: 'var(--neon)',
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
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
                    <span style={{ fontWeight: 700, color: 'var(--neon)' }}>
                      {c.score}%
                    </span>
                  </div>
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onView(c)}
                    type="button"
                  >
                    View
                  </button>
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
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            {o.jobTitle}
          </h3>
          <div
            style={{
              color: 'var(--neon)',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            {o.companyName}
          </div>
          <div className="offer-meta">
            {o.site && <span>📍 {o.site}</span>}
            {o.requiredLanguage && (
              <span>
                🗣 {o.requiredLanguage}
                {o.requiredLevel && ` · ${o.requiredLevel}`}
              </span>
            )}
            {(o.minAge || o.maxAge) && (
              <span>
                🎂 {o.minAge}–{o.maxAge}
              </span>
            )}
          </div>
          {o.interviewSlots && o.interviewSlots.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {o.interviewSlots.map((s: string, i: number) => (
                <span key={i} className="offer-slot-chip">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CandidateModal({
  candidate,
  offers,
  onClose,
}: {
  candidate: Candidate;
  offers: any[];
  onClose: () => void;
}) {
  const c = candidate;

  // Match with open offers
  const matches = offers
    .map((o) => {
      const checks: { name: string; pass: boolean }[] = [];

      if (o.requiredNationality && o.requiredNationality !== 'Any') {
        checks.push({
          name: 'Nationality',
          pass:
            String(c.nationality).trim().toLowerCase() ===
            String(o.requiredNationality).trim().toLowerCase(),
        });
      }

      if (o.requiredLanguage) {
        const lang = String(c.language || '').toLowerCase();
        checks.push({
          name: 'Language',
          pass: lang.includes(String(o.requiredLanguage).toLowerCase()),
        });
        if (o.requiredLevel) {
          checks.push({
            name: 'Language Level',
            pass: lang.includes(String(o.requiredLevel).toLowerCase()),
          });
        }
      }

      const age = Number(c.age) || 0;
      if (o.minAge) checks.push({ name: 'Min Age', pass: age >= Number(o.minAge) });
      if (o.maxAge) checks.push({ name: 'Max Age', pass: age <= Number(o.maxAge) });

      if (o.militaryStatus && o.militaryStatus !== 'Any') {
        checks.push({
          name: 'Military Status',
          pass:
            String(c.military).trim().toLowerCase() ===
            String(o.militaryStatus).trim().toLowerCase(),
        });
      }

      const exp = String(c.experience || '').toLowerCase();
      const hasExp = exp.includes('yes');
      if (Number(o.minExperience) > 0) {
        checks.push({ name: 'Call Center Exp', pass: hasExp });
      } else {
        checks.push({ name: 'Call Center Exp', pass: true });
      }

      const applied = String(c.appliedLast3Months || '').toLowerCase();
      const recently = applied.includes('yes');
      checks.push({ name: 'Not Applied Recently', pass: !recently });

      const accepted = String(o.acceptedStatuses || '')
        .split(',')
        .map((s: string) => s.trim().toLowerCase())
        .filter(Boolean);
      if (accepted.length > 0) {
        checks.push({
          name: 'Graduation Status',
          pass: accepted.includes(String(c.status).trim().toLowerCase()),
        });
      }

      const passed = checks.filter((x) => x.pass).length;
      const total = checks.length || 1;
      const score = Math.round((passed / total) * 100);
      const qualified = checks.every((x) => x.pass);

      return { offer: o, score, qualified, checks };
    })
    .sort((a, b) => b.score - a.score);

  const waNumber = String(c.whatsapp || c.phone || '').replace(/\D/g, '');

  const infoRows: [string, string][] = (
    [
      ['Applied For', c.appliedOfferTitle],
      ['National ID', c.nationalId],
      ['WhatsApp', c.whatsapp],
      ['Gmail', c.gmail],
      ['Site', c.site],
      ['College', c.college],
      ['Status', c.status],
      ['Military', c.military],
      ['Language & Level', c.language],
      ['Call Center Exp.', c.experience],
      ['Previous Company', c.companyName],
      ['Applied in last 3 months', c.appliedLast3Months],
      ['Interview Date', c.interviewDate],
      ['Interview Time', c.interviewTime],
    ] as [string, string][]
  ).filter(([, v]) => v);

  return (
    <div
      className="modal-back on"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-head">
          <div>
            <h3>{c.tripleName}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              {c.phone} · {c.gmail} · {c.nationality} · Age {c.age}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {c.vocaroo && (
            <a
              className="btn btn-ghost btn-sm"
              href={c.vocaroo}
              target="_blank"
              rel="noopener noreferrer"
            >
              🎙 Vocaroo
            </a>
          )}
          {c.cv && (
            <a
              className="btn btn-ghost btn-sm"
              href={c.cv}
              target="_blank"
              rel="noopener noreferrer"
            >
              📄 CV
            </a>
          )}
          {waNumber && (
            <a
              className="btn btn-ghost btn-sm"
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 WhatsApp
            </a>
          )}
        </div>

        <div
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 20,
          }}
        >
          {infoRows.map(([k, v]) => (
            <div
              key={k}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: 13,
              }}
            >
              <span style={{ color: 'var(--muted)' }}>{k}</span>
              <span style={{ fontWeight: 600, textAlign: 'right', marginLeft: 12 }}>
                {v}
              </span>
            </div>
          ))}
        </div>

        <h4
          style={{
            fontSize: 14,
            fontWeight: 800,
            marginBottom: 14,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--neon)',
          }}
        >
          🎯 Match with Open Offers ({matches.length})
        </h4>

        {matches.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>No open offers.</p>
        ) : (
          <div>
            {matches.map((m) => (
              <div
                key={m.offer.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 12,
                  background: 'var(--bg-2)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {m.offer.jobTitle}
                    </div>
                    <div
                      style={{
                        color: 'var(--muted)',
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {m.offer.companyName} · {m.offer.site || ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        border: '1px solid',
                        background: m.qualified
                          ? 'rgba(198,232,45,0.15)'
                          : 'rgba(245,158,11,0.1)',
                        color: m.qualified ? 'var(--neon)' : '#fcd34d',
                        borderColor: m.qualified
                          ? 'rgba(198,232,45,0.4)'
                          : 'rgba(245,158,11,0.3)',
                      }}
                    >
                      {m.qualified ? 'Qualified' : 'Partial'}
                    </span>
                    <span
                      style={{
                        fontWeight: 800,
                        color: 'var(--neon)',
                        fontSize: 15,
                      }}
                    >
                      {m.score}%
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {m.checks.map((ck, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        padding: '2px 0',
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 10,
                          fontWeight: 800,
                          background: ck.pass
                            ? 'rgba(198,232,45,0.15)'
                            : 'rgba(239,68,68,0.12)',
                          color: ck.pass ? 'var(--neon)' : '#fca5a5',
                          border: ck.pass
                            ? '1px solid rgba(198,232,45,0.4)'
                            : '1px solid rgba(239,68,68,0.3)',
                          flexShrink: 0,
                        }}
                      >
                        {ck.pass ? '✓' : '✕'}
                      </span>
                      <span>{ck.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}