import nodemailer from 'nodemailer';

let cached;

export async function getTransporter() {
  if (cached) return cached;

  if (process.env.SMTP_HOST) {
    cached = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    // dev fallback: Ethereal catches mail and gives you a preview URL
    const acct = await nodemailer.createTestAccount();
    console.log('Using Ethereal test account:', acct.user);
    cached = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: acct.user, pass: acct.pass },
    });
  }
  return cached;
}

export async function sendResetEmail(to, link) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: '"Forum Support" <no-reply@example.com>',
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