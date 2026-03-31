const { Resend } = require('resend');

let _resend = null;
function getResend() {
  if (!_resend && process.env.RESEND_API_KEY) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM        = 'StarBookNow <support@starbooknow.com>';
const REPLY_TO    = 'support@starbooknow.com';
const ADMIN       = process.env.ADMIN_EMAIL || 'support@starbooknow.com';
const SITE        = 'https://starbooknow.com';
const UNSUB_EMAIL = 'unsubscribe@starbooknow.com';

const gold   = '#f0bf5a';
const dark   = '#111111';
const card   = '#1a1a1a';
const muted  = '#888888';
const green  = '#6DBF7B';

// ── shared row/button helpers ─────────────────────────────────────────────────
function row(label, value) {
  return `<tr>
    <td style="padding:6px 0;color:${muted};font-size:13px;width:130px;vertical-align:top">${label}</td>
    <td style="padding:6px 0;color:#e5e2e1;font-size:13px;font-weight:600">${value || '—'}</td>
  </tr>`;
}

function btn(text, href) {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:linear-gradient(135deg,#f5cc6a,#c98a10);color:#1a0f00;font-weight:700;font-size:14px;text-decoration:none;border-radius:100px">${text}</a>`;
}

// ── plain-text helper (strips HTML tags) ──────────────────────────────────────
function toText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, '  ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ────────────────────────────────────────────────────────────────────────────
// BASE TEMPLATES
// ────────────────────────────────────────────────────────────────────────────

// 1. Transactional — dark gold (bookings, invoices, status updates, auth)
function baseTransactional(title, bodyHtml) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${dark};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e5e2e1;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${dark};padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr><td style="text-align:center;padding:0 0 28px">
          <div style="font-size:22px;font-weight:900;letter-spacing:3px;color:${gold};text-transform:uppercase">★ StarBookNow</div>
          <div style="font-size:11px;color:${muted};letter-spacing:1px;margin-top:4px">Elite Celebrity Booking</div>
        </td></tr>
        <tr><td style="background:${card};border-radius:16px;border:1px solid rgba(240,191,90,0.12);padding:36px 40px">
          <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#fff">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="text-align:center;padding:24px 0 0;color:${muted};font-size:11px;line-height:1.8">
          © ${new Date().getFullYear()} StarBookNow &nbsp;·&nbsp;
          <a href="${SITE}" style="color:${gold};text-decoration:none">starbooknow.com</a><br>
          Questions? <a href="mailto:${REPLY_TO}" style="color:${gold};text-decoration:none">${REPLY_TO}</a><br>
          <a href="mailto:${UNSUB_EMAIL}?subject=unsubscribe" style="color:${muted};text-decoration:underline;font-size:10px">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// 2. Welcome — star/onboarding feel
function baseWelcome(bodyHtml) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e5e2e1;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <!-- Hero banner -->
        <tr><td style="background:linear-gradient(135deg,#1a1200 0%,#2a1e00 50%,#1a1200 100%);border-radius:16px 16px 0 0;padding:40px;text-align:center;border:1px solid rgba(240,191,90,0.15);border-bottom:none">
          <div style="font-size:42px;margin-bottom:10px">⭐</div>
          <div style="font-size:24px;font-weight:900;letter-spacing:3px;color:${gold};text-transform:uppercase">StarBookNow</div>
          <div style="font-size:13px;color:rgba(240,191,90,0.6);margin-top:6px;letter-spacing:1px">Your access to the world's biggest stars</div>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:${card};border-radius:0 0 16px 16px;border:1px solid rgba(240,191,90,0.12);border-top:none;padding:36px 40px">
          ${bodyHtml}
        </td></tr>
        <tr><td style="text-align:center;padding:24px 0 0;color:${muted};font-size:11px;line-height:1.8">
          © ${new Date().getFullYear()} StarBookNow &nbsp;·&nbsp;
          <a href="${SITE}" style="color:${gold};text-decoration:none">starbooknow.com</a><br>
          <a href="mailto:${UNSUB_EMAIL}?subject=unsubscribe" style="color:${muted};text-decoration:underline;font-size:10px">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// 3. Membership/Plan — tier badge prominent
function baseMembership(tier, bodyHtml) {
  const isPlat = tier === 'platinum';
  const accent  = isPlat ? '#b8d4f0' : gold;
  const bg      = isPlat ? 'linear-gradient(135deg,#0a1520 0%,#152030 50%,#0a1520 100%)' : 'linear-gradient(135deg,#1a1200 0%,#2a1e00 50%,#1a1200 100%)';
  const border  = isPlat ? 'rgba(184,212,240,0.15)' : 'rgba(240,191,90,0.15)';
  const icon    = isPlat ? '💎' : '👑';
  const label   = isPlat ? 'PLATINUM EXECUTIVE' : 'VIP PREMIUM';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e5e2e1;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr><td style="background:${bg};border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;border:1px solid ${border};border-bottom:none">
          <div style="font-size:40px;margin-bottom:10px">${icon}</div>
          <div style="font-size:13px;font-weight:900;letter-spacing:4px;color:${accent};text-transform:uppercase">${label}</div>
          <div style="font-size:11px;color:${muted};letter-spacing:1px;margin-top:5px">StarBookNow Membership</div>
        </td></tr>
        <tr><td style="background:${card};border-radius:0 0 16px 16px;border:1px solid ${border};border-top:none;padding:36px 40px">
          ${bodyHtml}
        </td></tr>
        <tr><td style="text-align:center;padding:24px 0 0;color:${muted};font-size:11px;line-height:1.8">
          © ${new Date().getFullYear()} StarBookNow &nbsp;·&nbsp;
          <a href="${SITE}" style="color:${gold};text-decoration:none">starbooknow.com</a><br>
          Questions? <a href="mailto:${REPLY_TO}" style="color:${gold};text-decoration:none">${REPLY_TO}</a><br>
          <a href="mailto:${UNSUB_EMAIL}?subject=unsubscribe" style="color:${muted};text-decoration:underline;font-size:10px">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// 4. Alert — compact admin notification
function baseAlert(title, bodyHtml) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e5e2e1;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <tr><td style="padding-bottom:20px">
          <div style="font-size:13px;font-weight:800;letter-spacing:2px;color:${gold};text-transform:uppercase">StarBookNow &nbsp;›&nbsp; Admin Alert</div>
        </td></tr>
        <tr><td style="background:#1c1c1c;border-radius:12px;border-left:4px solid ${gold};padding:28px 32px">
          <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#fff">${title}</h2>
          ${bodyHtml}
        </td></tr>
        <tr><td style="text-align:left;padding:18px 0 0;color:${muted};font-size:11px;line-height:1.7">
          StarBookNow Admin · <a href="${SITE}" style="color:${gold};text-decoration:none">starbooknow.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// 5. Blog / Newsletter — editorial magazine layout
function baseBlog(blog, bodyHtml) {
  const { title, category, author, authorRole, readTime, img } = blog;
  const catColor = '#f0bf5a';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Georgia,'Times New Roman',serif;color:#e5e2e1;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Masthead -->
        <tr><td style="text-align:center;padding:0 0 24px;border-bottom:1px solid rgba(240,191,90,0.15)">
          <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:4px;color:${muted};text-transform:uppercase;margin-bottom:6px">The StarBookNow Journal</div>
          <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:#555;letter-spacing:1px">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </td></tr>

        <!-- Category pill -->
        <tr><td style="padding:24px 0 14px">
          <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;display:inline-block;background:rgba(240,191,90,0.12);border:1px solid rgba(240,191,90,0.3);border-radius:100px;padding:4px 14px;font-size:10px;font-weight:800;letter-spacing:2px;color:${catColor};text-transform:uppercase">${category || 'Insights'}</span>
        </td></tr>

        <!-- Headline -->
        <tr><td style="padding-bottom:16px">
          <h1 style="margin:0;font-size:clamp(22px,4vw,32px);font-weight:700;color:#fff;line-height:1.3">${title}</h1>
        </td></tr>

        <!-- Byline -->
        <tr><td style="padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06)">
          <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:${muted}">
            By <strong style="color:#c8c0b8">${author || 'StarBookNow'}</strong>
            ${authorRole ? `<span style="color:#555"> · ${authorRole}</span>` : ''}
            ${readTime ? `<span style="color:#555"> · ${readTime}</span>` : ''}
          </span>
        </td></tr>

        ${img ? `
        <!-- Hero image -->
        <tr><td style="padding:20px 0 0">
          <img src="${img}" alt="${title}" style="width:100%;border-radius:10px;display:block;max-height:300px;object-fit:cover" />
        </td></tr>` : ''}

        <!-- Article body -->
        <tr><td style="padding:28px 0">
          ${bodyHtml}
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:8px 0 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.06)">
          <a href="${SITE}" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;display:inline-block;margin-top:24px;padding:13px 30px;background:linear-gradient(135deg,#f5cc6a,#c98a10);color:#1a0f00;font-weight:700;font-size:13px;text-decoration:none;border-radius:100px">Read More on StarBookNow →</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding:20px 0 0;border-top:1px solid rgba(255,255,255,0.06);color:${muted};font-size:10px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.9">
          © ${new Date().getFullYear()} StarBookNow &nbsp;·&nbsp;
          <a href="${SITE}" style="color:${gold};text-decoration:none">starbooknow.com</a><br>
          You received this because you have an account with StarBookNow.<br>
          <a href="mailto:${UNSUB_EMAIL}?subject=unsubscribe" style="color:${muted};text-decoration:underline">Unsubscribe</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ────────────────────────────────────────────────────────────────────────────
// EMAIL FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

// 1. Welcome
async function sendWelcome({ name, email }) {
  const body = `
    <p style="color:#b0a898;font-size:16px;line-height:1.8;margin:0 0 20px">
      Hi <strong style="color:#fff">${name}</strong>,<br><br>
      You're officially in. Welcome to <strong style="color:${gold}">StarBookNow</strong> — your direct line to the world's biggest celebrities.
    </p>
    <p style="color:#b0a898;font-size:14px;line-height:1.8;margin:0 0 24px">
      Browse our celebrity roster, submit booking requests, and explore exclusive fan experiences — all in one place.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid rgba(255,255,255,0.08);margin-top:16px">
      ${row('Name', name)}
      ${row('Email', email)}
      ${row('Plan', 'Free')}
    </table>
    <div>${btn('Explore Celebrities →', SITE)}</div>
    <p style="margin:24px 0 0;font-size:11px;color:${muted}">
      Didn't create this account? You can safely ignore this email.
    </p>`;

  const html = baseWelcome(body);
  return send({
    to: email,
    subject: `Welcome to StarBookNow — you're in`,
    html,
    text: `Hi ${name},\n\nWelcome to StarBookNow! Your account is ready.\n\nExplore celebrities at ${SITE}\n\nIf you didn't create this account, ignore this email.\n\n© ${new Date().getFullYear()} StarBookNow`,
    headers: { 'Reply-To': REPLY_TO },
  });
}

// 2. Booking confirmation
async function sendBookingConfirmation({ name, email, celeb, type, amount, paymentMethod }) {
  const typeLabel = { event: 'Event Booking', fan_card: 'VIP Fan Card', fan_card_platinum: 'Platinum Elite Card', meet: 'Meet & Greet', donate: 'Donation', video: 'Video Message', brand: 'Brand Campaign', plan_upgrade: 'Plan Upgrade Request' }[type] || type;
  const payLabel  = { crypto: 'Crypto (BTC/ETH/USDT)', giftcard: 'Gift Card', other: 'Other' }[paymentMethod] || paymentMethod;

  const payNote = paymentMethod === 'crypto'
    ? 'Send your crypto payment to the wallet address shown in your booking. Once confirmed on-chain, your request will be processed within 24 hours.'
    : paymentMethod === 'giftcard'
    ? 'Your gift card details have been received. Once verified, your request will be processed within 24 hours.'
    : 'Our team will contact you shortly to confirm next steps.';

  const body = `
    <p style="color:#b0a898;font-size:15px;line-height:1.8;margin:0 0 20px">
      Hi <strong style="color:#fff">${name}</strong>, we've received your request and our team will review it shortly.
    </p>
    <div style="background:rgba(240,191,90,0.06);border:1px solid rgba(240,191,90,0.15);border-radius:10px;padding:20px 24px;margin-bottom:8px">
      <div style="font-size:10px;letter-spacing:2px;color:${gold};text-transform:uppercase;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:14px">Request Summary</div>
      <table cellpadding="0" cellspacing="0" style="width:100%">
        ${row('For', celeb)}
        ${row('Service', typeLabel)}
        ${row('Amount', `$${Number(amount).toLocaleString()}`)}
        ${row('Payment', payLabel)}
        ${row('Status', 'Pending Review')}
      </table>
    </div>
    <p style="color:${muted};font-size:13px;line-height:1.7;margin:20px 0 0">${payNote}</p>
    <div>${btn('View My Bookings →', SITE)}</div>`;

  const html = baseTransactional('Request received', body);
  return send({
    to: email,
    subject: `Request received — ${celeb}`,
    html,
    text: `Hi ${name},\n\nYour ${typeLabel} request for ${celeb} has been received.\n\nAmount: $${Number(amount).toLocaleString()}\nPayment: ${payLabel}\nStatus: Pending Review\n\n${payNote}\n\nView bookings: ${SITE}\n\n© ${new Date().getFullYear()} StarBookNow`,
    headers: { 'Reply-To': REPLY_TO },
  });
}

// 3. Booking status update
async function sendBookingStatusUpdate({ name, email, celeb, type, status }) {
  const approved = status === 'approved';
  const headline = approved ? 'Your booking is confirmed' : 'Booking update';
  const message  = approved
    ? `Your booking for <strong style="color:#fff">${celeb}</strong> has been <strong style="color:${green}">approved</strong>. Our concierge team will be in touch with the next steps.`
    : `Your booking for <strong style="color:#fff">${celeb}</strong> could not be approved at this time. Contact our support team for more information.`;

  const body = `
    <p style="color:#b0a898;font-size:15px;line-height:1.8;margin:0 0 20px">
      Hi <strong style="color:#fff">${name}</strong>,<br><br>${message}
    </p>
    <div>${btn(approved ? 'View My Bookings →' : 'Contact Support →', SITE)}</div>`;

  const html = baseTransactional(headline, body);
  return send({
    to: email,
    subject: approved ? `Booking confirmed — ${celeb}` : `Booking update — ${celeb}`,
    html,
    text: `Hi ${name},\n\n${approved ? `Your booking for ${celeb} has been approved. Our team will be in touch shortly.` : `Your booking for ${celeb} could not be approved. Please contact support.`}\n\n${SITE}\n\n© ${new Date().getFullYear()} StarBookNow`,
    headers: { 'Reply-To': REPLY_TO },
  });
}

// 4. Invoice
async function sendInvoice({ name, email, invoiceId, celeb, type, amount, paymentMethod, date, form }) {
  const typeLabel = { event: 'Event Booking', fan_card: 'VIP Fan Card', meet: 'Meet & Greet', donate: 'Charity Donation', video: 'Video Message', brand: 'Brand Campaign' }[type] || type;
  const payLabel  = { crypto: 'Crypto (BTC/ETH/USDT)', giftcard: 'Gift Card', other: 'Other / Contact' }[paymentMethod] || paymentMethod;
  const txDate    = new Date(date).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

  const body = `
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-align:center;margin-bottom:24px">
      <div style="font-size:10px;letter-spacing:3px;color:${gold};text-transform:uppercase;font-weight:700">Official Receipt</div>
    </div>

    <div style="background:rgba(240,191,90,0.06);border:1px solid rgba(240,191,90,0.2);border-radius:12px;padding:20px 24px;margin-bottom:20px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
      <table cellpadding="0" cellspacing="0" style="width:100%">
        <tr>
          <td style="vertical-align:top">
            <div style="font-size:10px;color:${muted};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Invoice No.</div>
            <div style="font-size:16px;font-weight:800;color:${gold};letter-spacing:1px">${invoiceId}</div>
          </td>
          <td style="vertical-align:top;text-align:right">
            <div style="font-size:10px;color:${muted};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Date</div>
            <div style="font-size:13px;color:#e5e2e1">${txDate}</div>
          </td>
        </tr>
      </table>
      <div style="border-top:1px solid rgba(255,255,255,0.08);margin-top:16px;padding-top:16px">
        <div style="font-size:10px;color:${muted};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Billed To</div>
        <div style="font-size:15px;font-weight:700;color:#fff">${name}</div>
        <div style="font-size:12px;color:${muted};margin-top:2px">${email}</div>
      </div>
    </div>

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
      <tr style="border-bottom:1px solid rgba(255,255,255,0.08)">
        <td style="padding:8px 0;font-size:10px;color:${muted};text-transform:uppercase;letter-spacing:1px">Description</td>
        <td style="padding:8px 0;font-size:10px;color:${muted};text-transform:uppercase;letter-spacing:1px;text-align:right">Amount</td>
      </tr>
      <tr>
        <td style="padding:16px 0">
          <div style="font-size:15px;font-weight:700;color:#fff">${typeLabel}</div>
          <div style="font-size:13px;color:${muted};margin-top:3px">Celebrity: <strong style="color:#e5e2e1">${celeb}</strong></div>
          <div style="font-size:12px;color:${muted};margin-top:2px">Payment: ${payLabel}</div>
          ${form?.date ? `<div style="font-size:12px;color:${muted};margin-top:2px">Event date: ${form.date}</div>` : ''}
          ${form?.guests ? `<div style="font-size:12px;color:${muted};margin-top:2px">Guests: ${form.guests}</div>` : ''}
        </td>
        <td style="padding:16px 0;text-align:right;vertical-align:top">
          <div style="font-size:20px;font-weight:900;color:${gold};font-family:Georgia,serif">$${Number(amount).toLocaleString()}</div>
        </td>
      </tr>
      <tr style="border-top:2px solid rgba(240,191,90,0.2)">
        <td style="padding:14px 0;font-size:15px;font-weight:700;color:#fff">Total Paid</td>
        <td style="padding:14px 0;text-align:right;font-size:22px;font-weight:900;color:${gold};font-family:Georgia,serif">$${Number(amount).toLocaleString()}</td>
      </tr>
    </table>

    <div style="background:#0a2a18;border:1px solid rgba(109,191,123,0.3);border-radius:12px;padding:18px 22px;margin-top:22px;text-align:center;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
      <div style="font-size:15px;font-weight:800;color:${green}">Booking Confirmed</div>
      <div style="font-size:13px;color:${muted};margin-top:6px;line-height:1.6">Our concierge team will be in touch within 24 hours with next steps.</div>
    </div>

    <p style="text-align:center;color:${muted};font-size:11px;margin-top:22px;line-height:1.7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
      Keep this email as your official receipt.<br>Invoice ID: <strong style="color:#e5e2e1">${invoiceId}</strong>
    </p>`;

  const html = baseTransactional('Booking confirmed', body);
  return send({
    to: email,
    subject: `Invoice ${invoiceId} — booking confirmed`,
    html,
    text: `Invoice ${invoiceId}\n\nBilled to: ${name} (${email})\nDate: ${txDate}\n\n${typeLabel} · ${celeb}\nPayment: ${payLabel}\nTotal: $${Number(amount).toLocaleString()}\n\nYour booking is confirmed. Our team will be in touch within 24 hours.\n\n© ${new Date().getFullYear()} StarBookNow`,
    headers: { 'Reply-To': REPLY_TO },
  });
}

// 5. New booking alert to admin
async function sendAdminBookingAlert({ customerName, customerEmail, celeb, type, amount, paymentMethod }) {
  const typeLabel = { event: 'Event Booking', fan_card: 'VIP Fan Card', fan_card_platinum: 'Platinum Elite Card', meet: 'Meet & Greet', donate: 'Donation', video: 'Video Message', brand: 'Brand Campaign', plan_upgrade: 'Plan Upgrade' }[type] || type;

  const body = `
    <p style="color:#b0a898;font-size:14px;line-height:1.7;margin:0 0 16px">A new request is awaiting review.</p>
    <div style="background:rgba(240,191,90,0.06);border:1px solid rgba(240,191,90,0.15);border-radius:10px;padding:16px 20px;margin-bottom:16px">
      <table cellpadding="0" cellspacing="0" style="width:100%">
        ${row('Customer', customerName)}
        ${row('Email', customerEmail)}
        ${row('For', celeb)}
        ${row('Type', typeLabel)}
        ${row('Amount', `$${Number(amount).toLocaleString()}`)}
        ${row('Payment', paymentMethod)}
      </table>
    </div>
    <a href="${SITE}/#admin" style="display:inline-block;padding:11px 24px;background:${gold};color:#1a0f00;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px">Review in Admin Panel →</a>`;

  const html = baseAlert(`New ${typeLabel}`, body);
  return send({
    to: ADMIN,
    subject: `New ${typeLabel} — ${customerName}`,
    html,
    text: `New ${typeLabel}\n\nCustomer: ${customerName} (${customerEmail})\nFor: ${celeb}\nAmount: $${Number(amount).toLocaleString()}\nPayment: ${paymentMethod}\n\nReview at ${SITE}/#admin`,
    headers: { 'Reply-To': customerEmail },
  });
}

// 6. Support alert to admin (all users)
async function sendPremiumSupportAlert({ customerName, email, tier, topic }) {
  const isPlat   = tier === 'platinum';
  const isPrem   = tier === 'premium';
  const tierLabel = isPlat ? 'Platinum Elite' : isPrem ? 'VIP Premium' : 'Standard';
  const accent    = isPlat ? '#b8d4f0' : isPrem ? gold : '#a0a0a0';
  const priority  = isPlat || isPrem;

  const body = `
    <p style="color:#b0a898;font-size:14px;line-height:1.7;margin:0 0 16px">
      ${priority
        ? `A <strong style="color:${accent}">${tierLabel} member</strong> has requested live support and requires immediate attention.`
        : `A user has requested live support.`
      }
    </p>
    <div style="background:rgba(240,191,90,0.06);border:1px solid rgba(240,191,90,0.15);border-radius:10px;padding:16px 20px;margin-bottom:16px">
      <table cellpadding="0" cellspacing="0" style="width:100%">
        ${row('Customer', customerName)}
        ${row('Email', email)}
        ${row('Tier', tierLabel)}
        ${row('Topic', topic || 'General Inquiry')}
      </table>
    </div>
    <a href="${SITE}/#admin" style="display:inline-block;padding:11px 24px;background:${gold};color:#1a0f00;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px">Open Support Inbox →</a>`;

  const title = priority ? `${tierLabel} Support Request` : `New Support Request`;
  const html = baseAlert(title, body);
  return send({
    to: ADMIN,
    subject: priority ? `Priority support — ${tierLabel}: ${customerName}` : `Support request — ${customerName}`,
    html,
    text: `${title}\n\nCustomer: ${customerName} (${email})\nTier: ${tierLabel}\nTopic: ${topic || 'General Inquiry'}\n\nOpen inbox: ${SITE}/#admin`,
    headers: { 'Reply-To': email },
  });
}

// 9. Login notification to user
async function sendLoginUser({ name, email }) {
  const time = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

  const body = `
    <p style="color:#b0a898;font-size:15px;line-height:1.8;margin:0 0 20px">
      Hi <strong style="color:#fff">${name}</strong>,<br><br>
      We detected a new sign-in to your StarBookNow account.
    </p>
    <div style="background:rgba(240,191,90,0.06);border:1px solid rgba(240,191,90,0.15);border-radius:10px;padding:16px 20px;margin-bottom:20px">
      <table cellpadding="0" cellspacing="0" style="width:100%">
        ${row('Account', email)}
        ${row('Time', time)}
      </table>
    </div>
    <p style="color:#b0a898;font-size:13px;line-height:1.7;margin:0 0 20px">
      If this was you, no action is needed. If you did not sign in, please contact us immediately at
      <a href="mailto:${REPLY_TO}" style="color:${gold};text-decoration:none">${REPLY_TO}</a>.
    </p>
    <div>${btn('Go to My Account →', SITE)}</div>`;

  const html = baseTransactional('New sign-in detected', body);
  return send({
    to: email,
    subject: `New sign-in to your StarBookNow account`,
    html,
    text: `Hi ${name},\n\nA new sign-in was detected on your StarBookNow account.\n\nAccount: ${email}\nTime: ${time}\n\nIf this was you, no action needed. If not, contact us at ${REPLY_TO}.\n\n${SITE}\n\n© ${new Date().getFullYear()} StarBookNow`,
    headers: { 'Reply-To': REPLY_TO },
  });
}

// 10. Login alert to admin
async function sendLoginAdmin({ name, email, plan }) {
  const time     = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
  const planLabel = plan === 'platinum' ? 'Platinum Elite' : plan === 'premium' ? 'VIP Premium' : 'Free';

  const body = `
    <p style="color:#b0a898;font-size:14px;line-height:1.7;margin:0 0 16px">A user has just signed in to StarBookNow.</p>
    <div style="background:rgba(240,191,90,0.06);border:1px solid rgba(240,191,90,0.15);border-radius:10px;padding:16px 20px;margin-bottom:16px">
      <table cellpadding="0" cellspacing="0" style="width:100%">
        ${row('Name', name)}
        ${row('Email', email)}
        ${row('Plan', planLabel)}
        ${row('Time', time)}
      </table>
    </div>
    <a href="${SITE}/#admin" style="display:inline-block;padding:11px 24px;background:${gold};color:#1a0f00;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px">View in Admin Panel →</a>`;

  const html = baseAlert('User Login', body);
  return send({
    to: ADMIN,
    subject: `Login — ${name} (${planLabel})`,
    html,
    text: `User Login\n\nName: ${name}\nEmail: ${email}\nPlan: ${planLabel}\nTime: ${time}\n\nAdmin panel: ${SITE}/#admin`,
    headers: { 'Reply-To': email },
  });
}

// 7. Plan changed notification to user
async function sendPlanChanged({ name, email, plan, planExpiresAt }) {
  const isPlat  = plan === 'platinum';
  const isPrem  = plan === 'premium';
  const label   = isPlat ? 'Platinum Executive' : isPrem ? 'Premium VIP' : 'Free';
  const perks   = isPlat
    ? ['Priority celebrity bookings', 'Exclusive member lounge access', 'Dedicated concierge service', 'Exclusive content & previews', 'Fan card add-ons']
    : isPrem
    ? ['Fan card purchases', 'All celebrity profiles', 'Priority support queue', 'Exclusive newsletter']
    : ['Celebrity browsing', 'Donations'];

  const body = `
    <p style="color:#b0a898;font-size:15px;line-height:1.8;margin:0 0 20px">
      Hi <strong style="color:#fff">${name}</strong>,<br><br>
      Your StarBookNow membership has been updated to <strong style="color:${isPlat ? '#b8d4f0' : gold}">${label}</strong>.
    </p>
    <div style="background:rgba(240,191,90,0.06);border:1px solid rgba(240,191,90,0.12);border-radius:10px;padding:20px 24px;margin-bottom:20px">
      <div style="font-size:10px;letter-spacing:2px;color:${gold};text-transform:uppercase;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:14px">What's included</div>
      ${perks.map(p => `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px"><span style="color:${green};font-size:14px;margin-top:1px">✓</span><span style="color:#c8c0b8;font-size:14px">${p}</span></div>`).join('')}
    </div>
    ${planExpiresAt ? `<p style="color:${muted};font-size:12px;line-height:1.7;margin:16px 0 0">Your ${label} plan is active until <strong style="color:#e5e2e1">${new Date(planExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>. It will renew or expire on this date.</p>` : ''}
    <div><a href="${SITE}" style="display:inline-block;margin-top:8px;padding:14px 32px;background:linear-gradient(135deg,#f5cc6a,#c98a10);color:#1a0f00;font-weight:700;font-size:14px;text-decoration:none;border-radius:100px">Explore Your Benefits →</a></div>`;

  const html = baseMembership(plan, body);
  return send({
    to: email,
    subject: `Your plan has been updated — ${label}`,
    html,
    text: `Hi ${name},\n\nYour StarBookNow plan has been updated to ${label}.\n\nWhat's included:\n${perks.map(p => `• ${p}`).join('\n')}${planExpiresAt ? `\n\nPlan active until: ${new Date(planExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}\n\nExplore your benefits: ${SITE}\n\n© ${new Date().getFullYear()} StarBookNow`,
    headers: {
      'Reply-To': REPLY_TO,
      'List-Unsubscribe': `<mailto:${UNSUB_EMAIL}?subject=unsubscribe>`,
    },
  });
}

// 8. New user registration alert to admin
async function sendNewUserAdmin({ name, email }) {
  const time = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

  const body = `
    <p style="color:#b0a898;font-size:14px;line-height:1.7;margin:0 0 16px">A new user has just created an account on StarBookNow.</p>
    <div style="background:rgba(240,191,90,0.06);border:1px solid rgba(240,191,90,0.15);border-radius:10px;padding:16px 20px;margin-bottom:16px">
      <table cellpadding="0" cellspacing="0" style="width:100%">
        ${row('Name', name)}
        ${row('Email', email)}
        ${row('Time', time)}
      </table>
    </div>
    <a href="${SITE}/#admin" style="display:inline-block;padding:11px 24px;background:${gold};color:#1a0f00;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px">View in Admin Panel →</a>`;

  const html = baseAlert('New User Registration', body);
  return send({
    to: ADMIN,
    subject: `New signup — ${name}`,
    html,
    text: `New User Registration\n\nName: ${name}\nEmail: ${email}\nTime: ${time}\n\nAdmin panel: ${SITE}/#admin`,
    headers: { 'Reply-To': email },
  });
}

// 9. Blog / newsletter email
async function sendBlogEmail({ name, email, blog }) {
  const blocks = Array.isArray(blog.content) ? blog.content : [];

  const articleHtml = blocks.map(b => {
    if (b.type === 'h2') {
      return `<h2 style="font-size:20px;font-weight:700;color:#fff;margin:28px 0 10px;line-height:1.3">${b.text}</h2>`;
    }
    return `<p style="font-size:15px;color:#b0a898;line-height:1.85;margin:0 0 18px">${b.text}</p>`;
  }).join('') || `<p style="font-size:15px;color:#b0a898;line-height:1.85">${blog.excerpt || ''}</p>`;

  const plainArticle = blocks.map(b => b.type === 'h2' ? `\n${b.text.toUpperCase()}\n` : `\n${b.text}`).join('\n') || blog.excerpt || '';

  const html = baseBlog(blog, articleHtml);
  return send({
    to: email,
    subject: blog.title,
    html,
    text: `${blog.title}\nBy ${blog.author || 'StarBookNow'}${blog.authorRole ? ` · ${blog.authorRole}` : ''}\n\n${plainArticle}\n\nRead more: ${SITE}\n\n© ${new Date().getFullYear()} StarBookNow\nUnsubscribe: mailto:${UNSUB_EMAIL}?subject=unsubscribe`,
    headers: {
      'Reply-To': REPLY_TO,
      'List-Unsubscribe': `<mailto:${UNSUB_EMAIL}?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'Precedence': 'bulk',
    },
  });
}

// ── core send ─────────────────────────────────────────────────────────────────
async function send({ to, subject, html, text, headers = {} }) {
  const resend = getResend();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — skipping: ${subject} → ${to}`);
    return;
  }
  try {
    const payload = { from: FROM, to, subject, html };
    if (text) payload.text = text;
    if (Object.keys(headers).length) payload.headers = headers;
    await resend.emails.send(payload);
    console.log(`[email] Sent "${subject}" → ${to}`);
  } catch (e) {
    console.error(`[email] Failed "${subject}" → ${to}:`, e.message);
  }
}

module.exports = {
  sendWelcome,
  sendBookingConfirmation,
  sendBookingStatusUpdate,
  sendAdminBookingAlert,
  sendInvoice,
  sendPremiumSupportAlert,
  sendPlanChanged,
  sendBlogEmail,
  sendLoginUser,
  sendLoginAdmin,
  sendNewUserAdmin,
};
