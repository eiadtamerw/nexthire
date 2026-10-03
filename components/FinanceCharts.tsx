'use client';

import { useMemo } from 'react';

type FinanceItem = {
  rowIndex: number;
  candidateName: string;
  teamLeader: string;
  recruiter: string;
  offer: string;
  hiredDate: string;
  collectionDate: string;
  totalCommission: number;
  tlCommission: number;
  recruiterCommission: number;
  status: string;
  createdAt: string;
};

/* ============ HELPERS ============ */
function monthKey(dateStr: string): string {
  if (!dateStr) return '';
  const m = String(dateStr).match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : '';
}

function monthLabel(key: string): string {
  if (!key) return '';
  const [y, m] = key.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${y.slice(2)}`;
}

function fmtMoney(n: number): string {
  if (!n) return '0';
  return n.toLocaleString('en-EG');
}

/* ============ MAIN ============ */
export default function FinanceCharts({ items }: { items: FinanceItem[] }) {
  // ===== Monthly Trend =====
  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((i) => {
      const k = monthKey(i.hiredDate || i.createdAt);
      if (!k) return;
      map.set(k, (map.get(k) || 0) + i.totalCommission);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8); // آخر 8 شهور
  }, [items]);

  // ===== Status Breakdown =====
  const statusBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    items.forEach((i) => {
      const s = i.status || 'Pending';
      const prev = map.get(s) || { count: 0, total: 0 };
      map.set(s, {
        count: prev.count + 1,
        total: prev.total + i.totalCommission,
      });
    });
    return Array.from(map.entries()).map(([status, v]) => ({ status, ...v }));
  }, [items]);

  // ===== Top Team Leaders =====
  const topTL = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    items.forEach((i) => {
      const tl = i.teamLeader || 'Unknown';
      const prev = map.get(tl) || { count: 0, total: 0 };
      map.set(tl, {
        count: prev.count + 1,
        total: prev.total + i.tlCommission,
      });
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [items]);

  // ===== Top Recruiters =====
  const topRecruiter = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    items.forEach((i) => {
      const r = i.recruiter || 'Unknown';
      const prev = map.get(r) || { count: 0, total: 0 };
      map.set(r, {
        count: prev.count + 1,
        total: prev.total + i.recruiterCommission,
      });
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [items]);

  // ===== Top Offers =====
  const topOffers = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    items.forEach((i) => {
      const o = i.offer || 'Unknown';
      const prev = map.get(o) || { count: 0, total: 0 };
      map.set(o, {
        count: prev.count + 1,
        total: prev.total + i.totalCommission,
      });
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [items]);

  if (items.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
        No data to analyze yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Monthly Trend */}
      <Card title="Monthly Commission Trend" subtitle="Total commission per month">
        <MonthlyBarChart data={monthly} />
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 24,
        }}
      >
        {/* Status Breakdown */}
        <Card title="Status Breakdown" subtitle="Distribution by status">
          <StatusPie data={statusBreakdown} />
        </Card>

        {/* Top Offers */}
        <Card title="Top Offers" subtitle="Offers with highest total commission">
          <HBarChart
            data={topOffers.map((o) => ({
              label: o.name,
              value: o.total,
              sub: `${o.count} hire${o.count !== 1 ? 's' : ''}`,
            }))}
            color="var(--neon)"
          />
        </Card>

        {/* Top Team Leaders */}
        <Card title="Top Team Leaders" subtitle="By TL commission (16.57%)">
          <HBarChart
            data={topTL.map((t) => ({
              label: t.name,
              value: t.total,
              sub: `${t.count} hire${t.count !== 1 ? 's' : ''}`,
            }))}
            color="#93c5fd"
          />
        </Card>

        {/* Top Recruiters */}
        <Card title="Top Recruiters" subtitle="By recruiter commission (33.43%)">
          <HBarChart
            data={topRecruiter.map((r) => ({
              label: r.name,
              value: r.total,
              sub: `${r.count} hire${r.count !== 1 ? 's' : ''}`,
            }))}
            color="#86efac"
          />
        </Card>
      </div>
    </div>
  );
}

/* ============ CARD WRAPPER ============ */
function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 22,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            marginBottom: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--neon)',
              boxShadow: '0 0 8px var(--neon)',
            }}
          />
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

/* ============ MONTHLY BAR CHART ============ */
function MonthlyBarChart({ data }: { data: [string, number][] }) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        No data yet
      </div>
    );
  }

  const max = Math.max(...data.map(([, v]) => v), 1);
  const width = 100;
  const height = 180;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, position: 'relative', paddingTop: 20 }}>
      {/* Y-axis grid lines */}
      {[0.25, 0.5, 0.75, 1].map((p) => (
        <div
          key={p}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: p * (height - 40),
            borderTop: '1px dashed rgba(255,255,255,0.06)',
          }}
        />
      ))}

      {data.map(([key, value]) => {
        const barH = (value / max) * (height - 40);
        return (
          <div
            key={key}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--neon)',
                whiteSpace: 'nowrap',
              }}
            >
              {fmtMoney(value)}
            </div>
            <div
              style={{
                width: '100%',
                maxWidth: 40,
                height: barH,
                background:
                  'linear-gradient(180deg, rgba(198,232,45,0.9), rgba(198,232,45,0.3))',
                borderRadius: 6,
                boxShadow: '0 0 12px rgba(198,232,45,0.3)',
                transition: 'height 0.4s ease',
              }}
            />
            <div
              style={{
                fontSize: 10,
                color: 'var(--muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {monthLabel(key)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============ HORIZONTAL BAR CHART ============ */
function HBarChart({
  data,
  color,
}: {
  data: { label: string; value: number; sub?: string }[];
  color: string;
}) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        No data yet
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 6,
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {d.label}
                {d.sub && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      color: 'var(--muted)',
                      fontWeight: 400,
                    }}
                  >
                    {d.sub}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color,
                  whiteSpace: 'nowrap',
                }}
              >
                {fmtMoney(d.value)} EGP
              </div>
            </div>
            <div
              style={{
                height: 6,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 999,
                  boxShadow: `0 0 10px ${color}80`,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============ PIE CHART ============ */
function StatusPie({
  data,
}: {
  data: { status: string; count: number; total: number }[];
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) {
    return (
      <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        No data yet
      </div>
    );
  }

  const colorMap: Record<string, string> = {
    Pending: '#fcd34d',
    Collected: '#86efac',
    Paid: '#93c5fd',
    Cancelled: '#fca5a5',
  };

  const size = 160;
  const radius = 70;
  const cx = size / 2;
  const cy = size / 2;

  let acc = 0;
  const segments = data.map((d) => {
    const pct = d.count / total;
    const startAngle = acc * 2 * Math.PI - Math.PI / 2;
    acc += pct;
    const endAngle = acc * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;

    const path =
      pct >= 0.9999
        ? `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx - radius} ${cy}`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      path,
      color: colorMap[d.status] || '#94a3b8',
      status: d.status,
      count: d.count,
      total: d.total,
    };
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            fillOpacity={0.85}
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="1"
          />
        ))}
        {/* Center hole */}
        <circle cx={cx} cy={cy} r={38} fill="var(--bg-2)" />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize="20"
          fontWeight="800"
          fill="var(--neon)"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fontSize="10"
          fill="var(--muted)"
        >
          TOTAL
        </text>
      </svg>

      <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {segments.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: s.color,
                  boxShadow: `0 0 6px ${s.color}`,
                }}
              />
              {s.status}
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
              {s.count} · {fmtMoney(s.total)} EGP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}