import { data, useLoaderData, Link } from 'react-router';
import type { Route } from './+types/page';
import { useState } from 'react';
import { authentifyUser } from '~/server/utils/authentify-user';
import { auth } from '~/auth.server';
import { getCoursesByTeacher } from '~/services/courses/get-courses';
import { getTeacherByUserId } from '~/services/teachers/get-teacher';
import { deleteCourse } from '~/services/courses/delete-course';
import { updateTeacher } from '~/services/teachers/update-teacher';
import { uploadAvatar } from '~/server/services/upload/upload-avatar';
import { getAvailabilityByTeacherId } from '~/services/availabilities/get-availability';
import CardCourse from '~/components/ui/card-course';
import UserProfile from '~/components/profile/user-profile';
import EditProfileModal from '~/components/profile/edit-profile-modal';
import { AvailabilitiesModal } from '~/components/availabilities/availabilities-modal';
import { Button } from '@heroui/react';
import { Icon, InlineIcon } from '@iconify/react';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });

  const teacherResult = await getTeacherByUserId(session.user.id);
  const teacher = teacherResult.success ? teacherResult.teacher : null;

  const coursesResult = teacher ? await getCoursesByTeacher(teacher.id) : null;
  const courses = coursesResult?.success ? (coursesResult.courses ?? []) : [];

  const availabilityResult = teacher ? await getAvailabilityByTeacherId(teacher.id) : null;
  const availabilities = availabilityResult?.success ? availabilityResult.availabilities : [];

  return {
    user: session.user,
    teacher,
    courses,
    availabilities,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });
  const formData = await request.formData();
  const actionType = formData.get('_action') as string;

  if (actionType === 'updateProfile') {
    const name = (formData.get('name') as string)?.trim();
    if (!name) return { success: false, error: 'Le nom est requis.' };

    let imageUrl: string | undefined;
    const avatarFile = formData.get('avatar');
    if (avatarFile instanceof File && avatarFile.size > 0) {
      const uploadResult = await uploadAvatar(avatarFile, session.user.id);
      if (!uploadResult.success) return uploadResult;
      imageUrl = uploadResult.data;
    }

    // Met à jour user en DB + rafraîchit le cookie cache Better Auth
    const updateResponse = await auth.api.updateUser({
      headers: request.headers,
      body: {
        name,
        ...(imageUrl !== undefined && { image: imageUrl }),
      },
      asResponse: true,
    });

    const teacherResult = await getTeacherByUserId(session.user.id);
    if (teacherResult.success && teacherResult.teacher) {
      const description = formData.get('description') as string | null;
      const skills = formData.get('skills') as string | null;
      await updateTeacher(teacherResult.teacher.id, {
        id: teacherResult.teacher.id,
        ...(description !== null && { description }),
        ...(skills !== null && { skills }),
      });
    }

    // Propage les Set-Cookie pour que le navigateur reçoive le cookie rafraîchi
    const responseHeaders = new Headers();
    updateResponse.headers.getSetCookie().forEach((cookie) => {
      responseHeaders.append('Set-Cookie', cookie);
    });

    return data({ success: true, message: 'Profil mis à jour.' }, { headers: responseHeaders });
  }

  const courseId = formData.get('courseId') as string;
  if (!courseId) return { success: false, error: 'ID manquant.' };
  return deleteCourse(courseId);
}

export default function Page() {
  const { user, teacher, courses, availabilities } = useLoaderData<typeof loader>();
  const [isAvailabilitiesOpen, setAvailabilitiesOpen] = useState(false);
  const [isEditProfileOpen, setEditProfileOpen] = useState(false);

  return (
    <main className="px-10 py-8 flex flex-col gap-6">
      <div className="flex justify-between items-center bg-amber-50 rounded-2xl p-6 w-full gap-4">
        <UserProfile user={user} teacher={teacher} />
        <div className="flex gap-2 items-end shrink-0">
          {teacher && (
            <Button
              size="lg"
              color="warning"
              variant="flat"
              className="p-4"
              startContent={<Icon icon="mdi:calendar-clock" width="16" />}
              onPress={() => setAvailabilitiesOpen(true)}
            >
              Mes disponibilités
            </Button>
          )}
          <Button isIconOnly size="lg" color="warning" variant="flat" onPress={() => setEditProfileOpen(true)}>
            <Icon icon="mdi:pencil" width="16" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col bg-amber-50 rounded-2xl p-6 gap-4 w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Mes cours</h3>
          {courses.length > 0 && (
            <Link to="/courses/create">
              <Button isIconOnly size="sm" color="warning" className="text-white">
                <InlineIcon icon="mdi:plus" width="20" />
              </Button>
            </Link>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 mb-4">Vous n'avez pas encore de cours.</p>
            <Link to="/courses/create">
              <Button size="sm" color="warning" variant="flat">
                Créer mon premier cours
              </Button>
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <ul className="flex gap-4 pb-2">
              {courses.map((course) => (
                <CardCourse key={course.id} course={course} showActions />
              ))}
            </ul>
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        user={user}
        teacher={teacher}
      />

      {teacher && (
        <AvailabilitiesModal
          isOpen={isAvailabilitiesOpen}
          onClose={() => setAvailabilitiesOpen(false)}
          teacherId={teacher.id}
          availabilities={availabilities}
        />
      )}
    </main>
  );
}
