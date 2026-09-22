/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { deleteUserFromSheet, getAuthUser } from '../../../../lib/sheets';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username } = await params;
    const target = decodeURIComponent(username);

    // متسمحش للمستخدم يمسح نفسه
    if (target === session.username) {
      return NextResponse.json(
        { ok: false, error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    await deleteUserFromSheet(target);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Delete user error:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}