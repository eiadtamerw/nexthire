/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { updateCandidateStatus, getAuthUser } from '../../../../lib/sheets';

export async function PATCH(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rowIndex, candidateStatus, notes } = body;

    if (!rowIndex || rowIndex < 2) {
      return NextResponse.json(
        { ok: false, error: 'Invalid row index' },
        { status: 400 }
      );
    }

    await updateCandidateStatus(
      Number(rowIndex),
      String(candidateStatus || 'New'),
      String(notes || '')
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Update candidate error:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to update' },
      { status: 500 }
    );
  }
}