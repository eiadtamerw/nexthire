import { NextResponse } from 'next/server';
import { getUsersFromSheet, addUserToSheet } from '../../../../lib/sheets';
import { hashPassword } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const existing = await getUsersFromSheet();
    if (existing.length > 0) {
      return NextResponse.json(
        { ok: false, error: 'Admin already exists' },
        { status: 403 }
      );
    }

    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: 'Missing username or password' },
        { status: 400 }
      );
    }
    if (String(password).length < 6) {
      return NextResponse.json(
        { ok: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const { hash, salt } = hashPassword(String(password));
    await addUserToSheet(String(username).trim(), hash, salt);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Setup error:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Setup failed' },
      { status: 500 }
    );
  }
}