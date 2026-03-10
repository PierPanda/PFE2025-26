<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import type { AvailableSlot, GetAvailableSlotsResponse } from '../types';
=======
import type { GetAvailableSlotsResponse } from '../types';
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
import type { AvailableSlot, GetAvailableSlotsResponse } from '../types';
>>>>>>> 3e5347a (feat(get available slots): create service and api route to get available slots to booking a course)
=======
import type { AvailableSlot, GetAvailableSlotsResponse } from '../types';
>>>>>>> 6e696d5 (feat(get available slots): create service and api route to get available slots to booking a course)
=======
import type { GetAvailableSlotsResponse } from '../types';
>>>>>>> 144a161 (feat(bookings): implement booking management features)
=======
import type { AvailableSlot, GetAvailableSlotsResponse } from '../types';
>>>>>>> ed94af3 (feat(get available slots): create service and api route to get available slots to booking a course)
import { getAvailabilityByTeacherId } from './get-availability.server';
import { getBookingsByTeacherId } from '../bookings/get-bookings.server';

/**
 * Get all available slot for a teacher
 */
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 6e696d5 (feat(get available slots): create service and api route to get available slots to booking a course)
export async function getAvailableSlots(
  teacherId: string,
  minDurationMinutes = 0,
): Promise<GetAvailableSlotsResponse> {
<<<<<<< HEAD
=======
export async function getAvailableSlots(teacherId: string, minDurationMinutes = 0): Promise<GetAvailableSlotsResponse> {
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)
=======
export async function getAvailabileSlots(teacherId: string): Promise<GetAvailableSlotsResponse> {
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
export async function getAvailableSlots(teacherId: string, minDurationMinutes = 0): Promise<GetAvailableSlotsResponse> {
>>>>>>> 3e5347a (feat(get available slots): create service and api route to get available slots to booking a course)
=======
>>>>>>> 6e696d5 (feat(get available slots): create service and api route to get available slots to booking a course)
  try {
    const availabilitiesResult = await getAvailabilityByTeacherId(teacherId);
    if (!availabilitiesResult.success) {
      return availabilitiesResult;
    }

    const bookingsResult = await getBookingsByTeacherId(teacherId, ['confirmed', 'pending']);
    if (!bookingsResult.success) {
      return bookingsResult;
    }

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3e5347a (feat(get available slots): create service and api route to get available slots to booking a course)
=======
>>>>>>> 6e696d5 (feat(get available slots): create service and api route to get available slots to booking a course)
    const slots = availabilitiesResult.availabilities.flatMap((availability) => {
      const availabilityStart = availability.startTime;
      const availabilityEnd = availability.endTime;

      const overlappingBookings = bookingsResult.bookings
        .filter((booking) => booking.availabilityId === availability.id)
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        .filter(
          (booking) => booking.endTime > availabilityStart && booking.startTime < availabilityEnd,
        )
=======
        .filter((booking) => booking.endTime > availabilityStart && booking.startTime < availabilityEnd)
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)
=======
        .filter((booking) => booking.endTime > availabilityStart && booking.startTime < availabilityEnd)
>>>>>>> 3e5347a (feat(get available slots): create service and api route to get available slots to booking a course)
=======
        .filter(
          (booking) => booking.endTime > availabilityStart && booking.startTime < availabilityEnd,
        )
>>>>>>> 6e696d5 (feat(get available slots): create service and api route to get available slots to booking a course)
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        const bookingStart =
          booking.startTime > availabilityStart ? booking.startTime : availabilityStart;
=======
        const bookingStart = booking.startTime > availabilityStart ? booking.startTime : availabilityStart;
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)
=======
        const bookingStart = booking.startTime > availabilityStart ? booking.startTime : availabilityStart;
>>>>>>> 3e5347a (feat(get available slots): create service and api route to get available slots to booking a course)
=======
        const bookingStart =
          booking.startTime > availabilityStart ? booking.startTime : availabilityStart;
>>>>>>> 6e696d5 (feat(get available slots): create service and api route to get available slots to booking a course)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 6e696d5 (feat(get available slots): create service and api route to get available slots to booking a course)
    });

    const minDurationMs = Math.max(0, minDurationMinutes) * 60 * 1000;
    const filteredSlots = minDurationMs
      ? slots.filter((slot) => slot.endTime.getTime() - slot.startTime.getTime() >= minDurationMs)
      : slots;

    return {
      success: true,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      slots: filteredSlots,
=======
      availabilities: filteredSlots,
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)
=======
      slots: filteredSlots,
>>>>>>> 3b88034 (feat(api): enhance booking and slot management)
    };
  } catch (error) {
    console.error('Error computing available slots for teacher:', error);
=======
    const slots = availabilitiesResult.availabilities.map((availability) => {
      const isBooked = bookingsResult.bookings.some((booking) => booking.availabilityId === availability.id);
      return {
        ...availability,
        isAvailable: !isBooked,
      };
=======
>>>>>>> 3e5347a (feat(get available slots): create service and api route to get available slots to booking a course)
    });

    const minDurationMs = Math.max(0, minDurationMinutes) * 60 * 1000;
    const filteredSlots = minDurationMs
      ? slots.filter((slot) => slot.endTime.getTime() - slot.startTime.getTime() >= minDurationMs)
      : slots;

    return {
      success: true,
      slots: filteredSlots,
    };
  } catch (error) {
    console.error('Error fetching availability by teacher ID:', error);
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
      availabilities: filteredSlots,
=======
      slots: filteredSlots,
>>>>>>> 7a9389b (feat(api): enhance booking and slot management)
    };
  } catch (error) {
    console.error('Error fetching availability by teacher ID:', error);
>>>>>>> 6e696d5 (feat(get available slots): create service and api route to get available slots to booking a course)
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des disponibilités.",
    };
  }
}
