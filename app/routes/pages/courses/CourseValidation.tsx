import { Input, NumberInput, Button } from "@heroui/react";
import type { CourseFormInput } from "./create";

type CourseValidationProps = {
  values: CourseFormInput;
  createCourse: (published: boolean) => void;
};

export default function CourseValidation({
  values,
  createCourse,
}: CourseValidationProps) {
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
      <Input label="Prix du cours (€)" value={values.price || "0"} readOnly />
      <NumberInput
        label="Durée du cours (minutes)"
        value={values.duration || 0}
        readOnly
      />
      <div>
        <Button
          type="button"
          variant="bordered"
          onPress={() => createCourse(true)}
        >
          Publier le cours
        </Button>
        <Button
          type="button"
          variant="bordered"
          onPress={() => createCourse(false)}
        >
          Enregistrer le cours en brouillon
        </Button>
      </div>
    </>
  );
}
