import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { createBookingSchema, deleteBookingSchema, updateBookingSchema } from '~/lib/validation';
import { getLearnerByUserId } from '~/services/learners/get-learner.server';
import { createBooking } from '~/services/bookings/create-booking.server';
import {
  getBooking,
  getBookingsByAvailabilityId,
  getBookingsByCourseId,
  getBookingsByLearnerId,
  getBookingsByTeacherId,
} from '~/services/bookings/get-bookings.server';
import { updateBooking } from '~/services/bookings/update-booking.server';
import { deleteBooking } from '~/services/bookings/delete-booking.server';

export async function loader({ request }: LoaderFunctionArgs) {
  await authentifyUser(request);

  const url = new URL(request.url);
  const bookingId = url.searchParams.get('id');
  const learnerId = url.searchParams.get('learnerId');
  const teacherId = url.searchParams.get('teacherId');
  const courseId = url.searchParams.get('courseId');
  const availabilityId = url.searchParams.get('availabilityId');

  if (bookingId) {
    const result = await getBooking(bookingId);
    if (!result.success || !result.booking) {
      return data({ error: result.error ?? 'Booking not found' }, { status: 404 });
    }
    return result;
  }

  if (learnerId) {
    return getBookingsByLearnerId(learnerId);
  }

  if (teacherId) {
    return getBookingsByTeacherId(teacherId);
  }

  if (courseId) {
    return getBookingsByCourseId(courseId);
  }

  if (availabilityId) {
    return getBookingsByAvailabilityId(availabilityId);
  }

  return data({ error: 'Booking ID or filter required' }, { status: 400 });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await authentifyUser(request);
  const method = request.method.toUpperCase();

  switch (method) {
    case 'POST': {
      const body = await request.json();
      const parsed = createBookingSchema.safeParse(body);

      if (!parsed.success) {
        return data({ success: false, error: parsed.error.issues.map((e) => e.message).join(', ') }, { status: 400 });
      }

      const learnerResult = await getLearnerByUserId(session.user.id);
      if (!learnerResult.success || !learnerResult.learner) {
        return data({ success: false, error: 'Apprenant introuvable.' }, { status: 403 });
      }

      if (learnerResult.learner.id !== parsed.data.learnerId) {
        return data({ success: false, error: 'Non autorise.' }, { status: 403 });
      }

      const result = await createBooking(parsed.data);
      return data(result, { status: result.success ? 201 : 400 });
    }

    case 'PUT': {
      const url = new URL(request.url);
      const bookingId = url.searchParams.get('id');

      if (!bookingId) {
        return data({ success: false, error: 'Booking ID required' }, { status: 400 });
      }

      const body = await request.json();
      const parsed = updateBookingSchema.safeParse(body);

      if (!parsed.success) {
        return data({ success: false, error: parsed.error.issues.map((e) => e.message).join(', ') }, { status: 400 });
      }

      const result = await updateBooking(bookingId, parsed.data);
      return data(result, { status: result.success ? 200 : 404 });
    }

    case 'DELETE': {
      const url = new URL(request.url);
      const bookingId = url.searchParams.get('id');

      if (!bookingId) {
        const body = await request.json();
        const parsed = deleteBookingSchema.safeParse(body);

        if (!parsed.success) {
          return data({ success: false, error: parsed.error.issues.map((e) => e.message).join(', ') }, { status: 400 });
        }

        const result = await deleteBooking(parsed.data.id);
        return data(result, { status: result.success ? 200 : 404 });
      }

      const result = await deleteBooking(bookingId);
      return data(result, { status: result.success ? 200 : 404 });
    }

    default:
      return data({ error: 'Method not allowed' }, { status: 405 });
  }
}
