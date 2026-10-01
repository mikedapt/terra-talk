import nodemailer from 'nodemailer';
import db from './db.js';

function getDbSetting(key) {
  return db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key)?.value || '';
}

async function getTransporter() {
  const dbHost = getDbSetting('smtp_host');
  if (dbHost) {
    return nodemailer.createTransport({
      host: dbHost,
      port: Number(getDbSetting('smtp_port') || 587),
      secure: false,
      auth: { user: getDbSetting('smtp_user'), pass: getDbSetting('smtp_pass') },
    });
  }

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  // dev fallback: Ethereal catches mail and gives you a preview URL
  const acct = await nodemailer.createTestAccount();
  console.log('Using Ethereal test account:', acct.user);
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: acct.user, pass: acct.pass },
  });
}

export async function sendResetEmail(to, link) {
  const t = await getTransporter();
  const fromDb = getDbSetting('smtp_from');
  const from = fromDb || process.env.SMTP_FROM || '"Forum Support" <no-reply@example.com>';

  const info = await t.sendMail({
    from,
    to,
    subject: 'Reset your password',
    text: `Reset your password here (expires in 1 hour): ${link}`,
    html: `<p>Click below to reset your password. The link expires in 1 hour.</p>
           <p><a href="${link}">Reset password</a></p>
           <p>If you didn't request this, ignore this email.</p>`,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log('Preview the email here:', preview);
}
