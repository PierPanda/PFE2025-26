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
import { categoryOptions } from "~/server/lib/categories";
import { levelOptions } from "~/server/lib/levels";
import type { CourseFormInput } from "./create";

type CourseFormProps = {
  values: CourseFormInput | null;
  errors: Record<string, string>;
};

export default function CourseForm({ values, errors }: CourseFormProps) {
  return (
    <div className="flex flex-col gap-4">
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
        defaultItems={categoryOptions}
        label="Catégorie du cours"
        placeholder="Recherchez une catégorie"
        name="category"
        defaultSelectedKey={values?.category || ""}
      >
        {(item) => (
          <AutocompleteItem key={item.value} className="capitalize">
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
        {levelOptions.map((levelItem) => (
          <SelectItem key={levelItem.value} className="capitalize">
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
      />
      <NumberInput
        isRequired
        errorMessage={errors.duration || "Veuillez renseigner une durée valide"}
        label="Durée du cours"
        name="duration"
        placeholder="Durée du cours en minutes"
      />
      <Button type="submit" variant="solid">
        Valider les données
      </Button>
    </div>
  );
}
