import CourseForm from "./CourseForm";
import { Form } from "@heroui/react";
import { useState } from "react";
import CourseValidation from "./CourseValidation";

export default function CreateCourse() {
  const [submitted, setSubmitted] = useState<Record<string, any> | null>(null);
  const [formValidated, setFormValidated] = useState(false);

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(e.currentTarget);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    setSubmitted(data);
    setFormValidated(true);

    console.log(data);
  };

  const createCourse = () => {
    console.log("Course created with data:", submitted);
  };

  return (
    <div>
      <h1>Créer un cours</h1>
      <Form className="w-full max-w-xs" onSubmit={onSubmit}>
        {!formValidated && <CourseForm values={submitted || {}} errors={{}} />}
        {formValidated && submitted && (
          <CourseValidation values={submitted} createCourse={createCourse} />
        )}
      </Form>
    </div>
  );
}
