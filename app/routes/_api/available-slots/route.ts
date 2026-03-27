import type { LoaderFunctionArgs } from 'react-router';
import { getAvailableSlots } from '~/services/availabilities/get-available-slots';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const teacherId = url.searchParams.get('teacherId');
  if (!teacherId) {
    throw new Response('teacherId is required', { status: 400 });
  }
  const minDurationMinutes = Number(url.searchParams.get('minDurationMinutes') ?? '0');

  return getAvailableSlots(teacherId || '', Number.isFinite(minDurationMinutes) ? minDurationMinutes : 0);
}
