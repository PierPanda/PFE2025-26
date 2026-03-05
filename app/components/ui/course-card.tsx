import { Card, CardBody, Image, Chip } from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import { Link } from 'react-router';
import type { CourseWithTeacher } from '~/services/types';

export default function CourseCard({ course }: { course: CourseWithTeacher }) {
  const urlImage = `/categories/${course.category}.jpg`;
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
            className="absolute top-3 right-3 text-sm font-bold z-10 text-white bg-amber-400"
            radius="lg"
            startContent={<InlineIcon icon="mdi:clock-outline" width="18" />}
          >
            {course.duration} min
          </Chip>
        </div>
        <CardBody>
          <p className="text-3xl font-bold text-black mb-2">{course.price}€</p>
          <p className="text-amber-400 font-semibold text-sm uppercase mb-1">{course.teacher.user.name}</p>
          <h3 className="text-orange-500 font-bold text-2xl mb-2">{course.title}</h3>
          <p className="text-gray-700 text-sm">{course.description}</p>
        </CardBody>
      </Card>
    </li>
  );
}
