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
import { useState } from 'react';
import { categoryOptions, levelOptions } from '~/lib/constant';
import { capitalize } from '~/lib/utils';
import type { CourseFormInput } from './create-course-form';

type CourseFormProps = {
  values: CourseFormInput | null;
  errors: Record<string, string>;
};

export default function CourseForm({ values, errors }: CourseFormProps) {
  const initialCategory = categoryOptions.find((category) => category.value === values?.category);

  const [selectedCategoryValue, setSelectedCategoryValue] = useState<string>(values?.category ?? '');
  const [categoryInputValue, setCategoryInputValue] = useState<string>(
    initialCategory?.label ? capitalize(initialCategory.label) : '',
  );

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
        isInvalid={errors.title ? true : undefined}
        errorMessage={errors.title}
      />

      <div className="grid grid-cols-2 gap-4">
        <Autocomplete
          isRequired
          color="warning"
          variant="bordered"
          defaultItems={categoryOptions}
          label="Catégorie"
          placeholder="Instrument…"
          name="category"
          selectedKey={selectedCategoryValue || null}
          inputValue={categoryInputValue}
          onInputChange={(value) => {
            setCategoryInputValue(value);
            if (!value) {
              setSelectedCategoryValue('');
            }
          }}
          onSelectionChange={(key) => {
            const selectedValue = typeof key === 'string' ? key : '';
            setSelectedCategoryValue(selectedValue);

            const selectedCategory = categoryOptions.find((category) => category.value === selectedValue);
            setCategoryInputValue(selectedCategory?.label ? capitalize(selectedCategory.label) : '');
          }}
          isInvalid={errors.category ? true : undefined}
          errorMessage={errors.category}
        >
          {(item) => (
            <AutocompleteItem key={item.value} className="capitalize">
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
          classNames={{
            value: 'capitalize',
          }}
          defaultSelectedKeys={values?.level ? [values.level] : []}
          isInvalid={errors.level ? true : undefined}
          errorMessage={errors.level}
        >
          {levelOptions.map((levelItem) => (
            <SelectItem key={levelItem.value} className="capitalize">
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
        isInvalid={errors.description ? true : undefined}
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
          isInvalid={errors.price ? true : undefined}
          errorMessage={errors.price}
        />
        <NumberInput
          isRequired
          color="warning"
          variant="bordered"
          label="Durée (min)"
          name="duration"
          placeholder="60"
          isInvalid={errors.duration ? true : undefined}
          errorMessage={errors.duration}
        />
      </div>

      <Button type="submit" color="warning" className="mt-2 h-12 w-full rounded-xl font-semibold tracking-wide">
        Continuer →
      </Button>
    </div>
  );
}
