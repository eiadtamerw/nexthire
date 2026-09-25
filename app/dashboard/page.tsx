'use client';
import { buildWhatsAppMessage, buildWhatsAppLink } from '@/lib/whatsapp';
import DashboardCharts from '@/components/DashboardCharts';
import { useEffect, useState, useMemo } from 'react';
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
  candidateStatus: string;
  notes: string;
};

type DashboardData = {
  totalCandidates: number;
  totalOffers: number;
  openOffers: number;
  scheduledInterviews: number;
  candidates: Candidate[];
  offers: any[];
};

type SortKey = 'newest' | 'oldest' | 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc';

/* ============ SVG ICONS ============ */
const IconCalendar = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconClock = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconMic = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const IconFile = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const IconWhatsapp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const IconTarget = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconClipboard = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" />
  </svg>
);

const IconSave = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

/* ============ HELPERS ============ */
function csvEscape(v: any): string {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function exportToCSV(candidates: Candidate[]) {
  const headers = [
    'Triple Name', 'Phone', 'WhatsApp', 'Gmail', 'Nationality', 'Site',
    'Language', 'Age', 'College', 'Status', 'Military',
    'Applied Last 3M', 'Experience', 'National ID', 'Company Name',
    'Interview Date', 'Interview Time', 'Score', 'Applied Offer',
    'Stage', 'Notes', 'Vocaroo', 'CV',
  ];

  const rows = candidates.map((c) => [
    c.tripleName, c.phone, c.whatsapp, c.gmail, c.nationality, c.site,
    c.language, c.age, c.college, c.status, c.military,
    c.appliedLast3Months, c.experience, c.nationalId, c.companyName,
    c.interviewDate, c.interviewTime, c.score, c.appliedOfferTitle,
    c.candidateStatus || 'New', c.notes || '',
    c.vocaroo, c.cv,
  ]);

  const csv =
    '\uFEFF' +
    [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `candidates-${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function normalizeDate(s: string): string {
  if (!s) return '';
  const trimmed = String(s).trim();
  const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : trimmed;
}

function formatDateLong(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const STAGE_OPTIONS = [
  'New',
  'Contacted',
  'Interviewed',
  'Shortlisted',
  'Hired',
  'Rejected',
  'No Show',
];

function stageStyle(stage: string) {
  const s = String(stage || 'New');
  if (s === 'Hired') return { bg: 'rgba(34,197,94,0.15)', color: '#86efac', border: 'rgba(34,197,94,0.3)' };
  if (s === 'Rejected') return { bg: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: 'rgba(239,68,68,0.3)' };
  if (s === 'Shortlisted') return { bg: 'rgba(198,232,45,0.15)', color: 'var(--neon)', border: 'rgba(198,232,45,0.4)' };
  if (s === 'Interviewed') return { bg: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: 'rgba(59,130,246,0.3)' };
  if (s === 'No Show') return { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: 'rgba(239,68,68,0.25)' };
  if (s === 'Contacted') return { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)' };
  return { bg: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: 'var(--border)' };
}

/* ============ MAIN ============ */
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'candidates' | 'interviews' | 'analytics' | 'offers'>('candidates');  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterNationality, setFilterNationality] = useState('all');
  const [filterOffer, setFilterOffer] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [interviewDateFilter, setInterviewDateFilter] = useState<string>('');

  function reload() {
    const t = localStorage.getItem('staffToken');
    fetch('/api/dashboard', {
      headers: { Authorization: 'Bearer ' + t },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setData(res);
      });
  }

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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterNationality, filterOffer, filterStage, minScore, sortKey]);

  const statusOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.candidates.map((c) => c.status).filter(Boolean))).sort();
  }, [data]);

  const nationalityOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(
      new Set(data.candidates.map((c) => c.nationality).filter(Boolean))
    ).sort();
  }, [data]);

  const offerOptions = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, string>();
    data.candidates.forEach((c) => {
      if (c.appliedOfferId && c.appliedOfferTitle) {
        map.set(c.appliedOfferId, c.appliedOfferTitle);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [data]);

  const availableInterviewDates = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    data.candidates.forEach((c) => {
      const d = normalizeDate(c.interviewDate);
      if (d) set.add(d);
    });
    return Array.from(set).sort();
  }, [data]);

  const candidatesWithInterviews = useMemo(() => {
    if (!data) return [];
    return data.candidates.filter((c) => normalizeDate(c.interviewDate));
  }, [data]);

  const interviewDayCandidates = useMemo(() => {
    if (!interviewDateFilter) return [];
    return candidatesWithInterviews.filter(
      (c) => normalizeDate(c.interviewDate) === interviewDateFilter
    );
  }, [candidatesWithInterviews, interviewDateFilter]);

  const interviewGroups = useMemo(() => {
    const groups = new Map<string, Candidate[]>();
    interviewDayCandidates.forEach((c) => {
      const time = (c.interviewTime || 'No time specified').trim();
      if (!groups.has(time)) groups.set(time, []);
      groups.get(time)!.push(c);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [interviewDayCandidates]);

  const filteredCandidates = useMemo(() => {
    if (!data) return [];
    let list = [...data.candidates];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) =>
        [c.tripleName, c.phone, c.whatsapp, c.gmail, c.nationalId]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    if (filterStatus !== 'all') list = list.filter((c) => c.status === filterStatus);
    if (filterNationality !== 'all')
      list = list.filter((c) => c.nationality === filterNationality);
    if (filterOffer !== 'all')
      list = list.filter((c) => c.appliedOfferId === filterOffer);
    if (filterStage !== 'all')
      list = list.filter((c) => (c.candidateStatus || 'New') === filterStage);
    if (minScore > 0) list = list.filter((c) => c.score >= minScore);

    switch (sortKey) {
      case 'newest':
        list.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
        break;
      case 'oldest':
        list.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
        break;
      case 'score-desc':
        list.sort((a, b) => b.score - a.score);
        break;
      case 'score-asc':
        list.sort((a, b) => a.score - b.score);
        break;
      case 'name-asc':
        list.sort((a, b) => a.tripleName.localeCompare(b.tripleName));
        break;
      case 'name-desc':
        list.sort((a, b) => b.tripleName.localeCompare(a.tripleName));
        break;
    }

    return list;
  }, [data, search, filterStatus, filterNationality, filterOffer, filterStage, minScore, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, currentPage]);

  const activeFiltersCount = [
    filterStatus !== 'all',
    filterNationality !== 'all',
    filterOffer !== 'all',
    filterStage !== 'all',
    minScore > 0,
    search.trim() !== '',
  ].filter(Boolean).length;

  function clearFilters() {
    setSearch('');
    setFilterStatus('all');
    setFilterNationality('all');
    setFilterOffer('all');
    setFilterStage('all');
    setMinScore(0);
    setSortKey('newest');
  }

  if (loading) {
    return (
      <div className="section">
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
          Loading dashboard…
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
        <KpiCard icon="calendar" value={data.scheduledInterviews} label="Scheduled Interviews" />
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
          className={'tab' + (activeTab === 'interviews' ? ' on' : '')}
          onClick={() => setActiveTab('interviews')}
        >
          Interviews ({data.scheduledInterviews})
        </button>
        <button
          className={'tab' + (activeTab === 'analytics' ? ' on' : '')}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={'tab' + (activeTab === 'offers' ? ' on' : '')}
          onClick={() => setActiveTab('offers')}
        >
          Offers ({data.openOffers})
        </button>
      </div>

      {activeTab === 'candidates' && (
        <>
          <div className="filter-bar">
            <div className="filter-search">
              <span className="filter-search-icon">
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Search by name, phone, email, national ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="filter-search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <IconX />
                </button>
              )}
            </div>

            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Stages</option>
              {STAGE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filterNationality}
              onChange={(e) => setFilterNationality(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Nationalities</option>
              {nationalityOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filterOffer}
              onChange={(e) => setFilterOffer(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Offers</option>
              {offerOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>

            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="filter-select"
            >
              <option value={0}>Any Score</option>
              <option value={60}>≥ 60%</option>
              <option value={80}>≥ 80%</option>
              <option value={100}>100% Only</option>
            </select>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score-desc">Score: High → Low</option>
              <option value="score-asc">Score: Low → High</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
            </select>

            {activeFiltersCount > 0 && (
              <button type="button" onClick={clearFilters} className="filter-clear">
                <IconX />
                Clear ({activeFiltersCount})
              </button>
            )}

            <button
              type="button"
              className="filter-export"
              onClick={() => exportToCSV(filteredCandidates)}
              disabled={filteredCandidates.length === 0}
            >
              <IconDownload />
              Export CSV
            </button>
          </div>

          <div className="filter-count">
            Showing <strong>{paginatedCandidates.length}</strong> of{' '}
            <strong>{filteredCandidates.length}</strong> candidate
            {filteredCandidates.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && ` (filtered from ${data.totalCandidates})`}
          </div>

          <CandidatesTab
            candidates={paginatedCandidates}
            onView={(c) => setSelectedCandidate(c)}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {activeTab === 'interviews' && (
        <InterviewsTab
          allCandidates={data.candidates}
          availableDates={availableInterviewDates}
          totalWithInterviews={candidatesWithInterviews.length}
          selectedDate={interviewDateFilter}
          onDateChange={setInterviewDateFilter}
          groups={interviewGroups}
          dayCandidates={interviewDayCandidates}
          onView={(c) => setSelectedCandidate(c)}
        />
      )}
             {activeTab === 'analytics' && (
        <DashboardCharts candidates={data.candidates} offers={data.offers} />
      )}

      {activeTab === 'offers' && <OffersTab offers={data.offers} />}

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          offers={data.offers}
          onClose={() => setSelectedCandidate(null)}
          onSaved={reload}
        />
      )}
    </div>
  );
}

/* ============ PAGINATION ============ */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    }
  }

  const withDots: (number | string)[] = [];
  pages.forEach((p, idx) => {
    if (idx > 0 && typeof p === 'number' && typeof pages[idx - 1] === 'number') {
      const prev = pages[idx - 1] as number;
      if (p - prev > 1) withDots.push('dots-' + p);
    }
    withDots.push(p);
  });

  return (
    <div className="pagination">
      <button
        type="button"
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        ← Previous
      </button>

      <div className="page-numbers">
        {withDots.map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="page-dots">…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={'page-num' + (p === currentPage ? ' on' : '')}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="page-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next →
      </button>
    </div>
  );
}

/* ============ INTERVIEWS TAB ============ */
function InterviewsTab({
  availableDates,
  totalWithInterviews,
  selectedDate,
  onDateChange,
  groups,
  dayCandidates,
  onView,
}: {
  allCandidates: Candidate[];
  availableDates: string[];
  totalWithInterviews: number;
  selectedDate: string;
  onDateChange: (d: string) => void;
  groups: [string, Candidate[]][];
  dayCandidates: Candidate[];
  onView: (c: Candidate) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = availableDates.filter((d) => d >= today);
  const past = availableDates.filter((d) => d < today);

  return (
    <div>
      <div className="interview-picker">
        <div className="interview-picker-left">
          <div className="interview-picker-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <circle cx="8" cy="15" r="1" fill="currentColor" />
              <circle cx="12" cy="15" r="1" fill="currentColor" />
              <circle cx="16" cy="15" r="1" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="interview-picker-title">Interview Schedule</div>
            <div className="interview-picker-sub">
              {totalWithInterviews} candidate{totalWithInterviews !== 1 ? 's' : ''} with
              scheduled interviews
            </div>
          </div>
        </div>

        <div className="interview-picker-right">
          <label className="interview-picker-label">Pick a date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="interview-date-input"
          />
        </div>
      </div>

      {availableDates.length > 0 && (
        <div className="interview-quick-dates">
          <span className="interview-quick-label">Quick pick:</span>
          {upcoming.slice(0, 8).map((d) => (
            <button
              key={d}
              type="button"
              className={'interview-date-chip' + (d === selectedDate ? ' on' : '')}
              onClick={() => onDateChange(d)}
            >
              {formatDateLong(d)}
            </button>
          ))}
          {upcoming.length === 0 && past.length > 0 && (
            <span className="interview-quick-empty">No upcoming dates</span>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="interview-empty">
          <div className="interview-empty-icon">
            <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            Pick a date to see scheduled interviews
          </p>
        </div>
      )}

      {selectedDate && dayCandidates.length === 0 && (
        <div className="interview-empty">
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            No interviews on this day
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            {formatDateLong(selectedDate)}
          </p>
        </div>
      )}

      {selectedDate && dayCandidates.length > 0 && (
        <>
          <div className="interview-summary">
            <div>
              <div className="interview-summary-date">{formatDateLong(selectedDate)}</div>
              <div className="interview-summary-count">
                {dayCandidates.length} candidate{dayCandidates.length !== 1 ? 's' : ''}
                {' · '}
                {groups.length} time slot{groups.length !== 1 ? 's' : ''}
              </div>
            </div>
            <button
              type="button"
              className="filter-export"
              onClick={() => exportToCSV(dayCandidates)}
            >
              <IconDownload />
              Export Day
            </button>
          </div>

          {groups.map(([time, cands]) => (
            <div key={time} className="interview-group">
              <div className="interview-group-head">
                <span className="interview-group-icon">
                  <IconClock />
                </span>
                <span className="interview-group-time">{time}</span>
                <span className="interview-group-count">
                  {cands.length} candidate{cands.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="interview-cards">
                {cands.map((c) => {
                  const wa = String(c.whatsapp || c.phone || '').replace(/\D/g, '');
                  const style = stageStyle(c.candidateStatus || 'New');
                  return (
                    <div key={c.rowIndex} className="interview-card">
                      <div className="interview-card-main">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                          <div className="interview-card-name">{c.tripleName}</div>
                          <span style={{
                            padding: '3px 9px',
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 800,
                            background: style.bg,
                            color: style.color,
                            border: '1px solid ' + style.border,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}>
                            {c.candidateStatus || 'New'}
                          </span>
                        </div>
                        <div className="interview-card-meta">
                          {c.appliedOfferTitle && (
                            <span className="interview-card-offer">
                              {c.appliedOfferTitle}
                            </span>
                          )}
                          <span>{c.phone}</span>
                          <span>{c.age}</span>
                          <span>{c.nationality}</span>
                        </div>
                      </div>
                      <div className="interview-card-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => onView(c)}
                        >
                          View
                        </button>
                                                {wa && (
                          <a
                            className="btn btn-ghost btn-sm"
                            href={buildWhatsAppLink(
                              String(c.whatsapp || c.phone),
                              buildWhatsAppMessage({
                                name: c.tripleName,
                                stage: c.candidateStatus || 'New',
                                offerTitle: c.appliedOfferTitle,
                                interviewDate: c.interviewDate,
                                interviewTime: c.interviewTime,
                              })
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              color: '#25D366',
                            }}
                          >
                            <IconWhatsapp />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ============ KPI CARD ============ */
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

/* ============ CANDIDATES TAB ============ */
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
        <p>No candidates match the current filters.</p>
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
            <th>Stage</th>
            <th>Age</th>
            <th>Interview</th>
            <th>Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c, i) => {
            const parts: { icon: 'calendar' | 'clock'; text: string }[] = [];
            if (c.interviewDate) parts.push({ icon: 'calendar', text: c.interviewDate });
            if (c.interviewTime) parts.push({ icon: 'clock', text: c.interviewTime });
            const stStyle = stageStyle(c.candidateStatus || 'New');

            return (
              <tr key={c.rowIndex}>
                <td>{i + 1}</td>
                <td>
                  <strong>{c.tripleName}</strong>
                </td>
                <td>{c.appliedOfferTitle || '—'}</td>
                <td>{c.phone}</td>
                <td>{c.nationality}</td>
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    background: stStyle.bg,
                    color: stStyle.color,
                    border: '1px solid ' + stStyle.border,
                    whiteSpace: 'nowrap',
                  }}>
                    {c.candidateStatus || 'New'}
                  </span>
                </td>
                <td>{c.age}</td>
                <td>
                  {parts.length > 0 ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        gap: 8,
                        alignItems: 'center',
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
                      {parts.map((p, pi) => (
                        <span
                          key={pi}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          {p.icon === 'calendar' ? <IconCalendar /> : <IconClock />}
                          {p.text}
                        </span>
                      ))}
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
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onView(c)}
                      type="button"
                    >
                      View
                    </button>
                    {String(c.whatsapp || c.phone || '').trim() && (
                      <a
                        className="btn btn-ghost btn-sm"
                        href={buildWhatsAppLink(
                          String(c.whatsapp || c.phone),
                          buildWhatsAppMessage({
                            name: c.tripleName,
                            stage: c.candidateStatus || 'New',
                            offerTitle: c.appliedOfferTitle,
                            interviewDate: c.interviewDate,
                            interviewTime: c.interviewTime,
                          })
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          color: '#25D366',
                        }}
                        title="Send WhatsApp message"
                      >
                        <IconWhatsapp />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ============ OFFERS TAB ============ */
function OffersTab({ offers }: { offers: any[] }) {
  if (offers.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
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
            {o.site && <span>{o.site}</span>}
            {o.requiredLanguage && (
              <span>
                {o.requiredLanguage}
                {o.requiredLevel && ` · ${o.requiredLevel}`}
              </span>
            )}
            {(o.minAge || o.maxAge) && (
              <span>
                {o.minAge}–{o.maxAge}
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

/* ============ CANDIDATE MODAL ============ */
function CandidateModal({
  candidate,
  offers,
  onClose,
  onSaved,
}: {
  candidate: Candidate;
  offers: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const c = candidate;
  const [editStatus, setEditStatus] = useState(c.candidateStatus || 'New');
  const [editNotes, setEditNotes] = useState(c.notes || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  async function saveChanges() {
    setSaving(true);
    setSaveMsg('');
    try {
      const token = localStorage.getItem('staffToken');
      const res = await fetch('/api/candidates/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          rowIndex: c.rowIndex,
          candidateStatus: editStatus,
          notes: editNotes,
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (!data.ok) {
        setSaveMsg('Failed: ' + (data.error || 'Unknown'));
        return;
      }
      setSaveMsg('Saved!');
      setTimeout(() => {
        onSaved();
        onClose();
      }, 700);
    } catch (e: any) {
      setSaving(false);
      setSaveMsg('Error: ' + e.message);
    }
  }

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

        {/* Links */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {c.vocaroo && (
            <a
              className="btn btn-ghost btn-sm"
              href={c.vocaroo}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <IconMic />
              Vocaroo
            </a>
          )}
          {c.cv && (
            <a
              className="btn btn-ghost btn-sm"
              href={c.cv}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <IconFile />
              CV
            </a>
          )}
                  {waNumber && (
            <a
              className="btn btn-ghost btn-sm"
              href={buildWhatsAppLink(
                String(c.whatsapp || c.phone),
                buildWhatsAppMessage({
                  name: c.tripleName,
                  stage: editStatus,
                  offerTitle: c.appliedOfferTitle,
                  interviewDate: c.interviewDate,
                  interviewTime: c.interviewTime,
                })
              )}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#25D366',
              }}
            >
              <IconWhatsapp />
              WhatsApp
            </a>
          )}
        </div>

        {/* Status & Notes */}
        <div style={{
          background: 'rgba(198,232,45,0.05)',
          border: '1px solid rgba(198,232,45,0.25)',
          borderRadius: 12,
          padding: 18,
          marginBottom: 20,
        }}>
          <div style={{
            fontSize: 13,
            fontWeight: 800,
            color: 'var(--neon)',
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <IconClipboard />
            Status & Notes
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11 }}>Candidate Stage</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              {STAGE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11 }}>Internal Notes</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add notes about this candidate (interview feedback, reminders, etc.)"
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={saveChanges}
              disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <IconSave />
              {saving ? 'Saving…' : 'Save Status & Notes'}
            </button>
            {saveMsg && (
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: saveMsg.startsWith('Saved') ? 'var(--neon)' : '#fca5a5',
              }}>
                {saveMsg}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
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
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <IconTarget />
          Match with Open Offers ({matches.length})
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
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
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
                    <span style={{ fontWeight: 800, color: 'var(--neon)', fontSize: 15 }}>
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