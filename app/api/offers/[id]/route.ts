import { NextResponse } from 'next/server';
import {
  updateOfferInSheet,
  deleteOfferFromSheet,
  getAuthUser,
} from '../../../../lib/sheets';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const rowIndex = Number(id);
    if (!rowIndex || rowIndex < 2) {
      return NextResponse.json(
        { ok: false, error: 'Invalid row index' },
        { status: 400 }
      );
    }

    const body = await request.json();
    await updateOfferInSheet(rowIndex, {
      jobTitle: body.jobTitle || '',
      companyName: body.companyName || '',
      site: body.site || '',
      requiredNationality: body.requiredNationality || 'Any',
      requiredLanguage: body.requiredLanguage || '',
      requiredLevel: body.requiredLevel || '',
      minAge: body.minAge || '',
      maxAge: body.maxAge || '',
      gender: body.gender || 'Any',
      militaryStatus: body.militaryStatus || 'Any',
      minExperience: body.minExperience || '0',
      description: body.description || '',
      status: body.status || 'Open',
      acceptedStatuses: body.acceptedStatuses || '',
      interviewSlots: Array.isArray(body.interviewSlots) ? body.interviewSlots : [],
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to update offer' },
      { status: 500 }
    );
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

  try {
    const { id } = await params;
    const rowIndex = Number(id);
    if (!rowIndex || rowIndex < 2) {
      return NextResponse.json(
        { ok: false, error: 'Invalid row index' },
        { status: 400 }
      );
    }

    await deleteOfferFromSheet(rowIndex);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to delete offer' },
      { status: 500 }
    );
  }
}