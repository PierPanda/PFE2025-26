import { Chip } from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import { categoryOptions, levelOptions } from '~/lib/constant';
import { calculateAverageRating, formatPrice } from '~/lib/utils';
import type { CourseWithTeacherAndRatings } from '~/services/types';

type CourseHeaderProps = {
  course: CourseWithTeacherAndRatings;
};

export default function CourseHeader({ course }: CourseHeaderProps) {
  const categoryLabel = categoryOptions.find((item) => item.key === course.category)?.value ?? course.category;
  const levelLabel = levelOptions.find((item) => item.key === course.level)?.value ?? course.level;
  const teacherName = course.teacher.user.name;
  const teacherOnlineSince = new Date(course.teacher.createdAt).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
  const reviewsCount = course.ratings.length;
  const averageRating = calculateAverageRating(course.ratings);
  const formattedRating = averageRating ? averageRating.toFixed(1).replace('.', ',') : null;

  return (
    <div className="space-y-5 py-4">
      <div className="flex flex-wrap gap-2">
        <Chip className="rounded-md bg-brand/10 text-brand">{categoryLabel}</Chip>
        <Chip className="rounded-md bg-brand-dark/5">{levelLabel}</Chip>
      </div>

      <div className="space-y-3">
        <div>
          <h1>{course.title}</h1>
          <p className="text-xl font-medium lg:text-2xl">avec {teacherName}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {formattedRating ? (
            <>
              <div className="flex items-center gap-1.5">
                <InlineIcon icon="mdi:star" className="text-brand-secondary" width="20" />
                <span className="font-semibold">{formattedRating}</span>
                <span className="text-brand-dark/80">({reviewsCount} avis)</span>
              </div>
              <span className="text-brand-dark/80">|</span>
            </>
          ) : null}
          <span className="text-brand-dark/80">En ligne depuis {teacherOnlineSince}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-2.5">
            <InlineIcon icon="mdi:clock-outline" width="24" />
            <span>{course.duration} min</span>
          </div>
          <div className="flex items-center gap-2.5">
            <InlineIcon icon="mdi:cash-multiple" width="24" />
            <span>{formatPrice(course.price)} par séance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
