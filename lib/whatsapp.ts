export type Stage =
  | 'New'
  | 'Contacted'
  | 'Interviewed'
  | 'Shortlisted'
  | 'Hired'
  | 'Rejected'
  | 'No Show';

/**
 * ينضّف الرقم ويضيف كود الدولة لو محتاج
 */
function normalizePhone(phone: string): string {
  let clean = String(phone || '').replace(/\D/g, '');

  if (!clean) return '';

  // لو الرقم بيبدأ بـ 0 (صيغة محلية مصرية: 01xxxxxxxxx)
  // نحذف الـ 0 ونضيف 20
  if (clean.startsWith('0')) {
    clean = '20' + clean.slice(1);
  }

  // لو الرقم مش بيبدأ بكود الدولة (مثلاً 1069731664 بطول 10)
  // نضيف 20
  if (clean.length === 10 && !clean.startsWith('20')) {
    clean = '20' + clean;
  }

  return clean;
}

/**
 * يبني رسالة WhatsApp جاهزة حسب حالة الكانديدت
 */
export function buildWhatsAppMessage(params: {
  name: string;
  stage: Stage | string;
  offerTitle?: string;
  interviewDate?: string;
  interviewTime?: string;
}): string {
  const { name, stage, offerTitle, interviewDate, interviewTime } = params;
  const firstName = String(name || '').split(' ')[0] || name;

  const offerLine = offerTitle ? ` for the *${offerTitle}* position` : '';

  switch (stage) {
    case 'New':
      return `Hi ${firstName},

This is *NextHire Recruitment Team* 👋

We've received your application${offerLine} and our team is reviewing it right now.

We'll get back to you within *3–5 business days* with the next steps.

Thanks for your interest — stay tuned! 🚀`;

    case 'Contacted':
      return `Hi ${firstName},

Hope you're doing well! This is *NextHire Recruitment Team*.

We'd love to schedule a quick call to discuss your application${offerLine}.

When are you available? Please share 2–3 time slots that work for you, and we'll confirm one right away.

Looking forward to speaking with you! 📞`;

    case 'Interviewed':
      return `Hi ${firstName},

Thank you so much for taking the time to interview with us${offerLine} yesterday! 🎉

Our team is currently reviewing all interviews and we'll get back to you with the final decision very soon.

We appreciate your patience and your interest in joining the team! 🙏`;

    case 'Shortlisted':
      return `Hi ${firstName},

🎉 *Great news!* You've been *shortlisted*${offerLine}!

${interviewDate ? `Your next interview is on *${interviewDate}${interviewTime ? ' at ' + interviewTime : ''}*.\n\n` : ''}Please confirm your attendance by replying to this message.

We're excited to move forward with you! 🚀`;

    case 'Hired':
      return `Hi ${firstName},

🎊 *Congratulations!* You've been *officially selected*${offerLine}!

Welcome to the team! 🙌

Our HR team will contact you shortly with the onboarding details (documents, start date, etc.).

We can't wait to have you on board! 💚`;

    case 'Rejected':
      return `Hi ${firstName},

Thank you for your interest${offerLine} and for taking the time to apply.

After careful consideration, we've decided to move forward with other candidates whose profiles better match our current needs.

We truly appreciate your effort and encourage you to apply again in the future — we'd love to stay in touch! 🌟

Wishing you the very best in your job search.`;

    case 'No Show':
      return `Hi ${firstName},

We noticed that you couldn't make it to your scheduled interview${offerLine}.

We understand things happen — no worries at all! If you're still interested, please let us know and we'll try to reschedule.

Looking forward to hearing from you! 🙏`;

    default:
      return `Hi ${firstName},

This is *NextHire Recruitment Team* — we'd like to chat with you about your application${offerLine}.

Are you available?`;
  }
}

/**
 * يبني رابط WhatsApp
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizePhone(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}