import { Chip } from '@heroui/react';
import type { CourseWithTeacher } from '~/services/types';

type CourseHeaderProps = {
  course: CourseWithTeacher;
};

export default function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex flex-wrap gap-2">
        <Chip color="warning" variant="flat" className="capitalize">
          {course.category}
        </Chip>
        <Chip color="default" variant="flat" className="capitalize">
          {course.level}
        </Chip>
      </div>

      <h1 className="mb-4 text-3xl font-bold text-gray-900">{course.title}</h1>

      <div className="flex flex-wrap gap-6 text-sm text-gray-500">
        <span>{course.duration} min / séance</span>
        <span className="capitalize">{course.level}</span>
        <span className="capitalize">{course.category}</span>
      </div>
    </div>
  );
}
