import { NextResponse } from 'next/server';
import { getUsersFromSheet } from '../../../lib/sheets';

export async function GET() {
  try {
    const users = await getUsersFromSheet();
    const teamLeaders = users
      .filter((u) => u.role === 'team_leader')
      .map((u) => ({ username: u.username }));
    return NextResponse.json({ ok: true, teamLeaders });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}