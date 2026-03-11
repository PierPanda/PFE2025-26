<<<<<<< HEAD
import {
  data,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { authentifyUser } from "~/server/utils/authentify-user.server";
import {
  createBookingSchema,
  deleteBookingSchema,
  updateBookingSchema,
} from "~/lib/validation";
import { getLearnerByUserId } from "~/services/learners/get-learner.server";
import { createBooking } from "~/services/bookings/create-booking.server";
=======
import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { createBookingSchema, updateBookingSchema } from '~/lib/validation';
import { getLearnerByUserId } from '~/services/learners/get-learner.server';
import { getTeacherByUserId } from '~/services/teachers/get-teacher.server';
import { createBooking } from '~/services/bookings/create-booking.server';
>>>>>>> d823109 (feat(api): enhance booking and slot management)
import {
  getBooking,
  getBookingsByAvailabilityId,
  getBookingsByCourseId,
  getBookingsByLearnerId,
  getBookingsByTeacherId,
<<<<<<< HEAD
} from "~/services/bookings/get-bookings.server";
import { getCourseById } from "~/services/courses/get-course.server";
import { getAvailability } from "~/services/availabilities/get-availability.server";
import { updateBooking } from "~/services/bookings/update-booking.server";
import { deleteBooking } from "~/services/bookings/delete-booking.server";
=======
} from '~/services/bookings/get-bookings.server';
import { getCourseById } from '~/services/courses/get-course.server';
import { getAvailability } from '~/services/availabilities/get-availability.server';
import { updateBooking } from '~/services/bookings/update-booking.server';
import { deleteBooking } from '~/services/bookings/delete-booking.server';
>>>>>>> d823109 (feat(api): enhance booking and slot management)

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request);

  const url = new URL(request.url);
  const bookingId = url.searchParams.get("id");
  const learnerId = url.searchParams.get("learnerId");
  const teacherId = url.searchParams.get("teacherId");
  const courseId = url.searchParams.get("courseId");
  const availabilityId = url.searchParams.get("availabilityId");

  const [learnerResult, teacherResult] = await Promise.all([
    getLearnerByUserId(session.user.id),
    getTeacherByUserId(session.user.id),
  ]);

  const currentLearnerId =
    learnerResult.success && learnerResult.learner
      ? learnerResult.learner.id
      : null;
  const currentTeacherId =
    teacherResult.success && teacherResult.teacher
      ? teacherResult.teacher.id
      : null;

  const [learnerResult, teacherResult] = await Promise.all([
    getLearnerByUserId(session.user.id),
    getTeacherByUserId(session.user.id),
  ]);

  const currentLearnerId = learnerResult.success && learnerResult.learner ? learnerResult.learner.id : null;
  const currentTeacherId = teacherResult.success && teacherResult.teacher ? teacherResult.teacher.id : null;

  if (bookingId) {
    const result = await getBooking(bookingId);
    if (!result.success || !result.booking) {
<<<<<<< HEAD
      return data({ error: "Réservation introuvable" }, { status: 404 });
    }

    const isLearnerOwner =
      currentLearnerId !== null &&
      result.booking.learnerId === currentLearnerId;
=======
      return data({ error: 'Réservation introuvable' }, { status: 404 });
    }

    const isLearnerOwner = currentLearnerId !== null && result.booking.learnerId === currentLearnerId;
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    const isTeacherOwner =
      currentTeacherId !== null &&
      (result.booking.course.teacherId === currentTeacherId ||
        result.booking.availability.teacherId === currentTeacherId);

    if (!isLearnerOwner && !isTeacherOwner) {
<<<<<<< HEAD
      return data({ error: "Non autorisé." }, { status: 403 });
=======
      return data({ error: 'Non autorisé.' }, { status: 403 });
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    }

    return result;
  }

  if (learnerId) {
    if (!currentLearnerId || learnerId !== currentLearnerId) {
<<<<<<< HEAD
      return data({ error: "Non autorisé." }, { status: 403 });
=======
      return data({ error: 'Non autorisé.' }, { status: 403 });
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    }

    return getBookingsByLearnerId(currentLearnerId);
  }

  if (teacherId) {
    if (!currentTeacherId || teacherId !== currentTeacherId) {
<<<<<<< HEAD
      return data({ error: "Non autorisé." }, { status: 403 });
=======
      return data({ error: 'Non autorisé.' }, { status: 403 });
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    }

    return getBookingsByTeacherId(currentTeacherId);
  }

  if (courseId) {
    if (!currentTeacherId) {
<<<<<<< HEAD
      return data({ error: "Non autorisé." }, { status: 403 });
=======
      return data({ error: 'Non autorisé.' }, { status: 403 });
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    }

    const courseResult = await getCourseById(courseId);
    if (!courseResult.success || !courseResult.course) {
<<<<<<< HEAD
      return data({ error: "Cours introuvable" }, { status: 404 });
    }

    if (courseResult.course.teacherId !== currentTeacherId) {
      return data({ error: "Non autorisé." }, { status: 403 });
=======
      return data({ error: 'Cours introuvable' }, { status: 404 });
    }

    if (courseResult.course.teacherId !== currentTeacherId) {
      return data({ error: 'Non autorisé.' }, { status: 403 });
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    }

    return getBookingsByCourseId(courseId);
  }

  if (availabilityId) {
    if (!currentTeacherId) {
<<<<<<< HEAD
      return data({ error: "Non autorisé." }, { status: 403 });
=======
      return data({ error: 'Non autorisé.' }, { status: 403 });
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    }

    const availabilityResult = await getAvailability(availabilityId);
    if (!availabilityResult.success || !availabilityResult.availability) {
<<<<<<< HEAD
      return data({ error: "Disponibilité introuvable" }, { status: 404 });
    }

    if (availabilityResult.availability.teacherId !== currentTeacherId) {
      return data({ error: "Non autorisé." }, { status: 403 });
=======
      return data({ error: 'Disponibilité introuvable' }, { status: 404 });
    }

    if (availabilityResult.availability.teacherId !== currentTeacherId) {
      return data({ error: 'Non autorisé.' }, { status: 403 });
>>>>>>> d823109 (feat(api): enhance booking and slot management)
    }

    return getBookingsByAvailabilityId(availabilityId);
  }

