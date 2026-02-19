import { Input, Button } from "@heroui/react";

type CourseValidationProps = {
  values: Record<string, any>;
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
      <Input label="Prix du cours (€)" value={values.price || ""} readOnly />
      <Input
        label="Durée du cours (minutes)"
        value={values.duration || ""}
        readOnly
      />
      <Button type="button" variant="bordered" onPress={createCourse}>
        Créer le cours
      </Button>
    </>
  );
}
