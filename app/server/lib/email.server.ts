import { Resend } from 'resend';
import { env } from '~/server/utils/env';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

// In dev or when RESEND_API_KEY is missing, log to server console instead of sending
async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.log('[EMAIL] dev mode — email not sent:', {
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });
}

export { sendEmail };
