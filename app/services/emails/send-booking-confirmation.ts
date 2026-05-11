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

function buildLearnerConfirmationHtml(booking: BookingWithRelations): string {
  const teacherName = booking.course.teacher.user.name;
  const courseName = booking.course.title;
  const startDate = formatDate(booking.startTime);
  const duration = booking.course.duration;
  const price = Number(booking.priceAtBooking).toFixed(2);

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #4f46e5;">Votre réservation a bien été enregistrée !</h2>
      <p>Bonjour,</p>
      <p>Votre demande de réservation a été transmise à l'enseignant. Voici le récapitulatif :</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #6b7280;">Cours</td><td style="padding: 8px 0; font-weight: 600;">${courseName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Enseignant</td><td style="padding: 8px 0;">${teacherName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Date</td><td style="padding: 8px 0;">${startDate}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Durée</td><td style="padding: 8px 0;">${duration} minutes</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Prix</td><td style="padding: 8px 0;">${price} €</td></tr>
      </table>
      <p style="color: #6b7280; font-size: 14px;">À bientôt sur Maestroo !</p>
    </div>
  `;
}

function buildTeacherNotificationHtml(booking: BookingWithRelations): string {
  const learnerName = booking.learner.user.name;
  const courseName = booking.course.title;
  const startDate = formatDate(booking.startTime);
  const duration = booking.course.duration;

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #4f46e5;">Nouvelle demande de réservation</h2>
      <p>Bonjour,</p>
      <p>Un apprenant vient de réserver l'un de vos cours :</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #6b7280;">Cours</td><td style="padding: 8px 0; font-weight: 600;">${courseName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Apprenant</td><td style="padding: 8px 0;">${learnerName}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Date</td><td style="padding: 8px 0;">${startDate}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Durée</td><td style="padding: 8px 0;">${duration} minutes</td></tr>
      </table>
      <p style="color: #6b7280; font-size: 14px;">Connectez-vous à Maestroo pour gérer cette réservation.</p>
    </div>
  `;
}

export async function sendBookingConfirmation(booking: BookingWithRelations): Promise<void> {
  const courseName = booking.course.title;
  const learnerEmail = booking.learner.user.email;
  const teacherEmail = booking.course.teacher.user.email;

  await Promise.all([
    sendEmail({
      to: learnerEmail,
      subject: `Réservation enregistrée — ${courseName}`,
      html: buildLearnerConfirmationHtml(booking),
    }),
    sendEmail({
      to: teacherEmail,
      subject: `Nouvelle réservation — ${courseName}`,
      html: buildTeacherNotificationHtml(booking),
    }),
  ]);
}
