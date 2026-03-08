import type { LoaderFunctionArgs } from 'react-router';
import { getAvailabileSlots } from '~/services/availabilities/get-available-slots.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const teacherId = url.searchParams.get('teacherId');

  return getAvailabileSlots(teacherId || '');
}
