import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user';
import { ratingFormSchema, updateRatingSchema } from '~/lib/validation';
import { getLearnerByUserId } from '~/services/learners/get-learner';
import { hasCompletedBookingWithTeacher } from '~/services/bookings/get-bookings';
import { getRatingsByTeacher, getRatingById, getRatingByLearnerAndTeacher } from '~/services/ratings/get-ratings';
import { createRating } from '~/services/ratings/create-rating';
import { updateRating } from '~/services/ratings/update-rating';
import { deleteRating } from '~/services/ratings/delete-rating';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const teacherId = url.searchParams.get('teacherId');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '20'), 50);

  if (teacherId) {
    const result = await getRatingsByTeacher(teacherId, limit);
    return data(result, { status: result.success ? 200 : 500 });
  }

  return data({ success: false, error: 'teacherId requis' }, { status: 400 });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await authentifyUser(request);
  const method = request.method.toUpperCase();

  const learnerResult = await getLearnerByUserId(session.user.id);
  const currentLearnerId = learnerResult.success && learnerResult.learner ? learnerResult.learner.id : null;

  switch (method) {
    case 'POST': {
      if (!currentLearnerId) {
        return data({ success: false, error: 'Profil apprenant requis pour publier un avis.' }, { status: 403 });
      }

      const body = await request.json();
      const parsed = ratingFormSchema.safeParse(body);

      if (!parsed.success) {
        return data({ success: false, error: parsed.error.issues.map((e) => e.message).join(', ') }, { status: 400 });
      }

      const completedCheck = await hasCompletedBookingWithTeacher(currentLearnerId, parsed.data.teacherId);
      if (!completedCheck.success) {
        return data({ success: false, error: completedCheck.error }, { status: 500 });
      }

      if (!completedCheck.exists) {
        return data(
          { success: false, error: 'Un cours terminé avec ce professeur est requis pour laisser un avis.' },
          { status: 403 },
        );
      }

      const existingRatingResult = await getRatingByLearnerAndTeacher(currentLearnerId, parsed.data.teacherId);
      if (!existingRatingResult.success) {
        return data({ success: false, error: existingRatingResult.error }, { status: 500 });
      }

      if (existingRatingResult.rating) {
        return data({ success: false, error: 'Vous avez déjà noté ce professeur.' }, { status: 409 });
      }

      const result = await createRating({
        id: crypto.randomUUID(),
        ...parsed.data,
        learnerId: currentLearnerId,
      });

      return data(result, { status: result.success ? 201 : 400 });
    }

    case 'PUT': {
      if (!currentLearnerId) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
      }

      const url = new URL(request.url);
      const ratingId = url.searchParams.get('id');

      if (!ratingId) {
        return data({ success: false, error: "ID de l'avis requis." }, { status: 400 });
      }

      const ratingResult = await getRatingById(ratingId);
      if (!ratingResult.success || !ratingResult.rating) {
        return data({ success: false, error: 'Avis introuvable.' }, { status: 404 });
      }

      if (ratingResult.rating.learnerId !== currentLearnerId) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
      }

      const body = await request.json();
      const parsed = updateRatingSchema.safeParse(body);

      if (!parsed.success) {
        return data({ success: false, error: parsed.error.issues.map((e) => e.message).join(', ') }, { status: 400 });
      }

      const result = await updateRating(ratingId, parsed.data);
      return data(result, { status: result.success ? 200 : 400 });
    }

    case 'DELETE': {
      if (!currentLearnerId) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
      }

      const url = new URL(request.url);
      const ratingId = url.searchParams.get('id');

      if (!ratingId) {
        return data({ success: false, error: "ID de l'avis requis." }, { status: 400 });
      }

      const ratingResult = await getRatingById(ratingId);
      if (!ratingResult.success || !ratingResult.rating) {
        return data({ success: false, error: 'Avis introuvable.' }, { status: 404 });
      }

      if (ratingResult.rating.learnerId !== currentLearnerId) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
      }

      const result = await deleteRating(ratingId);
      return data(result, { status: result.success ? 200 : 400 });
    }

    default:
      return data({ error: 'Method not allowed' }, { status: 405 });
  }
}
