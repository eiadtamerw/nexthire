import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID!;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

/**
 * يرجّع client للاتصال بـ Google Sheets API
 */
export async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

/**
 * يقرأ كل البيانات من تاب معيّن
 */
export async function readSheet(tabName: string) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tabName}!A:Z`,
  });
  return res.data.values || [];
}

/**
 * يضيف صف جديد لتاب
 */
export async function appendRow(tabName: string, values: (string | number)[]) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
  return res.data;
}

/**
 * يجيب بيانات الـ Offers من الشيت
 */
export async function getOffersFromSheet() {
  const rows = await readSheet('Offers');
  if (rows.length < 2) return [];

  const data = rows.slice(1);

  return data
    .filter((row) => row.some((c) => String(c || '').trim() !== ''))
    .map((row) => ({
      id: String(row[0] || ''),
      jobTitle: String(row[1] || ''),
      companyName: String(row[2] || ''),
      site: String(row[3] || ''),
      requiredNationality: String(row[4] || 'Any'),
      requiredLanguage: String(row[5] || ''),
      requiredLevel: String(row[6] || ''),
      minAge: String(row[7] || ''),
      maxAge: String(row[8] || ''),
      gender: String(row[9] || 'Any'),
      militaryStatus: String(row[10] || 'Any'),
      minExperience: String(row[11] || '0'),
      description: String(row[12] || ''),
      status: String(row[13] || 'Open'),
      createdAt: String(row[14] || ''),
      acceptedStatuses: String(row[15] || ''),
      interviewSlots: String(row[16] || '')
        .split(/[|,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    }));
}

/**
 * يضيف كانديدت جديد في تاب Candidates
 */
export async function addCandidateToSheet(data: {
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
  appliedOfferId: string;
  appliedOfferTitle: string;
  interviewTime: string;
}) {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').slice(0, 19);

  const row = [
    timestamp,
    data.tripleName,
    data.phone,
    data.whatsapp,
    data.gmail,
    data.nationality,
    data.site,
    data.language,
    data.age,
    data.college,
    data.status,
    data.military,
    data.appliedLast3Months,
    data.experience,
    data.nationalId,
    data.companyName,
    data.interviewDate,
    data.vocaroo,
    data.cv,
    '', // Score — يتحسب بعدين
    data.appliedOfferId,
    data.appliedOfferTitle,
    data.interviewTime,
  ];

  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Candidates!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });

  return res.data;
}
/**
 * يجيب الكانديدت من تاب Candidates
 */
export async function getCandidatesFromSheet() {
  const rows = await readSheet('Candidates');
  if (rows.length < 2) return [];

  const data = rows.slice(1);

  return data
    .filter((row) => row.some((c) => String(c || '').trim() !== ''))
    .map((row, i) => ({
      rowIndex: i + 2,
      timestamp: String(row[0] || ''),
      tripleName: String(row[1] || ''),
      phone: String(row[2] || ''),
      whatsapp: String(row[3] || ''),
      gmail: String(row[4] || ''),
      nationality: String(row[5] || ''),
      site: String(row[6] || ''),
      language: String(row[7] || ''),
      age: String(row[8] || ''),
      college: String(row[9] || ''),
      status: String(row[10] || ''),
      military: String(row[11] || ''),
      appliedLast3Months: String(row[12] || ''),
      experience: String(row[13] || ''),
      nationalId: String(row[14] || ''),
      companyName: String(row[15] || ''),
      interviewDate: String(row[16] || ''),
      vocaroo: String(row[17] || ''),
      cv: String(row[18] || ''),
      score: Number(row[19]) || 0,
      appliedOfferId: String(row[20] || ''),
      appliedOfferTitle: String(row[21] || ''),
      interviewTime: String(row[22] || ''),
    }));
}

/**
 * إحصائيات الـ Dashboard
 */
export async function getDashboardStats() {
  const [candidates, offers] = await Promise.all([
    getCandidatesFromSheet(),
    getOffersFromSheet(),
  ]);

  const openOffers = offers.filter((o) => (o.status || '').toLowerCase() === 'open');
  const scheduled = candidates.filter(
    (c) => c.interviewDate || c.interviewTime
  ).length;

  return {
    totalCandidates: candidates.length,
    totalOffers: offers.length,
    openOffers: openOffers.length,
    scheduledInterviews: scheduled,
    candidates: candidates.slice().reverse().slice(0, 50), // آخر 50
    offers: openOffers,
  };
}