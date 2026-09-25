'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Candidate = {
  status: string;
  nationality: string;
  timestamp: string;
  candidateStatus: string;
  appliedOfferId: string;
  appliedOfferTitle: string;
  score: number;
};

type Offer = {
  id: string;
  jobTitle: string;
  companyName: string;
  status: string;
};

/* ============ CONSTANTS ============ */
const FUNNEL_STAGES = ['New', 'Contacted', 'Interviewed', 'Shortlisted', 'Hired'];

const STAGE_COLORS: Record<string, string> = {
  New: '#3b82f6',
  Contacted: '#f59e0b',
  Interviewed: '#8b5cf6',
  Shortlisted: '#C6E82D',
  Hired: '#10b981',
  Rejected: '#ef4444',
  'No Show': '#64748b',
};

const PIE_COLORS = [
  '#C6E82D',
  '#3b82f6',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#ef4444',
  '#10b981',
  '#64748b',
];

const tooltipStyle = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  fontSize: 13,
  color: 'var(--text)',
  padding: '10px 14px',
};

/* ============ HELPERS ============ */
function countBy(arr: any[], key: string) {
  const map: Record<string, number> = {};
  arr.forEach((item) => {
    const k = item[key] || 'Unknown';
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function stageOf(c: Candidate) {
  return c.candidateStatus || 'New';
}

/* ============ MAIN ============ */
export default function DashboardCharts({
  candidates,
  offers,
}: {
  candidates: Candidate[];
  offers: Offer[];
}) {
  // ==== KPI Stats ====
  const stats = useMemo(() => {
    const total = candidates.length;
    const hired = candidates.filter((c) => stageOf(c) === 'Hired').length;
    const rejected = candidates.filter((c) => stageOf(c) === 'Rejected').length;
    const noShow = candidates.filter((c) => stageOf(c) === 'No Show').length;
    const inProgress = total - hired - rejected - noShow;
    const avgScore =
      total > 0
        ? Math.round(
            candidates.reduce((sum, c) => sum + (Number(c.score) || 0), 0) / total
          )
        : 0;
    const hireRate = total > 0 ? Math.round((hired / total) * 100) : 0;
    const rejectRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

    return {
      total,
      hired,
      rejected,
      noShow,
      inProgress,
      avgScore,
      hireRate,
      rejectRate,
    };
  }, [candidates]);

  // ==== Funnel ====
  const funnelData = useMemo(() => {
    return FUNNEL_STAGES.map((stage) => {
      if (stage === 'Hired') {
        return {
          stage,
          count: candidates.filter((c) => stageOf(c) === 'Hired').length,
        };
      }
      // Cumulative: كل اللي وصلوا للمرحلة دي أو أبعد
      const stageIdx = FUNNEL_STAGES.indexOf(stage);
      const reached = candidates.filter((c) => {
        const cStage = stageOf(c);
        const cIdx = FUNNEL_STAGES.indexOf(cStage);
        return cIdx >= stageIdx && cIdx !== -1;
      }).length;
      return { stage, count: reached };
    });
  }, [candidates]);

  const funnelMax = Math.max(...funnelData.map((f) => f.count), 1);

  // ==== Pie — Stages ====
  const stagePie = useMemo(() => {
    const allStages = ['New', 'Contacted', 'Interviewed', 'Shortlisted', 'Hired', 'Rejected', 'No Show'];
    const map: Record<string, number> = {};
    candidates.forEach((c) => {
      const s = stageOf(c);
      map[s] = (map[s] || 0) + 1;
    });
    return allStages
      .filter((s) => map[s])
      .map((s) => ({ name: s, value: map[s] }));
  }, [candidates]);

  // ==== Per-Offer Stats ====
  const offerStats = useMemo(() => {
    const map: Record<string, {
      id: string;
      title: string;
      company: string;
      total: number;
      hired: number;
      rejected: number;
      inProgress: number;
      totalScore: number;
    }> = {};

    candidates.forEach((c) => {
      const key = c.appliedOfferId || '_unknown';
      if (!map[key]) {
        map[key] = {
          id: key,
          title: c.appliedOfferTitle || 'Unknown Offer',
          company: '',
          total: 0,
          hired: 0,
          rejected: 0,
          inProgress: 0,
          totalScore: 0,
        };
      }
      const s = stageOf(c);
      map[key].total++;
      map[key].totalScore += Number(c.score) || 0;
      if (s === 'Hired') map[key].hired++;
      else if (s === 'Rejected') map[key].rejected++;
      else if (s !== 'No Show') map[key].inProgress++;
    });

    // اربط بأسماء الشركات
    Object.values(map).forEach((o) => {
      const real = offers.find((x) => x.id === o.id);
      if (real) {
        o.title = real.jobTitle;
        o.company = real.companyName;
      }
    });

    return Object.values(map)
      .map((o) => ({
        ...o,
        avgScore: o.total > 0 ? Math.round(o.totalScore / o.total) : 0,
        hireRate: o.total > 0 ? Math.round((o.hired / o.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [candidates, offers]);

  // ==== Bar — Applications per Offer (Top 6) ====
  const perOfferBar = useMemo(
    () =>
      offerStats.slice(0, 6).map((o) => ({
        name: o.title.length > 18 ? o.title.slice(0, 16) + '…' : o.title,
        applications: o.total,
        hired: o.hired,
        rejected: o.rejected,
      })),
    [offerStats]
  );

  // ==== Line — Applications last 30 days ====
  const timeData = useMemo(() => {
    const now = new Date();
    const days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
    candidates.forEach((c) => {
      const day = String(c.timestamp || '').slice(0, 10);
      const found = days.find((d) => d.date === day);
      if (found) found.count++;
    });
    return days.map((d) => ({ date: d.date.slice(5), count: d.count }));
  }, [candidates]);

  // ==== Nationality Pie ====
  const nationalityData = useMemo(() => countBy(candidates, 'nationality'), [candidates]);

  if (candidates.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
        <p>No data to display yet.</p>
      </div>
    );
  }

  return (
    <div className="analytics-wrap">
      {/* ==== KPI Row ==== */}
      <div className="analytics-kpis">
        <KpiBox
          label="Total Applications"
          value={stats.total}
          icon="users"
          color="#C6E82D"
        />
        <KpiBox
          label="Hired"
          value={stats.hired}
          sub={`${stats.hireRate}% hire rate`}
          icon="check"
          color="#10b981"
        />
        <KpiBox
          label="Rejected"
          value={stats.rejected}
          sub={`${stats.rejectRate}% reject rate`}
          icon="x"
          color="#ef4444"
        />
        <KpiBox
          label="In Progress"
          value={stats.inProgress}
          icon="clock"
          color="#3b82f6"
        />
        <KpiBox
          label="Avg Score"
          value={stats.avgScore + '%'}
          icon="target"
          color="#8b5cf6"
        />
        <KpiBox
          label="Open Offers"
          value={offers.filter((o) => (o.status || '').toLowerCase() === 'open').length}
          icon="briefcase"
          color="#f59e0b"
        />
      </div>

      {/* ==== Funnel ==== */}
      <div className="chart-card">
        <div className="chart-card-title">Recruitment Funnel</div>
        <div className="funnel">
          {funnelData.map((f, i) => {
            const pct = (f.count / funnelMax) * 100;
            const color = STAGE_COLORS[f.stage] || '#64748b';
            return (
              <div key={f.stage} className="funnel-row">
                <div className="funnel-label">
                  <span className="funnel-stage">{f.stage}</span>
                  <span className="funnel-count">{f.count}</span>
                </div>
                <div className="funnel-bar-bg">
                  <div
                    className="funnel-bar"
                    style={{
                      width: `${Math.max(pct, 3)}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                      boxShadow: `0 0 20px ${color}55`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==== Charts Grid ==== */}
      <div className="charts-grid">
        {/* Pie — Stages */}
        <div className="chart-card">
          <div className="chart-card-title">Candidates by Stage</div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stagePie}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  dataKey="value"
                  stroke="var(--bg)"
                  strokeWidth={2}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {stagePie.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={STAGE_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie — Nationality */}
        <div className="chart-card">
          <div className="chart-card-title">Candidates by Nationality</div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={nationalityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  dataKey="value"
                  stroke="var(--bg)"
                  strokeWidth={2}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {nationalityData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar — Applications per Offer */}
        <div className="chart-card">
          <div className="chart-card-title">Applications per Offer (Top 6)</div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={perOfferBar} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  stroke="var(--muted)"
                  style={{ fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--muted)"
                  style={{ fontSize: 11 }}
                  width={110}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(198,232,45,0.05)' }}
                />
                <Bar
                  dataKey="applications"
                  fill="#C6E82D"
                  radius={[0, 8, 8, 0]}
                  name="Applications"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar — Hired vs Rejected per Offer */}
        <div className="chart-card">
          <div className="chart-card-title">Hired vs Rejected per Offer</div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={perOfferBar}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted)"
                  style={{ fontSize: 10 }}
                />
                <YAxis stroke="var(--muted)" style={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(198,232,45,0.05)' }}
                />
                <Bar dataKey="hired" fill="#10b981" radius={[6, 6, 0, 0]} name="Hired" />
                <Bar dataKey="rejected" fill="#ef4444" radius={[6, 6, 0, 0]} name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line — Applications over time */}
        <div className="chart-card chart-card-full">
          <div className="chart-card-title">Applications · Last 30 Days</div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted)" style={{ fontSize: 11 }} />
                <YAxis stroke="var(--muted)" style={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#C6E82D"
                  strokeWidth={3}
                  dot={{ fill: '#C6E82D', r: 3 }}
                  activeDot={{ r: 6, fill: '#C6E82D' }}
                  name="Applications"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ==== Per-Offer Table ==== */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <div className="chart-card-title">Full Breakdown by Offer</div>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Offer</th>
                <th>Company</th>
                <th>Applied</th>
                <th>Hired</th>
                <th>Rejected</th>
                <th>In Progress</th>
                <th>Avg Score</th>
                <th>Hire Rate</th>
              </tr>
            </thead>
            <tbody>
              {offerStats.map((o, i) => (
                <tr key={o.id}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>{o.title}</strong>
                  </td>
                  <td style={{ color: 'var(--neon)', fontWeight: 600 }}>
                    {o.company || '—'}
                  </td>
                  <td>
                    <span className="num-badge">{o.total}</span>
                  </td>
                  <td>
                    <span className="num-badge num-green">{o.hired}</span>
                  </td>
                  <td>
                    <span className="num-badge num-red">{o.rejected}</span>
                  </td>
                  <td>
                    <span className="num-badge num-blue">{o.inProgress}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="score-bar" style={{ width: 70 }}>
                        <div style={{ width: `${o.avgScore}%` }} />
                      </div>
                      <span style={{ color: 'var(--neon)', fontWeight: 700 }}>
                        {o.avgScore}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="num-badge"
                      style={{
                        background:
                          o.hireRate >= 50
                            ? 'rgba(16,185,129,0.15)'
                            : o.hireRate >= 25
                            ? 'rgba(198,232,45,0.15)'
                            : 'rgba(239,68,68,0.12)',
                        color:
                          o.hireRate >= 50
                            ? '#10b981'
                            : o.hireRate >= 25
                            ? 'var(--neon)'
                            : '#fca5a5',
                        border: '1px solid',
                        borderColor:
                          o.hireRate >= 50
                            ? 'rgba(16,185,129,0.3)'
                            : o.hireRate >= 25
                            ? 'rgba(198,232,45,0.3)'
                            : 'rgba(239,68,68,0.3)',
                      }}
                    >
                      {o.hireRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============ KPI BOX ============ */
function KpiBox({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: 'users' | 'check' | 'x' | 'clock' | 'target' | 'briefcase';
  color: string;
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
    check: (
      <svg viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    x: (
      <svg viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    clock: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    target: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    briefcase: (
      <svg viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  };

  return (
    <div className="analytics-kpi" style={{ borderColor: color + '40' }}>
      <div className="analytics-kpi-icon" style={{ background: color + '15', color: color }}>
        {icons[icon]}
      </div>
      <div className="analytics-kpi-value" style={{ color }}>
        {value}
      </div>
      <div className="analytics-kpi-label">{label}</div>
      {sub && <div className="analytics-kpi-sub">{sub}</div>}
    </div>
  );
}