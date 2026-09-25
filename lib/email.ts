import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = 'onboarding@resend.dev';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

type CandidateData = {
  tripleName: string;
  phone: string;
  gmail: string;
  nationality: string;
  age: string;
  college: string;
  status: string;
  language: string;
  experience: string;
  appliedOfferTitle: string;
  interviewDate: string;
  interviewTime: string;
  vocaroo: string;
  cv: string;
  score: number;
};

export async function sendCandidateConfirmation(data: CandidateData) {
  if (!resend) {
    console.warn('Resend not configured — skipping email');
    return { ok: false, error: 'Email not configured' };
  }

  if (!data.gmail) {
    console.warn('No candidate email — skipping');
    return { ok: false, error: 'No recipient email' };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0; padding:0; background:#0a0a0a; font-family: 'Segoe UI', Tahoma, system-ui, -apple-system, sans-serif;">

  <div style="max-width:640px; margin:0 auto; padding:32px 16px;">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#000000 0%,#0f0f0f 100%); border-radius:20px 20px 0 0; padding:44px 32px 36px; text-align:center; border:1px solid #1f1f1f; border-bottom:none; position:relative; overflow:hidden;">

      <!-- LOGO -->
      <div style="display:inline-block; margin-bottom:24px;">
        <div style="display:inline-block; width:64px; height:58px; vertical-align:middle; margin-right:10px;">
          <svg width="64" height="58" viewBox="0 0 130 115" fill="none">
            <circle cx="20" cy="12" r="8" fill="#C6E82D"/>
            <path d="M 6 26 L 6 92 L 24 92 L 24 56 L 56 92 L 74 92 L 74 26 L 56 26 L 56 62 L 24 26 Z" fill="#C6E82D"/>
            <path d="M 112 26 L 112 78 Q 112 92 126 92" stroke="#C6E82D" stroke-width="18" fill="none" stroke-linecap="round"/>
            <rect x="88" y="52" width="42" height="14" fill="#C6E82D"/>
            <circle cx="122" cy="108" r="8" fill="#C6E82D"/>
          </svg>
        </div>
        <span style="display:inline-block; vertical-align:middle; font-size:26px; font-weight:900; letter-spacing:-0.8px; color:#ffffff;">
          Next<span style="color:#C6E82D;">Hire</span>
        </span>
      </div>

      <!-- CHECK ICON -->
      <div style="width:80px; height:80px; margin:0 auto 24px; background:rgba(198,232,45,0.12); border:2px solid rgba(198,232,45,0.4); border-radius:50%; display:grid; place-items:center;">
        <div style="font-size:40px; line-height:1;">✓</div>
      </div>

      <h1 style="color:#ffffff; margin:0 0 14px; font-size:32px; font-weight:900; letter-spacing:-1px; line-height:1.15;">
        Application Received!
      </h1>
      <p style="color:#8a8a8a; margin:0; font-size:16px; line-height:1.65; max-width:440px; margin-left:auto; margin-right:auto;">
        Thank you for applying, <strong style="color:#C6E82D;">${data.tripleName}</strong>. We've successfully received your application and our team will review it shortly.
      </p>
    </div>

    <!-- BODY -->
    <div style="background:#0f0f0f; padding:0; border:1px solid #1f1f1f; border-top:none; border-radius:0 0 20px 20px; overflow:hidden;">

      <!-- POSITION -->
      <div style="padding:28px 32px; background:linear-gradient(135deg, rgba(198,232,45,0.08) 0%, rgba(198,232,45,0.02) 100%); border-bottom:1px solid #1f1f1f; text-align:center;">
        <div style="font-size:11px; color:#8a8a8a; text-transform:uppercase; letter-spacing:2px; font-weight:800; margin-bottom:10px;">
          Position Applied For
        </div>
        <div style="font-size:22px; font-weight:900; color:#C6E82D; letter-spacing:-0.3px; line-height:1.3;">
          ${data.appliedOfferTitle || 'N/A'}
        </div>
      </div>

      <!-- INTERVIEW -->
      ${data.interviewDate ? `
      <div style="padding:28px 32px; border-bottom:1px solid #1f1f1f; text-align:center;">
        <div style="font-size:11px; color:#8a8a8a; text-transform:uppercase; letter-spacing:2px; font-weight:800; margin-bottom:14px;">
          📅 Your Interview
        </div>
        <div style="display:inline-block; padding:14px 24px; background:rgba(198,232,45,0.1); border:2px solid rgba(198,232,45,0.35); border-radius:14px;">
          <div style="font-size:19px; font-weight:900; color:#ffffff; line-height:1.3; margin-bottom:4px;">
            ${data.interviewDate}
          </div>
          ${data.interviewTime ? `<div style="font-size:15px; font-weight:700; color:#C6E82D;">${data.interviewTime}</div>` : ''}
        </div>
        <p style="color:#8a8a8a; margin:16px 0 0; font-size:13px; line-height:1.6;">
          Please make sure to attend on time. If you need to reschedule, contact us as soon as possible.
        </p>
      </div>` : ''}

      <!-- DETAILS -->
      <div style="padding:28px 32px;">

        <div style="font-size:11px; color:#8a8a8a; text-transform:uppercase; letter-spacing:1.5px; font-weight:800; margin-bottom:18px;">
          Your Submitted Information
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#8a8a8a;">📞 Phone</td>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#ffffff; font-weight:600; text-align:right;">${data.phone}</td>
          </tr>
          <tr>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#8a8a8a;">✉️ Email</td>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#ffffff; font-weight:600; text-align:right; word-break:break-all;">${data.gmail}</td>
          </tr>
          <tr>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#8a8a8a;">🌍 Nationality</td>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#ffffff; font-weight:600; text-align:right;">${data.nationality}</td>
          </tr>
          <tr>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#8a8a8a;">🎂 Age</td>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#ffffff; font-weight:600; text-align:right;">${data.age}</td>
          </tr>
          <tr>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#8a8a8a;">🎓 Graduation</td>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#ffffff; font-weight:600; text-align:right;">${data.status}</td>
          </tr>
          <tr>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#8a8a8a;">🗣 Language</td>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#ffffff; font-weight:600; text-align:right;">${data.language}</td>
          </tr>
          <tr>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#8a8a8a;">💼 Experience</td>
            <td style="padding:12px 0; border-bottom:1px solid #1f1f1f; color:#ffffff; font-weight:600; text-align:right;">${data.experience}</td>
          </tr>
          <tr>
            <td style="padding:12px 0; color:#8a8a8a;">🏫 College</td>
            <td style="padding:12px 0; color:#ffffff; font-weight:600; text-align:right;">${data.college}</td>
          </tr>
        </table>

      </div>

      <!-- NEXT STEPS -->
      <div style="padding:0 32px 28px;">
        <div style="background:rgba(198,232,45,0.05); border:1px solid rgba(198,232,45,0.2); border-radius:14px; padding:22px;">
          <div style="font-size:13px; font-weight:900; color:#C6E82D; margin-bottom:14px; letter-spacing:0.3px;">
            📌 What Happens Next?
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:13px; color:#b0b0b0; line-height:1.7;">
            <tr>
              <td style="padding:6px 0; vertical-align:top; width:24px; color:#C6E82D; font-weight:800;">1.</td>
              <td style="padding:6px 0;">Our recruitment team will review your application.</td>
            </tr>
            <tr>
              <td style="padding:6px 0; vertical-align:top; color:#C6E82D; font-weight:800;">2.</td>
              <td style="padding:6px 0;">If you're a good fit, we'll contact you within 3–5 business days.</td>
            </tr>
            <tr>
              <td style="padding:6px 0; vertical-align:top; color:#C6E82D; font-weight:800;">3.</td>
              <td style="padding:6px 0;">Keep an eye on your phone and email for updates.</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="padding:24px 32px; background:#000000; border-top:1px solid #1f1f1f; text-align:center;">
        <div style="color:#C6E82D; font-size:14px; font-weight:900; letter-spacing:-0.3px; margin-bottom:6px;">
          Next<span style="color:#fff;">Hire</span>
        </div>
        <div style="color:#666; font-size:12px; line-height:1.6;">
          Opening Doors. Creating Futures.<br>
          Connecting Talent with Opportunities.
        </div>
        <div style="color:#444; font-size:11px; margin-top:12px;">
          This is an automated confirmation. Please do not reply.
        </div>
      </div>

    </div>

    <div style="text-align:center; padding:20px; color:#444; font-size:11px;">
      © ${new Date().getFullYear()} NextHire Recruitment System · All rights reserved.
    </div>

  </div>

</body>
</html>
  `;

  try {
    const result = await resend.emails.send({
      from: 'NextHire <' + FROM_EMAIL + '>',
      to: data.gmail,
      subject: `✅ Application Received — ${data.appliedOfferTitle || 'NextHire'}`,
      html: html,
    });
    return { ok: true, id: result.data?.id };
  } catch (e: any) {
    console.error('Email send error:', e);
    return { ok: false, error: e.message };
  }
}