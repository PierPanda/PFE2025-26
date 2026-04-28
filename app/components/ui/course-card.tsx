import { useEffect, useState } from 'react';
import {
  addToast,
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import { Link, useFetcher, useRevalidator } from 'react-router';
import EditCourseModal from '~/components/profile/edit-course-modal';
import { levelOptions } from '~/lib/constant';
import { calculateAverageRating } from '~/lib/utils';
import type { CourseWithTeacherAndRatings } from '~/services/types';

type CourseCardProps = {
  course: CourseWithTeacherAndRatings;
  currentUserId?: string | null;
  currentUserRole?: string | null;
  deleteAction?: string;
};

export default function CourseCard({
  course,
  currentUserId = null,
  currentUserRole = null,
  deleteAction = '/profile',
}: CourseCardProps) {
  const [courseState, setCourseState] = useState(course);
  const revalidator = useRevalidator();
  const deleteFetcher = useFetcher<{ success?: boolean }>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);

  useEffect(() => {
    setCourseState(course);
  }, [course]);

  useEffect(() => {
    if (deleteFetcher.state === 'idle' && deleteFetcher.data?.success) {
      setConfirmOpen(false);
      revalidator.revalidate();
    }
  }, [deleteFetcher.data, deleteFetcher.state, revalidator]);

  const ratings = courseState.ratings ?? [];
  const averageRating = calculateAverageRating(ratings);
  const levelLabel =
    levelOptions.find((levelOption) => levelOption.key === courseState.level)?.value ?? courseState.level;
  const isCourseOwner = courseState.teacher.user.id === currentUserId;
  const canManageCourse = isCourseOwner;
  const urlImage = `/categories/${courseState.category}.jpg`;

  const handleDelete = () => {
    deleteFetcher.submit(
      { _action: 'deleteCourse', courseId: courseState.id },
      { method: 'post', action: deleteAction },
    );
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    const browserNavigator = window.navigator;
    const canUseNativeShare = typeof browserNavigator.share === 'function';
    const clipboard = browserNavigator.clipboard;
    const shareUrl = new URL(`/courses/${courseState.id}`, window.location.origin).toString();

    try {
      if (canUseNativeShare) {
        await browserNavigator.share({
          title: courseState.title,
          text: `Découvrez le cours "${courseState.title}" sur Maestroo.`,
          url: shareUrl,
        });
        return;
      }

      if (clipboard?.writeText) {
        await clipboard.writeText(shareUrl);
        addToast({
          title: 'Lien copié',
          description: 'Le lien du cours a bien été copié dans le presse-papiers.',
          color: 'success',
        });
        return;
      }

      throw new Error('Clipboard unavailable');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      addToast({
        title: 'Partage impossible',
        description: "Le lien du cours n'a pas pu être partagé.",
        color: 'danger',
      });
    }
  };

  return (
    <>
      <li className="shrink-0">
        <Card
          className="h-full max-w-80 border-none bg-transparent p-2 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
          radius="lg"
          shadow="sm"
        >
          <div className="relative">
            <Link to={`/courses/${courseState.id}`} className="block">
              <Image
                alt={courseState.title}
                className="rounded-t-lg object-cover"
                height={150}
                src={urlImage}
                width={350}
              />
            </Link>

            <Chip className="absolute left-3 top-3 z-10 bg-chip-light text-sm font-bold text-chip-dark" radius="sm">
              {levelLabel}
            </Chip>

            {canManageCourse ? (
              <div className="absolute right-2 top-2 z-10">
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      aria-label="Options"
                      className="bg-white/80 backdrop-blur-sm"
                      size="sm"
                      variant="solid"
                    >
                      <InlineIcon icon="mdi:dots-vertical" width="20" />
                    </Button>
                  </DropdownTrigger>

                  <DropdownMenu aria-label="Gestion du cours">
                    <DropdownItem
                      key="edit"
                      startContent={<InlineIcon icon="mdi:pencil" width="16" />}
                      onPress={() => setEditOpen(true)}
                    >
                      Modifier
                    </DropdownItem>

                    <DropdownItem
                      key="share"
                      startContent={<InlineIcon icon="mdi:share-variant" width="16" />}
                      onPress={handleShare}
                    >
                      Partager
                    </DropdownItem>

                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<InlineIcon icon="mdi:trash-can-outline" width="16" />}
                      onPress={() => setConfirmOpen(true)}
                    >
                      Supprimer
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            ) : null}
          </div>

          <CardBody>
            <Link to={`/courses/${courseState.id}`} className="block h-full text-inherit no-underline">
              <div className="flex h-full flex-col items-start justify-between">
                <div>
                  <div className="mb-4 flex items-center gap-1">
                    <InlineIcon color="#FFA500" height="20" icon="mdi:star" width="20" />
                    <p className="text-sm text-dark/60">
                      {averageRating ? averageRating.toFixed(1) : 'N/A'} ({ratings.length})
                    </p>
                  </div>

                  <p className="text-lg font-medium text-dark/80">{courseState.teacher.user.name}</p>
                  <h3 className="mb-2 text-xl font-semibold leading-6 text-dark">{courseState.title}</h3>
                  <p className="text-lg font-light text-dark">{courseState.description}</p>
                </div>

                <div className="mt-4 flex w-full items-center justify-between">
                  <div className="flex items-center justify-start gap-2">
                    <InlineIcon icon="mdi:clock-outline" width="18" />
                    <p>{courseState.duration} min</p>
                  </div>

                  <div className="flex items-center justify-start gap-2">
                    <InlineIcon icon="mdi:money" width="18" />
                    <p>{courseState.price} €</p>
                  </div>
                </div>
              </div>
            </Link>
          </CardBody>
        </Card>
      </li>

      <EditCourseModal
        key={`${courseState.id}:${String(courseState.updatedAt)}:${isEditOpen ? 'open' : 'closed'}`}
        isOpen={isEditOpen}
        onClose={() => setEditOpen(false)}
        onSaved={setCourseState}
        course={courseState}
      />

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} size="sm">
        <ModalContent>
          <ModalHeader>Supprimer le cours</ModalHeader>

          <ModalBody>
            <p className="text-gray-600">
              Etes-vous sur de vouloir supprimer <span className="font-semibold">{courseState.title}</span> ? Cette
              action est irreversible.
            </p>
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button color="danger" isLoading={deleteFetcher.state === 'submitting'} onPress={handleDelete}>
              Supprimer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
