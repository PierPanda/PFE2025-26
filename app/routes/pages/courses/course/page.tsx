import { useLoaderData } from 'react-router';
import type { Route } from './+types/page';
import { getCourseById } from '~/services/courses/get-course.server';
import { getTeacherSummary } from '~/services/teachers/get-teacher.server';
import CourseHeader from '~/components/courses/course-header';
import CourseDescription from '~/components/courses/course-description';
import BookingCard from '~/components/courses/booking-card';
import { getAvailableSlots } from '~/services/availabilities/get-available-slots.server';
<<<<<<< HEAD
=======
import { getAvailabilityByTeacherId } from '~/services/availabilities/get-availability.server';
import { getBookingsByTeacherId } from '~/services/bookings/get-bookings.server';
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)

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

  const availabilitiesResult = await getAvailabilityByTeacherId(courseResult.course.teacherId);
  const bookingsResult = await getBookingsByTeacherId(courseResult.course.teacherId, ['pending', 'confirmed']);
  const availableSlotsResult = await getAvailableSlots(courseResult.course.teacherId, courseResult.course.duration);

  return {
    course: courseResult.course,
    teacher: teacherResult.success ? teacherResult.teacher : null,
<<<<<<< HEAD
    availableSlots: availableSlotsResult.success ? availableSlotsResult.slots : null,
=======
    availabilities: availabilitiesResult.success ? availabilitiesResult.availabilities : null,
    bookings: bookingsResult.success ? bookingsResult.bookings : null,
    availableSlots: availableSlotsResult.success ? availableSlotsResult.availabilities : null,
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)
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
  const { course, teacher, availableSlots } = useLoaderData<typeof loader>();
=======
  const { course, teacher, availabilities, bookings, availableSlots } = useLoaderData<typeof loader>();
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)

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
            <BookingCard course={course} teacher={teacher} availableSlots={availableSlots} />
=======
            <BookingCard
              course={course}
              teacher={teacher}
              availabilities={availabilities}
              bookings={bookings}
              availableSlots={availableSlots}
            />
>>>>>>> 93dbced (feat(get available slots): create service and api route to get available slots to booking a course)
          </div>
        </div>
      </div>
    </main>
  );
}
