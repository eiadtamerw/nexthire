'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Candidate = any;
type Offer = any;

type MatchResult = {
  candidate: Candidate;
  score: number;
  qualified: boolean;
  checks: { name: string; pass: boolean; detail?: string }[];
};

type OfferMatch = {
  offer: Offer;
  qualifiedCount: number;
  candidates: MatchResult[];
};

type MatchesData = {
  totalCandidates: number;
  totalOpenOffers: number;
  totalMatches: number;
  offerMatches: OfferMatch[];
};

export default function MatchesPage() {
  const [data, setData] = useState<MatchesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOfferId, setSelectedOfferId] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(60);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
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

  if (error || !data) {
    return (
      <div className="section">
        <div className="alert alert-error" style={{ maxWidth: 600, margin: '60px auto' }}>
          {error || 'Failed to load'}
        </div>
      </div>
    );
  }

  // فلترة
  const filteredOffers =
    selectedOfferId === 'all'
      ? data.offerMatches
      : data.offerMatches.filter((om) => om.offer.id === selectedOfferId);

  const filteredWithScore = filteredOffers
    .map((om) => ({
      ...om,
      candidates: om.candidates.filter((c) => c.score >= minScore),
    }))
    .filter((om) => om.candidates.length > 0);

  const totalFiltered = filteredWithScore.reduce(
    (sum, om) => sum + om.candidates.length,
    0
  );

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

      {/* KPI Cards */}
      <div className="grid grid-3" style={{ marginBottom: 30 }}>
        <div className="kpi">
          <div className="icon">👥</div>
          <div className="num">{data.totalCandidates}</div>
          <div className="lbl">Total Candidates</div>
        </div>
        <div className="kpi">
          <div className="icon">💼</div>
          <div className="num">{data.totalOpenOffers}</div>
          <div className="lbl">Open Offers</div>
        </div>
        <div className="kpi">
          <div className="icon">🎯</div>
          <div className="num">{data.totalMatches}</div>
          <div className="lbl">Total Matches</div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          padding: 20,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          marginBottom: 30,
        }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Filter by Offer
          </label>
          <select
            value={selectedOfferId}
            onChange={(e) => setSelectedOfferId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--bg-2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 14,
            }}
          >
            <option value="all">All Offers ({data.offerMatches.length})</option>
            {data.offerMatches.map((om) => (
              <option key={om.offer.id} value={om.offer.id}>
                {om.offer.jobTitle} — {om.offer.companyName} ({om.qualifiedCount})
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Min Score: {minScore}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={10}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--neon)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(198,232,45,0.1)',
              border: '1px solid rgba(198,232,45,0.3)',
              borderRadius: 10,
              fontSize: 13,
              color: 'var(--neon)',
              fontWeight: 700,
            }}
          >
            🎯 {totalFiltered} match{totalFiltered !== 1 ? 'es' : ''}
          </div>
        </div>
      </div>

      {/* No results */}
      {filteredWithScore.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: 80,
            background: 'var(--card)',
            border: '1px dashed var(--border)',
            borderRadius: 14,
            color: 'var(--muted)',
          }}
        >
          <p style={{ fontSize: 44, marginBottom: 12 }}>🎯</p>
          <p>No matches with score ≥ {minScore}%</p>
          <p style={{ fontSize: 12, marginTop: 8 }}>Try lowering the minimum score</p>
        </div>
      )}

      {/* Offers with matches */}
      {filteredWithScore.map((om) => (
        <div key={om.offer.id} style={{ marginBottom: 30 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(198,232,45,0.1), rgba(198,232,45,0.03))',
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
              🎯 {om.candidates.length} qualified
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--border)',
              borderTop: 'none',
              borderRadius: '0 0 14px 14px',
              background: 'var(--card)',
              overflow: 'hidden',
            }}
          >
            {om.candidates.map((m, i) => {
              const cand = m.candidate;
              const wa = String(cand.whatsapp || cand.phone || '').replace(/\D/g, '');
              const key = `${om.offer.id}-${cand.rowIndex}`;
              const isExpanded = expandedCandidate === key;

              return (
                <div
                  key={key}
                  style={{
                    borderBottom:
                      i < om.candidates.length - 1
                        ? '1px solid var(--border)'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background .2s',
                    }}
                    onClick={() =>
                      setExpandedCandidate(isExpanded ? null : key)
                    }
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          marginBottom: 4,
                        }}
                      >
                        {cand.tripleName}
                      </div>
                      <div
                        style={{
                          color: 'var(--muted)',
                          fontSize: 12,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <span>📞 {cand.phone}</span>
                        <span>🎂 {cand.age}</span>
                        <span>🌍 {cand.nationality}</span>
                        <span>🎓 {cand.status}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div
                        className="score-bar"
                        style={{ width: 80, height: 8 }}
                      >
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
                      <span
                        style={{
                          color: 'var(--muted)',
                          fontSize: 18,
                          transition: 'transform .2s',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                        }}
                      >
                        ▾
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 20px 20px',
                        background: 'var(--bg-2)',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                          gap: 10,
                          marginBottom: 16,
                        }}
                      >
                        {m.checks.map((ck, ci) => (
                          <div
                            key={ci}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '8px 12px',
                              background: 'var(--card)',
                              border: '1px solid var(--border)',
                              borderRadius: 8,
                              fontSize: 12,
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
                            <span style={{ fontWeight: 600 }}>{ck.name}</span>
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                        }}
                      >
                        {cand.vocaroo && (
                          <a
                            className="btn btn-ghost btn-sm"
                            href={cand.vocaroo}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            🎙 Vocaroo
                          </a>
                        )}
                        {cand.cv && (
                          <a
                            className="btn btn-ghost btn-sm"
                            href={cand.cv}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            📄 CV
                          </a>
                        )}
                        {wa && (
                          <a
                            className="btn btn-ghost btn-sm"
                            href={`https://wa.me/${wa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            💬 WhatsApp
                          </a>
                        )}
                        <Link
                          href="/dashboard"
                          className="btn btn-ghost btn-sm"
                        >
                          📊 View in Dashboard
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}