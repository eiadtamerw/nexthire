/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import {
  getAuthUser,
  getTemplatesFromSheet,
  saveTemplate,
  deleteTemplate,
} from '../../../lib/sheets';

export async function GET(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const templates = await getTemplatesFromSheet();
    return NextResponse.json({ ok: true, templates });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAuthUser(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { offerId, offerTitle, message } = await request.json();
    if (!offerId) {
      return NextResponse.json({ ok: false, error: 'Missing offerId' }, { status: 400 });
    }
    await saveTemplate(
      String(offerId),
      String(offerTitle || ''),
      String(message || '')
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAuthUser(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { offerId } = await request.json();
    await deleteTemplate(String(offerId));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}