/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import {
  getAuthUser,
  hasFinanceAccess,
  getFinanceFromSheet,
  addFinanceToSheet,
} from '../../../lib/sheets';

export async function GET(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasFinanceAccess(session.username)) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const finance = await getFinanceFromSheet();
    return NextResponse.json({ ok: true, finance });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasFinanceAccess(session.username)) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.candidateName) {
      return NextResponse.json(
        { ok: false, error: 'Candidate name is required' },
        { status: 400 }
      );
    }

    const result = await addFinanceToSheet({
      interviewDateTime: String(body.interviewDateTime || ''),
      candidateName: String(body.candidateName || ''),
      teamLeader: String(body.teamLeader || ''),
      recruiter: String(body.recruiter || ''),
      offer: String(body.offer || ''),
      hiredDate: String(body.hiredDate || ''),
      periodDays: Number(body.periodDays) || 0,
      totalCommission: Number(body.totalCommission) || 0,
      status: String(body.status || 'Pending'),
      notes: String(body.notes || ''),
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}