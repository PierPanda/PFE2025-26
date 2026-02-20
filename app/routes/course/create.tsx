import CourseForm from "./CourseForm";
import { Form } from "@heroui/react";
import { useState } from "react";
import CourseValidation from "./CourseValidation";
import { z } from "zod";
import { categoryValues, levelValues } from "~/types/course";
import { auth } from "~/server/lib/auth.server";
import { redirect, useLoaderData, useFetcher } from "react-router";
import type { Route } from "./+types/create";
import { createCourse } from "~/server/actions/course/create.actions.server";
import { getTeacherByUserId } from "~/server/actions/teacher/get.server";
import { createTeacher } from "~/server/actions/teacher/create.server";

// Schema for form validation (client-side)
export const courseFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  duration: z.coerce.number().min(1, "La durée est requise."),
  level: z.enum(levelValues),
  price: z.coerce
    .number()
    .min(0, "Le prix doit être supérieur ou égal à 0.")
    .transform((val) => val.toString()),
  category: z.enum(categoryValues),
});

// Full schema for server-side validation (includes generated fields)
export const createCourseSchema = z.object({
  id: z.string().uuid("L'ID est requis."),
  teacherId: z.string().min(1, "L'ID enseignant est requis."),
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  duration: z.coerce.number().min(1, "La durée est requise."),
  level: z.enum(levelValues),
  price: z.coerce
    .number()
    .min(0, "Le prix doit être supérieur ou égal à 0.")
    .transform((val) => val.toString()),
  isPublished: z.coerce.boolean().default(false),
  category: z.enum(categoryValues),
});

export type CourseFormInput = z.infer<typeof courseFormSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      throw redirect("/auth");
    }

    // Check if user is already a teacher
    const teacherResult = await getTeacherByUserId(session.user.id);
    const isTeacher =
      teacherResult.success &&
      teacherResult.teacher &&
      teacherResult.teacher.length > 0;
    const teacher = isTeacher ? teacherResult.teacher![0] : null;

    return { user: session.user, teacher, isTeacher };
  } catch {
    throw redirect("/auth");
  }
}

export async function action({ request }: Route.ActionArgs) {
  // Verify authentication
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return { success: false, error: "Non authentifié." };
  }

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Check if user is already a teacher
  const teacherResult = await getTeacherByUserId(session.user.id);
  let teacherId: string;

  if (
    teacherResult.success &&
    teacherResult.teacher &&
    teacherResult.teacher.length > 0
  ) {
    // User is already a teacher
    teacherId = teacherResult.teacher[0].id;
  } else {
    // Create teacher record for this user
    const newTeacherId = crypto.randomUUID();
    const teacherCreation = await createTeacher({
      id: newTeacherId,
      userId: session.user.id,
    });

    if (!teacherCreation.success) {
      return {
        success: false,
        error: "Erreur lors de la création du profil enseignant.",
      };
    }
    teacherId = newTeacherId;
  }

  // Override teacherId with the actual one
  const courseData = { ...data, teacherId };

  const parsed = createCourseSchema.safeParse(courseData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten() };
  }

  const result = await createCourse(parsed.data);
  return result;
}

export default function CreateCourse() {
  const [submitted, setSubmitted] = useState<CourseFormInput | null>(null);
  const [formValidated, setFormValidated] = useState(false);
  const { teacher } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.currentTarget));

    // Validate form fields only (not generated fields like id, teacherId)
    const dataParsed = courseFormSchema.safeParse(formData);
    if (!dataParsed.success) {
      console.log("Validation errors:", dataParsed.error);
      return;
    }
    setSubmitted(dataParsed.data);
    setFormValidated(true);
  };

  const handleCreateCourse = (published: boolean) => {
    if (!submitted) return;

    const payload = {
      ...submitted,
      id: crypto.randomUUID(),
      teacherId: teacher?.id ?? "pending",
      isPublished: published,
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div>
      <h1>
        {formValidated ? "Validation de mon cours" : "Création de mon cours"}
      </h1>
      <Form className="w-full max-w-xs" onSubmit={onSubmit}>
        {!formValidated && <CourseForm values={submitted} errors={{}} />}
        {formValidated && submitted && (
          <CourseValidation
            values={submitted}
            createCourse={handleCreateCourse}
          />
        )}
      </Form>
      {fetcher.data?.success && (
        <p className="text-green-600">Cours créé avec succès!</p>
      )}
      {fetcher.data?.error && (
        <p className="text-red-600">{fetcher.data.error}</p>
      )}
    </div>
  );
}
