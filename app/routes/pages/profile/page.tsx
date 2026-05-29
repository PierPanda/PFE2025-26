import { data, redirect, useLoaderData, useSearchParams } from 'react-router';
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
import { parsePageParam, computeOffset } from '~/lib/pagination';
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
import { getRatingsByTeacher } from '~/services/ratings/get-ratings';
// import ReviewsSection from "~/components/ratings/reviews-section";

const PAGE_SIZE = 10;

export async function loader({ params, request }: Route.LoaderArgs) {
  const { id: profileUserId } = params;

  if (!profileUserId) {
    throw redirect('/');
  }

  const session = await authentifyUser(request, { redirectTo: '/auth' });
  const isOwnProfile = profileUserId === session.user.id;

  const profileTeacherResult = await getTeacherByUserId(profileUserId);
  const profileTeacher = profileTeacherResult.success ? profileTeacherResult.teacher : null;

  // Public profile: only teacher info + courses
  if (!isOwnProfile) {
    if (!profileTeacher) {
      throw redirect('/');
    }

    const [coursesResult, ratingsResult] = await Promise.all([
      getCoursesByTeacher(profileTeacher.id),
      getRatingsByTeacher(profileTeacher.id),
    ]);
    const courses = coursesResult.success ? (coursesResult.courses ?? []) : [];
    const teacherRatings = ratingsResult.success ? ratingsResult.ratings : [];

    return {
      isOwnProfile: false as const,
      profileUser: profileTeacher.user,
      profileTeacher,
      courses,
      teacherRatings,
    };
  }

  // Own profile: load all private data
  const url = new URL(request.url);
  const page = parsePageParam(url.searchParams.get('page'));
  const VALID_FILTERS: BookingFilter[] = ['all', 'upcoming', 'cancelled', 'completed'];
  const rawFilter = url.searchParams.get('filter') ?? 'all';
  const filter: BookingFilter = VALID_FILTERS.includes(rawFilter as BookingFilter)
    ? (rawFilter as BookingFilter)
    : 'all';
  const offset = computeOffset(page, PAGE_SIZE);

  const teacher = profileTeacher;

  const learnerResult = await getLearnerByUserId(session.user.id);
  const learner = learnerResult.success ? learnerResult.learner : null;

  const [coursesResult, availabilityResult, ownRatingsResult] = await Promise.all([
    teacher ? getCoursesByTeacher(teacher.id) : null,
    teacher ? getAvailabilityByTeacherId(teacher.id) : null,
    teacher ? getRatingsByTeacher(teacher.id) : null,
  ]);
  const courses = coursesResult?.success ? (coursesResult.courses ?? []) : [];
  const availabilities = availabilityResult?.success ? availabilityResult.availabilities : [];
  const teacherRatings = ownRatingsResult?.success ? ownRatingsResult.ratings : [];

  const [teacherBookingsResult, learnerBookingsResult, upcomingTeacherBookingsResult, upcomingLearnerBookingsResult] =
    await Promise.all([
      teacher ? getBookingsByTeacherId(teacher.id, { filter, limit: PAGE_SIZE, offset }) : null,
      learner ? getBookingsByLearnerId(learner.id, { filter, limit: PAGE_SIZE, offset }) : null,
      teacher
        ? getBookingsByTeacherId(teacher.id, {
            filter: 'upcoming',
            limit: 3,
            orderDirection: 'asc',
          })
        : null,
      learner
        ? getBookingsByLearnerId(learner.id, {
            filter: 'upcoming',
            limit: 3,
            orderDirection: 'asc',
          })
        : null,
    ]);

  const totalTeacherBookings = teacherBookingsResult?.success ? (teacherBookingsResult.total ?? 0) : 0;
  const totalLearnerBookings = learnerBookingsResult?.success ? (learnerBookingsResult.total ?? 0) : 0;

  const rawView = url.searchParams.get('view') ?? '';
  const activeView = (() => {
    if (rawView === 'teacher' || rawView === 'learner') return rawView;
    return teacher ? 'teacher' : 'learner';
  })();
  const relevantTotal = activeView === 'teacher' ? totalTeacherBookings : totalLearnerBookings;
  const totalPages = Math.ceil(relevantTotal / PAGE_SIZE);

  if (totalPages > 0 && page > totalPages) {
    const redirectUrl = new URL(url);
    redirectUrl.searchParams.set('page', String(totalPages));
    throw redirect(redirectUrl.pathname + redirectUrl.search);
  }

  return {
    isOwnProfile: true as const,
    profileUser: session.user,
    profileTeacher: teacher,
    learner,
    courses,
    availabilities,
    teacherBookings: teacherBookingsResult?.success ? teacherBookingsResult.bookings : [],
    totalTeacherBookings,
    learnerBookings: learnerBookingsResult?.success ? learnerBookingsResult.bookings : [],
    totalLearnerBookings,
    upcomingTeacherBookings: upcomingTeacherBookingsResult?.success ? upcomingTeacherBookingsResult.bookings : [],
    upcomingLearnerBookings: upcomingLearnerBookingsResult?.success ? upcomingLearnerBookingsResult.bookings : [],
    currentPage: page,
    currentFilter: filter,
    pageSize: PAGE_SIZE,
    teacherRatings,
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
        return {
          success: false,
          error: 'Vous ne pouvez modifier que vos propres cours.',
        };
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
        return {
          success: false,
          error: 'Vous ne pouvez supprimer que vos propres cours.',
        };
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
      return {
        success: false,
        error: 'Vous ne pouvez pas modifier cette réservation.',
      };
    }

    const status = formData.get('status') as string | null;
    const VALID_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;
    if (!status || !VALID_STATUSES.includes(status as never)) {
      return { success: false, error: 'Statut invalide.' };
    }

    if (status === 'confirmed' && !isTeacher && !isAdmin) {
      return {
        success: false,
        error: 'Seul un enseignant peut confirmer une réservation.',
      };
    }

    if (status === 'confirmed' && booking.status !== 'pending') {
      return {
        success: false,
        error: 'Seule une réservation en attente peut être confirmée.',
      };
    }

    if (status === 'cancelled' && booking.status === 'cancelled') {
      return { success: false, error: 'Cette réservation est déjà annulée.' };
    }

    return updateBooking(bookingId, {
      status: status as 'pending' | 'confirmed' | 'cancelled',
    });
  }

  return { success: false, error: 'Action inconnue.' };
}

