'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Candidate = {
  rowIndex: number;
  tripleName: string;
  phone: string;
  whatsapp: string;
  gmail: string;
  appliedOfferId: string;
  appliedOfferTitle: string;
  companyName: string;
  interviewDate: string;
  interviewTime: string;
  site: string;
  owner: string;
};

type Offer = {
  id: string;
  jobTitle: string;
  companyName: string;
};

type Template = {
  offerId: string;
  offerTitle: string;
  message: string;
};

const DEFAULT_TEMPLATE =
  'مرحباً {name}،\n\nبنفكرك بميعاد المقابلة بكرة {date}{time}.\n' +
  'الوظيفة: {job}\nالشركة: {company}\n\nمنتظرينك، بالتوفيق!';

function toWhatsAppNumber(phone: string): string {
  let cleaned = String(phone || '').replace(/\D/g, '');
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);
  if (cleaned.startsWith('20') && cleaned.length >= 12) return cleaned;
  if (cleaned.startsWith('0')) return '20' + cleaned.slice(1);
  if (cleaned.length === 10 && cleaned.startsWith('1')) return '20' + cleaned;
  if (cleaned.length === 11 && cleaned.startsWith('1')) return '20' + cleaned;
  if (cleaned.length >= 10) return cleaned;
  return '';
}

function fillTemplate(template: string, c: Candidate): string {
  return template
    .replace(/\{name\}/g, c.tripleName || '')
    .replace(/\{date\}/g, c.interviewDate || '')
    .replace(/\{time\}/g, c.interviewTime ? ' الساعة ' + c.interviewTime : '')
    .replace(/\{job\}/g, c.appliedOfferTitle || '')
    .replace(/\{company\}/g, c.companyName || '')
    .replace(/\{site\}/g, c.site || '');
}

/* ============ SVG ICONS ============ */
const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconWhatsApp = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconBriefcase = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

/* ============ PAGE ============ */
export default function RemindersPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offerFilter, setOfferFilter] = useState('all');
  const [selections, setSelections] = useState<Record<number, string>>({});

  useEffect(() => {
    const t = localStorage.getItem('staffToken');
    const exp = Number(localStorage.getItem('staffExpires') || 0);
    if (!t || exp < Date.now()) {
      router.push('/login');
      return;
    }

    const headers = { Authorization: 'Bearer ' + t };

    Promise.all([
      fetch('/api/reminders', { headers }).then((r) => r.json()),
      fetch('/api/offers').then((r) => r.json()),
      fetch('/api/templates', { headers }).then((r) => r.json()),
    ])
      .then(([remRes, offRes, tplRes]) => {
        if (remRes.ok) {
          setCandidates(remRes.candidates);
          setDate(remRes.date);
          const init: Record<number, string> = {};
          remRes.candidates.forEach((c: Candidate) => {
            init[c.rowIndex] = c.appliedOfferId;
          });
          setSelections(init);
        } else {
          setError(remRes.error || 'Failed to load reminders');
        }
        if (offRes.ok) setOffers(offRes.offers || []);
        if (tplRes.ok) setTemplates(tplRes.templates || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  const uniqueOffers = Array.from(
    new Set(candidates.map((c) => c.appliedOfferTitle).filter(Boolean))
  );

  const filtered =
    offerFilter === 'all'
      ? candidates
      : candidates.filter((c) => c.appliedOfferTitle === offerFilter);

  function getMessage(c: Candidate): string {
    const selectedOfferId = selections[c.rowIndex] || c.appliedOfferId;
    const tpl = templates.find((t) => t.offerId === selectedOfferId);
    const raw = tpl && tpl.message ? tpl.message : DEFAULT_TEMPLATE;
    return fillTemplate(raw, c);
  }

  function sendWhatsApp(c: Candidate) {
    const rawNumber = c.whatsapp || c.phone;
    const number = toWhatsAppNumber(rawNumber);
    if (!number) {
      alert(
        `رقم الواتساب غير صالح.\n\nالرقم المسجل: "${rawNumber}"\n\nمن فضلك تأكد من الرقم في الشيت.`
      );
      return;
    }
    const message = getMessage(c);
    const url = `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
    const w = window.open(url, '_blank');
    if (!w) alert('من فضلك اسمح بالـ Popups لهذا الموقع.');
  }

  return (
    <div className="section" style={{ maxWidth: 1000, paddingTop: 30 }}>
      <div style={{ marginBottom: 30 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <IconCalendar />
          Interview Reminders
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Reminders for tomorrow ({date || '...'}). Pick an offer, then click
          Send.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && candidates.length > 0 && (
        <div className="field" style={{ marginBottom: 20, maxWidth: 400 }}>
          <label>Filter by Offer</label>
          <select
            value={offerFilter}
            onChange={(e) => setOfferFilter(e.target.value)}
          >
            <option value="all">All offers ({candidates.length})</option>
            {uniqueOffers.map((o) => (
              <option key={o} value={o}>
                {o} ({candidates.filter((c) => c.appliedOfferTitle === o).length})
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : candidates.length === 0 ? (
        <div
          className="form-section"
          style={{ textAlign: 'center', padding: 40 }}
        >
          <p style={{ fontSize: 16, color: 'var(--muted)' }}>
            No interviews scheduled for tomorrow.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((c) => {
            const number = toWhatsAppNumber(c.whatsapp || c.phone);
            const selectedOfferId = selections[c.rowIndex] || c.appliedOfferId;
            return (
              <div
                key={c.rowIndex}
                className="form-section"
                style={{
                  marginBottom: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 20,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ flex: '1 1 320px' }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      marginBottom: 8,
                    }}
                  >
                    {c.tripleName}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--muted)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 16,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <IconPhone />
                      {c.phone}
                    </span>
                    <span
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <IconWhatsApp />
                      {c.whatsapp || '—'}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--muted)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 16,
                    }}
                  >
                    <span
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <IconCalendar />
                      {c.interviewDate}
                    </span>
                    {c.interviewTime && (
                      <span
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <IconClock />
                        {c.interviewTime}
                      </span>
                    )}
                    {c.site && (
                      <span
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <IconMapPin />
                        {c.site}
                      </span>
                    )}
                  </div>

                  {(c.appliedOfferTitle || c.companyName) && (
                    <div
                      style={{
                        fontSize: 13,
                        marginTop: 8,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <IconBriefcase />
                      <strong>{c.appliedOfferTitle}</strong>
                      {c.companyName ? ` — ${c.companyName}` : ''}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <select
                    value={selectedOfferId}
                    onChange={(e) =>
                      setSelections((prev) => ({
                        ...prev,
                        [c.rowIndex]: e.target.value,
                      }))
                    }
                    style={{
                      padding: '10px 14px',
                      fontSize: 13,
                      minWidth: 200,
                      background: 'rgba(0,0,0,0.4)',
                      borderRadius: 6,
                    }}
                  >
                    <option value="">— Select offer —</option>
                    {offers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.jobTitle}
                        {o.companyName ? ` — ${o.companyName}` : ''}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => sendWhatsApp(c)}
                    disabled={!number}
                    className="btn btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 18px',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                    title="Send WhatsApp"
                  >
                    <IconWhatsApp size={20} />
                    Send
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}