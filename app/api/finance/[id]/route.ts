/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import {
  getAuthUser,
  hasFinanceAccess,
  updateFinanceInSheet,
  deleteFinanceFromSheet,
} from '../../../../lib/sheets';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasFinanceAccess(session.username)) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const rowIndex = Number(id);
    if (!rowIndex || rowIndex < 2) {
      return NextResponse.json({ ok: false, error: 'Invalid row' }, { status: 400 });
    }

    const body = await request.json();
    await updateFinanceInSheet(rowIndex, {
      recruiter: body.recruiter,
      status: body.status,
      notes: body.notes,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasFinanceAccess(session.username)) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const rowIndex = Number(id);
    if (!rowIndex || rowIndex < 2) {
      return NextResponse.json({ ok: false, error: 'Invalid row' }, { status: 400 });
    }

    await deleteFinanceFromSheet(rowIndex);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}