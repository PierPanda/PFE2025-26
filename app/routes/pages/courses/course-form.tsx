import {
  Input,
  NumberInput,
  Button,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
  Textarea,
  Form,
} from '@heroui/react';
import { useState } from 'react';
import { categoryOptions, levelOptions } from '~/lib/constant';
import { courseFormSchema } from '~/lib/validation';
import type { CourseFormInput } from './create-course-form';

type CourseFormProps = {
  values: CourseFormInput | null;
  onValidSubmit: (data: CourseFormInput) => void;
};

/** Valide un champ via le schéma Zod et retourne le message d'erreur ou undefined */
function validateField<K extends keyof typeof courseFormSchema.shape>(field: K, value: unknown): string | undefined {
  const fieldSchema = courseFormSchema.shape[field];
  const result = fieldSchema.safeParse(value);
  if (!result.success) {
    return result.error.issues[0]?.message;
  }
}

export default function CourseForm({ values, onValidSubmit }: CourseFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(values?.category ?? '');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));

    const parsed = courseFormSchema.safeParse(formData);
    if (!parsed.success) return; // La validation HeroUI affiche déjà les erreurs

    onValidSubmit(parsed.data);
  };

  return (
    <Form className="flex flex-col gap-5" validationBehavior="native" onSubmit={handleSubmit}>
      <Input
        isRequired
        color="warning"
        variant="bordered"
        label="Titre du cours"
        name="title"
        placeholder="Ex : Cours de piano jazz"
        type="text"
        defaultValue={values?.title || ''}
        validate={(value) => validateField('title', value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <input type="hidden" name="category" value={selectedCategory} />
        <Autocomplete
          isRequired
          color="warning"
          variant="bordered"
          defaultItems={categoryOptions}
          label="Catégorie"
          placeholder="Instrument…"
          selectedKey={selectedCategory || null}
          onSelectionChange={(key) => setSelectedCategory(typeof key === 'string' ? key : '')}
          validate={() => validateField('category', selectedCategory)}
        >
          {(item) => <AutocompleteItem key={item.key}>{item.value}</AutocompleteItem>}
        </Autocomplete>

        <Select
          isRequired
          color="warning"
          variant="bordered"
          label="Niveau"
          placeholder="Choisir…"
          name="level"
          defaultSelectedKeys={values?.level ? [values.level] : []}
          validate={(value) => validateField('level', value)}
        >
          {levelOptions.map((levelItem) => (
            <SelectItem key={levelItem.key}>{levelItem.value}</SelectItem>
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
        defaultValue={values?.description || ''}
        validate={(value) => validateField('description', value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          isRequired
          color="warning"
          variant="bordered"
          label="Prix (€)"
          name="price"
          placeholder="0"
          validate={(value) => validateField('price', value)}
        />
        <NumberInput
          isRequired
          color="warning"
          variant="bordered"
          label="Durée (min)"
          name="duration"
          placeholder="60"
          validate={(value) => validateField('duration', value)}
        />
      </div>

      <Button type="submit" color="warning" className="mt-2 h-12 w-full rounded-xl font-semibold tracking-wide">
        Continuer →
      </Button>
    </Form>
  );
}
