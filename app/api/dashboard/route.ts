import { NextResponse } from 'next/server';
import { getDashboardStats, getAuthUser } from '../../../lib/sheets';

export async function GET(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ ok: true, ...stats });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}