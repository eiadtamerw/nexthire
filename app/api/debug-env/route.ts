import { NextResponse } from 'next/server';

export async function GET() {
  const id = process.env.GOOGLE_SHEETS_ID || '';
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
  const pk = process.env.GOOGLE_PRIVATE_KEY || '';

  return NextResponse.json({
    GOOGLE_SHEETS_ID: {
      value: id,
      length: id.length,
      firstChars: id.slice(0, 5),
      lastChars: id.slice(-5),
    },
    GOOGLE_SERVICE_ACCOUNT_EMAIL: {
      value: email,
      length: email.length,
    },
    GOOGLE_PRIVATE_KEY: {
      length: pk.length,
      startsWith: pk.slice(0, 40),
      endsWith: pk.slice(-40),
      hasBackslashN: pk.includes('\\n'),
      hasActualNewlines: pk.includes('\n'),
      firstCharCode: pk.charCodeAt(0),
      lastCharCode: pk.charCodeAt(pk.length - 1),
    },
  });
}