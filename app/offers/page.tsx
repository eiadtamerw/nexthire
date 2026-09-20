'use client';

import Link from 'next/link';

// 🔧 بيانات مؤقتة — هنربطها بالـ Google Sheets بعدين
const DEMO_OFFERS = [
  {
    id: 'OFF-001',
    jobTitle: 'Customer Service Representative',
    companyName: 'CNX',
    site: 'Cairo',
    requiredNationality: 'Egyptian',
    requiredLanguage: 'English',
    requiredLevel: 'B2',
    minAge: '18',
    maxAge: '40',
    minExperience: 0,
    status: 'Open',
    acceptedStatuses: 'Grad,Undergrad',
    interviewSlots: ['Saturday 1pm to 5pm', 'Thursday 2pm to 4pm'],
  },
  {
    id: 'OFF-002',
    jobTitle: 'Technical Support Agent',
    companyName: 'TTC',
    site: 'Maadi',
    requiredNationality: 'Any',
    requiredLanguage: 'English',
    requiredLevel: 'C1',
    minAge: '18',
    maxAge: '30',
    minExperience: 1,
    status: 'Open',
    acceptedStatuses: 'Grad',
    interviewSlots: ['Monday to Friday 3pm to 5pm'],
  },
  {
    id: 'OFF-003',
    jobTitle: 'Sales Representative',
    companyName: 'Sutherland',
    site: 'Smart Village',
    requiredNationality: 'Egyptian',
    requiredLanguage: 'English',
    requiredLevel: 'B1',
    minAge: '20',
    maxAge: '35',
    minExperience: 0,
    status: 'Closed',
    acceptedStatuses: 'Grad,Undergrad,Gap Year',
    interviewSlots: [],
  },
];

export default function OffersPage() {
  const openOffers = DEMO_OFFERS.filter((o) => o.status === 'Open');

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

      {openOffers.length === 0 ? (
        <div className="empty-msg">
          <p style={{ fontSize: 44, marginBottom: 12 }}>💼</p>
          <p>No open offers right now. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {openOffers.map((o) => {
            const statuses = o.acceptedStatuses.split(',').map((s) => s.trim()).filter(Boolean);

            return (
              <div key={o.id} className="card offer-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div>
                    <h3>{o.jobTitle}</h3>
                    <div className="company">{o.companyName}</div>
                  </div>
                  <span className="badge badge-open">Open</span>
                </div>

                <div className="offer-meta">
                  {o.site && <span>📍 {o.site}</span>}
                  {o.requiredNationality !== 'Any' && <span>🌍 {o.requiredNationality}</span>}
                  {o.requiredLanguage && (
                    <span>🗣 {o.requiredLanguage} {o.requiredLevel && `· ${o.requiredLevel}`}</span>
                  )}
                  {(o.minAge || o.maxAge) && (
                    <span>🎂 {o.minAge}–{o.maxAge}</span>
                  )}
                  {o.minExperience > 0 && <span>💼 {o.minExperience}+ yr</span>}
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
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
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