import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
<<<<<<< HEAD
<<<<<<< HEAD
import { createBookingSchema, updateBookingSchema } from '~/lib/validation';
import { getLearnerByUserId } from '~/services/learners/get-learner.server';
import { getTeacherByUserId } from '~/services/teachers/get-teacher.server';
=======
import { createBookingSchema, deleteBookingSchema, updateBookingSchema } from '~/lib/validation';
import { getLearnerByUserId } from '~/services/learners/get-learner.server';
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
import { createBookingSchema, updateBookingSchema } from '~/lib/validation';
import { getLearnerByUserId } from '~/services/learners/get-learner.server';
import { getTeacherByUserId } from '~/services/teachers/get-teacher.server';
>>>>>>> d823109 (feat(api): enhance booking and slot management)
import { createBooking } from '~/services/bookings/create-booking.server';
import {
  getBooking,
  getBookingsByAvailabilityId,
  getBookingsByCourseId,
  getBookingsByLearnerId,
  getBookingsByTeacherId,
} from '~/services/bookings/get-bookings.server';
<<<<<<< HEAD
<<<<<<< HEAD
import { getCourseById } from '~/services/courses/get-course.server';
import { getAvailability } from '~/services/availabilities/get-availability.server';
=======
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
import { getCourseById } from '~/services/courses/get-course.server';
import { getAvailability } from '~/services/availabilities/get-availability.server';
>>>>>>> d823109 (feat(api): enhance booking and slot management)
import { updateBooking } from '~/services/bookings/update-booking.server';
import { deleteBooking } from '~/services/bookings/delete-booking.server';

export async function loader({ request }: LoaderFunctionArgs) {
<<<<<<< HEAD
<<<<<<< HEAD
  const session = await authentifyUser(request);
=======
  await authentifyUser(request);
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
  const session = await authentifyUser(request);
>>>>>>> d823109 (feat(api): enhance booking and slot management)

  const url = new URL(request.url);
  const bookingId = url.searchParams.get('id');
  const learnerId = url.searchParams.get('learnerId');
  const teacherId = url.searchParams.get('teacherId');
  const courseId = url.searchParams.get('courseId');
  const availabilityId = url.searchParams.get('availabilityId');

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
  const [learnerResult, teacherResult] = await Promise.all([
    getLearnerByUserId(session.user.id),
    getTeacherByUserId(session.user.id),
  ]);

<<<<<<< HEAD
<<<<<<< HEAD
  const currentLearnerId =
    learnerResult.success && learnerResult.learner ? learnerResult.learner.id : null;
  const currentTeacherId =
    teacherResult.success && teacherResult.teacher ? teacherResult.teacher.id : null;
=======
  const currentLearnerId = learnerResult.success && learnerResult.learner ? learnerResult.learner.id : null;
  const currentTeacherId = teacherResult.success && teacherResult.teacher ? teacherResult.teacher.id : null;
>>>>>>> 3b88034 (feat(api): enhance booking and slot management)
=======
  const currentLearnerId = learnerResult.success && learnerResult.learner ? learnerResult.learner.id : null;
  const currentTeacherId = teacherResult.success && teacherResult.teacher ? teacherResult.teacher.id : null;
>>>>>>> d823109 (feat(api): enhance booking and slot management)

  if (bookingId) {
    const result = await getBooking(bookingId);
    if (!result.success || !result.booking) {
      return data({ error: 'Réservation introuvable' }, { status: 404 });
    }

<<<<<<< HEAD
<<<<<<< HEAD
    const isLearnerOwner =
      currentLearnerId !== null && result.booking.learnerId === currentLearnerId;
=======
    const isLearnerOwner = currentLearnerId !== null && result.booking.learnerId === currentLearnerId;
>>>>>>> 3b88034 (feat(api): enhance booking and slot management)
=======
    const isLearnerOwner = currentLearnerId !== null && result.booking.learnerId === currentLearnerId;
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    const isTeacherOwner =
      currentTeacherId !== null &&
      (result.booking.course.teacherId === currentTeacherId ||
        result.booking.availability.teacherId === currentTeacherId);

    if (!isLearnerOwner && !isTeacherOwner) {
      return data({ error: 'Non autorisé.' }, { status: 403 });
    }

<<<<<<< HEAD
=======
  if (bookingId) {
    const result = await getBooking(bookingId);
    if (!result.success) {
      return data({ error: result.error }, { status: 404 });
    }
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    return result;
  }

  if (learnerId) {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    if (!currentLearnerId || learnerId !== currentLearnerId) {
      return data({ error: 'Non autorisé.' }, { status: 403 });
    }

    return getBookingsByLearnerId(currentLearnerId);
<<<<<<< HEAD
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

=======
    return getBookingsByLearnerId(learnerId);
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
  }

  if (teacherId) {
    if (!currentTeacherId || teacherId !== currentTeacherId) {
      return data({ error: 'Non autorisé.' }, { status: 403 });
    }

    return getBookingsByTeacherId(currentTeacherId);
  }

  if (courseId) {
<<<<<<< HEAD
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
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

>>>>>>> d823109 (feat(api): enhance booking and slot management)
    return getBookingsByCourseId(courseId);
  }

  if (availabilityId) {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
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

<<<<<<< HEAD
    return getBookingsByAvailabilityId(availabilityId);
  }

  return data({ error: 'ID de réservation ou filtre requis' }, { status: 400 });
=======
    return getBookingsByAvailabilityId(availabilityId);
  }

  return data({ error: 'Booking ID or filter required' }, { status: 400 });
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
    return getBookingsByAvailabilityId(availabilityId);
  }

  return data({ error: 'ID de réservation ou filtre requis' }, { status: 400 });
