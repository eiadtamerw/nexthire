'use client';

import Link from 'next/link';
import { useEffect } from 'react';

const COMPANIES = [
  'CNX', 'TP', 'Sutherland', 'VXI', 'TTec', 'LTS', 'Golf Global',
  'Alorica', 'IntouchCX', 'Atain', 'TTC', 'Insource', 'eClerx',
  'Octopus', 'Centro', 'Minster Fitness', 'Vintrin Clinic',
  'GeekyCx', 'Hangup', 'O4U', 'Central Tact', 'Cata Leads',
  'BIS', 'Evolve', 'LeadBull', 'NeuroLink', 'Cxperts',
];

function buildMarqueeList(items: string[]) {
  const repeated = [...items, ...items, ...items, ...items];
  return [...repeated, ...repeated];
}

export default function HomePage() {
  useEffect(() => {
    // مفيش حاجة محتاجة تعمل هنا دلوقتي
  }, []);

  const mid = Math.ceil(COMPANIES.length / 2);
  const row1 = buildMarqueeList(COMPANIES.slice(0, mid));
  const row2 = buildMarqueeList(COMPANIES.slice(mid));

  return (
    <>
      <header className="hero">
        <div className="hero-bg"></div>
        <div className="hero-inner">
          <span className="pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ filter: 'drop-shadow(0 0 4px rgba(198,232,45,0.6))' }}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            RECRUITMENT, REIMAGINED
          </span>
          <h1>
            Find the <span className="grad">right talent</span>
            <br />faster than ever.
          </h1>
          <p className="hero-sub">
            The all-in-one platform to manage your recruitment agency —
            receive applications, publish offers, and let the system
            match candidates to jobs automatically.
          </p>
          <div className="hero-actions">
            <Link href="/apply" className="btn btn-primary btn-lg">Apply Now →</Link>
          </div>

          {/* Marquee */}
          <div className="marquee-section">
            <div className="marquee-label">Trusted Partners</div>
            <div className="marquee">
              <div className="marquee-track">
                {row1.map((c, i) => (
                  <div className="marquee-item" key={'r1-' + i}>{c}</div>
                ))}
              </div>
            </div>
            <div className="marquee reverse" style={{ marginTop: 12 }}>
              <div className="marquee-track">
                {row2.map((c, i) => (
                  <div className="marquee-item" key={'r2-' + i}>{c}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="section-head">
          <h2>Everything you need</h2>
          <p>One platform to run your entire recruitment workflow.</p>
        </div>

        <div className="grid grid-3">
          <div className="card feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="13" x2="15" y2="13"/>
                <line x1="9" y1="17" x2="13" y2="17"/>
              </svg>
            </div>
            <h3>Smart Application</h3>
            <p>Complete application form — only qualified candidates get through.</p>
          </div>

          <div className="card feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <h3>Auto Matching</h3>
            <p>The system validates every candidate against offer requirements.</p>
          </div>

          <div className="card feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24">
                <line x1="3" y1="21" x2="21" y2="21"/>
                <rect x="5" y="13" width="3" height="7" rx="1"/>
                <rect x="10.5" y="8" width="3" height="12" rx="1"/>
                <rect x="16" y="3" width="3" height="17" rx="1"/>
              </svg>
            </div>
            <h3>Live Dashboard</h3>
            <p>Real-time statistics on applications, offers, and qualified matches.</p>
          </div>

          <div className="card feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h3>Offers Manager</h3>
            <p>Add offers with graduation status filters and interview slots.</p>
          </div>

          <div className="card feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3>Instant Screening</h3>
            <p>Automatic rejection for candidates who don&apos;t match requirements.</p>
          </div>

          <div className="card feature">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="16" rx="2"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="8" y1="3" x2="8" y2="7"/>
                <line x1="16" y1="3" x2="16" y2="7"/>
                <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <h3>Interview Tracking</h3>
            <p>Interview dates, times, Vocaroo recordings, and CVs — all in one place.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="cta card">
          <div>
            <h2>Ready to join the team?</h2>
            <p>Apply now and let the system check if you qualify instantly.</p>
          </div>
          <Link href="/apply" className="btn btn-primary btn-lg">Start Application</Link>
        </div>
      </section>
    </>
  );
}