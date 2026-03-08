import { useLoaderData } from 'react-router';
import type { Route } from './+types/page';
import { getCourseById } from '~/services/courses/get-course.server';
import { getTeacherSummary } from '~/services/teachers/get-teacher.server';
import CourseHeader from '~/components/courses/course-header';
import CourseDescription from '~/components/courses/course-description';
import BookingCard from '~/components/courses/booking-card';
import { getAvailabileSlots } from '~/services/availabilities/get-available-slots.server';
import { getAvailabilityByTeacherId } from '~/services/availabilities/get-availability.server';

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;

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

  const availabilitiesResult = await getAvailabilityByTeacherId(courseResult.course.teacherId);
  const availableSlotsResult = await getAvailabileSlots(courseResult.course.teacherId);

  return {
    course: courseResult.course,
    teacher: teacherResult.success ? teacherResult.teacher : null,
    availabilities: availabilitiesResult.success ? availabilitiesResult.availabilities : null,
    availableSlots: availableSlotsResult.success ? availableSlotsResult.availabilities : null,
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
  const { course, teacher, availabilities, availableSlots } = useLoaderData<typeof loader>();

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
            <BookingCard
              course={course}
              teacher={teacher}
              availabilities={availabilities}
              availableSlots={availableSlots}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