type View = 'teacher' | 'learner';

export default function Page() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { isOwnProfile, profileUser, profileTeacher, courses } = loaderData;

  const rawView = searchParams.get('view') ?? '';
  const view: View = (() => {
    if (rawView === 'teacher' || rawView === 'learner') return rawView;
    return profileTeacher ? 'teacher' : 'learner';
  })();

  const handleViewChange = (newView: View) => {
    setSearchParams(
      (prev) => {
        prev.set('view', newView);
        return prev;
      },
      { preventScrollReset: true },
    );
  };

  if (!isOwnProfile) {
    return (
      <main className="px-10 py-8 flex flex-col gap-12">
        <UserProfile user={profileUser} teacher={profileTeacher} isOwnProfile={false} />
        {profileTeacher && <CoursesSection courses={courses} currentUserId={null} isOwnProfile={false} />}
        {/* {profileTeacher && (
          <ReviewsSection ratings={loaderData.teacherRatings} />
        )} */}
      </main>
    );
  }

  const {
    learner,
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
  } = loaderData;

  const isTeacherView = view === 'teacher';

  return (
    <main className="px-4 md:px-10 py-8 flex flex-col gap-12">
      <UserProfile user={profileUser} teacher={profileTeacher} isOwnProfile={true} />
      <div className="flex flex-col gap-20">
        {profileTeacher && learner && (
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

        {profileTeacher && isTeacherView && (
          <CalendarSection
            teacherBookings={upcomingTeacherBookings}
            teacher={profileTeacher}
            availabilities={availabilities}
            isTeacher
            action={`/profile/${profileUser.id}`}
          />
        )}

        {profileTeacher && isTeacherView && (
          <CoursesSection
            courses={courses}
            currentUserId={profileUser.id}
            isOwnProfile={true}
            deleteAction={`/profile/${profileUser.id}`}
          />
        )}

        {/* {profileTeacher && isTeacherView && (
          <ReviewsSection ratings={loaderData.teacherRatings} />
        )} */}

        {learner && !isTeacherView && (
          <CalendarSection learnerBookings={upcomingLearnerBookings} action={`/profile/${profileUser.id}`} />
        )}

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
