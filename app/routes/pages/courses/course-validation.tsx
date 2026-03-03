import { Button } from '@heroui/react';
import type { CourseFormInput } from './create-course-form';
import { formatPrice, formatDuration } from '~/lib/utils';

type CourseValidationProps = {
  values: CourseFormInput;
  createCourse: (published: boolean) => void;
  onBack: () => void;
};

export default function CourseValidation({ values, createCourse, onBack }: CourseValidationProps) {
  const fields = [
    { label: 'Titre', value: values.title },
    { label: 'Catégorie', value: values.category },
    { label: 'Niveau', value: values.level },
    { label: 'Description', value: values.description },
    { label: 'Prix', value: formatPrice(values.price) },
    { label: 'Durée', value: formatDuration(values.duration) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-5 py-1">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between border-b border-zinc-800 py-3 last:border-0">
            <span className="w-24 shrink-0 text-sm text-zinc-500">{label}</span>
            <span className="text-right text-sm capitalize text-zinc-100">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          color="warning"
          className="h-12 w-full rounded-xl font-bold"
          onPress={() => createCourse(true)}
        >
          Publier le cours
        </Button>
        <Button
          type="button"
          className="h-12 w-full rounded-xl bg-brand-secondary font-semibold text-white"
          onPress={() => createCourse(false)}
        >
          Enregistrer en brouillon
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="mt-1 text-center text-sm text-zinc-500 transition-colors hover:text-white"
        >
          ← Modifier les informations
        </button>
      </div>
    </div>
  );
}
