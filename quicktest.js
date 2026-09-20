const { google } = require('googleapis');
const fs = require('fs');

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

// ⚠️ حط الـ ID الجديد بتاع Test Sheet هنا:
const TEST_SHEET_ID = '1x3V4MAdEmJCFGX0nn0qAGAyfaFYvE4zhaeMOyG0NIEs' ;
async function run() {
  console.log('Testing with ID:', TEST_SHEET_ID);

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: cfg.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (cfg.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const meta = await sheets.spreadsheets.get({ spreadsheetId: TEST_SHEET_ID });
    console.log('✅ SUCCESS!');
    console.log('Title:', meta.data.properties.title);
    console.log('Tabs:', meta.data.sheets.map((s) => s.properties.title).join(', '));
  } catch (e) {
    console.log('❌ FAILED:', e.message);
    console.log('Full error:', JSON.stringify(e.errors || e.response?.data || {}, null, 2));
  }
}

run();