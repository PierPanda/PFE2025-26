import {
  Input,
  Button,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";

const categoryValues = [
  { key: "guitare", label: "Guitare" },
  { key: "piano", label: "Piano" },
  { key: "violin", label: "Violon" },
];

const levelValues = [
  { key: "beginner", label: "Débutant" },
  { key: "intermediaire", label: "Intermédiaire" },
  { key: "advanced", label: "Avancé" },
];

type CourseFormProps = {
  values: Record<string, any>;
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
        defaultValue={values.title || ""}
      />
      <Autocomplete
        isRequired
        className="max-w-xs"
        defaultItems={categoryValues}
        label="Catégorie du cours"
        placeholder="Recherchez une catégorie"
        name="category"
        defaultSelectedKey={values.category?.key || ""}
      >
        {(item) => (
          <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
        )}
      </Autocomplete>
      <Select
        isRequired
        className="max-w-xs"
        label="Niveau du cours"
        placeholder="Selectionne le niveau du cours"
        name="level"
        defaultSelectedKeys={values.level ? [values.level] : []}
      >
        {levelValues.map((levelItem) => (
          <SelectItem key={levelItem.key}>{levelItem.label}</SelectItem>
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
        defaultValue={values.description || ""}
      />
      <Input
        isRequired
        errorMessage={errors.price || "Veuillez renseigner un prix valide"}
        label="Prix du cours"
        name="price"
        placeholder="Prix du cours en euros"
        type="number"
        defaultValue={values.price || ""}
      />
      <Input
        isRequired
        errorMessage={errors.duration || "Veuillez renseigner une durée valide"}
        label="Durée du cours"
        name="duration"
        placeholder="Durée du cours en minutes"
        type="number"
        defaultValue={values.duration || ""}
      />
      <Button type="submit" variant="bordered">
        Valider les données
      </Button>
    </>
  );
}
