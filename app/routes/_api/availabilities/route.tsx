import { type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { validateJsonBody, createAvailabilitySchema } from '~/lib/validation';
import { getAvailabilityByTeacherId } from '~/services/availabilities/get-availability.server';
import { createAvailability } from '~/services/availabilities/create-availability.server';
import { getTeacherByUserId } from '~/services/teachers/get-teacher.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request);
  const url = new URL(request.url);
  const teacherId = url.searchParams.get('teacherId');

  return getAvailabilityByTeacherId(teacherId || session.user.id);
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await authentifyUser(request);

  if (request.method === 'POST') {
    const body = await validateJsonBody(request, createAvailabilitySchema);

    const teacherResult = await getTeacherByUserId(session.user.id);
    if (!teacherResult.success || !teacherResult.teacher) {
      throw new Response('Enseignant introuvable.', { status: 403 });
    }
    if (body.teacherId !== teacherResult.teacher.id) {
      throw new Response('Non autorisé.', { status: 403 });
    }

    return createAvailability(body);
  }
}
