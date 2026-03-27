import { Card, CardBody, Image, Chip } from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import { Link } from 'react-router';
import { calculateAverageRating } from '~/lib/utils';
import type { CourseWithTeacherAndRatings } from '~/services/types';

export default function CourseCard({ course }: { course: CourseWithTeacherAndRatings }) {
  const urlImage = `/categories/${course.category}.jpg`;
  const ratings = course.ratings ?? [];
  const averageRating = calculateAverageRating(ratings);

  return (
    <li className="shrink-0">
      <Card
        as={Link}
        to={`/courses/${course.id}`}
        className="border-none bg-white max-w-80 h-full p-2 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
        radius="lg"
        shadow="sm"
      >
        <div className="relative">
          <Image alt={course.title} className="object-cover rounded-t-lg" height={150} src={urlImage} width={350} />
          <Chip
            className="absolute top-3 left-3 text-sm font-bold z-10 text-[#662D14] bg-[#FFE6DB]"
            radius="sm"
            startContent={<InlineIcon icon="mdi:clock-outline" width="18" />}
          >
            {course.level}
          </Chip>
        </div>
        <CardBody>
          <div className="flex flex-col justify-between items-start h-full">
            <div>
              <div className="mb-1 flex items-center gap-1">
                <InlineIcon icon="mdi:star" width="20" height="20" color="#FFA500" />
                <p className="text-sm text-gray-600">
                  {averageRating ? averageRating.toFixed(1) : 'N/A'} ({ratings.length})
                </p>
              </div>
              <p className="text-gray-500 font-medium text-l uppercase mb-1">{course.teacher.user.name}</p>
              <h3 className="text-black font-semibold text-2xl mb-2">{course.title}</h3>
              <p className="text-black font-light text-l">{course.description}</p>
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
