import { data, type ActionFunctionArgs } from 'react-router';
import { env } from '~/server/utils/env';
import { cancelExpiredBookings } from '~/services/cron/cancel-expired-bookings';

/**
 * POST /api/cron
 *
 * Triggers all scheduled cron tasks.
 * Protected by the `Authorization: Bearer <CRON_SECRET>` header.
 *
 * Designed to be called by an external scheduler (e.g. Vercel Cron Jobs,
 * GitHub Actions, Upstash, etc.) at a regular interval.
 */
export async function action({ request }: ActionFunctionArgs) {
  if (!env.CRON_SECRET) {
    return data({ error: 'Cron non configuré.' }, { status: 503 });
  }

  const authHeader = request.headers.get('Authorization');
  const expectedToken = `Bearer ${env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return data({ error: 'Non autorisé.' }, { status: 401 });
  }

  const cancelExpiredResult = await cancelExpiredBookings();

  return data(
    {
      success: true,
      tasks: {
        cancelExpiredBookings: cancelExpiredResult,
      },
    },
    { status: 200 },
  );
}
