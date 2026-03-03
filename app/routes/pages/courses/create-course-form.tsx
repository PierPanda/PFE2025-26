import CourseForm from './course-form';
import { useState } from 'react';
import CourseValidation from './course-validation';
import { z } from 'zod';
import { categoryValues, levelValues } from '~/types/course';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { useLoaderData, useFetcher, Form } from 'react-router';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { uuidv7 } from 'uuidv7';
import { createCourse } from '~/services/courses/create-course.server';
import { getTeacherByUserId } from '~/services/teachers/get-teacher.server';
import { createTeacher } from '~/services/teachers/create-teacher.server';
import { cn } from '~/lib/utils';

export const courseFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  description: z.string().min(1, 'La description est requise.'),
  duration: z.coerce.number().min(1, 'La durée est requise.'),
  level: z.enum(levelValues),
  price: z.coerce
    .number()
    .min(0, 'Le prix doit être supérieur ou égal à 0.')
    .transform((val: { toString: () => any }) => val.toString()),
  category: z.enum(categoryValues),
});

export const createCourseSchema = z.object({
  id: z.uuid("L'ID est requis."),
  teacherId: z.string().min(1, "L'ID enseignant est requis."),
  title: z.string().min(1, 'Le titre est requis.'),
  description: z.string().min(1, 'La description est requise.'),
  duration: z.coerce.number().min(1, 'La durée est requise.'),
  level: z.enum(levelValues),
  price: z.coerce
    .number()
    .min(0, 'Le prix doit être supérieur ou égal à 0.')
    .transform((val: { toString: () => any }) => val.toString()),
  isPublished: z.coerce.boolean().default(false),
  category: z.enum(categoryValues),
});

export type CourseFormInput = z.infer<typeof courseFormSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  const teacherResult = await getTeacherByUserId(session.user.id);
  const teacher = teacherResult.success ? teacherResult.teacher : null;
  const isTeacher = !!teacher;

  return { user: session.user, teacher, isTeacher };
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await authentifyUser(request);

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const teacherResult = await getTeacherByUserId(session.user.id);
  let teacherId: string;

  if (teacherResult.success && teacherResult.teacher) {
    teacherId = teacherResult.teacher.id;
  } else {
    const newTeacherId = uuidv7();
    const teacherCreation = await createTeacher({
      id: newTeacherId,
      userId: session.user.id,
    });

    if (!teacherCreation.success) {
      return {
        success: false,
        error: 'Erreur lors de la création du profil enseignant.',
      };
    }
    teacherId = newTeacherId;
  }

  const courseData = { ...data, teacherId };

  const parsed = createCourseSchema.safeParse(courseData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten() };
  }

  const result = await createCourse(parsed.data);
  return result;
}

export default function CreateCourse() {
  const [submitted, setSubmitted] = useState<CourseFormInput | null>(null);
  const [formValidated, setFormValidated] = useState(false);
  const { teacher } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.currentTarget));

    const dataParsed = courseFormSchema.safeParse(formData);
    if (!dataParsed.success) {
      console.log('Validation errors:', dataParsed.error);
      return;
    }
    setSubmitted(dataParsed.data);
    setFormValidated(true);
  };

  const handleCreateCourse = (published: boolean) => {
    if (!submitted) return;

    const payload = {
      ...submitted,
      id: uuidv7(),
      teacherId: teacher?.id ?? 'pending',
      isPublished: published,
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    fetcher.submit(formData, { method: 'post' });
  };

  return (
    <div className="dark min-h-screen bg-black px-4 py-14">
      <div className="mx-auto max-w-lg">
        {/* En-tête */}
        <div className="mb-10 text-center">
          <p className="mb-1 text-xs font-semibold tracking-[0.3em] text-brand uppercase">VOTRE MUSIQUE COMMENCE ICI</p>
          <h1 className="text-4xl font-bold text-white">{formValidated ? 'Vérification' : 'Nouveau cours'}</h1>
        </div>

        {/* Indicateur d'étapes */}
        <div className="mb-10 flex items-start justify-center gap-1">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300',
                !formValidated ? 'bg-brand text-black' : 'bg-zinc-700 text-zinc-400',
              )}
            >
              {formValidated ? '✓' : '1'}
            </div>
            <span className={cn('text-xs font-medium', !formValidated ? 'text-brand' : 'text-zinc-500')}>
              Informations
            </span>
          </div>

          <div
            className={cn(
              'mx-3 mt-4 h-0.5 w-16 rounded-full transition-colors duration-300',
              formValidated ? 'bg-brand' : 'bg-zinc-700',
            )}
          />

          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300',
                formValidated ? 'bg-brand text-black' : 'border-2 border-zinc-700 bg-black text-zinc-500',
              )}
            >
              2
            </div>
            <span className={cn('text-xs font-medium', formValidated ? 'text-brand' : 'text-zinc-500')}>
              Validation
            </span>
          </div>
        </div>

        {/* Carte formulaire */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl shadow-black/60">
          <Form className="w-full" onSubmit={onSubmit}>
            {!formValidated && <CourseForm values={submitted} errors={{}} />}
            {formValidated && submitted && (
              <CourseValidation
                values={submitted}
                createCourse={handleCreateCourse}
                onBack={() => setFormValidated(false)}
              />
            )}
          </Form>

          {fetcher.data?.success && (
            <div className="mt-6 rounded-xl border border-emerald-800/50 bg-emerald-950 p-4 text-center text-sm text-emerald-400">
              Cours créé avec succès !
            </div>
          )}
          {fetcher.data?.error && (
            <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950 p-4 text-center text-sm text-red-400">
              {fetcher.data.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
