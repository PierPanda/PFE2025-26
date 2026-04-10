import { data, type ActionFunctionArgs } from 'react-router';
import { completeExpiredBookings } from '~/services/bookings/complete-booking';

function isCronAuthorized(request: Request): boolean {
  const expectedSecret = process.env.BOOKINGS_COMPLETE_CRON_SECRET;
  if (!expectedSecret) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const headerSecret = request.headers.get('x-cron-secret');

  return bearerToken === expectedSecret || headerSecret === expectedSecret;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method.toUpperCase() !== 'POST') {
    return data({ error: 'Method not allowed' }, { status: 405 });
  }

  if (!isCronAuthorized(request)) {
    return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
  }

  const result = await completeExpiredBookings();
  return data(result, { status: result.success ? 200 : 500 });
}
