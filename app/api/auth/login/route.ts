/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import {
  findUser,
  addSessionToSheet,
  getLoginAttempts,
  recordFailedLogin,
  clearLoginAttempts,
} from '../../../../lib/sheets';
import { verifyPassword, generateToken } from '../../../../lib/auth';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0].trim() || 'unknown';
  return 'ip:' + ip;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: 'Missing username or password' },
        { status: 400 }
      );
    }

    const clientId = getClientId(request);

    // ⭐ فحص الـ rate limit
    const attempts = await getLoginAttempts(clientId);
    if (attempts.count >= MAX_ATTEMPTS) {
      const elapsed = Date.now() - attempts.firstAttempt;
      const remaining = Math.ceil((WINDOW_MS - elapsed) / 60000);
      return NextResponse.json(
        {
          ok: false,
          error: `Too many failed attempts. Please try again in ${remaining} minute${remaining !== 1 ? 's' : ''}.`,
        },
        { status: 429 }
      );
    }

    const user = await findUser(String(username).trim());

    if (!user) {
      await recordFailedLogin(clientId);
      const remaining = MAX_ATTEMPTS - attempts.count - 1;
      return NextResponse.json(
        {
          ok: false,
          error:
            remaining > 0
              ? `Invalid username or password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
              : 'Invalid username or password.',
        },
        { status: 401 }
      );
    }

    const valid = verifyPassword(String(password), user.password_hash, user.salt);
    if (!valid) {
      await recordFailedLogin(clientId);
      const remaining = MAX_ATTEMPTS - attempts.count - 1;
      return NextResponse.json(
        {
          ok: false,
          error:
            remaining > 0
              ? `Invalid username or password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
              : 'Too many failed attempts. Account locked for 15 minutes.',
        },
        { status: 401 }
      );
    }

    // ⭐ نجح — امسح المحاولات القديمة
    await clearLoginAttempts(clientId);

    const token = generateToken();
    const expiresAt = Date.now() + SESSION_TTL_MS;
    await addSessionToSheet(token, user.username, expiresAt);

    const adminUsername = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
    const isAdmin =
      !!adminUsername && user.username.trim().toLowerCase() === adminUsername;

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