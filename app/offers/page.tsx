'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Offer = {
  rowIndex: number;
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

const emptyForm = {
  jobTitle: '',
  companyName: '',
  site: '',
  requiredNationality: 'Any',
  requiredLanguage: '',
  requiredLevel: '',
  minAge: '18',
  maxAge: '45',
  gender: 'Any',
  militaryStatus: 'Any',
  minExperience: '0',
  description: '',
  status: 'Open',
  acceptedStatuses: '',
  interviewSlots: [''],
};

/* ============ SVG ICONS ============ */
const IconLocation = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconGlobe = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconChat = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconCake = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconBriefcase = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const IconGraduation = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const IconCalendar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    const t = localStorage.getItem('staffToken');
    const exp = Number(localStorage.getItem('staffExpires') || 0);
    setIsAuth(!!t && exp > Date.now());
    loadOffers();
  }, []);

  function loadOffers() {
    setLoading(true);
    const token = localStorage.getItem('staffToken');
    fetch('/api/offers', {
      headers: token ? { Authorization: 'Bearer ' + token } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setOffers(data.offers);
        else setError(data.error || 'Failed to load');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  function openNewModal() {
    setEditingId(null);
    setForm({ ...emptyForm, interviewSlots: [''] });
    setModalOpen(true);
  }

  function openEditModal(o: Offer) {
    setEditingId(o.rowIndex);
    setForm({
      jobTitle: o.jobTitle,
      companyName: o.companyName,
      site: o.site,
      requiredNationality: o.requiredNationality || 'Any',
      requiredLanguage: o.requiredLanguage,
      requiredLevel: o.requiredLevel,
      minAge: o.minAge || '18',
      maxAge: o.maxAge || '45',
      gender: o.gender || 'Any',
      militaryStatus: o.militaryStatus || 'Any',
      minExperience: o.minExperience || '0',
      description: o.description,
      status: o.status || 'Open',
      acceptedStatuses: o.acceptedStatuses,
      interviewSlots: o.interviewSlots.length ? o.interviewSlots : [''],
    });
    setModalOpen(true);
  }

  function updateField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateSlot(i: number, value: string) {
    const slots = [...form.interviewSlots];
    slots[i] = value;
    setForm({ ...form, interviewSlots: slots });
  }

  function addSlot() {
    setForm({ ...form, interviewSlots: [...form.interviewSlots, ''] });
  }

  function removeSlot(i: number) {
    setForm({
      ...form,
      interviewSlots: form.interviewSlots.filter((_, idx) => idx !== i),
    });
  }

  function toggleStatus(s: string) {
    const current = form.acceptedStatuses
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
    const idx = current.indexOf(s);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(s);
    setForm({ ...form, acceptedStatuses: current.join(',') });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slots = form.interviewSlots.map((s) => s.trim()).filter(Boolean);
    const payload = { ...form, interviewSlots: slots };

    try {
      const token = localStorage.getItem('staffToken');
      const url = editingId ? `/api/offers/${editingId}` : '/api/offers';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) {
        alert('Error: ' + (data.error || 'Failed'));
        return;
      }
      setModalOpen(false);
      loadOffers();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleDelete(rowIndex: number, jobTitle: string) {
    if (!confirm(`Delete offer "${jobTitle}"?`)) return;
    try {
      const token = localStorage.getItem('staffToken');
      const res = await fetch(`/api/offers/${rowIndex}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = await res.json();
      if (!data.ok) {
        alert('Error: ' + (data.error || 'Failed'));
        return;
      }
      loadOffers();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  const openOffers = offers.filter((o) => (o.status || '').toLowerCase() === 'open');

  return (
    <div className="section">
      <div className="offers-head">
        <div>
          <h1>
            Job <span className="grad">Offers</span>
          </h1>
          <p>Browse open positions and apply for the one that fits you.</p>
        </div>
        {isAuth && (
          <button className="btn btn-primary" onClick={openNewModal}>
            + New Offer
          </button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          Loading offers…
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ maxWidth: 600, margin: '0 auto 30px' }}>
          {error}
        </div>
      )}

      {!loading && openOffers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          <p style={{ marginBottom: 12 }}>No open offers right now.</p>
        </div>
      )}

      {!loading && openOffers.length > 0 && (
        <div className="grid grid-3">
          {openOffers.map((o) => {
            const statuses = o.acceptedStatuses
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            return (
              <div key={o.rowIndex} className="card offer-card">
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
                  {o.site && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <IconLocation />
                      {o.site}
                    </span>
                  )}
                  {o.requiredNationality !== 'Any' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <IconGlobe />
                      {o.requiredNationality}
                    </span>
                  )}
                  {o.requiredLanguage && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <IconChat />
                      {o.requiredLanguage}
                      {o.requiredLevel && ` · ${o.requiredLevel}`}
                    </span>
                  )}
                  {(o.minAge || o.maxAge) && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <IconCake />
                      {o.minAge}–{o.maxAge}
                    </span>
                  )}
                  {Number(o.minExperience) > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <IconBriefcase />
                      {o.minExperience}+ yr
                    </span>
                  )}
                </div>

                {statuses.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 11,
                      color: 'var(--muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      flexWrap: 'wrap',
                    }}
                  >
                    <IconGraduation />
                    Accepts:{' '}
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <IconCalendar />
                      Available Slots
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
                  {isAuth && (
                    <>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEditModal(o)}
                        type="button"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <IconEdit />
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(o.rowIndex, o.jobTitle)}
                        type="button"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <IconTrash />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div
          className="modal-back on"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal">
            <div className="modal-head">
              <h3>{editingId ? 'Edit Offer' : 'New Offer'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>
                  Job Title <span className="req">*</span>
                </label>
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  required
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>
                    Company Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Site</label>
                  <input
                    type="text"
                    value={form.site}
                    onChange={(e) => updateField('site', e.target.value)}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Required Nationality</label>
                  <select
                    value={form.requiredNationality}
                    onChange={(e) => updateField('requiredNationality', e.target.value)}
                  >
                    <option value="Any">Any</option>
                    <option>Egyptian</option>
                    <option>Saudi</option>
                    <option>Emirati</option>
                    <option>Jordanian</option>
                    <option>Syrian</option>
                    <option>Palestinian</option>
                    <option>Sudanese</option>
                  </select>
                </div>
                <div className="field">
                  <label>Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                  >
                    <option value="Any">Any</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>

              <div className="field-row-3">
                <div className="field">
                  <label>Required Language</label>
                  <select
                    value={form.requiredLanguage}
                    onChange={(e) => updateField('requiredLanguage', e.target.value)}
                  >
                    <option value="">—</option>
                    <option>English</option>
                    <option>Arabic</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Spanish</option>
                    <option>Italian</option>
                    <option>Turkish</option>
                  </select>
                </div>
                <div className="field">
                  <label>Required Level</label>
                  <select
                    value={form.requiredLevel}
                    onChange={(e) => updateField('requiredLevel', e.target.value)}
                  >
                    <option value="">—</option>
                    <option>A1</option>
                    <option>A2</option>
                    <option>B1</option>
                    <option>B2</option>
                    <option>C1</option>
                    <option>C2</option>
                    <option>Native</option>
                  </select>
                </div>
                <div className="field">
                  <label>Min Experience (yrs)</label>
                  <input
                    type="number"
                    value={form.minExperience}
                    onChange={(e) => updateField('minExperience', e.target.value)}
                    min={0}
                  />
                </div>
              </div>

              <div className="field-row-3">
                <div className="field">
                  <label>Min Age</label>
                  <input
                    type="number"
                    value={form.minAge}
                    onChange={(e) => updateField('minAge', e.target.value)}
                    min={16}
                    max={70}
                  />
                </div>
                <div className="field">
                  <label>Max Age</label>
                  <input
                    type="number"
                    value={form.maxAge}
                    onChange={(e) => updateField('maxAge', e.target.value)}
                    min={16}
                    max={70}
                  />
                </div>
                <div className="field">
                  <label>Military Status</label>
                  <select
                    value={form.militaryStatus}
                    onChange={(e) => updateField('militaryStatus', e.target.value)}
                  >
                    <option value="Any">Any</option>
                    <option>Completed</option>
                    <option>Exempted</option>
                    <option>Postponed</option>
                    <option>Not Applicable</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Accepted Graduation Statuses</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Grad', 'Undergrad', 'Gap Year', 'Drop Out'].map((s) => {
                    const isOn = form.acceptedStatuses
                      .split(',')
                      .map((x) => x.trim())
                      .includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleStatus(s)}
                        className={'radio-chip' + (isOn ? ' on' : '')}
                        style={{ cursor: 'pointer' }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="field">
                <label>Interview Slots</label>
                {form.interviewSlots.map((slot, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      value={slot}
                      onChange={(e) => updateSlot(i, e.target.value)}
                      placeholder="e.g. Saturday 1pm to 5pm"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeSlot(i)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={addSlot}
                  style={{ marginTop: 6 }}
                >
                  + Add Slot
                </button>
              </div>

              <div className="field">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="field">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Offer' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}