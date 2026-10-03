'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import FinanceCharts from '@/components/FinanceCharts';

type Expense = {
  rowIndex: number;
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  createdAt: string;
};

type FinanceItem = {
  rowIndex: number;
  id: string;
  interviewDateTime: string;
  candidateName: string;
  teamLeader: string;
  recruiter: string;
  offer: string;
  hiredDate: string;
  periodDays: number;
  collectionDate: string;
  totalCommission: number;
  tlCommission: number;
  recruiterCommission: number;
  status: string;
  notes: string;
  createdAt: string;
};

const STATUS_OPTIONS = ['Pending', 'Collected', 'Paid', 'Cancelled'];

function statusStyle(s: string) {
  const v = String(s || 'Pending');
  if (v === 'Collected')
    return { bg: 'rgba(34,197,94,0.15)', color: '#86efac', border: 'rgba(34,197,94,0.4)' };
  if (v === 'Paid')
    return { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: 'rgba(59,130,246,0.4)' };
  if (v === 'Cancelled')
    return { bg: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: 'rgba(239,68,68,0.35)' };
  return { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: 'rgba(245,158,11,0.35)' };
}

function isOverdue(item: FinanceItem): boolean {
  if (!item.collectionDate) return false;
  if ((item.status || '').toLowerCase() === 'collected') return false;
  if ((item.status || '').toLowerCase() === 'paid') return false;
  const today = new Date().toISOString().slice(0, 10);
  return item.collectionDate < today;
}

function fmtMoney(n: number): string {
  if (!n) return '0';
  return n.toLocaleString('en-EG');
}

