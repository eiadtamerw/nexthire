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
          <p style={{ fontSize: 44, marginBottom: 12 }}>💼</p>
          <p>No open offers right now.</p>
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
                  {o.site && <span>📍 {o.site}</span>}
                  {o.requiredNationality !== 'Any' && (
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
                      🎂 {o.minAge}–{o.maxAge}
                    </span>
                  )}
                  {Number(o.minExperience) > 0 && (
                    <span>💼 {o.minExperience}+ yr</span>
                  )}
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
                  {isAuth && (
                    <>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEditModal(o)}
                        type="button"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(o.rowIndex, o.jobTitle)}
                        type="button"
                      >
                        🗑 Delete
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