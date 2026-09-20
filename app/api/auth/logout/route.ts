import { NextResponse } from 'next/server';
import { deleteSessionFromSheet } from '../../../../lib/sheets';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.token) {
      await deleteSessionFromSheet(String(body.token));
    }
  } catch (e) {}
  return NextResponse.json({ ok: true });
}