import { NextResponse } from 'next/server';
import { getAuthUser, updateUserProfilePic } from '../../../../lib/sheets';

export async function POST(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { profilePic } = body;

      if (typeof profilePic !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing image' }, { status: 400 });
    }
    // لو مش فاضي، لازم يكون صورة صحيحة
    if (profilePic !== '') {
      if (!profilePic.startsWith('data:image/')) {
        return NextResponse.json({ ok: false, error: 'Invalid image format' }, { status: 400 });
      }
      if (profilePic.length > 200000) {
        return NextResponse.json({ ok: false, error: 'Image too large (max 200KB)' }, { status: 400 });
      }
    }
    await updateUserProfilePic(session.username, profilePic);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}