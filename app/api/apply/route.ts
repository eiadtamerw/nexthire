import { NextResponse } from 'next/server';
import { addCandidateToSheet } from '../../../../lib/sheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.tripleName || !body.nationalId || !body.phone) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await addCandidateToSheet({
      tripleName: body.tripleName || '',
      phone: body.phone || '',
      whatsapp: body.whatsapp || '',
      gmail: body.gmail || '',
      nationality: body.nationality || '',
      site: body.site || '',
      language: body.language || '',
      age: body.age || '',
      college: body.college || '',
      status: body.status || '',
      military: body.military || '',
      appliedLast3Months: body.appliedLast3Months || '',
      experience: body.experience || '',
      nationalId: body.nationalId || '',
      companyName: body.companyName || '',
      interviewDate: body.interviewDate || '',
      vocaroo: body.vocaroo || '',
      cv: body.cv || '',
      appliedOfferId: body.appliedOfferId || '',
      appliedOfferTitle: body.appliedOfferTitle || '',
      interviewTime: body.interviewTime || '',
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Error adding candidate:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}