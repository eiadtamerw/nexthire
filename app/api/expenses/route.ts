/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import {
  getAuthUser,
  hasFinanceAccess,
  getExpensesFromSheet,
  addExpenseToSheet,
} from '../../../lib/sheets';

export async function GET(request: Request) {
  const session = await getAuthUser(request);
  if (!session)
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  if (!hasFinanceAccess(session.username))
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });

  try {
    const expenses = await getExpensesFromSheet();
    return NextResponse.json({ ok: true, expenses });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAuthUser(request);
  if (!session)
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  if (!hasFinanceAccess(session.username))
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });

  try {
    const body = await request.json();
    if (!body.description || !body.amount) {
      return NextResponse.json(
        { ok: false, error: 'Description and amount required' },
        { status: 400 }
      );
    }
    await addExpenseToSheet({
      date: String(body.date || ''),
      description: String(body.description || ''),
      amount: Number(body.amount) || 0,
      category: String(body.category || 'Other'),
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}