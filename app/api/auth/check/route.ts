import { NextResponse } from 'next/server';
import { findSession } from '../../../../lib/sheets';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return NextResponse.json({ ok: false });
  }

  const session = await findSession(token);
  if (!session) {
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true, username: session.username });
}