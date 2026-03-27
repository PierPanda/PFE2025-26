import { Button } from '@heroui/react';
import { Link, data, type LoaderFunctionArgs, useLoaderData } from 'react-router';
import { formatDateTime, formatPrice } from '~/lib/utils';
import { getBooking } from '~/services/bookings/get-bookings';
import { getLearnerByUserId } from '~/services/learners/get-learner';
import { authentifyUser } from '~/server/utils/authentify-user.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });
  const bookingId = params.id;

  if (!bookingId) {
    throw new Response('ID de réservation manquant', { status: 400 });
  }

  const [learnerResult, bookingResult] = await Promise.all([
    getLearnerByUserId(session.user.id),
    getBooking(bookingId),
  ]);

  if (!learnerResult.success || !learnerResult.learner) {
    throw new Response('Apprenant introuvable', { status: 403 });
  }

  if (!bookingResult.success || !bookingResult.booking) {
    throw new Response('Réservation introuvable', { status: 404 });
  }

  if (bookingResult.booking.learnerId !== learnerResult.learner.id) {
    throw new Response('Non autorisé', { status: 403 });
  }

  return data({ booking: bookingResult.booking });
}

export default function CheckoutPage() {
  const { booking } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-3xl border border-brand/15 bg-white p-8 shadow-lg shadow-brand/5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Checkout</p>
          <h1 className="text-3xl font-bold text-brand-dark">Réservation enregistrée</h1>
          <p className="text-brand-dark/70">
            Votre réservation a été créée avec le statut <span className="font-semibold">pending</span>. L’étape de
            paiement peut maintenant prendre le relais.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-brand/15 bg-brand-tertiary/40 p-5">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-brand-dark/60">Cours</p>
              <p className="font-semibold text-brand-dark">{booking.course.title}</p>
            </div>
            <div>
              <p className="text-sm text-brand-dark/60">Date et heure</p>
              <p className="font-semibold text-brand-dark">{formatDateTime(booking.startTime)}</p>
            </div>
            <div>
              <p className="text-sm text-brand-dark/60">Prix</p>
              <p className="text-xl font-bold text-brand-dark">{formatPrice(booking.priceAtBooking)}</p>
            </div>
            <div>
              <p className="text-sm text-brand-dark/60">Référence</p>
              <p className="font-mono text-sm text-brand-dark/70">{booking.id}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button as={Link} to="/" className="bg-brand-secondary font-semibold text-brand-dark">
            Retour à l'accueil
          </Button>
          <Button as={Link} to="/profile" variant="light">
            Voir mes réservations
          </Button>
        </div>
      </div>
    </main>
  );
}
