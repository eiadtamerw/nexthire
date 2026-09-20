import { NextResponse } from 'next/server';
import { getDashboardStats } from '../../../lib/sheets';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ ok: true, ...stats });
  } catch (e: any) {
    console.error('Dashboard error:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}