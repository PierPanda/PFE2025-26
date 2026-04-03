import type { AvailableSlot, GetAvailableSlotsResponse } from '../types';
import { getAvailabilityByTeacherId } from './get-availability';
import { getBookingsByTeacherId } from '../bookings/get-bookings';

function splitIntervalIntoCourseSlots(slot: AvailableSlot, courseDurationMs: number): AvailableSlot[] {
  if (courseDurationMs <= 0) {
    return [slot];
  }

  const courseSlots: AvailableSlot[] = [];
  let cursor = new Date(slot.startTime);

  while (cursor.getTime() + courseDurationMs <= slot.endTime.getTime()) {
    const nextEnd = new Date(cursor.getTime() + courseDurationMs);

    courseSlots.push({
      availabilityId: slot.availabilityId,
      teacherId: slot.teacherId,
      startTime: new Date(cursor),
      endTime: nextEnd,
    });

    cursor = nextEnd;
  }

  return courseSlots;
}

/**
 * Get all available slot for a teacher
 */
export async function getAvailableSlots(teacherId: string, minDurationMinutes = 0): Promise<GetAvailableSlotsResponse> {
  try {
    const availabilitiesResult = await getAvailabilityByTeacherId(teacherId);
    if (!availabilitiesResult.success) {
      return availabilitiesResult;
    }

    const bookingsResult = await getBookingsByTeacherId(teacherId, ['confirmed', 'pending']);
    if (!bookingsResult.success) {
      return bookingsResult;
    }

    // Séparer règles (disponibilités normales) et exceptions (blocages)
    const rules = availabilitiesResult.availabilities.filter((a) => !a.isException);
    const exceptions = availabilitiesResult.availabilities.filter((a) => a.isException);

    const bookingsByAvailabilityId = new Map<string, (typeof bookingsResult.bookings)[number][]>();

    for (const booking of bookingsResult.bookings) {
      const availabilityBookings = bookingsByAvailabilityId.get(booking.availabilityId);

      if (availabilityBookings) {
        availabilityBookings.push(booking);
      } else {
        bookingsByAvailabilityId.set(booking.availabilityId, [booking]);
      }
    }

    for (const availabilityBookings of bookingsByAvailabilityId.values()) {
      availabilityBookings.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    }

    const rawSlots = rules.flatMap((availability) => {
      const availabilityStart = availability.startTime;
      const availabilityEnd = availability.endTime;

      const overlappingBookings = (bookingsByAvailabilityId.get(availability.id) ?? []).filter(
        (booking) => booking.endTime > availabilityStart && booking.startTime < availabilityEnd,
      );

      if (overlappingBookings.length === 0) {
        return [
          {
            availabilityId: availability.id,
            teacherId: availability.teacherId,
            startTime: availabilityStart,
            endTime: availabilityEnd,
          },
        ];
      }

      const remainingSlots: AvailableSlot[] = [];
      let cursor = availabilityStart;

      for (const booking of overlappingBookings) {
        const bookingStart = booking.startTime > availabilityStart ? booking.startTime : availabilityStart;
        const bookingEnd = booking.endTime < availabilityEnd ? booking.endTime : availabilityEnd;

        if (bookingStart > cursor) {
          remainingSlots.push({
            availabilityId: availability.id,
            teacherId: availability.teacherId,
            startTime: cursor,
            endTime: bookingStart,
          });
        }

        if (bookingEnd > cursor) {
          cursor = bookingEnd;
        }
      }

      if (cursor < availabilityEnd) {
        remainingSlots.push({
          availabilityId: availability.id,
          teacherId: availability.teacherId,
          startTime: cursor,
          endTime: availabilityEnd,
        });
      }

      return remainingSlots;
    });

    const slots = rawSlots.flatMap((slot) => {
      // Trouver les exceptions qui chevauchent ce créneau
      const overlappingExceptions = exceptions
        .filter((ex) => ex.endTime > slot.startTime && ex.startTime < slot.endTime)
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      // S'il n'y a pas d'exception qui chevauche ce créneau, on le garde tel quel
      if (overlappingExceptions.length === 0) {
        return [slot];
      }

      const remaining: AvailableSlot[] = [];
      let cursor = slot.startTime;

      for (const ex of overlappingExceptions) {
        const exStart = ex.startTime > slot.startTime ? ex.startTime : slot.startTime;
        const exEnd = ex.endTime < slot.endTime ? ex.endTime : slot.endTime;

        // Si l'exception laisse un trou avant elle, on ajoute ce créneau disponible
        if (exStart > cursor) {
          remaining.push({
            availabilityId: slot.availabilityId,
            teacherId: slot.teacherId,
            startTime: cursor,
            endTime: exStart,
          });
        }

        // Avancer le curseur à la fin effective de l'exception dans le créneau
        if (exEnd > cursor) {
          cursor = exEnd;
        }
      }

      // Si après la dernière exception il reste du temps disponible, on l'ajoute
      if (cursor < slot.endTime) {
        remaining.push({
          availabilityId: slot.availabilityId,
          teacherId: slot.teacherId,
          startTime: cursor,
          endTime: slot.endTime,
        });
      }

      return remaining;
    });

    const courseDurationMs = Math.max(0, minDurationMinutes) * 60 * 1000;
    const formattedSlots = courseDurationMs
      ? slots.flatMap((slot) => splitIntervalIntoCourseSlots(slot, courseDurationMs))
      : slots;

    return {
      success: true,
      slots: formattedSlots,
    };
  } catch (error) {
    console.error('Error computing available slots for teacher:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des disponibilités.",
    };
  }
}
