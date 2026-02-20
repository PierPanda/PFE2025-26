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
import { redirect } from "react-router";
import type { Route } from "./+types/create";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      throw redirect("/auth");
    }

    return { user: session.user };
  } catch {
    throw redirect("/auth");
  }
}

export default function CreateCourse() {
  const [submitted, setSubmitted] = useState<Course | null>(null);
  const [formValidated, setFormValidated] = useState(false);

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget));

    const dataParsed = createCourseSchema.safeParse(data);
    if (!dataParsed.success) {
      console.log("Validation errors:", dataParsed.error.flatten());
      return;
    }
    setSubmitted(dataParsed.data);
    setFormValidated(true);
  };

  const prepareCreateCourse = async () => {
    if (!submitted || Object.keys(submitted).length === 0) return;
    submitted.price = Number(submitted.price);
    const result = await createCourse(submitted);
    console.log("Course created:", result);
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
