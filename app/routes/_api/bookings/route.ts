import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { createBookingRequestSchema, updateBookingSchema } from '~/lib/validation';
import { getLearnerByUserId } from '~/services/learners/get-learner';
import { getTeacherByUserId } from '~/services/teachers/get-teacher';
import { createBooking } from '~/services/bookings/create-booking';
import { createLearner } from '~/services/learners/create-learner';

import {
  getBooking,
  getBookingsByAvailabilityId,
  getBookingsByCourseId,
  getBookingsByLearnerId,
  getBookingsByTeacherId,
} from '~/services/bookings/get-bookings';
import { getCourseById } from '~/services/courses/get-course';
import { getAvailability } from '~/services/availabilities/get-availability';
import { updateBooking } from '~/services/bookings/update-booking';
import { deleteBooking } from '~/services/bookings/delete-booking';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request);

  const url = new URL(request.url);
  const bookingId = url.searchParams.get('id');
  const learnerId = url.searchParams.get('learnerId');
  const teacherId = url.searchParams.get('teacherId');
  const courseId = url.searchParams.get('courseId');
  const availabilityId = url.searchParams.get('availabilityId');

  const [learnerResult, teacherResult] = await Promise.all([
    getLearnerByUserId(session.user.id),
    getTeacherByUserId(session.user.id),
  ]);

  const currentLearnerId = learnerResult.success && learnerResult.learner ? learnerResult.learner.id : null;
  const currentTeacherId = teacherResult.success && teacherResult.teacher ? teacherResult.teacher.id : null;

  if (bookingId) {
    const result = await getBooking(bookingId);
    if (!result.success || !result.booking) {
      return data({ error: 'Réservation introuvable' }, { status: 404 });
    }

    const isLearnerOwner = currentLearnerId !== null && result.booking.learnerId === currentLearnerId;

    const isTeacherOwner =
      currentTeacherId !== null &&
      (result.booking.course.teacherId === currentTeacherId ||
        result.booking.availability.teacherId === currentTeacherId);

    if (!isLearnerOwner && !isTeacherOwner) {
      return data({ error: 'Non autorisé.' }, { status: 403 });
    }

    return result;
  }

  if (learnerId) {
    if (!currentLearnerId || learnerId !== currentLearnerId) {
      return data({ error: 'Non autorisé.' }, { status: 403 });
    }

    return getBookingsByLearnerId(currentLearnerId);
  }

  if (teacherId) {
    if (!currentTeacherId || teacherId !== currentTeacherId) {
      return data({ error: 'Non autorisé.' }, { status: 403 });
    }

    return getBookingsByTeacherId(currentTeacherId);
  }

  if (courseId) {
    if (!currentTeacherId) {
      return data({ error: 'Non autorisé.' }, { status: 403 });
    }

    const courseResult = await getCourseById(courseId);
    if (!courseResult.success || !courseResult.course) {
      return data({ error: 'Cours introuvable' }, { status: 404 });
    }

    if (courseResult.course.teacherId !== currentTeacherId) {
      return data({ error: 'Non autorisé.' }, { status: 403 });
    }

    return getBookingsByCourseId(courseId);
  }

  if (availabilityId) {
    if (!currentTeacherId) {
      return data({ error: 'Non autorisé.' }, { status: 403 });
    }

    const availabilityResult = await getAvailability(availabilityId);
    if (!availabilityResult.success || !availabilityResult.availability) {
      return data({ error: 'Disponibilité introuvable' }, { status: 404 });
    }

    if (availabilityResult.availability.teacherId !== currentTeacherId) {
      return data({ error: 'Non autorisé.' }, { status: 403 });
    }

    return getBookingsByAvailabilityId(availabilityId);
  }

  return data({ error: 'ID de réservation ou filtre requis' }, { status: 400 });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await authentifyUser(request);
  const method = request.method.toUpperCase();

  const [learnerResult, teacherResult] = await Promise.all([
    getLearnerByUserId(session.user.id),
    getTeacherByUserId(session.user.id),
  ]);

  const currentLearnerId = learnerResult.success && learnerResult.learner ? learnerResult.learner.id : null;
  const currentTeacherId = teacherResult.success && teacherResult.teacher ? teacherResult.teacher.id : null;

  switch (method) {
    case 'POST': {
      const body = await request.json();
      const parsed = createBookingRequestSchema.safeParse(body);

      if (!parsed.success) {
        return data(
          {
            success: false,

            error: parsed.error.issues.map((e) => e.message).join(', '),
          },
          { status: 400 },
        );
      }

      const [courseResult, availabilityResult, availabilityBookingsResult] = await Promise.all([
        getCourseById(parsed.data.courseId),
        getAvailability(parsed.data.availabilityId),
        getBookingsByAvailabilityId(parsed.data.availabilityId),
      ]);

      if (!courseResult.success || !courseResult.course) {
        return data({ success: false, error: 'Cours introuvable.' }, { status: 404 });
      }

      if (!availabilityResult.success || !availabilityResult.availability) {
        return data({ success: false, error: 'Disponibilité introuvable.' }, { status: 404 });
      }

      if (!availabilityBookingsResult.success) {
        return data({ success: false, error: availabilityBookingsResult.error }, { status: 500 });
      }

      if (currentTeacherId && courseResult.course.teacherId === currentTeacherId) {
        return data({ success: false, error: 'Vous ne pouvez pas réserver votre propre cours.' }, { status: 403 });
      }

      let learnerId = currentLearnerId;

      if (!learnerId) {
        const learnerCreationResult = await createLearner({ userId: session.user.id });

        if (!learnerCreationResult.success) {
          return data({ success: false, error: learnerCreationResult.error }, { status: 500 });
        }

        learnerId = learnerCreationResult.learner.id;
      }

      const startTime = parsed.data.startTime;
      const endTime = parsed.data.endTime;
      const courseDurationMs = courseResult.course.duration * 60 * 1000;
      const requestedDurationMs = endTime.getTime() - startTime.getTime();

      if (courseResult.course.teacherId !== availabilityResult.availability.teacherId) {
        return data({ success: false, error: 'Ce créneau ne correspond pas à ce cours.' }, { status: 400 });
      }

      if (
        startTime < availabilityResult.availability.startTime ||
        endTime > availabilityResult.availability.endTime ||
        startTime >= endTime
      ) {
        return data({ success: false, error: 'Le créneau sélectionné est invalide.' }, { status: 400 });
      }

      if (requestedDurationMs !== courseDurationMs) {
        return data(
          { success: false, error: 'La durée du créneau ne correspond pas à celle du cours.' },
          { status: 400 },
        );
      }

      const hasConflict = availabilityBookingsResult.bookings.some(
        (booking) =>
          ['pending', 'confirmed'].includes(booking.status) &&
          booking.endTime > startTime &&
          booking.startTime < endTime,
      );

      if (hasConflict) {
        return data({ success: false, error: 'Ce créneau vient déjà d’être réservé.' }, { status: 409 });
      }

      const result = await createBooking({
        ...parsed.data,
        learnerId,
        priceAtBooking: String(courseResult.course.price),
        status: 'pending',
      });
      return data(result, { status: result.success ? 201 : 400 });
    }

    case 'PUT': {
      const url = new URL(request.url);
      const bookingId = url.searchParams.get('id');

      if (!bookingId) {
        return data({ success: false, error: 'ID de réservation requis' }, { status: 400 });
      }

      const bookingResult = await getBooking(bookingId);
      if (!bookingResult.success || !bookingResult.booking) {
        return data({ success: false, error: 'Réservation introuvable.' }, { status: 404 });
      }

      const isLearnerOwner = currentLearnerId !== null && bookingResult.booking.learnerId === currentLearnerId;
      const isTeacherOwner =
        currentTeacherId !== null &&
        (bookingResult.booking.course.teacherId === currentTeacherId ||
          bookingResult.booking.availability.teacherId === currentTeacherId);

      if (!isLearnerOwner && !isTeacherOwner) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
      }

      const body = await request.json();
      const parsed = updateBookingSchema.safeParse(body);

      if (!parsed.success) {
        return data(
          {
            success: false,
            error: parsed.error.issues.map((e) => e.message).join(', '),
          },
          { status: 400 },
        );
      }

      const result = await updateBooking(bookingId, parsed.data);
      return data(result, { status: result.success ? 200 : 404 });
    }

    case 'DELETE': {
      const url = new URL(request.url);
      const bookingId = url.searchParams.get('id');

      if (!bookingId) {
        return data({ success: false, error: 'ID de réservation requis' }, { status: 400 });
      }

      const bookingResult = await getBooking(bookingId);
      if (!bookingResult.success || !bookingResult.booking) {
        return data({ success: false, error: 'Réservation introuvable.' }, { status: 404 });
      }

      const isLearnerOwner = currentLearnerId !== null && bookingResult.booking.learnerId === currentLearnerId;
      const isTeacherOwner =
        currentTeacherId !== null &&
        (bookingResult.booking.course.teacherId === currentTeacherId ||
          bookingResult.booking.availability.teacherId === currentTeacherId);

      if (!isLearnerOwner && !isTeacherOwner) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
      }

      const result = await deleteBooking(bookingId);
      return data(result, { status: result.success ? 200 : 404 });
    }

    default:
      return data({ error: 'Method not allowed' }, { status: 405 });
  }
}
