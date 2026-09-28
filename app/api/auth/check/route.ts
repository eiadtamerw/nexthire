import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/sheets';

export async function GET(request: Request) {
  const session = await getAuthUser(request);

  if (!session) {
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({
    ok: true,
    username: session.username,
    role: session.role || 'user',
    theme: session.theme || 'neon',
    profilePic: session.profile_pic || '', // ⭐
  });
}