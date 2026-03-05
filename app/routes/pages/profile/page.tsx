import { redirect, useLoaderData, Link } from 'react-router';
import type { Route } from './+types/page';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { db } from '~/server/lib/db/index.server';
import { teachers } from '~/server/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCoursesByTeacher } from '~/services/courses/get-courses.server';
import { getTeacher } from '~/services/teachers/get-teacher.server';
import CardCourse from '~/components/ui/CardCourse';
import UserProfile from '~/components/profile/UserProfile';
import { Button } from '@heroui/react';

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const session = await authentifyUser(request);

    const teacherResult = await db.select().from(teachers).where(eq(teachers.userId, session.user.id));

    const isTeacher = teacherResult.length > 0;
    const teacher = isTeacher ? teacherResult[0] : null;

    let courses: any[] = [];
    if (teacher) {
      const coursesResult = await getCoursesByTeacher(teacher.id);
      if (coursesResult.success && coursesResult.courses) {
        courses = coursesResult.courses;
      }
    }
    let teacherData = null;
    if (teacher) {
      const getTeacherResult = await getTeacher(teacher.id);
      if (getTeacherResult.success && getTeacherResult.teacher) {
        teacherData = getTeacherResult.teacher;
      }
    }
    return { user: session.user, isTeacher, teacher, teacherData, courses };
  } catch {
    throw redirect('/auth');
  }
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
              {courses.map((course) => {
                return <CardCourse key={course.id} course={course} />;
              })}
            </ul>
          </div>
        </div>
      </section>
      {/* <section className="w-auto flex flex-col items-center justify-center h-auto gap-4 py-4 px-30">
        <div className="flex flex-col bg-blue-100 rounded-2xl p-4 gap-4 w-full overflow-hidden">
          <div className="flex justify-between">
            <h3 className="text-3xl font-bold">Mes réservations</h3>
          </div>
          <div className="rounded-2xl w-full overflow-scroll">
            <ul className="flex gap-4 w-screen overflow-x-auto overflow-scroll scrollbar-hid">
              {bookings.map((booking) => {
                return <CardBooking booking={booking} />;
              })}
            </ul>
          </div>
        </div>
      </section> */}
    </>
  );
}
