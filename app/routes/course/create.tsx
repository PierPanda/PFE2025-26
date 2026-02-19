import CourseGeneralForm from "./CourseGeneralForm";
import { Form } from "@heroui/react";
import { useState } from "react";

export default function CreateCourse() {
  const [submitted, setSubmitted] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const onSubmit = (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget));

    setSubmitted(data);
    console.log(submitted);
  };

  const goNextStep = () => {
    console.log();
  };

  return (
    <div>
      <h1>Créer un cours</h1>
      <Form className="w-full max-w-xs border" onSubmit={onSubmit}>
        <CourseGeneralForm goNextStep={goNextStep} />
      </Form>
    </div>
  );
}
