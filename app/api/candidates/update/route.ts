/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import {
  updateCandidateStatus,
  getAuthUser,
  getCandidatesFromSheet,
  addFinanceFromCandidate,
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

    // هات كل الكانديدتس
    const allCandidates = await getCandidatesFromSheet();
    const candidate = allCandidates.find((c) => c.rowIndex === Number(rowIndex));

    if (!candidate) {
      return NextResponse.json({ ok: false, error: 'Candidate not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && candidate.owner !== session.username) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    const previousStatus = candidate.candidateStatus || 'New';
    const newStatus = String(candidateStatus || 'New');

    await updateCandidateStatus(Number(rowIndex), newStatus, String(notes || ''));

    // ⭐ لو الحالة الجديدة = Hired ومكانتش Hired قبل كده
    if (newStatus === 'Hired' && previousStatus !== 'Hired') {
      try {
        await addFinanceFromCandidate({
          interviewDate: candidate.interviewDate || '',
          interviewTime: candidate.interviewTime || '',
          candidateName: candidate.tripleName || '',
          teamLeader: candidate.owner || '',
          offerTitle: candidate.appliedOfferTitle || '',
          offerId: candidate.appliedOfferId || '',
          hiredDate:
            candidate.interviewDate ||
            new Date().toISOString().slice(0, 10),
          notes: candidate.notes || '',
        });
      } catch (financeErr) {
        console.error('Failed to auto-add to Finance:', financeErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Update candidate error:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to update' },
      { status: 500 }
    );
  }
}