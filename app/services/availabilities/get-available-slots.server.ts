import type { GetAvailableSlotsResponse } from '../types';
import { getAvailabilityByTeacherId } from './get-availability.server';
import { getBookingsByTeacherId } from '../bookings/get-bookings.server';

/**
 * Get all available slot for a teacher
 */
export async function getAvailabileSlots(teacherId: string): Promise<GetAvailableSlotsResponse> {
  try {
    const availabilitiesResult = await getAvailabilityByTeacherId(teacherId);
    if (!availabilitiesResult.success) {
      return availabilitiesResult;
    }

    const bookingsResult = await getBookingsByTeacherId(teacherId, ['confirmed', 'pending']);
    if (!bookingsResult.success) {
      return bookingsResult;
    }

    const slots = availabilitiesResult.availabilities.map((availability) => {
      const isBooked = bookingsResult.bookings.some((booking) => booking.availabilityId === availability.id);
      return {
        ...availability,
        isAvailable: !isBooked,
      };
    });

    return {
      success: true,
      availabilities: slots,
    };
  } catch (error) {
    console.error('Error fetching availability by teacher ID:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des disponibilités.",
    };
  }
}
