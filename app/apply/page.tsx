/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';

type Offer = {
  rowIndex: number;
  id: string;
  jobTitle: string;
  companyName: string;
};

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    appliedOfferId: '',
    appliedOfferTitle: '',
    interviewDate: '',
    interviewTime: '',
    tripleName: '',
    nationalId: '',
    age: '',
    phone: '',
    whatsapp: '',
    nationality: '',
    gmail: '',
    college: '',
    site: '',
    status: '',
    military: '',
    language: '',
    experience: '',
    appliedLast3Months: '',
    companyName: '',
    vocaroo: '',
    cv: '',
  });

  const [languages, setLanguages] = useState([{ lang: '', lvl: '' }]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);

  useEffect(() => {
    fetch('/api/offers')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          const openOffers = data.offers.filter(
            (o: any) => (o.status || '').toLowerCase() === 'open'
          );
          setOffers(openOffers);
        }
      })
      .catch((e) => console.error('Failed to load offers:', e))
      .finally(() => setOffersLoading(false));
  }, []);

  function updateField(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleOfferSelect(offerId: string) {
    const selected = offers.find((o) => o.id === offerId);
    setFormData((prev) => ({
      ...prev,
      appliedOfferId: offerId,
      appliedOfferTitle: selected ? selected.jobTitle : '',
    }));
  }

  function calcAge(nid: string) {
    if (!/^\d{14}$/.test(nid)) return '';
    const c = parseInt(nid[0], 10);
    let century: number | null = null;
    if (c === 2) century = 1900;
    else if (c === 3) century = 2000;
    else return '';
    const yy = parseInt(nid.substr(1, 2), 10);
    const mm = parseInt(nid.substr(3, 2), 10);
    const dd = parseInt(nid.substr(5, 2), 10);
    const birth = new Date(century + yy, mm - 1, dd);
    if (isNaN(birth.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return String(age);
  }

  function handleNationalId(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, 14);
    const age = calcAge(cleaned);
    setFormData((prev) => ({ ...prev, nationalId: cleaned, age }));
  }

  function addLanguage() {
    setLanguages([...languages, { lang: '', lvl: '' }]);
  }

  function updateLanguage(index: number, field: 'lang' | 'lvl', value: string) {
    const copy = [...languages];
    copy[index][field] = value;
    setLanguages(copy);
  }

  function removeLanguage(index: number) {
    setLanguages(languages.filter((_, i) => i !== index));
  }

    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!formData.tripleName || !formData.nationalId || !formData.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.nationalId.length !== 14) {
      setError('National ID must be exactly 14 digits.');
      return;
    }
    if (!formData.appliedOfferId) {
      setError('Please select a position you are applying for.');
      return;
    }
    if (!formData.vocaroo) {
      setError('Vocaroo link is required.');
      return;
    }

    const langParts: string[] = [];
    languages.forEach((l) => {
      if (l.lang) langParts.push(l.lang + (l.lvl ? ' - ' + l.lvl : ''));
    });
    const finalLanguage = langParts.join(', ');

    if (!finalLanguage) {
      setError('Please select at least one language.');
      return;
    }

    const payload = { ...formData, language: finalLanguage };
    setLoading(true);

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      setLoading(false);

      // ⭐ لو مرفوض
      if (data.rejected) {
        setError('❌ ' + (data.error || 'Application rejected'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (!data.ok) {
        setError(data.error || 'Failed to submit application.');
        return;
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      appliedOfferId: '',
      appliedOfferTitle: '',
      interviewDate: '',
      interviewTime: '',
      tripleName: '',
      nationalId: '',
      age: '',
      phone: '',
      whatsapp: '',
      nationality: '',
      gmail: '',
      college: '',
      site: '',
      status: '',
      military: '',
      language: '',
      experience: '',
      appliedLast3Months: '',
      companyName: '',
      vocaroo: '',
      cv: '',
    });
    setLanguages([{ lang: '', lvl: '' }]);
    setSubmitted(false);
    setError('');
  }

  if (submitted) {
    return (
      <div className="form-wrap">
        <div
          className="alert alert-success"
          style={{ marginTop: 40, padding: 30, textAlign: 'center' }}
        >
          <h2 style={{ marginBottom: 12, fontSize: 24, fontWeight: 800 }}>
            ✅ Application Received!
          </h2>
          <p style={{ marginBottom: 20 }}>
            Thank you, <strong>{formData.tripleName}</strong>. We&apos;ve received your
            application.
          </p>
          <button className="btn btn-primary" onClick={resetForm}>
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-wrap">
      <div className="form-header">
        <h1>
          Apply <span className="grad">Now</span>
        </h1>
        <p>Fill in your details carefully — the system will match you with the right offers.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>
            <span className="dot"></span> Position & Interview
          </h3>

          <div className="field">
            <label>
              Position you&apos;re applying for <span className="req">*</span>
            </label>
            <select
              value={formData.appliedOfferId}
              onChange={(e) => handleOfferSelect(e.target.value)}
              required
              disabled={offersLoading}
            >
              <option value="">
                {offersLoading
                  ? 'Loading offers…'
                  : offers.length === 0
                  ? 'No open offers available'
                  : 'Select a position…'}
              </option>
              {offers.map((o) => (
                <option key={o.rowIndex} value={o.id}>
                  {o.jobTitle} — {o.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label>
                Interview Date <span className="req">*</span>
              </label>
              <input
                type="date"
                value={formData.interviewDate}
                onChange={(e) => updateField('interviewDate', e.target.value)}
              />
            </div>
            <div className="field">
              <label>
                Interview Time <span className="req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Monday 3pm to 5pm"
                value={formData.interviewTime}
                onChange={(e) => updateField('interviewTime', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>
            <span className="dot"></span> Personal Information
          </h3>

          <div className="field">
            <label>
              Triple Name <span className="req">*</span>
            </label>
            <input
              type="text"
              placeholder="Your full triple name"
              value={formData.tripleName}
              onChange={(e) => updateField('tripleName', e.target.value)}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>
                National ID <span className="req">*</span>
              </label>
              <input
                type="text"
                maxLength={14}
                placeholder="14 digits"
                value={formData.nationalId}
                onChange={(e) => handleNationalId(e.target.value)}
              />
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                Age: <strong style={{ color: 'var(--neon)' }}>{formData.age || '—'}</strong>
              </div>
            </div>
            <div className="field">
              <label>Age (auto)</label>
              <input type="text" readOnly value={formData.age} placeholder="Calculated" />
            </div>
          </div>

          <div className="field-row-3">
            <div className="field">
              <label>
                Phone <span className="req">*</span>
              </label>
              <input
                type="tel"
                placeholder="01xxxxxxxxx"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
            <div className="field">
              <label>
                WhatsApp <span className="req">*</span>
              </label>
              <input
                type="tel"
                placeholder="01xxxxxxxxx"
                value={formData.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value)}
              />
            </div>
            <div className="field">
              <label>
                Nationality <span className="req">*</span>
              </label>
              <select
                value={formData.nationality}
                onChange={(e) => updateField('nationality', e.target.value)}
              >
                <option value="">Select…</option>
                <option>Egyptian</option>
                <option>Saudi</option>
                <option>Emirati</option>
                <option>Jordanian</option>
                <option>Syrian</option>
                <option>Palestinian</option>
                <option>Sudanese</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>
              Gmail <span className="req">*</span>
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={formData.gmail}
              onChange={(e) => updateField('gmail', e.target.value)}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>
            <span className="dot"></span> Education & Status
          </h3>

          <div className="field-row">
            <div className="field">
              <label>
                College <span className="req">*</span>
              </label>
              <input
                type="text"
                placeholder="College / Degree"
                value={formData.college}
                onChange={(e) => updateField('college', e.target.value)}
              />
            </div>
            <div className="field">
              <label>
                Site <span className="req">*</span>
              </label>
              <input
                type="text"
                placeholder="City / Location"
                value={formData.site}
                onChange={(e) => updateField('site', e.target.value)}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>
                Status <span className="req">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value)}
              >
                <option value="">Select…</option>
                <option>Grad</option>
                <option>Undergrad</option>
                <option>Gap Year</option>
                <option>Drop Out</option>
              </select>
            </div>
            <div className="field">
              <label>
                Military Status <span className="req">*</span>
              </label>
              <select
                value={formData.military}
                onChange={(e) => updateField('military', e.target.value)}
              >
                <option value="">Select…</option>
                <option>Completed</option>
                <option>Exempted</option>
                <option>Postponed</option>
                <option>Not Applicable</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>
            <span className="dot"></span> Language & Level
          </h3>

          {languages.map((lang, i) => (
            <div key={i} className="field-row-3" style={{ marginBottom: 12 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>
                  Language {i + 1} <span className="req">*</span>
                </label>
                <select
                  value={lang.lang}
                  onChange={(e) => updateLanguage(i, 'lang', e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>English</option>
                  <option>Arabic</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Spanish</option>
                  <option>Italian</option>
                  <option>Turkish</option>
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>
                  Level {i + 1} <span className="req">*</span>
                </label>
                <select
                  value={lang.lvl}
                  onChange={(e) => updateLanguage(i, 'lvl', e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>A1</option>
                  <option>A2</option>
                  <option>B1</option>
                  <option>B2</option>
                  <option>C1</option>
                  <option>C2</option>
                  <option>Native</option>
                </select>
              </div>
              <div
                className="field"
                style={{ marginBottom: 0, display: 'flex', alignItems: 'flex-end' }}
              >
                {i === 0 ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%' }}
                    onClick={addLanguage}
                  >
                    + Add Language
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => removeLanguage(i)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="form-section">
          <h3>
            <span className="dot"></span> Experience
          </h3>

          <div className="field">
            <label>
              Applied to this company in the last 3 months?{' '}
              <span className="req">*</span>
            </label>
            <div className="radio-group">
              {['Yes', 'No'].map((opt) => (
                <label
                  key={opt}
                  className={
                    'radio-chip' + (formData.appliedLast3Months === opt ? ' on' : '')
                  }
                >
                  <input
                    type="radio"
                    name="appliedLast3Months"
                    value={opt}
                    checked={formData.appliedLast3Months === opt}
                    onChange={(e) => updateField('appliedLast3Months', e.target.value)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label>
              Call Center / Telesales / Cold Calling Experience?{' '}
              <span className="req">*</span>
            </label>
            <div className="radio-group">
              {['Yes', 'No'].map((opt) => (
                <label
                  key={opt}
                  className={'radio-chip' + (formData.experience === opt ? ' on' : '')}
                >
                  <input
                    type="radio"
                    name="experience"
                    value={opt}
                    checked={formData.experience === opt}
                    onChange={(e) => updateField('experience', e.target.value)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Company Name (if any)</label>
            <input
              type="text"
              placeholder="Previous company name"
              value={formData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>
            <span className="dot"></span> Voice Recording & CV
          </h3>

          <div className="field">
            <label>
              Vocaroo Link <span className="req">*</span>
            </label>
            <input
              type="url"
              placeholder="https://vocaroo.com/..."
              value={formData.vocaroo}
              onChange={(e) => updateField('vocaroo', e.target.value)}
            />
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
              Required — record your voice on vocaroo.com and paste the link here.
            </div>
          </div>

          <div className="field">
            <label>CV Link (optional)</label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={formData.cv}
              onChange={(e) => updateField('cv', e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}