<<<<<<< HEAD
  return data({ error: "ID de réservation ou filtre requis" }, { status: 400 });
=======
  return data({ error: 'ID de réservation ou filtre requis' }, { status: 400 });
>>>>>>> d823109 (feat(api): enhance booking and slot management)
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await authentifyUser(request);
  const method = request.method.toUpperCase();

  const [learnerResult, teacherResult] = await Promise.all([
    getLearnerByUserId(session.user.id),
    getTeacherByUserId(session.user.id),
  ]);

<<<<<<< HEAD
  const currentLearnerId =
    learnerResult.success && learnerResult.learner
      ? learnerResult.learner.id
      : null;
  const currentTeacherId =
    teacherResult.success && teacherResult.teacher
      ? teacherResult.teacher.id
      : null;
=======
  const currentLearnerId = learnerResult.success && learnerResult.learner ? learnerResult.learner.id : null;
  const currentTeacherId = teacherResult.success && teacherResult.teacher ? teacherResult.teacher.id : null;
>>>>>>> d823109 (feat(api): enhance booking and slot management)

  switch (method) {
    case "POST": {
      const body = await request.json();
      const parsed = createBookingSchema.safeParse(body);

      if (!parsed.success) {
        return data(
          {
            success: false,
<<<<<<< HEAD
            error: parsed.error.issues.map((e) => e.message).join(", "),
=======
            error: parsed.error.issues.map((e) => e.message).join(', '),
>>>>>>> d823109 (feat(api): enhance booking and slot management)
          },
          { status: 400 },
        );
      }

      if (!currentLearnerId) {
<<<<<<< HEAD
        return data(
          { success: false, error: "Apprenant introuvable." },
          { status: 403 },
        );
      }

      if (currentLearnerId !== parsed.data.learnerId) {
        return data(
          { success: false, error: "Non autorisé." },
          { status: 403 },
        );
=======
        return data({ success: false, error: 'Apprenant introuvable.' }, { status: 403 });
      }

      if (currentLearnerId !== parsed.data.learnerId) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
>>>>>>> d823109 (feat(api): enhance booking and slot management)
      }

      const result = await createBooking(parsed.data);
      return data(result, { status: result.success ? 201 : 400 });
    }

    case "PUT": {
      const url = new URL(request.url);
      const bookingId = url.searchParams.get("id");

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

    case "DELETE": {
      const url = new URL(request.url);
      const bookingId = url.searchParams.get("id");

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
      return data({ error: "Method not allowed" }, { status: 405 });
  }
}
