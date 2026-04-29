import { data, useLoaderData, useSearchParams } from 'react-router';
import type { Route } from './+types/page';
import { authentifyUser } from '~/server/utils/authentify-user';
import { auth } from '~/auth.server';
import { getCoursesByTeacher } from '~/services/courses/get-courses';
import { getCourseById } from '~/services/courses/get-course';
import { getTeacherByUserId } from '~/services/teachers/get-teacher';
import { deleteCourse } from '~/services/courses/delete-course';
import { updateCourse } from '~/services/courses/update-course';
import { updateTeacher } from '~/services/teachers/update-teacher';
import { uploadAvatar } from '~/server/services/upload/upload-avatar';
import { getAvailabilityByTeacherId } from '~/services/availabilities/get-availability';
import { courseFormSchema } from '~/lib/validation';
import UserProfile from '~/components/profile/user-profile';
import {
  getBooking,
  getBookingsByLearnerId,
  getBookingsByTeacherId,
  type BookingFilter,
} from '~/services/bookings/get-bookings';
import { updateBooking } from '~/services/bookings/update-booking';
import CalendarSection from './calendar-section';
import CoursesSection from './courses-section';
import BookingsTable from './bookings-table';
import { Tabs, Tab } from '@heroui/react';
import { getLearnerByUserId } from '~/services/learners/get-learner';

const PAGE_SIZE = 10;

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  const url = new URL(request.url);
  const rawPage = parseInt(url.searchParams.get('page') ?? '1', 10);
  const page = isNaN(rawPage) ? 1 : Math.max(1, rawPage);
  const filter = (url.searchParams.get('filter') ?? 'all') as BookingFilter;
  const offset = (page - 1) * PAGE_SIZE;

  const [teacherResult, learnerResult] = await Promise.all([
    getTeacherByUserId(session.user.id),
    getLearnerByUserId(session.user.id),
  ]);
  const teacher = teacherResult.success ? teacherResult.teacher : null;
  const learner = learnerResult.success ? learnerResult.learner : null;

  const [coursesResult, availabilityResult] = await Promise.all([
    teacher ? getCoursesByTeacher(teacher.id) : null,
    teacher ? getAvailabilityByTeacherId(teacher.id) : null,
  ]);
  const courses = coursesResult?.success ? (coursesResult.courses ?? []) : [];
  const availabilities = availabilityResult?.success ? availabilityResult.availabilities : [];

  const [teacherBookingsResult, learnerBookingsResult, upcomingTeacherBookingsResult, upcomingLearnerBookingsResult] =
    await Promise.all([
      teacher ? getBookingsByTeacherId(teacher.id, { filter, limit: PAGE_SIZE, offset }) : null,
      learner ? getBookingsByLearnerId(learner.id, { filter, limit: PAGE_SIZE, offset }) : null,
      teacher ? getBookingsByTeacherId(teacher.id, { filter: 'upcoming', limit: 3, orderDirection: 'asc' }) : null,
      learner ? getBookingsByLearnerId(learner.id, { filter: 'upcoming', limit: 3, orderDirection: 'asc' }) : null,
    ]);

  return {
    user: session.user,
    teacher,
    learner,
    courses,
    availabilities,
    teacherBookings: teacherBookingsResult?.success ? teacherBookingsResult.bookings : [],
    totalTeacherBookings: teacherBookingsResult?.success ? (teacherBookingsResult.total ?? 0) : 0,
    learnerBookings: learnerBookingsResult?.success ? learnerBookingsResult.bookings : [],
    totalLearnerBookings: learnerBookingsResult?.success ? (learnerBookingsResult.total ?? 0) : 0,
    upcomingTeacherBookings: upcomingTeacherBookingsResult?.success ? upcomingTeacherBookingsResult.bookings : [],
    upcomingLearnerBookings: upcomingLearnerBookingsResult?.success ? upcomingLearnerBookingsResult.bookings : [],
    currentPage: page,
    currentFilter: filter,
    pageSize: PAGE_SIZE,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });
  const isAdmin = session.user.role === 'admin';
  const formData = await request.formData();
  const actionType = formData.get('_action') as string;

  if (actionType === 'updateProfile') {
    const name = (formData.get('name') as string)?.trim();
    if (!name) return { success: false, error: 'Le nom est requis.' };

    let imageUrl: string | undefined;
    const avatarFile = formData.get('avatar');
    if (avatarFile instanceof File && avatarFile.size > 0) {
      const uploadResult = await uploadAvatar(avatarFile, session.user.id);
      if (!uploadResult.success) return uploadResult;
      imageUrl = uploadResult.data;
    }

    // Met à jour user en DB + rafraîchit le cookie cache Better Auth
    const updateResponse = await auth.api.updateUser({
      headers: request.headers,
      body: {
        name,
        ...(imageUrl !== undefined && { image: imageUrl }),
      },
      asResponse: true,
    });

    const teacherResult = await getTeacherByUserId(session.user.id);
    if (teacherResult.success && teacherResult.teacher) {
      const description = formData.get('description') as string | null;
      const skills = formData.get('skills') as string | null;
      await updateTeacher(teacherResult.teacher.id, {
        id: teacherResult.teacher.id,
        ...(description !== null && { description }),
        ...(skills !== null && { skills }),
      });
    }

    // Propage les Set-Cookie pour que le navigateur reçoive le cookie rafraîchi
    const responseHeaders = new Headers();
    updateResponse.headers.getSetCookie().forEach((cookie) => {
      responseHeaders.append('Set-Cookie', cookie);
    });

    return data({ success: true, message: 'Profil mis à jour.' }, { headers: responseHeaders });
  }

  if (actionType === 'updateCourse') {
    const courseId = (formData.get('courseId') as string | null)?.trim();

    if (!courseId) {
      return { success: false, error: 'ID du cours manquant.' };
    }

    const courseResult = await getCourseById(courseId);

    if (!courseResult.success || !courseResult.course) {
      return { success: false, error: 'Cours introuvable.' };
    }

    if (!isAdmin) {
      const teacherResult = await getTeacherByUserId(session.user.id);

      if (!teacherResult.success || !teacherResult.teacher) {
        return { success: false, error: 'Profil enseignant introuvable.' };
      }

      if (courseResult.course.teacherId !== teacherResult.teacher.id) {
        return { success: false, error: 'Vous ne pouvez modifier que vos propres cours.' };
      }
    }

    const parsed = courseFormSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((issue) => issue.message).join(', '),
      };
    }

    return updateCourse(courseId, { id: courseId, ...parsed.data });
  }

  if (actionType === 'deleteCourse') {
    const courseId = (formData.get('courseId') as string | null)?.trim();

    if (!courseId) {
      return { success: false, error: 'ID du cours manquant.' };
    }

    const courseResult = await getCourseById(courseId);

    if (!courseResult.success || !courseResult.course) {
      return { success: false, error: 'Cours introuvable.' };
    }

    if (!isAdmin) {
      const teacherResult = await getTeacherByUserId(session.user.id);

      if (!teacherResult.success || !teacherResult.teacher) {
        return { success: false, error: 'Profil enseignant introuvable.' };
      }

      if (courseResult.course.teacherId !== teacherResult.teacher.id) {
        return { success: false, error: 'Vous ne pouvez supprimer que vos propres cours.' };
      }
    }

    return deleteCourse(courseId);
  }

  if (actionType === 'updateBooking') {
    const bookingId = (formData.get('bookingId') as string | null)?.trim();
    if (!bookingId) return { success: false, error: 'ID de réservation manquant.' };

    const bookingResult = await getBooking(bookingId);
    if (!bookingResult.success || !bookingResult.booking) {
      return { success: false, error: 'Réservation introuvable.' };
    }

    const booking = bookingResult.booking;
    const isLearner = booking.learner.user.id === session.user.id;
    const isTeacher = booking.course.teacher.user.id === session.user.id;
    if (!isAdmin && !isLearner && !isTeacher) {
      return { success: false, error: 'Vous ne pouvez pas modifier cette réservation.' };
    }

    const status = formData.get('status') as string | null;
    if (!status) return { success: false, error: 'Statut manquant.' };
    return updateBooking(bookingId, { status: status as 'pending' | 'confirmed' | 'cancelled' });
  }

  return { success: false, error: 'Action inconnue.' };
}

