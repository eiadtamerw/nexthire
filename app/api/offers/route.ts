import { NextResponse } from 'next/server';
import { getOffersFromSheet } from '../../../lib/sheets';

export async function GET() {
  try {
    const offers = await getOffersFromSheet();
    return NextResponse.json({ ok: true, offers });
  } catch (e: any) {
    console.error('Error fetching offers:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}