/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import {
  findUser,
  updateUserPassword,
  getAuthUser,
} from '../../../../lib/sheets';
import { hashPassword, verifyPassword } from '../../../../lib/auth';

export async function POST(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { ok: false, error: 'Missing fields' },
        { status: 400 }
      );
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { ok: false, error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const user = await findUser(session.username);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const valid = verifyPassword(
      String(currentPassword),
      user.password_hash,
      user.salt
    );
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    const { hash, salt } = hashPassword(String(newPassword));
    await updateUserPassword(session.username, hash, salt);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Change password error:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}