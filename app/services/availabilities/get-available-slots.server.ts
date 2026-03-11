import type { AvailableSlot, GetAvailableSlotsResponse } from '../types';
import { getAvailabilityByTeacherId } from './get-availability.server';
import { getBookingsByTeacherId } from '../bookings/get-bookings.server';

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

    const slots = availabilitiesResult.availabilities.flatMap((availability) => {
      const availabilityStart = availability.startTime;
      const availabilityEnd = availability.endTime;

      const overlappingBookings = bookingsResult.bookings
        .filter((booking) => booking.availabilityId === availability.id)
        .filter((booking) => booking.endTime > availabilityStart && booking.startTime < availabilityEnd)
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

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

    const minDurationMs = Math.max(0, minDurationMinutes) * 60 * 1000;
    const filteredSlots = minDurationMs
      ? slots.filter((slot) => slot.endTime.getTime() - slot.startTime.getTime() >= minDurationMs)
      : slots;

    return {
      success: true,
      availabilities: filteredSlots,
    };
  } catch (error) {
    console.error('Error computing available slots for teacher:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des disponibilités.",
    };
  }
}
