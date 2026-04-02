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
} from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import { Link, useNavigate } from 'react-router';
import { levelOptions } from '~/lib/constant';
import { calculateAverageRating } from '~/lib/utils';
import type { CourseWithTeacherAndRatings } from '~/services/types';

type CourseCardProps = {
  course: CourseWithTeacherAndRatings;
  currentUserId?: string | null;
};

export default function CourseCard({ course, currentUserId = null }: CourseCardProps) {
  const navigate = useNavigate();
  const urlImage = `/categories/${course.category}.jpg`;
  const ratings = course.ratings ?? [];
  const averageRating = calculateAverageRating(ratings);
  const levelLabel = levelOptions.find((levelOption) => levelOption.key === course.level)?.value ?? course.level;
  const isCourseOwner = course.teacher.user.id === currentUserId;

  return (
    <li className="shrink-0">
      <Card
        as={Link}
        to={`/courses/${course.id}`}
        className="border-none bg-transparent max-w-80 h-full p-2 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
        radius="lg"
        shadow="sm"
      >
        <div className="relative">
          <Image alt={course.title} className="object-cover rounded-t-lg" height={150} src={urlImage} width={350} />
          <Chip className="absolute top-3 left-3 text-sm font-bold z-10 text-dark-light bg-light" radius="sm">
            {levelLabel}
          </Chip>
          {isCourseOwner ? (
            <div className="absolute top-2 right-2 z-10">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="solid"
                    className="bg-white/80 backdrop-blur-sm"
                    aria-label="Options"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  >
                    <InlineIcon icon="mdi:dots-vertical" width="20" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Gestion du cours">
                  <DropdownItem
                    key="edit"
                    startContent={<InlineIcon icon="mdi:pencil" width="16" />}
                    onPress={() => navigate(`/courses/${course.id}`)}
                  >
                    Modifier
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          ) : null}
        </div>
        <CardBody>
          <div className="flex flex-col justify-between items-start h-full">
            <div>
              <div className="mb-4 flex items-center gap-1">
                <InlineIcon icon="mdi:star" width="20" height="20" color="#FFA500" />
                <p className="text-sm text-dark/60">
                  {averageRating ? averageRating.toFixed(1) : 'N/A'} ({ratings.length})
                </p>
              </div>
              <p className="text-dark/80 font-medium text-l">{course.teacher.user.name}</p>
              <h3 className="text-dark font-semibold text-xl mb-2 leading-6">{course.title}</h3>
              <p className="text-dark font-light text-l">{course.description}</p>
            </div>

            {/* //icons  */}
            <div className="flex justify-between items-center w-full mt-4">
              <div className="flex gap-2 items-center justify-start">
                <InlineIcon icon="mdi:clock-outline" width="18" />
                <p>{course.duration} min</p>
              </div>
              <div className="flex gap-2 items-center justify-start">
                <InlineIcon icon="mdi:money" width="18" />
                <p>{course.price} €</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </li>
  );
}