export default function FinancePage() {
  const router = useRouter();
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<FinanceItem | null>(null);
  const [tab, setTab] = useState<'transactions' | 'analysis'>('transactions');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('staffToken');
    const exp = Number(localStorage.getItem('staffExpires') || 0);
    if (!t || exp < Date.now()) {
      router.push('/login');
      return;
    }
    loadFinance();
  }, [router]);

  function loadFinance() {
    setLoading(true);
    const t = localStorage.getItem('staffToken');
    Promise.all([
      fetch('/api/finance', { headers: { Authorization: 'Bearer ' + t } }).then(
        async (r) => {
          if (r.status === 403) throw new Error('no-access');
          if (r.status === 401) {
            router.push('/login');
            return { ok: false, finance: [] };
          }
          return r.json();
        }
      ),
      fetch('/api/expenses', { headers: { Authorization: 'Bearer ' + t } })
        .then((r) => r.json())
        .catch(() => ({ ok: true, expenses: [] })),
    ])
      .then(([finRes, expRes]) => {
        if (finRes.ok) setItems(finRes.finance);
        if (expRes.ok) setExpenses(expRes.expenses || []);
      })
      .catch((e) => {
        if (e.message === 'no-access')
          setError('You do not have access to Finance.');
        else setError(e.message);
      })
      .finally(() => setLoading(false));
  }

  const filtered = useMemo(() => {
    let list = [...items];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) =>
        [i.candidateName, i.teamLeader, i.recruiter, i.offer, i.id]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    if (filterStatus !== 'all') {
      list = list.filter((i) => i.status === filterStatus);
    }
    return list.sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt))
    );
  }, [items, search, filterStatus]);

  const kpis = useMemo(() => {
    const totalCommission = items.reduce((s, i) => s + i.totalCommission, 0);
    const collectedCommission = items
      .filter((i) =>
        ['collected', 'paid'].includes((i.status || '').toLowerCase())
      )
      .reduce((s, i) => s + i.totalCommission, 0);
    const pendingCommission = items
      .filter((i) => (i.status || 'Pending').toLowerCase() === 'pending')
      .reduce((s, i) => s + i.totalCommission, 0);
    const overdueCommission = items
      .filter(isOverdue)
      .reduce((s, i) => s + i.totalCommission, 0);

    const revenue = Math.round(collectedCommission * 0.5);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = revenue - totalExpenses;

    return {
      totalCommission,
      collectedCommission,
      pendingCommission,
      overdueCommission,
      revenue,
      totalExpenses,
      netProfit,
    };
  }, [items, expenses]);

  return (
    <div className="section" style={{ paddingTop: 30 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em' }}>
          Finance
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Track commissions, collections, and payments.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Top KPIs */}
      <div
        className="grid grid-4"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}
      >
        <KpiCard label="Total Commission" value={kpis.totalCommission} accent="neon" />
        <KpiCard label="Collected" value={kpis.collectedCommission} accent="green" />
        <KpiCard label="Pending" value={kpis.pendingCommission} accent="yellow" />
        <KpiCard label="Overdue" value={kpis.overdueCommission} accent="red" />
      </div>

      {/* Company P&L */}
      <div style={{ marginTop: 24 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: 'var(--muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Company P&L
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}
        >
          <KpiCard label="Total Revenue" value={kpis.revenue} accent="green" />
          <KpiCard
            label="Total Expenses"
            value={kpis.totalExpenses}
            accent="red"
          />
          <KpiCard
            label="Net Profit"
            value={kpis.netProfit}
            accent={kpis.netProfit >= 0 ? 'neon' : 'red'}
          />
          <KpiCard
            label="Team & Recruiters"
            value={kpis.collectedCommission - kpis.revenue}
            accent="yellow"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginTop: 30 }}>
        <button
          className={'tab' + (tab === 'transactions' ? ' on' : '')}
          onClick={() => setTab('transactions')}
        >
          Transactions ({items.length})
        </button>
        <button
          className={'tab' + (tab === 'analysis' ? ' on' : '')}
          onClick={() => setTab('analysis')}
        >
          Analysis
        </button>
      </div>

      {/* Add Expense Button */}
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}
      >
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setExpenseModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Expense
        </button>
      </div>

      {/* Filters + Table */}
      {tab === 'transactions' && (
        <div>
          <div className="filter-bar" style={{ marginTop: 30 }}>
            <div className="filter-search">
              <span className="filter-search-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by candidate, offer, team leader…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>
              Loading finance…
            </p>
          ) : filtered.length === 0 ? (
            <div
              style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}
            >
              <p>No transactions yet.</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>
                Transactions appear here automatically when a candidate is
                marked as Hired.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Candidate</th>
                    <th>Offer</th>
                    <th>Team Leader</th>
                    <th>Recruiter</th>
                    <th>Hired Date</th>
                    <th>Collection</th>
                    <th>Total</th>
                    <th>TL (16.57%)</th>
                    <th>Recruiter (33.43%)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => {
                    const st = statusStyle(item.status);
                    const overdue = isOverdue(item);
                    return (
                      <tr key={item.id}>
                        <td>{i + 1}</td>
                        <td>
                          <strong>{item.candidateName}</strong>
                        </td>
                        <td>{item.offer || '—'}</td>
                        <td>{item.teamLeader || '—'}</td>
                        <td>
                          {item.recruiter ? (
                            item.recruiter
                          ) : (
                            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                              —
                            </span>
                          )}
                        </td>
                        <td>{item.hiredDate || '—'}</td>
                        <td>
                          {item.collectionDate ? (
                            <span
                              style={{
                                color: overdue ? '#fca5a5' : 'inherit',
                                fontWeight: overdue ? 700 : 400,
                              }}
                            >
                              {item.collectionDate}
                              {overdue && ' ⚠'}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <strong style={{ color: 'var(--neon)' }}>
                            {fmtMoney(item.totalCommission)} EGP
                          </strong>
                        </td>
                        <td>{fmtMoney(item.tlCommission)}</td>
                        <td>{fmtMoney(item.recruiterCommission)}</td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 700,
                              background: st.bg,
                              color: st.color,
                              border: '1px solid ' + st.border,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setSelected(item)}
                            type="button"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analysis */}
      {tab === 'analysis' && <FinanceCharts items={items} />}

      {/* Expense Modal */}
      {expenseModalOpen && (
        <ExpenseModal
          onClose={() => setExpenseModalOpen(false)}
          onSaved={() => {
            setExpenseModalOpen(false);
            loadFinance();
          }}
        />
      )}

      {/* Edit Modal */}
      {selected && (
        <EditModal
          item={selected}
          onClose={() => setSelected(null)}
          onSaved={loadFinance}
        />
      )}
    </div>
  );
}

/* ============ KPI CARD ============ */
function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'neon' | 'yellow' | 'green' | 'red';
}) {
  const colors: Record<string, string> = {
    neon: 'var(--neon)',
    yellow: '#fcd34d',
    green: '#86efac',
    red: '#fca5a5',
  };
  return (
    <div className="kpi">
      <div className="num" style={{ color: colors[accent] }}>
        {value.toLocaleString('en-EG')}
      </div>
      <div className="lbl">{label}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
        EGP
      </div>
    </div>
  );
}

