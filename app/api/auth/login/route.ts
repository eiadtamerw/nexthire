import { NextResponse } from 'next/server';
import { findUser, addSessionToSheet } from '../../../../lib/sheets';
import { verifyPassword, generateToken } from '../../../../lib/auth';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: 'Missing username or password' },
        { status: 400 }
      );
    }

    const user = await findUser(String(username).trim());
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const valid = verifyPassword(String(password), user.password_hash, user.salt);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const token = generateToken();
    const expiresAt = Date.now() + SESSION_TTL_MS;
    await addSessionToSheet(token, user.username, expiresAt);

          const adminUsername = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
    const isAdmin =
      !!adminUsername &&
      user.username.trim().toLowerCase() === adminUsername;

    return NextResponse.json({
      ok: true,
      token,
      expiresAt,
      username: user.username,
      isAdmin,
    });
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Login failed' },
      { status: 500 }
    );
  }
}