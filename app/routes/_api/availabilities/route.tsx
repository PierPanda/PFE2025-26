import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { createAvailabilitySchema, deleteAvailabilitySchema, batchAvailabilitySchema } from '~/lib/validation';
import { getAvailability, getAvailabilityByTeacherId } from '~/services/availabilities/get-availability.server';
import { createAvailability } from '~/services/availabilities/create-availability.server';
import { deleteAvailability } from '~/services/availabilities/delete-availability.server';
import { batchUpdateAvailabilities } from '~/services/availabilities/batch-availabilities.server';
import { getTeacherByUserId } from '~/services/teachers/get-teacher.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request);
  const url = new URL(request.url);
  const teacherId = url.searchParams.get('teacherId');

  return getAvailabilityByTeacherId(teacherId || session.user.id);
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await authentifyUser(request);
  const method = request.method.toUpperCase();

  switch (method) {
    case 'POST': {
      const body = await request.json();
      const parsed = createAvailabilitySchema.safeParse(body);

      if (!parsed.success) {
        return data(
          {
            success: false,
            error: parsed.error.issues.map((e) => e.message).join(', '),
          },
          { status: 400 },
        );
      }

      const teacherResult = await getTeacherByUserId(session.user.id);
      if (!teacherResult.success || !teacherResult.teacher) {
        return data({ success: false, error: 'Enseignant introuvable.' }, { status: 403 });
      }
      if (parsed.data.teacherId !== teacherResult.teacher.id) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
      }

      const result = await createAvailability(parsed.data);
      return data(result, { status: result.success ? 201 : 400 });
    }

    case 'DELETE': {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      const parsed = deleteAvailabilitySchema.safeParse({ id });

      if (!parsed.success) {
        return data(
          {
            success: false,
            error: parsed.error.issues.map((e) => e.message).join(', '),
          },
          { status: 400 },
        );
      }

      const teacherResult = await getTeacherByUserId(session.user.id);
      if (!teacherResult.success || !teacherResult.teacher) {
        return data({ success: false, error: 'Enseignant introuvable.' }, { status: 403 });
      }

      const availabilityResult = await getAvailability(parsed.data.id);
      if (!availabilityResult.success || !availabilityResult.availability) {
        return data({ success: false, error: 'Disponibilité introuvable.' }, { status: 404 });
      }
      if (availabilityResult.availability.teacherId !== teacherResult.teacher.id) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
      }

      const result = await deleteAvailability(parsed.data.id);
      return data(result, { status: result.success ? 200 : 400 });
    }

    case 'PATCH': {
      const body = await request.json();
      const parsed = batchAvailabilitySchema.safeParse(body);

      if (!parsed.success) {
        return data(
          {
            success: false,
            error: parsed.error.issues.map((e) => e.message).join(', '),
          },
          { status: 400 },
        );
      }

      const teacherResult = await getTeacherByUserId(session.user.id);
      if (!teacherResult.success || !teacherResult.teacher) {
        return data({ success: false, error: 'Enseignant introuvable.' }, { status: 403 });
      }

      const teacher = teacherResult.teacher;

      if (parsed.data.add.some((s) => s.teacherId !== teacher.id)) {
        return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
      }

      if (parsed.data.delete.length > 0) {
        const deleteChecks = await Promise.all(parsed.data.delete.map((id) => getAvailability(id)));
        if (deleteChecks.some((r) => !r.success || !r.availability || r.availability.teacherId !== teacher.id)) {
          return data({ success: false, error: 'Non autorisé.' }, { status: 403 });
        }
      }

      const result = await batchUpdateAvailabilities(parsed.data.add, parsed.data.delete);
      return data(result, { status: result.success ? 200 : 500 });
    }

    default:
      return data({ error: 'Method not allowed' }, { status: 405 });
  }
}
