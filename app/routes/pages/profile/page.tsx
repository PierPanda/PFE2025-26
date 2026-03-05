import { useLoaderData, Link } from 'react-router';
import type { Route } from './+types/page';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { getCoursesByTeacher } from '~/services/courses/get-courses.server';
import { getTeacherByUserId } from '~/services/teachers/get-teacher.server';
import CardCourse from '~/components/ui/CardCourse';
import UserProfile from '~/components/profile/UserProfile';
import { Button } from '@heroui/react';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  const teacherResult = await getTeacherByUserId(session.user.id);
  const teacher = teacherResult.success ? teacherResult.teacher : null;

  const coursesResult = teacher ? await getCoursesByTeacher(teacher.id) : null;
  const courses = coursesResult?.success ? (coursesResult.courses ?? []) : [];

  return { user: session.user, teacher, courses };
}

export default function Page() {
  const { user, courses } = useLoaderData<typeof loader>();

  return (
    <>
      <section className="w-auto flex flex-col items-center justify-center h-auto px-30 py-30 gap-30">
        <UserProfile user={user} />
      </section>
      <section className="w-auto flex flex-col items-center justify-center h-auto gap-4 py-4 px-30">
        <div className="flex flex-col bg-blue-100 rounded-2xl p-4 gap-4 w-full overflow-hidden">
          <div className="flex justify-between">
            <h3 className="text-3xl font-bold">Mes cours</h3>
            <Link to="/courses/create">
              <Button radius="sm" color="primary">
                Ajouter un nouveau cours
              </Button>
            </Link>
          </div>
          <div className="rounded-2xl w-full overflow-scroll">
            <ul className="flex gap-4 w-screen overflow-x-auto h-auto overflow-scroll scrollbar-hid">
              {courses.map((course) => (
                <CardCourse key={course.id} course={course} />
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
