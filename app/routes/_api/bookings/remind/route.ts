import { data, type ActionFunctionArgs } from 'react-router';
import { env } from '~/server/utils/env';
import { sendBookingReminders } from '~/services/bookings/send-booking-reminders';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method.toUpperCase() !== 'POST') {
    return data({ error: 'Method not allowed' }, { status: 405 });
  }

  const expectedSecret = env.BOOKINGS_REMIND_CRON_SECRET;
  if (!expectedSecret) {
    return data({ success: false, error: 'Endpoint non configuré.' }, { status: 503 });
  }

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (bearerToken !== expectedSecret) {
    return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
  }

  const result = await sendBookingReminders();
  return data(result, { status: result.success ? 200 : 500 });
}
