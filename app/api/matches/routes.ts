import { NextResponse } from 'next/server';
import {
  getCandidatesFromSheet,
  getOffersFromSheet,
  getAuthUser,
} from '../../../lib/sheets';
import { evaluateCandidateForOffer } from '../../../lib/matching';

export async function GET(request: Request) {
  const session = await getAuthUser(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [candidates, offers] = await Promise.all([
      getCandidatesFromSheet(),
      getOffersFromSheet(),
    ]);

    const openOffers = offers.filter(
      (o) => (o.status || '').toLowerCase() === 'open'
    );

    // لكل عرض، احسب الكانديدت المؤهلين
    const offerMatches = openOffers.map((offer) => {
      const qualified = candidates
        .map((cand) => {
          const result = evaluateCandidateForOffer(cand, offer);
          return {
            candidate: cand,
            score: result.score,
            qualified: result.qualified,
            checks: result.checks,
          };
        })
        .filter((m) => m.qualified)
        .sort((a, b) => b.score - a.score);

      return {
        offer,
        qualifiedCount: qualified.length,
        candidates: qualified,
      };
    });

    // إحصائيات عامة
    const totalMatches = offerMatches.reduce(
      (sum, om) => sum + om.qualifiedCount,
      0
    );

    return NextResponse.json({
      ok: true,
      totalCandidates: candidates.length,
      totalOpenOffers: openOffers.length,
      totalMatches,
      offerMatches,
    });
  } catch (e: any) {
    console.error('Matches error:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Failed to load matches' },
      { status: 500 }
    );
  }
}