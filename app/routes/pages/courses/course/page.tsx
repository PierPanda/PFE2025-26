import { useLoaderData } from 'react-router';
import type { Route } from './+types/page';
import { getCourseById } from '~/services/courses/get-course';
import { getTeacherSummary } from '~/services/teachers/get-teacher';
import CourseHeader from '~/components/courses/course-header';
import CourseDescription from '~/components/courses/course-description';
import BookingCard from '~/components/courses/booking-card';
import { getAvailableSlots } from '~/services/availabilities/get-available-slots';
import { InlineIcon } from '@iconify/react';

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
  const availableSlotsResult = await getAvailableSlots(courseResult.course.teacherId, courseResult.course.duration);

  return {
    course: courseResult.course,
    teacher: teacherResult.success ? teacherResult.teacher : null,
    availableSlots: availableSlotsResult.success ? availableSlotsResult.slots : null,
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
  const { course, teacher, availableSlots } = useLoaderData<typeof loader>();

  return (
    <main className="py-20 mx-auto max-w-7xl px-6">
      <div className="space-y-8">
        <a href="/#courses" className="flex items-center text-dark hover:underline">
          <InlineIcon icon="mdi:arrow-left" className="mr-2" />
          <span>Retour à la liste des cours</span>
        </a>
        <div className="flex items-start gap-8 flex-col lg:flex-row relative">
          <div className="flex-1">
            <img
              src={`/categories/${course.category}.jpg`}
              alt={course.title}
              className="h-64 w-full object-cover rounded-2xl"
            />
            <div className="space-y-5">
              <CourseHeader course={course} />
              <CourseDescription description={course.description ?? null} />
            </div>
          </div>
          <BookingCard course={course} teacher={teacher} availableSlots={availableSlots} />
        </div>
      </div>
    </main>
  );
}
