// Basic env-driven configuration
const EMAIL_ENABLED = process.env.ALERT_EMAIL_ENABLED === 'true';
const WHATSAPP_ENABLED = process.env.ALERT_WHATSAPP_ENABLED === 'true';

let mailTransport = null;
if (EMAIL_ENABLED) {
  // Lazy-require to avoid hard dependency unless enabled
  // eslint-disable-next-line global-require
  const nodemailer = require('nodemailer');
  mailTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined
  });
}

async function sendEmail(subject, text) {
  if (!EMAIL_ENABLED || !process.env.ALERT_EMAIL_TO) return;
  if (!mailTransport) return;
  await mailTransport.sendMail({
    from: process.env.ALERT_EMAIL_FROM || process.env.SMTP_USER,
    to: process.env.ALERT_EMAIL_TO,
    subject,
    text
  });
}

// Placeholder for WhatsApp (e.g., via Twilio). Implement when credentials are provided.
async function sendWhatsApp(message) {
  if (!WHATSAPP_ENABLED) return;
  // Implementation can be added with Twilio credentials:
  // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  // await client.messages.create({ from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, to: `whatsapp:${process.env.ALERT_WHATSAPP_TO}`, body: message });
  return;
}

async function notifyLowStock(products) {
  if (!products || products.length === 0) return;
  const lines = products.map(p => {
    const name = p.product?.name || p.name || 'Unknown';
    const qty = typeof p.quantity === 'number' ? p.quantity : p.stock;
    const minQty = typeof p.minQuantity === 'number' ? p.minQuantity : p.minStock;
    return `- ${name}: ${qty} (min ${minQty})`;
  });
  const text = `Low stock alert for:\n${lines.join('\n')}`;
  await Promise.all([
    sendEmail('Low stock alert', text),
    sendWhatsApp(text)
  ]);
}

module.exports = {
  notifyLowStock
};


