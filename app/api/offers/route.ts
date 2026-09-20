import { NextResponse } from 'next/server';
import {
  getOffersFromSheet,
  addOfferToSheet,
  getAuthUser,
} from '../../../lib/sheets';

export async function GET() {
  try {
    const offers = await getOffersFromSheet();
    return NextResponse.json({ ok: true, offers });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.jobTitle || !body.companyName) {
      return NextResponse.json(
        { ok: false, error: 'Job Title and Company Name are required' },
        { status: 400 }
      );
    }

    const result = await addOfferToSheet({
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

    return NextResponse.json({ ok: true, id: result.id });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to add offer' },
      { status: 500 }
    );
  }
}