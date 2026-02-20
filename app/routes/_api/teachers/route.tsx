// API Route: /api/teachers
// Handles CRUD operations for teachers

import {
  data,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import { authenticateUser } from "~/server/utils/authentify-user";
import { createTeacherSchema, updateTeacherSchema } from "~/lib/validation";
import { createTeacher } from "~/services/teachers/createTeacher.server";
import {
  getTeacher,
  getTeacherByUserId,
} from "~/services/teachers/getTeacher.server";
import { updateTeacher } from "~/services/teachers/updateTeacher.server";
import { deleteTeacher } from "~/services/teachers/deleteTeacher.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const teacherId = url.searchParams.get("id");
  const userId = url.searchParams.get("userId");

  if (teacherId) {
    const result = await getTeacher(teacherId);
    if (!result.success) {
      return data({ error: result.error }, { status: 404 });
    }
    return result;
  }

  if (userId) {
    const result = await getTeacherByUserId(userId);
    return result;
  }

  return data({ error: "Teacher ID or User ID required" }, { status: 400 });
}

export async function action({ request }: ActionFunctionArgs) {
  const { user } = await authenticateUser(request);

  const method = request.method.toUpperCase();

  switch (method) {
    case "POST": {
      const body = await request.json();
      const parsed = createTeacherSchema.safeParse(body);

      if (!parsed.success) {
        return data(
          { success: false, errors: parsed.error.flatten() },
          { status: 400 },
        );
      }

      const result = await createTeacher(parsed.data);
      return data(result, { status: result.success ? 201 : 400 });
    }

    case "PUT": {
      const url = new URL(request.url);
      const teacherId = url.searchParams.get("id");

      if (!teacherId) {
        return data(
          { success: false, error: "Teacher ID required" },
          { status: 400 },
        );
      }

      const body = await request.json();
      const parsed = updateTeacherSchema.safeParse(body);

      if (!parsed.success) {
        return data(
          { success: false, errors: parsed.error.flatten() },
          { status: 400 },
        );
      }

      const result = await updateTeacher(teacherId, parsed.data);
      return result;
    }

    case "DELETE": {
      const url = new URL(request.url);
      const teacherId = url.searchParams.get("id");

      if (!teacherId) {
        return data(
          { success: false, error: "Teacher ID required" },
          { status: 400 },
        );
      }

      const result = await deleteTeacher(teacherId);
      return result;
    }

    default:
      return data({ error: "Method not allowed" }, { status: 405 });
  }
}
