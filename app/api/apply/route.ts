import { NextResponse } from 'next/server';
import {
  addCandidateToSheet,
  getOffersFromSheet,
} from '../../../lib/sheets';
import { evaluateCandidateForOffer } from '../../../lib/matching';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validation أساسي
    if (!body.tripleName || !body.nationalId || !body.phone) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    if (String(body.nationalId).length !== 14) {
      return NextResponse.json(
        { ok: false, error: 'National ID must be exactly 14 digits' },
        { status: 400 }
      );
    }
    if (!body.appliedOfferId) {
      return NextResponse.json(
        { ok: false, error: 'Please select a position' },
        { status: 400 }
      );
    }

    // 2. هات كل العروض
    const offers = await getOffersFromSheet();
    const targetOffer = offers.find(
      (o) => String(o.id) === String(body.appliedOfferId)
    );

    if (!targetOffer) {
      return NextResponse.json(
        {
          ok: false,
          rejected: true,
          error: 'The selected position is no longer available.',
        },
        { status: 400 }
      );
    }

    // 3. بناء كانديدت مؤقت للفحص
    const tempCandidate = {
      rowIndex: 0,
      tripleName: String(body.tripleName || ''),
      phone: String(body.phone || ''),
      whatsapp: String(body.whatsapp || ''),
      gmail: String(body.gmail || ''),
      nationality: String(body.nationality || ''),
      site: String(body.site || ''),
      language: String(body.language || ''),
      age: String(body.age || ''),
      college: String(body.college || ''),
      status: String(body.status || ''),
      military: String(body.military || ''),
      appliedLast3Months: String(body.appliedLast3Months || ''),
      experience: String(body.experience || ''),
      nationalId: String(body.nationalId || ''),
      companyName: String(body.companyName || ''),
      interviewDate: String(body.interviewDate || ''),
      vocaroo: String(body.vocaroo || ''),
      cv: String(body.cv || ''),
      score: 0,
      appliedOfferId: String(body.appliedOfferId || ''),
      appliedOfferTitle: String(body.appliedOfferTitle || targetOffer.jobTitle),
      interviewTime: String(body.interviewTime || ''),
    };

    // 4. فحص التوافق مع العرض المختار
    const eligibility = evaluateCandidateForOffer(tempCandidate, targetOffer);

    if (!eligibility.qualified) {
      const failed = eligibility.checks
        .filter((c) => !c.pass)
        .map((c) => c.name);

      return NextResponse.json(
        {
          ok: false,
          rejected: true,
          error: `You are not eligible for "${targetOffer.jobTitle}". Failed: ${failed.join(', ')}`,
          failedChecks: failed,
          score: eligibility.score,
        },
        { status: 200 }
      );
    }

    // 5. احسب أفضل score مع كل العروض المفتوحة
    const openOffers = offers.filter(
      (o) => (o.status || '').toLowerCase() === 'open'
    );
    let bestScore = eligibility.score; // على الأقل score العرض اللي اختاره
    openOffers.forEach((o) => {
      const ev = evaluateCandidateForOffer(tempCandidate, o);
      if (ev.score > bestScore) bestScore = ev.score;
    });

    // 6. احفظ في الشيت مع الـ score
    await addCandidateToSheet({
      tripleName: tempCandidate.tripleName,
      phone: tempCandidate.phone,
      whatsapp: tempCandidate.whatsapp,
      gmail: tempCandidate.gmail,
      nationality: tempCandidate.nationality,
      site: tempCandidate.site,
      language: tempCandidate.language,
      age: tempCandidate.age,
      college: tempCandidate.college,
      status: tempCandidate.status,
      military: tempCandidate.military,
      appliedLast3Months: tempCandidate.appliedLast3Months,
      experience: tempCandidate.experience,
      nationalId: tempCandidate.nationalId,
      companyName: tempCandidate.companyName,
      interviewDate: tempCandidate.interviewDate,
      vocaroo: tempCandidate.vocaroo,
      cv: tempCandidate.cv,
      appliedOfferId: tempCandidate.appliedOfferId,
      appliedOfferTitle: targetOffer.jobTitle,
      interviewTime: tempCandidate.interviewTime,
      score: bestScore,
    });

    return NextResponse.json({
      ok: true,
      message: 'Application received',
      score: bestScore,
    });
  } catch (e: any) {
    console.error('Error adding candidate:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}