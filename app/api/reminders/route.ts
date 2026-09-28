import { NextResponse } from 'next/server';
import { getAuthUser, getCandidatesFromSheet } from '../../../lib/sheets';

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const all = await getCandidatesFromSheet();
    const tomorrow = getTomorrowDate();

    let filtered = all.filter((c) => {
      const d = String(c.interviewDate || '').trim();
      return d.startsWith(tomorrow);
    });

    // Team leader يشوف بتاعه بس
    if (session.role !== 'admin') {
      filtered = filtered.filter((c) => c.owner === session.username);
    }

    return NextResponse.json({
      ok: true,
      candidates: filtered,
      date: tomorrow,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}