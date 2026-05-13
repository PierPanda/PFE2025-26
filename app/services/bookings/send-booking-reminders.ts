import { and, eq, gte, isNull, lte, sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings } from '~/server/lib/db/schema';
import { sendBookingReminder } from '~/services/emails/send-booking-reminder';
import type { SendBookingRemindersResponse } from '../types';

const bookingRelations = {
  course: {
    with: {
      teacher: {
        with: {
          user: true,
        },
      },
    },
  },
  learner: {
    with: {
      user: true,
    },
  },
} as const;

// Find confirmed bookings starting in 23–25h with no reminder sent yet, send reminder, mark as sent
export async function sendBookingReminders(): Promise<SendBookingRemindersResponse> {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const pendingReminders = await db.query.bookings.findMany({
      where: and(
        eq(bookings.status, 'confirmed'),
        gte(bookings.startTime, windowStart),
        lte(bookings.startTime, windowEnd),
        isNull(bookings.reminderSentAt),
      ),
      with: bookingRelations,
    });

    if (pendingReminders.length === 0) {
      return { success: true, sent: 0 };
    }

    await Promise.all(
      pendingReminders.map(async (booking) => {
        await sendBookingReminder(booking);
        await db
          .update(bookings)
          .set({ reminderSentAt: sql`NOW()` })
          .where(eq(bookings.id, booking.id));
      }),
    );

    return { success: true, sent: pendingReminders.length };
  } catch (error) {
    console.error('Error sending booking reminders:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de l'envoi des rappels.",
    };
  }
}