>>>>>>> d823109 (feat(api): enhance booking and slot management)
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await authentifyUser(request);
  const method = request.method.toUpperCase();

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
  const [learnerResult, teacherResult] = await Promise.all([
    getLearnerByUserId(session.user.id),
    getTeacherByUserId(session.user.id),
  ]);

<<<<<<< HEAD
<<<<<<< HEAD
  const currentLearnerId =
    learnerResult.success && learnerResult.learner ? learnerResult.learner.id : null;
  const currentTeacherId =
    teacherResult.success && teacherResult.teacher ? teacherResult.teacher.id : null;
=======
  const currentLearnerId = learnerResult.success && learnerResult.learner ? learnerResult.learner.id : null;
  const currentTeacherId = teacherResult.success && teacherResult.teacher ? teacherResult.teacher.id : null;
>>>>>>> 3b88034 (feat(api): enhance booking and slot management)

=======
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
  const currentLearnerId = learnerResult.success && learnerResult.learner ? learnerResult.learner.id : null;
  const currentTeacherId = teacherResult.success && teacherResult.teacher ? teacherResult.teacher.id : null;

>>>>>>> d823109 (feat(api): enhance booking and slot management)
  switch (method) {
    case 'POST': {
      const body = await request.json();
      const parsed = createBookingSchema.safeParse(body);

      if (!parsed.success) {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
        return data(
          {
            success: false,
            error: parsed.error.issues.map((e) => e.message).join(', '),
          },
          { status: 400 },
        );
<<<<<<< HEAD
      }

      if (!currentLearnerId) {
        return data({ success: false, error: 'Apprenant introuvable.' }, { status: 403 });
      }

      if (currentLearnerId !== parsed.data.learnerId) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
=======
        return data({ success: false, error: parsed.error.issues.map((e) => e.message).join(', ') }, { status: 400 });
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
      }

      if (!currentLearnerId) {
        return data({ success: false, error: 'Apprenant introuvable.' }, { status: 403 });
      }

<<<<<<< HEAD
      if (learnerResult.learner.id !== parsed.data.learnerId) {
        return data({ success: false, error: 'Non autorise.' }, { status: 403 });
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
      if (currentLearnerId !== parsed.data.learnerId) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
>>>>>>> d823109 (feat(api): enhance booking and slot management)
      }

      const result = await createBooking(parsed.data);
      return data(result, { status: result.success ? 201 : 400 });
    }

    case 'PUT': {
      const url = new URL(request.url);
      const bookingId = url.searchParams.get('id');

      if (!bookingId) {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
        return data({ success: false, error: 'ID de réservation requis' }, { status: 400 });
      }

      const bookingResult = await getBooking(bookingId);
      if (!bookingResult.success || !bookingResult.booking) {
        return data({ success: false, error: 'Réservation introuvable.' }, { status: 404 });
      }

<<<<<<< HEAD
<<<<<<< HEAD
      const isLearnerOwner =
        currentLearnerId !== null && bookingResult.booking.learnerId === currentLearnerId;
=======
      const isLearnerOwner = currentLearnerId !== null && bookingResult.booking.learnerId === currentLearnerId;
>>>>>>> 3b88034 (feat(api): enhance booking and slot management)
=======
      const isLearnerOwner = currentLearnerId !== null && bookingResult.booking.learnerId === currentLearnerId;
>>>>>>> d823109 (feat(api): enhance booking and slot management)
      const isTeacherOwner =
        currentTeacherId !== null &&
        (bookingResult.booking.course.teacherId === currentTeacherId ||
          bookingResult.booking.availability.teacherId === currentTeacherId);

      if (!isLearnerOwner && !isTeacherOwner) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
<<<<<<< HEAD
=======
        return data({ success: false, error: 'Booking ID required' }, { status: 400 });
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
      }

      const body = await request.json();
      const parsed = updateBookingSchema.safeParse(body);

      if (!parsed.success) {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
        return data(
          {
            success: false,
            error: parsed.error.issues.map((e) => e.message).join(', '),
          },
          { status: 400 },
        );
<<<<<<< HEAD
=======
        return data({ success: false, error: parsed.error.issues.map((e) => e.message).join(', ') }, { status: 400 });
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
      }

      const result = await updateBooking(bookingId, parsed.data);
      return data(result, { status: result.success ? 200 : 404 });
    }

    case 'DELETE': {
      const url = new URL(request.url);
      const bookingId = url.searchParams.get('id');

      if (!bookingId) {
<<<<<<< HEAD
<<<<<<< HEAD
        return data({ success: false, error: 'ID de réservation requis' }, { status: 400 });
      }

      const bookingResult = await getBooking(bookingId);
      if (!bookingResult.success || !bookingResult.booking) {
        return data({ success: false, error: 'Réservation introuvable.' }, { status: 404 });
      }

<<<<<<< HEAD
      const isLearnerOwner =
        currentLearnerId !== null && bookingResult.booking.learnerId === currentLearnerId;
=======
      const isLearnerOwner = currentLearnerId !== null && bookingResult.booking.learnerId === currentLearnerId;
>>>>>>> 3b88034 (feat(api): enhance booking and slot management)
      const isTeacherOwner =
        currentTeacherId !== null &&
        (bookingResult.booking.course.teacherId === currentTeacherId ||
          bookingResult.booking.availability.teacherId === currentTeacherId);

      if (!isLearnerOwner && !isTeacherOwner) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
=======
        const body = await request.json();
        const parsed = deleteBookingSchema.safeParse(body);
=======
        return data({ success: false, error: 'ID de réservation requis' }, { status: 400 });
      }
>>>>>>> d823109 (feat(api): enhance booking and slot management)

      const bookingResult = await getBooking(bookingId);
      if (!bookingResult.success || !bookingResult.booking) {
        return data({ success: false, error: 'Réservation introuvable.' }, { status: 404 });
      }

<<<<<<< HEAD
        const result = await deleteBooking(parsed.data.id);
        return data(result, { status: result.success ? 200 : 404 });
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
      const isLearnerOwner = currentLearnerId !== null && bookingResult.booking.learnerId === currentLearnerId;
      const isTeacherOwner =
        currentTeacherId !== null &&
        (bookingResult.booking.course.teacherId === currentTeacherId ||
          bookingResult.booking.availability.teacherId === currentTeacherId);

      if (!isLearnerOwner && !isTeacherOwner) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
>>>>>>> d823109 (feat(api): enhance booking and slot management)
      }

      const result = await deleteBooking(bookingId);
      return data(result, { status: result.success ? 200 : 404 });
    }

    default:
      return data({ error: 'Method not allowed' }, { status: 405 });
  }
}