type View = 'teacher' | 'learner';

export default function Page() {
  const {
    user,
    teacher,
    learner,
    courses,
    availabilities,
    teacherBookings,
    totalTeacherBookings,
    learnerBookings,
    totalLearnerBookings,
    upcomingTeacherBookings,
    upcomingLearnerBookings,
    currentPage,
    currentFilter,
    pageSize,
  } = useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();
  const view = (searchParams.get('view') ?? (teacher ? 'teacher' : 'learner')) as View;

  const handleViewChange = (newView: View) => {
    setSearchParams({ view: newView }, { preventScrollReset: true });
  };

  const isTeacherView = view === 'teacher';

  return (
    <main className="px-10 py-8 flex flex-col gap-12">
      <UserProfile user={user} teacher={teacher} />
      <div className="flex flex-col gap-20">
        {teacher && learner && (
          <Tabs
            selectedKey={view}
            onSelectionChange={(key) => handleViewChange(key as View)}
            variant="underlined"
            className="mx-auto"
            classNames={{
              tab: 'text-lg font-medium text-default-500',
              cursor: 'bg-secondary',
            }}
          >
            <Tab key="teacher" title="Enseignant" />
            <Tab key="learner" title="Apprenant" />
          </Tabs>
        )}

        {teacher && isTeacherView && (
          <CalendarSection
            teacherBookings={upcomingTeacherBookings}
            teacher={teacher}
            availabilities={availabilities}
            isTeacher
          />
        )}

        {teacher && isTeacherView && <CoursesSection courses={courses} user={user} />}

        {learner && !isTeacherView && <CalendarSection learnerBookings={upcomingLearnerBookings} />}

        <BookingsTable
          bookings={isTeacherView ? teacherBookings : learnerBookings}
          total={isTeacherView ? totalTeacherBookings : totalLearnerBookings}
          currentPage={currentPage}
          currentFilter={currentFilter}
          pageSize={pageSize}
          isTeacher={isTeacherView}
        />
      </div>
    </main>
  );
}
