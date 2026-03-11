import { levelOptions } from '~/lib/constant';

export { levelOptions };

export const levelValues = levelOptions.map((option) => option.key) as unknown as readonly [
  CourseLevel,
  ...CourseLevel[],
];

export type CourseLevel = (typeof levelOptions)[number]['key'];
