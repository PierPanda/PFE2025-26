import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { createCourseSchema, updateCourseSchema } from '~/lib/validation';
import { createCourse } from '~/services/courses/create-course.server';
import { getCourseById } from '~/services/courses/get-course.server';
import { getCourses, getCoursesByTeacher } from '~/services/courses/get-courses.server';
import { updateCourse } from '~/services/courses/update-course.server';
import { deleteCourse } from '~/services/courses/delete-course.server';
import type { CourseCategory, CourseLevel } from '~/types/course';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const courseId = url.searchParams.get('id');
  const teacherId = url.searchParams.get('teacherId');

  const category = url.searchParams.get('category') as CourseCategory | null;
  const level = url.searchParams.get('level') as CourseLevel | null;
  const minPrice = url.searchParams.get('minPrice') as string | null;
  const maxPrice = url.searchParams.get('maxPrice') as string | null;
  const search = url.searchParams.get('search') as string | null;

  if (courseId) {
    const result = await getCourseById(courseId);
    if (!result.success) {
      return data({ error: result.error }, { status: 404 });
    }
    return result;
  }

  if (teacherId) {
    const result = await getCoursesByTeacher(teacherId);
    return result;
  }

  const result = await getCourses(category, level, minPrice, maxPrice, search);
  return result;
}

export async function action({ request }: ActionFunctionArgs) {
  await authentifyUser(request);

  const method = request.method.toUpperCase();

  switch (method) {
    case 'POST': {
      const body = await request.json();
      const parsed = createCourseSchema.safeParse(body);

      if (!parsed.success) {
        return data({ success: false, errors: parsed.error.flatten() }, { status: 400 });
      }

      const result = await createCourse(parsed.data);
      return data(result, { status: result.success ? 201 : 400 });
    }

    case 'PUT': {
      const url = new URL(request.url);
      const courseId = url.searchParams.get('id');

      if (!courseId) {
        return data({ success: false, error: 'Course ID required' }, { status: 400 });
      }

      const body = await request.json();
      const parsed = updateCourseSchema.safeParse(body);

      if (!parsed.success) {
        return data({ success: false, errors: parsed.error.flatten() }, { status: 400 });
      }

      const result = await updateCourse(courseId, parsed.data);
      return result;
    }

    case 'DELETE': {
      const url = new URL(request.url);
      const courseId = url.searchParams.get('id');

      if (!courseId) {
        return data({ success: false, error: 'Course ID required' }, { status: 400 });
      }

      const result = await deleteCourse(courseId);
      return result;
    }

    default:
      return data({ error: 'Method not allowed' }, { status: 405 });
  }
}
