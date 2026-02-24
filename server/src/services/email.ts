import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || '"HelloEve" <noreply@helloeve.io>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  await sendEmail(email, 'ברוכים הבאים ל-HelloEve!', `
    <div dir="rtl" style="font-family: Assistant, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #14181f;">שלום ${name},</h1>
      <p style="color: #64748b; font-size: 18px;">ברוכים הבאים ל-HelloEve! אנחנו שמחים שבחרת לבנות את האתר שלך איתנו.</p>
      <a href="https://helloeve.io/dashboard" style="display: inline-block; background: #e33670; color: white; padding: 16px 32px; border-radius: 2rem; text-decoration: none; font-weight: bold;">התחל לבנות</a>
    </div>
  `);
}

export async function sendSiteLaunchedEmail(email: string, siteName: string, domain: string) {
  await sendEmail(email, `האתר ${siteName} עלה לאוויר!`, `
    <div dir="rtl" style="font-family: Assistant, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #14181f;">האתר שלך באוויר! 🚀</h1>
      <p style="color: #64748b; font-size: 18px;">האתר <strong>${siteName}</strong> הושק בהצלחה בכתובת:</p>
      <p style="font-size: 24px; font-weight: bold;"><a href="https://${domain}">${domain}</a></p>
    </div>
  `);
}
