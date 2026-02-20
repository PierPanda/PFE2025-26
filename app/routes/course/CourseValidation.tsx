import { Input, NumberInput, Button } from "@heroui/react";
import type { Course } from "~/types/course";

type CourseValidationProps = {
  values: Course;
  createCourse: () => void;
};

export default function CourseValidation({
  values,
  createCourse,
}: CourseValidationProps) {
  console.log(values);
  return (
    <>
      <h1>Validation</h1>
      <Input label="Titre du cours" value={values.title || ""} readOnly />
      <Input
        label="Catégorie du cours"
        value={values.category || ""}
        readOnly
      />
      <Input label="Niveau du cours" value={values.level || ""} readOnly />
      <Input label="Description" value={values.description || ""} readOnly />
      <NumberInput
        label="Prix du cours (€)"
        value={values.price || 0}
        readOnly
      />
      <NumberInput
        label="Durée du cours (minutes)"
        value={values.duration || 0}
        readOnly
      />
      <Button type="button" variant="bordered" onPress={createCourse}>
        Créer le cours
      </Button>
    </>
  );
}
