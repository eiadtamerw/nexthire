/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import {
  updateCandidateStatus,
  getAuthUser,
  getCandidatesFromSheet,
} from '../../../../lib/sheets';

export async function GET(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allCandidates = await getCandidatesFromSheet();
    let candidates = allCandidates;

    // لو مش أدمن، يشوف بتاعه بس
    if (session.role !== 'admin') {
      candidates = allCandidates.filter((c) => c.owner === session.username);
    }

    return NextResponse.json({ ok: true, candidates });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rowIndex, candidateStatus, notes } = body;

    if (!rowIndex || rowIndex < 2) {
      return NextResponse.json({ ok: false, error: 'Invalid row index' }, { status: 400 });
    }

    // لو مش أدمن، نتأكد إن الكانديدت بتاعه
    if (session.role !== 'admin') {
      const allCandidates = await getCandidatesFromSheet();
      const target = allCandidates.find((c) => c.rowIndex === Number(rowIndex));
      if (!target || target.owner !== session.username) {
        return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    await updateCandidateStatus(
      Number(rowIndex),
      String(candidateStatus || 'New'),
      String(notes || '')
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Update candidate error:', e);
    return NextResponse.json({ ok: false, error: e.message || 'Failed to update' }, { status: 500 });
  }
}