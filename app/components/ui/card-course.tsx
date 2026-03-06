import { useState } from 'react';
import {
  Card,
  CardBody,
  Image,
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import { formatDuration } from '~/lib/utils';
import { useFetcher } from 'react-router';

type CardCoursesProps = {
  course: any;
  showActions?: boolean;
};

export default function CardCourses({ course, showActions = false }: CardCoursesProps) {
  const urlImage = `/categories/${course.category}.jpg`;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fetcher = useFetcher();

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, index) => (
      <InlineIcon
        key={index}
        icon={index < Math.floor(rating) ? 'mdi:star' : 'mdi:star-outline'}
        className="text-amber-400"
        width="24"
      />
    ));

  const handleDelete = () => {
    fetcher.submit({ courseId: course.id }, { method: 'post', action: '/profile' });
    setConfirmOpen(false);
  };

  return (
    <>
      <li className="shrink-0">
        <Card className="border-none bg-white max-w-80 h-full p-2 shadow-sm" radius="lg" shadow="none">
          <div className="relative">
            <Image alt={course.title} className="object-cover rounded-t-lg" height={150} src={urlImage} width={350} />
            <Chip
              className="absolute top-3 left-3 text-sm font-bold z-10 text-white bg-amber-400"
              radius="lg"
              startContent={<InlineIcon icon="mdi:clock-outline" width="18" />}
            >
              {formatDuration(course.duration)}
            </Chip>

            {showActions && (
              <div className="absolute top-2 right-2 z-10">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="solid"
                      className="bg-white/80 backdrop-blur-sm"
                      aria-label="Options"
                    >
                      <InlineIcon icon="mdi:dots-vertical" width="20" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Gestion du cours">
                    <DropdownItem key="edit" startContent={<InlineIcon icon="mdi:pencil" width="16" />}>
                      Modifier
                    </DropdownItem>
                    <DropdownItem key="share" startContent={<InlineIcon icon="mdi:share-variant" width="16" />}>
                      Partager
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      color="danger"
                      className="text-danger"
                      startContent={<InlineIcon icon="mdi:trash-can-outline" width="16" />}
                      onPress={() => setConfirmOpen(true)}
                    >
                      Supprimer
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            )}
          </div>
          <CardBody>
            <div className="flex gap-1 mb-3 font-bold">{renderStars(course.rating || 4.5)}</div>
            <p className="text-3xl font-bold text-black mb-2">{course.price}€</p>
            <p className="text-amber-400 font-semibold text-sm uppercase mb-1">{course.teacherName}</p>
            <h3 className="text-orange-500 font-bold text-2xl mb-2">{course.title}</h3>
            <p className="text-gray-700 text-sm">{course.description}</p>
          </CardBody>
        </Card>
      </li>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} size="sm">
        <ModalContent>
          <ModalHeader>Supprimer le cours</ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer <span className="font-semibold">{course.title}</span> ? Cette action
              est irréversible.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={fetcher.state === 'submitting'}>
              Supprimer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
