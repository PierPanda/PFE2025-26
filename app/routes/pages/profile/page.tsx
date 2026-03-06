import { useLoaderData, Link } from 'react-router';
import type { Route } from './+types/page';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { getCoursesByTeacher } from '~/services/courses/get-courses.server';
import { getTeacherByUserId } from '~/services/teachers/get-teacher.server';
import { getAvailabilityByTeacherId } from '~/services/availabilities/get-availability.server';
import CardCourse from '~/components/ui/card-course';
import CardAvailability from '~/components/ui/card-availability';
import UserProfile from '~/components/profile/user-profile';
import { Button } from '@heroui/react';
import { InlineIcon } from '@iconify/react';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  const teacherResult = await getTeacherByUserId(session.user.id);
  const teacher = teacherResult.success ? teacherResult.teacher : null;

  const coursesResult = teacher ? await getCoursesByTeacher(teacher.id) : null;
  const courses = coursesResult?.success ? (coursesResult.courses ?? []) : [];

  const availabilityResult = teacher ? await getAvailabilityByTeacherId(teacher.id) : null;
  const availabilities = availabilityResult?.success ? availabilityResult.availabilities : [];

  return {
    user: session.user,
    teacher,
    courses,
    availabilities,
  };
}

export async function action({ request }: Route.ActionArgs) {
  await authentifyUser(request, { redirectTo: '/auth' });

  const { deleteCourse } = await import('~/services/courses/delete-course.server');
  const formData = await request.formData();
  const courseId = formData.get('courseId') as string;

  if (!courseId) return { success: false, error: 'ID manquant.' };
  return deleteCourse(courseId);
}

export default function Page() {
  const { user, teacher, courses, availabilities } = useLoaderData<typeof loader>();
  return (
    <main className="px-10 py-8 flex flex-col gap-6">
      <div className="flex flex-col bg-amber-50 rounded-2xl p-6 w-full">
        <UserProfile user={user} teacher={teacher} />
      </div>

      <div className="flex flex-col bg-amber-50 rounded-2xl p-6 gap-4 w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Mes cours</h3>
          {courses.length > 0 && (
            <Link to="/courses/create">
              <Button isIconOnly size="sm" color="warning" className="text-white">
                <InlineIcon icon="mdi:plus" width="20" />
              </Button>
            </Link>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore de cours.</p>
            <Link to="/courses/create">
              <Button size="sm" color="warning" variant="flat">
                Créer mon premier cours
              </Button>
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <ul className="flex gap-4 pb-2">
              {courses.map((course) => (
                <CardCourse key={course.id} course={course} showActions />
              ))}
            </ul>
          </div>
        )}
        {availabilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore de disponibilités.</p>
            <Link to="/availability/create">
              <Button size="sm" color="warning" variant="flat">
                Créer ma première disponibilité
              </Button>
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <ul className="flex gap-4 pb-2">
              {availabilities.map((availability) => (
                <CardAvailability key={availability.id} availability={availability} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
