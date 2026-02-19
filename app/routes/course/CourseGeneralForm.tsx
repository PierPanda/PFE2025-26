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

export default function CourseGeneralForm({ goNextStep }) {
  return (
    <>
      <Input
        isRequired
        errorMessage="Veuillez renseigner un titre"
        label="Titre duc ours"
        labelPlacement="outside"
        name="title"
        placeholder="Cours de piano argentin"
        type="text"
      />
      <div className="border">
        <Autocomplete
          isRequired
          className="max-w-xs"
          defaultItems={categoryValues}
          label="Catégorie du cours"
          placeholder="Recherchez une catégorie"
        >
          {(item) => (
            <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
          )}
        </Autocomplete>
      </div>
      <div className="border">
        <Select
          isRequired
          className="max-w-xs"
          label="Niveau du cours"
          placeholder="Selectionne le niveau du cours"
        >
          {levelValues.map((levelItem) => (
            <SelectItem key={levelItem.key}>{levelItem.label}</SelectItem>
          ))}
        </Select>
      </div>
      <div className="border">
        <Textarea
          isRequired
          className="max-w-xs"
          label="Description"
          placeholder="Écrire une courte description"
        />
      </div>
      <Button type="button" variant="bordered" onPress={goNextStep}>
        Suivant
      </Button>
    </>
  );
}
