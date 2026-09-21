export type Candidate = {
  rowIndex: number;
  tripleName: string;
  phone: string;
  whatsapp: string;
  gmail: string;
  nationality: string;
  site: string;
  language: string;
  age: string;
  college: string;
  status: string;
  military: string;
  appliedLast3Months: string;
  experience: string;
  nationalId: string;
  companyName: string;
  interviewDate: string;
  vocaroo: string;
  cv: string;
  score: number;
  appliedOfferId: string;
  appliedOfferTitle: string;
  interviewTime: string;
};

export type Offer = {
  rowIndex: number;
  id: string;
  jobTitle: string;
  companyName: string;
  site: string;
  requiredNationality: string;
  requiredLanguage: string;
  requiredLevel: string;
  minAge: string;
  maxAge: string;
  gender: string;
  militaryStatus: string;
  minExperience: string;
  description: string;
  status: string;
  createdAt: string;
  acceptedStatuses: string;
  interviewSlots: string[];
};

export type CheckResult = {
  name: string;
  pass: boolean;
  detail?: string;
};

export type MatchResult = {
  score: number;
  qualified: boolean;
  checks: CheckResult[];
};

/**
 * يقارن كانديدت بعرض واحد ويرجّع النتيجة
 */
export function evaluateCandidateForOffer(
  cand: Candidate,
  offer: Offer
): MatchResult {
  const checks: CheckResult[] = [];

  // 1. Nationality
  if (offer.requiredNationality && offer.requiredNationality !== 'Any') {
    const pass =
      String(cand.nationality).trim().toLowerCase() ===
      String(offer.requiredNationality).trim().toLowerCase();
    checks.push({
      name: 'Nationality',
      pass,
      detail: `${cand.nationality} vs ${offer.requiredNationality}`,
    });
  }

  // 2. Language
  if (offer.requiredLanguage) {
    const langStr = String(cand.language || '').toLowerCase();
    const reqLang = String(offer.requiredLanguage).toLowerCase();
    const pass = langStr.includes(reqLang);
    checks.push({
      name: 'Language',
      pass,
      detail: `${offer.requiredLanguage}`,
    });

    // 3. Language Level
    if (offer.requiredLevel) {
      const reqLvl = String(offer.requiredLevel).toLowerCase();
      const pass = langStr.includes(reqLvl);
      checks.push({
        name: 'Language Level',
        pass,
        detail: `${offer.requiredLevel}`,
      });
    }
  }

  // 4. Age
  const age = Number(cand.age) || 0;
  if (offer.minAge) {
    checks.push({
      name: 'Min Age',
      pass: age >= Number(offer.minAge),
      detail: `≥ ${offer.minAge}`,
    });
  }
  if (offer.maxAge) {
    checks.push({
      name: 'Max Age',
      pass: age <= Number(offer.maxAge),
      detail: `≤ ${offer.maxAge}`,
    });
  }

  // 5. Military Status
  if (offer.militaryStatus && offer.militaryStatus !== 'Any') {
    const pass =
      String(cand.military).trim().toLowerCase() ===
      String(offer.militaryStatus).trim().toLowerCase();
    checks.push({
      name: 'Military Status',
      pass,
      detail: `${offer.militaryStatus}`,
    });
  }

  // 6. Call Center Experience
  const exp = String(cand.experience || '').toLowerCase();
  const hasExp = exp.includes('yes');
  if (Number(offer.minExperience) > 0) {
    checks.push({
      name: 'Call Center Experience',
      pass: hasExp,
      detail: `${offer.minExperience}+ yr`,
    });
  } else {
    checks.push({
      name: 'Call Center Experience',
      pass: true,
      detail: 'Not required',
    });
  }

  // 7. Not Applied Recently
  const applied = String(cand.appliedLast3Months || '').toLowerCase();
  const recently = applied.includes('yes');
  checks.push({
    name: 'Not Applied Recently',
    pass: !recently,
    detail: recently ? 'Applied in last 3 months' : 'OK',
  });

  // 8. Graduation Status
  const accepted = String(offer.acceptedStatuses || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (accepted.length > 0) {
    const candStatus = String(cand.status || '').trim().toLowerCase();
    checks.push({
      name: 'Graduation Status',
      pass: accepted.includes(candStatus),
      detail: `Accepts: ${offer.acceptedStatuses}`,
    });
  }

  // حساب النتيجة
  const passed = checks.filter((c) => c.pass).length;
  const total = checks.length || 1;
  const score = Math.round((passed / total) * 100);
  const qualified = checks.every((c) => c.pass);

  return { score, qualified, checks };
}

/**
 * بيرجع أفضل العروض المطابقة لكانديدت واحد
 */
export function getBestMatchesForCandidate(
  cand: Candidate,
  offers: Offer[]
) {
  return offers
    .filter((o) => (o.status || '').toLowerCase() === 'open')
    .map((o) => ({
      offer: o,
      ...evaluateCandidateForOffer(cand, o),
    }))
    .sort((a, b) => b.score - a.score);
}