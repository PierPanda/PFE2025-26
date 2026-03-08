import { useLoaderData } from 'react-router';
import type { Route } from './+types/page';
import { getCourseById } from '~/services/courses/get-course.server';
import { getTeacherSummary } from '~/services/teachers/get-teacher.server';
import CourseHeader from '~/components/courses/course-header';
import CourseDescription from '~/components/courses/course-description';
import BookingCard from '~/components/courses/booking-card';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { getAvailableSlots } from '~/services/availabilities/get-available-slots.server';
<<<<<<< HEAD
<<<<<<< HEAD
=======
import { getAvailabilityByTeacherId } from '~/services/availabilities/get-availability.server';
import { getBookingsByTeacherId } from '~/services/bookings/get-bookings.server';
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)
=======
>>>>>>> 3b88034 (feat(api): enhance booking and slot management)
=======
import { getAvailabileSlots } from '~/services/availabilities/get-available-slots.server';
import { getAvailabilityByTeacherId } from '~/services/availabilities/get-availability.server';
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
import { getAvailableSlots } from '~/services/availabilities/get-available-slots.server';
<<<<<<< HEAD
import { getAvailabilityByTeacherId } from '~/services/availabilities/get-availability.server';
import { getBookingsByTeacherId } from '~/services/bookings/get-bookings.server';
>>>>>>> 3e5347a (feat(get available slots): create service and api route to get available slots to booking a course)
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
=======
import { getAvailableSlots } from '~/services/availabilities/get-available-slots.server';
>>>>>>> e8a3f28 (feat(bookings): implement booking management features)

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;

  if (!id) {
    throw new Response('ID du cours manquant', { status: 400 });
  }

  const courseResult = await getCourseById(id);

  if (!courseResult.success) {
    throw new Response('Erreur lors de la récupération du cours', {
      status: 500,
    });
  }

  if (!courseResult.course) {
    throw new Response('Cours non trouvé', { status: 404 });
  }
  const teacherResult = await getTeacherSummary(courseResult.course.teacherId);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e8a3f28 (feat(bookings): implement booking management features)
  const availableSlotsResult = await getAvailableSlots(
    courseResult.course.teacherId,
    courseResult.course.duration,
  );

  const availabilitiesResult = await getAvailabilityByTeacherId(courseResult.course.teacherId);
  const bookingsResult = await getBookingsByTeacherId(courseResult.course.teacherId, [
    'pending',
    'confirmed',
  ]);
  const availableSlotsResult = await getAvailableSlots(
    courseResult.course.teacherId,
    courseResult.course.duration,
  );
<<<<<<< HEAD

  const availabilitiesResult = await getAvailabilityByTeacherId(courseResult.course.teacherId);
  const bookingsResult = await getBookingsByTeacherId(courseResult.course.teacherId, ['pending', 'confirmed']);
=======
>>>>>>> 3b88034 (feat(api): enhance booking and slot management)
  const availableSlotsResult = await getAvailableSlots(courseResult.course.teacherId, courseResult.course.duration);

  const availabilitiesResult = await getAvailabilityByTeacherId(courseResult.course.teacherId);
  const bookingsResult = await getBookingsByTeacherId(courseResult.course.teacherId, ['pending', 'confirmed']);
=======
>>>>>>> d823109 (feat(api): enhance booking and slot management)
  const availableSlotsResult = await getAvailableSlots(courseResult.course.teacherId, courseResult.course.duration);
=======
>>>>>>> e8a3f28 (feat(bookings): implement booking management features)

  return {
    course: courseResult.course,
    teacher: teacherResult.success ? teacherResult.teacher : null,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    availableSlots: availableSlotsResult.success ? availableSlotsResult.slots : null,
=======
    availabilities: availabilitiesResult.success ? availabilitiesResult.availabilities : null,
    bookings: bookingsResult.success ? bookingsResult.bookings : null,
    availableSlots: availableSlotsResult.success ? availableSlotsResult.availabilities : null,
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)
=======
    availableSlots: availableSlotsResult.success ? availableSlotsResult.slots : null,
>>>>>>> 3b88034 (feat(api): enhance booking and slot management)
=======
    availabilities: availabilitiesResult.success ? availabilitiesResult.availabilities : null,
    bookings: bookingsResult.success ? bookingsResult.bookings : null,
    availableSlots: availableSlotsResult.success ? availableSlotsResult.availabilities : null,
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
    availableSlots: availableSlotsResult.success ? availableSlotsResult.slots : null,
>>>>>>> d823109 (feat(api): enhance booking and slot management)
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title: data?.course?.title ? `${data.course.title} | Maestroo` : 'Maestroo',
    },
    { name: 'description', content: data?.course?.description ?? '' },
    { property: 'og:title', content: data?.course?.title ?? 'Maestroo' },
    { property: 'og:description', content: data?.course?.description ?? '' },
  ];
}

export default function CourseDetail() {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  const { course, teacher, availableSlots } = useLoaderData<typeof loader>();
=======
  const { course, teacher, availabilities, bookings, availableSlots } = useLoaderData<typeof loader>();
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)
=======
  const { course, teacher, availableSlots } = useLoaderData<typeof loader>();
>>>>>>> 3b88034 (feat(api): enhance booking and slot management)
=======
  const { course, teacher, availabilities, availableSlots } = useLoaderData<typeof loader>();
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
  const { course, teacher, availabilities, bookings, availableSlots } = useLoaderData<typeof loader>();
>>>>>>> 3e5347a (feat(get available slots): create service and api route to get available slots to booking a course)
=======
  const { course, teacher, availableSlots } = useLoaderData<typeof loader>();
>>>>>>> d823109 (feat(api): enhance booking and slot management)

  return (
    <main>
      <div className="mb-8 mx-auto max-w-7xl px-6">
        <img
          src={`/categories/${course.category}.jpg`}
          alt={course.title}
          className="h-64 w-full object-cover rounded-2xl"
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <CourseHeader course={course} />
            <CourseDescription description={course.description ?? null} />
          </div>
          <div>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
            <BookingCard course={course} teacher={teacher} availableSlots={availableSlots} />
=======
=======
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
            <BookingCard
              course={course}
              teacher={teacher}
              availabilities={availabilities}
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3e5347a (feat(get available slots): create service and api route to get available slots to booking a course)
              bookings={bookings}
              availableSlots={availableSlots}
            />
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)
=======
            <BookingCard course={course} teacher={teacher} availableSlots={availableSlots} />
>>>>>>> 3b88034 (feat(api): enhance booking and slot management)
=======
              availableSlots={availableSlots}
            />
>>>>>>> 38ec649 (feat(bookings): implement booking management features)
=======
            <BookingCard course={course} teacher={teacher} availableSlots={availableSlots} />
>>>>>>> d823109 (feat(api): enhance booking and slot management)
          </div>
        </div>
      </div>
    </main>
  );
}
