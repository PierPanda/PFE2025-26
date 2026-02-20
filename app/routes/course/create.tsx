import CourseForm from "./CourseForm";
import { Form } from "@heroui/react";
import { useState } from "react";
import CourseValidation from "./CourseValidation";
import {
  createCourseSchema,
  createCourse,
} from "~/server/actions/course/create.actions";
import type { Course } from "~/types/course";
import { auth } from "~/server/lib/auth";
import { redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/create";
import { getTeacherByUserId } from "~/server/actions/teacher/get.actions";
import { uuidv7 } from "uuidv7";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      throw redirect("/auth");
    }

    const teacherResult = await getTeacherByUserId(session.user.id);

    if (!teacherResult.success || !teacherResult.teacher) {
      throw redirect("/auth");
    }
    const isTeacher = teacherResult.teacher.length > 0;
    const teacher = isTeacher ? teacherResult.teacher[0] : null;
    if (!isTeacher || !teacher) {
      throw redirect("/auth");
    }

    return { user: session.user, teacher, isTeacher };
  } catch {
    throw redirect("/auth");
  }
}

export default function CreateCourse() {
  const [submitted, setSubmitted] = useState<Course | null>(null);
  const [formValidated, setFormValidated] = useState(false);
  const { teacher } = useLoaderData<typeof loader>();

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.currentTarget));

    const dataParsed = createCourseSchema.safeParse(formData);
    if (!dataParsed.success) {
      console.log("Validation errors:", dataParsed.error);
      return;
    }
    setSubmitted(dataParsed.data);
    setFormValidated(true);
  };

  const prepareCreateCourse = async (published: boolean) => {
    if (!submitted || Object.keys(submitted).length === 0) return;
    const payload = {
      ...submitted,
      id: uuidv7(),
      teacherId: teacher.id,
      isPublished: published,
    };
    const dataParsed = createCourseSchema.safeParse(payload);
    if (!dataParsed.success) {
      console.log("Validation errors:", dataParsed.error);
      return;
    }
    const result = await createCourse(dataParsed.data);
    return result.success
      ? redirect("/profile")
      : alert("Une erreur s'est produite lors de la création du cours.");
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
            createCourse={prepareCreateCourse}
          />
        )}
      </Form>
    </div>
  );
}
