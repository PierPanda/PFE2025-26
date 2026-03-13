import CourseForm from './course-form';
import { useState } from 'react';
import CourseValidation from './course-validation';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { useLoaderData, useFetcher } from 'react-router';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { uuidv7 } from 'uuidv7';
import { createCourse } from '~/services/courses/create-course';
import { getTeacherByUserId } from '~/services/teachers/get-teacher';
import { cn } from '~/lib/utils';
import { createCourseSchema } from '~/lib/validation';
import type { CourseFormInput, CreateCourseInput } from '~/types/course';
export type { CourseFormInput, CreateCourseInput };

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
  if (!teacherResult.success || !teacherResult.teacher) {
    return { success: false, error: 'Profil enseignant introuvable.' };
  }
  const teacherId = teacherResult.teacher.id;

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
  useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleValidSubmit = (data: CourseFormInput) => {
    setSubmitted(data);
    setFormValidated(true);
  };

  const handleCreateCourse = (published: boolean) => {
    if (!submitted) return;

    const payload = {
      ...submitted,
      id: uuidv7(),
      isPublished: published,
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    fetcher.submit(formData, { method: 'post' });
  };

  return (
    <div className="min-h-screen bg-brand/10 px-4 py-14">
      <div className="mx-auto max-w-lg">
        <div className="mb-10 text-center">
          <p className="mb-1 text-xs font-semibold tracking-[0.3em] text-brand uppercase">VOTRE MUSIQUE COMMENCE ICI</p>
          <h1 className="text-4xl font-bold text-gray-900">{formValidated ? 'Vérification' : 'Nouveau cours'}</h1>
        </div>

        <div className="mb-10 flex items-start justify-center gap-1">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300',
                !formValidated ? 'bg-brand text-black' : 'bg-gray-200 text-gray-500',
              )}
            >
              {formValidated ? '✓' : '1'}
            </div>
            <span className={cn('text-xs font-medium', !formValidated ? 'text-brand' : 'text-gray-400')}>
              Informations
            </span>
          </div>

          <div
            className={cn(
              'mx-3 mt-4 h-0.5 w-16 rounded-full transition-colors duration-300',
              formValidated ? 'bg-brand' : 'bg-gray-200',
            )}
          />

          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300',
                formValidated ? 'bg-brand/10 text-brand' : 'bg-brand/10 text-gray-400',
              )}
            >
              2
            </div>
            <span className={cn('text-xs font-medium', formValidated ? 'text-brand' : 'text-gray-400')}>
              Validation
            </span>
          </div>
        </div>

        {/* Carte formulaire */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg shadow-black/5">
          {!formValidated && <CourseForm values={submitted} onValidSubmit={handleValidSubmit} />}
          {formValidated && submitted && (
            <CourseValidation
              values={submitted}
              createCourse={handleCreateCourse}
              onBack={() => setFormValidated(false)}
            />
          )}

          {fetcher.data?.success && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-700">
              Cours créé avec succès !
            </div>
          )}
          {fetcher.data?.error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
              {fetcher.data.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
