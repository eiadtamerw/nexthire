const { google } = require('googleapis');
const fs = require('fs');

// قراءة .env.local
const env = fs.readFileSync('.env.local', 'utf8');
const cfg = {};
env.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const i = trimmed.indexOf('=');
  if (i < 0) return;
  const key = trimmed.slice(0, i).trim();
  let val = trimmed.slice(i + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  cfg[key] = val;
});

const SHEET_ID = cfg.GOOGLE_SHEETS_ID;
const SA_EMAIL = cfg.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PK = (cfg.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

async function run() {
  console.log('====================================');
  console.log('STEP 1: Environment Check');
  console.log('====================================');
  console.log('Sheet ID:', SHEET_ID);
  console.log('SA Email:', SA_EMAIL);
  console.log('PK length:', PK.length);
  console.log('PK starts:', PK.slice(0, 35));
  console.log('PK ends:', PK.slice(-35));

  console.log('\n====================================');
  console.log('STEP 2: Authenticate');
  console.log('====================================');
  let auth;
  try {
    auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: SA_EMAIL,
        private_key: PK,
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
      ],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log('✅ Auth OK');
    console.log('Token:', token.token ? token.token.slice(0, 20) + '...' : 'NO TOKEN');
  } catch (e) {
    console.log('❌ Auth FAILED:', e.message);
    return;
  }

  console.log('\n====================================');
  console.log('STEP 3: Get spreadsheet metadata');
  console.log('====================================');
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    console.log('✅ Sheet found!');
    console.log('Title:', meta.data.properties.title);
    console.log('Tabs:', meta.data.sheets.map((s) => s.properties.title).join(', '));
  } catch (e) {
    console.log('❌ FAILED:', e.message);
    console.log('Full error:', JSON.stringify(e.errors || e.response?.data || {}, null, 2));
    return;
  }

  console.log('\n====================================');
  console.log('STEP 4: Read Offers tab');
  console.log('====================================');
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Offers!A1:Z5',
    });
    console.log('✅ Read OK');
    console.log('Values:', JSON.stringify(res.data.values, null, 2));
  } catch (e) {
    console.log('❌ FAILED:', e.message);
  }

  console.log('\n====================================');
  console.log('DONE');
  console.log('====================================');
}

run().catch((e) => console.error('FATAL:', e));