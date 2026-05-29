import { sendEmail } from '~/server/lib/email.server';
import type { BookingWithRelations } from '../types';

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(date);
}

function buildLearnerReminderHtml(booking: BookingWithRelations): string {
  const teacherName = booking.course.teacher.user.name;
  const courseName = booking.course.title;
  const startDate = formatDate(booking.startTime);
  const duration = booking.course.duration;

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #4f46e5;">Rappel : votre cours est dans 24h !</h2>
      <p>Bonjour,</p>
      <p>N'oubliez pas votre cours prévu demain :</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #6b7280;">Cours</td><td style="padding: 8px 0; font-weight: 600;">${courseName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Enseignant</td><td style="padding: 8px 0;">${teacherName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Date</td><td style="padding: 8px 0;">${startDate}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Durée</td><td style="padding: 8px 0;">${duration} minutes</td></tr>
      </table>
      <p style="color: #6b7280; font-size: 14px;">À demain sur Maestroo !</p>
    </div>
  `;
}

function buildTeacherReminderHtml(booking: BookingWithRelations): string {
  const learnerName = booking.learner.user.name;
  const courseName = booking.course.title;
  const startDate = formatDate(booking.startTime);
  const duration = booking.course.duration;

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #4f46e5;">Rappel : un cours est prévu dans 24h</h2>
      <p>Bonjour,</p>
      <p>Un apprenant vous rejoindra demain pour :</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #6b7280;">Cours</td><td style="padding: 8px 0; font-weight: 600;">${courseName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Apprenant</td><td style="padding: 8px 0;">${learnerName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Date</td><td style="padding: 8px 0;">${startDate}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Durée</td><td style="padding: 8px 0;">${duration} minutes</td></tr>
      </table>
      <p style="color: #6b7280; font-size: 14px;">Connectez-vous à Maestroo pour plus de détails.</p>
    </div>
  `;
}

export async function sendBookingReminder(booking: BookingWithRelations): Promise<void> {
  const courseName = booking.course.title;
  const learnerEmail = booking.learner.user.email;
  const teacherEmail = booking.course.teacher.user.email;

  await Promise.all([
    sendEmail({
      to: learnerEmail,
      subject: `Rappel : votre cours dans 24h — ${courseName}`,
      html: buildLearnerReminderHtml(booking),
    }),
    sendEmail({
      to: teacherEmail,
      subject: `Rappel : cours dans 24h — ${courseName}`,
      html: buildTeacherReminderHtml(booking),
    }),
  ]);
}
