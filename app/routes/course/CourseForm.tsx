import {
  Input,
  NumberInput,
  Button,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { categoryValues, levelValues } from "~/types/course";
import type { CourseFormInput } from "./create";

const categories = categoryValues.map((cat) => ({
  key: cat,
  label: cat,
}));

const levels = levelValues.map((level) => ({
  key: level,
  label: level,
}));

type CourseFormProps = {
  values: CourseFormInput | null;
  errors: Record<string, string>;
};

export default function CourseForm({ values, errors }: CourseFormProps) {
  return (
    <>
      <Input
        isRequired
        errorMessage={errors.title || "Veuillez renseigner un titre"}
        label="Titre du cours"
        name="title"
        placeholder="Cours de piano argentin"
        type="text"
        defaultValue={values?.title || ""}
      />
      <Autocomplete
        isRequired
        className="max-w-xs"
        defaultItems={categories}
        label="Catégorie du cours"
        placeholder="Recherchez une catégorie"
        name="category"
        defaultSelectedKey={values?.category || ""}
      >
        {(item) => (
          <AutocompleteItem key={item.key} className="capitalize">
            {item.label}
          </AutocompleteItem>
        )}
      </Autocomplete>
      <Select
        isRequired
        className="max-w-xs"
        label="Niveau du cours"
        placeholder="Selectionne le niveau du cours"
        name="level"
        defaultSelectedKeys={values?.level ? [values.level] : []}
      >
        {levels.map((levelItem) => (
          <SelectItem key={levelItem.key} className="capitalize">
            {levelItem.label}
          </SelectItem>
        ))}
      </Select>

      <Textarea
        isRequired
        className="max-w-xs"
        label="Description"
        placeholder="Écrire une courte description"
        name="description"
        errorMessage={
          errors.description || "Veuillez renseigner une description"
        }
        defaultValue={values?.description || ""}
      />
      <NumberInput
        isRequired
        errorMessage={errors.price || "Veuillez renseigner un prix valide"}
        label="Prix du cours"
        name="price"
        placeholder="Prix du cours en euros"
        defaultValue={values?.price ? Number(values.price) : 0}
      />
      <NumberInput
        isRequired
        errorMessage={errors.duration || "Veuillez renseigner une durée valide"}
        label="Durée du cours"
        name="duration"
        placeholder="Durée du cours en minutes"
        defaultValue={values?.duration || 0}
      />
      <Button type="submit" variant="solid">
        Valider les données
      </Button>
    </>
  );
}
