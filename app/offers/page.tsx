'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Offer = {
  id: string;
  jobTitle: string;
  companyName: string;
  site: string;
  requiredNationality: string;
  requiredLanguage: string;
  requiredLevel: string;
  minAge: string;
  maxAge: string;
  gender: string;
  militaryStatus: string;
  minExperience: string;
  description: string;
  status: string;
  createdAt: string;
  acceptedStatuses: string;
  interviewSlots: string[];
};

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/offers')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setOffers(data.offers);
        } else {
          setError(data.error || 'Failed to load offers');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const openOffers = offers.filter((o) => (o.status || '').toLowerCase() === 'open');

  if (loading) {
    return (
      <div className="section">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: 'var(--muted)' }}>Loading offers…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="offers-head">
        <div>
          <h1>
            Job <span className="grad">Offers</span>
          </h1>
          <p>Browse open positions and apply for the one that fits you.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ maxWidth: 600, margin: '0 auto 30px' }}>
          Error: {error}
        </div>
      )}

      {openOffers.length === 0 ? (
        <div className="empty-msg">
          <p style={{ fontSize: 44, marginBottom: 12 }}>💼</p>
          <p>No open offers right now. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {openOffers.map((o) => {
            const statuses = o.acceptedStatuses
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);

            return (
              <div key={o.id} className="card offer-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <div>
                    <h3>{o.jobTitle}</h3>
                    <div className="company">{o.companyName}</div>
                  </div>
                  <span className="badge badge-open">Open</span>
                </div>

                <div className="offer-meta">
                  {o.site && <span>📍 {o.site}</span>}
                  {o.requiredNationality && o.requiredNationality !== 'Any' && (
                    <span>🌍 {o.requiredNationality}</span>
                  )}
                  {o.requiredLanguage && (
                    <span>
                      🗣 {o.requiredLanguage}
                      {o.requiredLevel && ` · ${o.requiredLevel}`}
                    </span>
                  )}
                  {(o.minAge || o.maxAge) && (
                    <span>
                      🎂 {o.minAge || '?'}–{o.maxAge || '?'}
                    </span>
                  )}
                  {Number(o.minExperience) > 0 && <span>💼 {o.minExperience}+ yr</span>}
                </div>

                {statuses.length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)' }}>
                    🎓 Accepts:{' '}
                    {statuses.map((s) => (
                      <strong key={s} style={{ color: 'var(--neon)', marginRight: 6 }}>
                        {s}
                      </strong>
                    ))}
                  </div>
                )}

                {o.interviewSlots.length > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 8,
                      }}
                    >
                      📅 Available Slots
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {o.interviewSlots.map((s) => (
                        <span key={s} className="offer-slot-chip">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="offer-actions">
                  <Link href="/apply" className="btn btn-primary btn-sm">
                    Apply Now →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}