/* ============ EDIT MODAL ============ */
function EditModal({
  item,
  onClose,
  onSaved,
}: {
  item: FinanceItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [recruiter, setRecruiter] = useState(item.recruiter || '');
  const [status, setStatus] = useState(item.status || 'Pending');
  const [notes, setNotes] = useState(item.notes || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function save() {
    setSaving(true);
    setMsg('');
    try {
      const t = localStorage.getItem('staffToken');
      const res = await fetch(`/api/finance/${item.rowIndex}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({ recruiter, status, notes }),
      });
      const data = await res.json();
      setSaving(false);
      if (!data.ok) {
        setMsg('❌ ' + (data.error || 'Failed'));
        return;
      }
      setMsg('✅ Saved');
      setTimeout(() => {
        onSaved();
        onClose();
      }, 600);
    } catch (e: any) {
      setSaving(false);
      setMsg('❌ ' + e.message);
    }
  }

  async function remove() {
    if (!confirm('Delete this transaction?')) return;
    try {
      const t = localStorage.getItem('staffToken');
      const res = await fetch(`/api/finance/${item.rowIndex}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + t },
      });
      const data = await res.json();
      if (!data.ok) {
        alert('Error: ' + (data.error || 'Failed'));
        return;
      }
      onSaved();
      onClose();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  }

  return (
    <div
      className="modal-back on"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-head">
          <div>
            <h3>{item.candidateName}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              {item.offer} · {item.teamLeader || '—'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Summary */}
        <div
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '10px 18px',
            marginBottom: 18,
          }}
        >
          {(
            [
              ['Total Commission', `${fmtMoney(item.totalCommission)} EGP`],
              ['TL Commission', `${fmtMoney(item.tlCommission)} EGP`],
              [
                'Recruiter Commission',
                `${fmtMoney(item.recruiterCommission)} EGP`,
              ],
              ['Hired Date', item.hiredDate || '—'],
              ['Period', `${item.periodDays} days`],
              ['Collection Date', item.collectionDate || '—'],
              ['Interview', item.interviewDateTime || '—'],
            ] as [string, string][]
          ).map(([k, v]) => (
            <div
              key={k}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: 13,
              }}
            >
              <span style={{ color: 'var(--muted)' }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Editable fields */}
        <div className="field">
          <label>Recruiter (اسم الريكروتر)</label>
          <input
            type="text"
            value={recruiter}
            onChange={(e) => setRecruiter(e.target.value)}
            placeholder="اسم الريكروتر"
          />
        </div>

        <div className="field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {msg && (
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              marginTop: 8,
              color: msg.startsWith('✅') ? 'var(--neon)' : '#fca5a5',
            }}
          >
            {msg}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
            marginTop: 20,
          }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={remove}
            style={{ color: '#fca5a5', borderColor: 'rgba(239,68,68,0.3)' }}
          >
            Delete
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ EXPENSE MODAL ============ */
const EXPENSE_CATEGORIES = [
  'Marketing',
  'Salaries',
  'Office',
  'Tools',
  'Transport',
  'Other',
];

function ExpenseModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function save() {
    if (!description || !amount) {
      setMsg('❌ Fill all fields');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      const t = localStorage.getItem('staffToken');
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({
          date,
          description,
          amount: Number(amount) || 0,
          category,
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (!data.ok) {
        setMsg('❌ ' + (data.error || 'Failed'));
        return;
      }
      onSaved();
    } catch (e: any) {
      setSaving(false);
      setMsg('❌ ' + e.message);
    }
  }

  return (
    <div
      className="modal-back on"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-head">
          <h3>Add Expense</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="field">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Facebook Ads"
          />
        </div>

        <div className="field">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Amount (EGP)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min={0}
          />
        </div>

        {msg && (
          <p style={{ fontSize: 13, color: '#fca5a5', fontWeight: 700 }}>
            {msg}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 16,
          }}
        >
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}