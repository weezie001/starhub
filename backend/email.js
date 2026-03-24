const { Resend } = require('resend');

let _resend = null;
function getResend() {
  if (!_resend && process.env.RESEND_API_KEY) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM   = 'StarBookNow <support@starbooknow.com>';
const ADMIN  = process.env.ADMIN_EMAIL || 'support@starbooknow.com';

const gold   = '#f0bf5a';
const dark   = '#111111';
const card   = '#1a1a1a';
const muted  = '#888888';

function base(title, bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${dark};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e5e2e1;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${dark};padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr><td style="text-align:center;padding:0 0 32px">
          <div style="font-size:22px;font-weight:900;letter-spacing:3px;color:${gold};text-transform:uppercase">★ StarBookNow</div>
          <div style="font-size:11px;color:${muted};letter-spacing:1px;margin-top:4px">Elite Celebrity Booking</div>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:${card};border-radius:16px;border:1px solid rgba(240,191,90,0.1);padding:36px 40px">
          <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#fff">${title}</h1>
          ${bodyHtml}
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding:28px 0 0;color:${muted};font-size:11px;line-height:1.8">
          © ${new Date().getFullYear()} StarBookNow · <a href="https://starbooknow.com" style="color:${gold};text-decoration:none">starbooknow.com</a><br>
          Questions? <a href="mailto:support@starbooknow.com" style="color:${gold};text-decoration:none">support@starbooknow.com</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label, value) {
  return `<tr>
    <td style="padding:6px 0;color:${muted};font-size:13px;width:130px;vertical-align:top">${label}</td>
    <td style="padding:6px 0;color:#e5e2e1;font-size:13px;font-weight:600">${value || '—'}</td>
  </tr>`;
}

function btn(text, href) {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:linear-gradient(135deg,#f5cc6a,#c98a10);color:#1a0f00;font-weight:700;font-size:14px;text-decoration:none;border-radius:100px">${text}</a>`;
}

// ── 1. Welcome email on registration ─────────────────────────────────────────
async function sendWelcome({ name, email }) {
  const body = `
    <p style="color:#b0a898;font-size:15px;line-height:1.8;margin:0 0 20px">
      Hi <strong style="color:#fff">${name}</strong>, welcome to StarBookNow! 🎉<br>
      Your account is ready. You can now browse our celebrity roster and submit booking requests.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid rgba(255,255,255,0.08);margin-top:20px">
      ${row('Name', name)}
      ${row('Email', email)}
    </table>
    <div>${btn('Explore Celebrities →', 'https://starbooknow.com')}</div>
    <p style="margin:24px 0 0;font-size:12px;color:${muted}">
      If you didn't create this account, please ignore this email.
    </p>`;

  return send({ to: email, subject: 'Welcome to StarBookNow 🌟', html: base('Welcome aboard!', body) });
}

// ── 2. Booking confirmation to customer ──────────────────────────────────────
async function sendBookingConfirmation({ name, email, celeb, type, amount, paymentMethod }) {
  const typeLabel = { event: 'Event Booking', fan_card: 'Video Message', meet: 'Meet & Greet', donate: 'Donation', brand: 'Brand Campaign' }[type] || type;
  const payLabel  = { crypto: '₿ Crypto (BTC/ETH/USDT)', giftcard: '🎁 Gift Card', other: 'Other' }[paymentMethod] || paymentMethod;

  const body = `
    <p style="color:#b0a898;font-size:15px;line-height:1.8;margin:0 0 20px">
      Hi <strong style="color:#fff">${name}</strong>, we've received your booking request. Our team will review it and get back to you shortly.
    </p>
    <div style="background:rgba(240,191,90,0.06);border:1px solid rgba(240,191,90,0.15);border-radius:10px;padding:20px 24px;margin-bottom:8px">
      <div style="font-size:11px;letter-spacing:2px;color:${gold};text-transform:uppercase;font-weight:700;margin-bottom:14px">Booking Summary</div>
      <table cellpadding="0" cellspacing="0" style="width:100%">
        ${row('Celebrity', celeb)}
        ${row('Service', typeLabel)}
        ${row('Amount', `$${Number(amount).toLocaleString()}`)}
        ${row('Payment', payLabel)}
        ${row('Status', '⏳ Pending Review')}
      </table>
    </div>
    <p style="color:${muted};font-size:13px;line-height:1.7;margin:20px 0 0">
      ${paymentMethod === 'crypto'
        ? 'Please send your crypto payment to the wallet address shown in your booking. Once confirmed on-chain, your booking will be approved within 24 hours.'
        : paymentMethod === 'giftcard'
        ? 'Your gift card details have been received. Once verified, your booking will be approved within 24 hours.'
        : 'Our team will contact you shortly to confirm next steps.'}
    </p>
    <div>${btn('View My Bookings →', 'https://starbooknow.com')}</div>`;

  return send({ to: email, subject: `Booking Received — ${celeb} ⭐`, html: base('Booking received!', body) });
}

// ── 3. Booking status update to customer ─────────────────────────────────────
async function sendBookingStatusUpdate({ name, email, celeb, type, status }) {
  const approved = status === 'approved';
  const icon     = approved ? '✅' : '❌';
  const headline = approved ? 'Your booking is confirmed!' : 'Booking not approved';
  const message  = approved
    ? `Great news! Your booking for <strong style="color:#fff">${celeb}</strong> has been <strong style="color:#6DBF7B">approved</strong>. Our concierge team will be in touch with the next steps.`
    : `Unfortunately your booking for <strong style="color:#fff">${celeb}</strong> could not be approved at this time. Please contact our support team for more information.`;

  const body = `
    <p style="color:#b0a898;font-size:15px;line-height:1.8;margin:0 0 20px">
      Hi <strong style="color:#fff">${name}</strong>, ${icon}<br><br>${message}
    </p>
    <div>${btn(approved ? 'View My Bookings →' : 'Contact Support →', approved ? 'https://starbooknow.com' : 'https://starbooknow.com')}</div>`;

  return send({ to: email, subject: `${icon} Booking ${approved ? 'Approved' : 'Declined'} — ${celeb}`, html: base(headline, body) });
}

// ── 4. New booking alert to admin ────────────────────────────────────────────
async function sendAdminBookingAlert({ customerName, customerEmail, celeb, type, amount, paymentMethod }) {
  const typeLabel = { event: 'Event Booking', fan_card: 'Video Message', meet: 'Meet & Greet', donate: 'Donation', brand: 'Brand Campaign' }[type] || type;

  const body = `
    <p style="color:#b0a898;font-size:15px;line-height:1.8;margin:0 0 20px">
      A new booking has been submitted and is awaiting your review.
    </p>
    <div style="background:rgba(240,191,90,0.06);border:1px solid rgba(240,191,90,0.15);border-radius:10px;padding:20px 24px">
      <div style="font-size:11px;letter-spacing:2px;color:${gold};text-transform:uppercase;font-weight:700;margin-bottom:14px">Booking Details</div>
      <table cellpadding="0" cellspacing="0" style="width:100%">
        ${row('Customer', customerName)}
        ${row('Email', customerEmail)}
        ${row('Celebrity', celeb)}
        ${row('Service', typeLabel)}
        ${row('Amount', `$${Number(amount).toLocaleString()}`)}
        ${row('Payment', paymentMethod)}
      </table>
    </div>
    <div>${btn('Review in Admin Panel →', 'https://starbooknow.com')}</div>`;

  return send({ to: ADMIN, subject: `🔔 New Booking — ${customerName} × ${celeb}`, html: base('New booking received', body) });
}

async function send({ to, subject, html }) {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — skipping email to ${to}: ${subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    console.log(`[email] Sent "${subject}" → ${to}`);
  } catch (e) {
    console.error(`[email] Failed to send "${subject}" → ${to}:`, e.message);
  }
}

module.exports = { sendWelcome, sendBookingConfirmation, sendBookingStatusUpdate, sendAdminBookingAlert };
