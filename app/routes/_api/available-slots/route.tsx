import type { LoaderFunctionArgs } from 'react-router';
<<<<<<< HEAD
<<<<<<< HEAD
import { getAvailableSlots } from '~/services/availabilities/get-available-slots.server';
=======
import { getAvailabileSlots } from '~/services/availabilities/get-available-slots.server';
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
import { getAvailableSlots } from '~/services/availabilities/get-available-slots.server';
>>>>>>> 3e5347a (feat(get available slots): create service and api route to get available slots to booking a course)

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const teacherId = url.searchParams.get('teacherId');
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  if (!teacherId) {
    throw new Response('teacherId is required', { status: 400 });
  }
  const minDurationMinutes = Number(url.searchParams.get('minDurationMinutes') ?? '0');

  return getAvailableSlots(
    teacherId || '',
    Number.isFinite(minDurationMinutes) ? minDurationMinutes : 0,
  );
=======
=======
  if (!teacherId) {
    throw new Response('teacherId is required', { status: 400 });
  }
>>>>>>> 3b88034 (feat(api): enhance booking and slot management)
=======
  if (!teacherId) {
    throw new Response('teacherId is required', { status: 400 });
  }
>>>>>>> d823109 (feat(api): enhance booking and slot management)
  const minDurationMinutes = Number(url.searchParams.get('minDurationMinutes') ?? '0');

  return getAvailableSlots(teacherId || '', Number.isFinite(minDurationMinutes) ? minDurationMinutes : 0);
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)
=======

  return getAvailabileSlots(teacherId || '');
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
  const minDurationMinutes = Number(url.searchParams.get('minDurationMinutes') ?? '0');

  return getAvailableSlots(teacherId || '', Number.isFinite(minDurationMinutes) ? minDurationMinutes : 0);
>>>>>>> 3e5347a (feat(get available slots): create service and api route to get available slots to booking a course)
}
