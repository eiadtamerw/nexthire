/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import {
  getUsersFromSheet,
  addUserToSheet,
  findUser,
  getAuthUser,
} from '../../../lib/sheets';
import { hashPassword } from '../../../lib/auth';

export async function GET(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await getUsersFromSheet();
    // مش بنبعت الـ hashes أبدًا
    return NextResponse.json({
      ok: true,
      users: users.map((u) => ({
        username: u.username,
        created_at: u.created_at,
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to load users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, password } = body;

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

     const existing = await findUser(String(username).trim());
    if (existing) {
      return NextResponse.json(
        { ok: false, error: 'Username already exists' },
        { status: 409 }
      );
    }

    const { hash, salt } = hashPassword(String(password));
    await addUserToSheet(String(username).trim(), hash, salt);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Add user error:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to add user' },
      { status: 500 }
    );
  }
}