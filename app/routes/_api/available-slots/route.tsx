import type { LoaderFunctionArgs } from 'react-router';
import { getAvailableSlots } from '~/services/availabilities/get-available-slots.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const teacherId = url.searchParams.get('teacherId');
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
  const minDurationMinutes = Number(url.searchParams.get('minDurationMinutes') ?? '0');

  return getAvailableSlots(teacherId || '', Number.isFinite(minDurationMinutes) ? minDurationMinutes : 0);
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)
}
