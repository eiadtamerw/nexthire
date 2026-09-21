import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID!;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

/* ============ CLIENT ============ */
export async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

/* ============ GENERIC ============ */
export async function readSheet(tabName: string) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tabName}!A:Z`,
  });
  return res.data.values || [];
}

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

/* ============ OFFERS ============ */
export async function getOffersFromSheet() {
  const rows = await readSheet('Offers');
  if (rows.length < 2) return [];

  return rows
    .slice(1)
    .map((row, i) => ({
      rowIndex: i + 2,
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
    }))
    .filter((o) => o.id && o.jobTitle);
}

export async function addOfferToSheet(data: {
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
  acceptedStatuses: string;
  interviewSlots: string[];
}) {
  const id = 'OFF-' + Date.now().toString().slice(-6);
  const now = new Date().toISOString().slice(0, 10);

  await appendRow('Offers', [
    id,
    data.jobTitle,
    data.companyName,
    data.site,
    data.requiredNationality || 'Any',
    data.requiredLanguage,
    data.requiredLevel,
    data.minAge,
    data.maxAge,
    data.gender || 'Any',
    data.militaryStatus || 'Any',
    data.minExperience || '0',
    data.description,
    data.status || 'Open',
    now,
    data.acceptedStatuses || '',
    (data.interviewSlots || []).join(' | '),
  ]);

  return { id };
}

export async function updateOfferInSheet(
  rowIndex: number,
  data: {
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
    acceptedStatuses: string;
    interviewSlots: string[];
  }
) {
  const sheets = await getSheetsClient();

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `Offers!A${rowIndex}:O${rowIndex}`,
  });
  const currentRow = current.data.values?.[0] || [];
  const id = String(currentRow[0] || '');
  const createdAt = String(currentRow[14] || '');

  const row = [
    id,
    data.jobTitle,
    data.companyName,
    data.site,
    data.requiredNationality || 'Any',
    data.requiredLanguage,
    data.requiredLevel,
    data.minAge,
    data.maxAge,
    data.gender || 'Any',
    data.militaryStatus || 'Any',
    data.minExperience || '0',
    data.description,
    data.status || 'Open',
    createdAt,
    data.acceptedStatuses || '',
    (data.interviewSlots || []).join(' | '),
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Offers!A${rowIndex}:Q${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });

  return { ok: true };
}

export async function deleteOfferFromSheet(rowIndex: number) {
  const sheets = await getSheetsClient();
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const offersSheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === 'Offers'
  );
  const sheetId = offersSheet?.properties?.sheetId;
  if (sheetId === undefined || sheetId === null) {
    throw new Error('Offers sheet not found');
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });

  return { ok: true };
}

/* ============ CANDIDATES ============ */
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
  score?: number;
}) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  await appendRow('Candidates', [
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
    String(data.score ?? ''),
    data.appliedOfferId,
    data.appliedOfferTitle,
    data.interviewTime,
  ]);

  return { ok: true };
}

export async function getCandidatesFromSheet() {
  const rows = await readSheet('Candidates');
  if (rows.length < 2) return [];

  return rows
    .slice(1)
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

export async function getDashboardStats() {
  const [candidates, offers] = await Promise.all([
    getCandidatesFromSheet(),
    getOffersFromSheet(),
  ]);

  const openOffers = offers.filter((o) => (o.status || '').toLowerCase() === 'open');
  const scheduled = candidates.filter((c) => c.interviewDate || c.interviewTime).length;

  return {
    totalCandidates: candidates.length,
    totalOffers: offers.length,
    openOffers: openOffers.length,
    scheduledInterviews: scheduled,
    candidates: candidates.slice().reverse().slice(0, 50),
    offers: openOffers,
  };
}

/* ============ AUTH: USERS ============ */
export async function getUsersFromSheet() {
  const rows = await readSheet('Users');
  if (rows.length < 2) return [];
  return rows.slice(1).map((row) => ({
    username: String(row[0] || ''),
    password_hash: String(row[1] || ''),
    salt: String(row[2] || ''),
    created_at: String(row[3] || ''),
  }));
}

export async function addUserToSheet(
  username: string,
  password_hash: string,
  salt: string
) {
  const now = new Date().toISOString();
  await appendRow('Users', [username, password_hash, salt, now]);
}

export async function findUser(username: string) {
  const users = await getUsersFromSheet();
  return users.find((u) => u.username === username) || null;
}

/* ============ AUTH: SESSIONS ============ */
export async function getSessionsFromSheet() {
  const rows = await readSheet('Sessions');
  if (rows.length < 2) return [];
  return rows.slice(1).map((row, i) => ({
    rowIndex: i + 2,
    token: String(row[0] || ''),
    username: String(row[1] || ''),
    expires_at: Number(row[2]) || 0,
  }));
}

export async function addSessionToSheet(
  token: string,
  username: string,
  expiresAt: number
) {
  await appendRow('Sessions', [token, username, String(expiresAt)]);
}

export async function deleteSessionFromSheet(token: string) {
  const sheets = await getSheetsClient();
  const sessions = await getSessionsFromSheet();
  const session = sessions.find((s) => s.token === token);
  if (!session) return { ok: false };

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sessionsSheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === 'Sessions'
  );
  const sheetId = sessionsSheet?.properties?.sheetId;
  if (sheetId === undefined || sheetId === null) {
    throw new Error('Sessions sheet not found');
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: session.rowIndex - 1,
              endIndex: session.rowIndex,
            },
          },
        },
      ],
    },
  });

  return { ok: true };
}

export async function findSession(token: string) {
  const sessions = await getSessionsFromSheet();
  const s = sessions.find((x) => x.token === token);
  if (!s) return null;
  if (s.expires_at < Date.now()) return null;
  return s;
}

export async function getAuthUser(request: Request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  return await findSession(token);
}