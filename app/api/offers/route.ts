import { NextResponse } from 'next/server';
import {
  getOffersFromSheet,
  addOfferToSheet,
  getAuthUser,
} from '../../../lib/sheets';

export async function GET(request: Request) {
  try {
    const session = await getAuthUser(request);
    const offers = await getOffersFromSheet();

    // ⭐ اخفي commission + period من غير الأدمن
    const isAdmin = session?.role === 'admin';
    const safeOffers = offers.map((o: any) => {
      if (isAdmin) return o;
      const { commission, period, ...rest } = o;
      return rest;
    });

    return NextResponse.json({ ok: true, offers: safeOffers });
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
  if (session.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
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
      owner: body.owner || session.username,
      commission: Number(body.commission) || 0,
      period: Number(body.period) || 0,
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to add offer' },
      { status: 500 }
    );
  }
}