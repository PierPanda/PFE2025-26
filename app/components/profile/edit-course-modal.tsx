import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
  NumberInput,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import { useFetcher, useRevalidator } from 'react-router';
import { categoryOptions, levelOptions } from '~/lib/constant';
import { courseFormSchema } from '~/lib/validation';
import type { CourseWithTeacherAndRatings, UpdateCourseResponse } from '~/services/types';

type EditCourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course: CourseWithTeacherAndRatings;
  action?: string;
  onSaved?: (course: CourseWithTeacherAndRatings) => void;
};

function validateField<K extends keyof typeof courseFormSchema.shape>(field: K, value: unknown): string | undefined {
  const fieldSchema = courseFormSchema.shape[field];
  const result = fieldSchema.safeParse(value);

  if (!result.success) {
    return result.error.issues[0]?.message;
  }
}

export default function EditCourseModal({
  isOpen,
  onClose,
  course,
  action = '/profile',
  onSaved,
}: EditCourseModalProps) {
  const fetcher = useFetcher<UpdateCourseResponse>();
  const revalidator = useRevalidator();
  const [selectedCategory, setSelectedCategory] = useState<string>(course.category);
  const isSubmitting = fetcher.state !== 'idle';

  const onCloseRef = useRef(onClose);
  const onSavedRef = useRef(onSaved);
  onCloseRef.current = onClose;
  onSavedRef.current = onSaved;

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      onSavedRef.current?.({ ...course, ...fetcher.data.course });
      onCloseRef.current();
      revalidator.revalidate();
    }
  }, [course, fetcher.state, fetcher.data, revalidator]);

  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(course.category);
    }
  }, [course.category, isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('_action', 'updateCourse');
    formData.set('courseId', course.id);
    fetcher.submit(formData, { method: 'POST', action });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Modifier le cours</ModalHeader>

        <form key={`${course.id}:${String(course.updatedAt)}`} onSubmit={handleSubmit}>
          <ModalBody className="flex flex-col gap-5">
            <Input
              isRequired
              color="warning"
              variant="bordered"
              label="Titre du cours"
              name="title"
              placeholder="Ex : Cours de piano jazz"
              type="text"
              defaultValue={course.title}
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
                placeholder="Instrument..."
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
                placeholder="Choisir..."
                name="level"
                defaultSelectedKeys={[course.level]}
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
              placeholder="Decrivez votre cours en quelques mots..."
              name="description"
              defaultValue={course.description ?? ''}
              validate={(value) => validateField('description', value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                isRequired
                color="warning"
                variant="bordered"
                label="Prix (EUR)"
                name="price"
                placeholder="0"
                defaultValue={Number(course.price)}
                validate={(value) => validateField('price', value)}
              />

              <NumberInput
                isRequired
                color="warning"
                variant="bordered"
                label="Duree (min)"
                name="duration"
                placeholder="60"
                defaultValue={course.duration}
                validate={(value) => validateField('duration', value)}
              />
            </div>
          </ModalBody>

          {fetcher.data && !fetcher.data.success && (
            <p className="px-6 pb-2 text-sm text-red-500">{fetcher.data.error}</p>
          )}

          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" color="warning" isLoading={isSubmitting}>
              Enregistrer
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
