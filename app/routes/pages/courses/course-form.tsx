import {
  Input,
  NumberInput,
  Button,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import { categoryValues, levelValues } from '~/types/course';
import type { CourseFormInput } from './create-course-form';

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
    <div className="flex flex-col gap-5">
      <Input
        isRequired
        color="warning"
        variant="bordered"
        label="Titre du cours"
        name="title"
        placeholder="Ex : Cours de piano jazz"
        type="text"
        defaultValue={values?.title || ''}
        isInvalid={!!errors.title}
        errorMessage={errors.title}
      />

      <div className="grid grid-cols-2 gap-4">
        <Autocomplete
          isRequired
          color="warning"
          variant="bordered"
          defaultItems={categories}
          label="Catégorie"
          placeholder="Instrument…"
          name="category"
          defaultSelectedKey={values?.category || ''}
        >
          {(item) => (
            <AutocompleteItem key={item.key} className="capitalize">
              {item.label}
            </AutocompleteItem>
          )}
        </Autocomplete>

        <Select
          isRequired
          color="warning"
          variant="bordered"
          label="Niveau"
          placeholder="Choisir…"
          name="level"
          defaultSelectedKeys={values?.level ? [values.level] : []}
        >
          {levels.map((levelItem) => (
            <SelectItem key={levelItem.key} className="capitalize">
              {levelItem.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      <Textarea
        isRequired
        color="warning"
        variant="bordered"
        minRows={3}
        label="Description"
        placeholder="Décrivez votre cours en quelques mots…"
        name="description"
        isInvalid={!!errors.description}
        errorMessage={errors.description}
        defaultValue={values?.description || ''}
      />

      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          isRequired
          color="warning"
          variant="bordered"
          label="Prix (€)"
          name="price"
          placeholder="0"
          isInvalid={!!errors.price}
          errorMessage={errors.price}
        />
        <NumberInput
          isRequired
          color="warning"
          variant="bordered"
          label="Durée (min)"
          name="duration"
          placeholder="60"
          isInvalid={!!errors.duration}
          errorMessage={errors.duration}
        />
      </div>

      <Button type="submit" color="warning" className="mt-2 h-12 w-full rounded-xl font-semibold tracking-wide">
        Continuer →
      </Button>
    </div>
  );
}
