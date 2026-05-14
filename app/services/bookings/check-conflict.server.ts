import { and, eq, gt, lt, ne, or } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings } from '~/server/lib/db/schema';
import type { DbBooking } from '~/services/types';

export async function checkBookingConflict(data: {
  availabilityId: string;
  startTime: Date;
  endTime: Date;
  excludeBookingId?: string;
}): Promise<DbBooking | null> {
  const conditions = [
    eq(bookings.availabilityId, data.availabilityId),
    or(eq(bookings.status, 'pending'), eq(bookings.status, 'confirmed')),
    lt(bookings.startTime, data.endTime),
    gt(bookings.endTime, data.startTime),
  ];

  if (data.excludeBookingId) {
    conditions.push(ne(bookings.id, data.excludeBookingId));
  }

  const [conflict] = await db
    .select()
    .from(bookings)
    .where(and(...conditions))
    .limit(1);

  return conflict ?? null;
}
