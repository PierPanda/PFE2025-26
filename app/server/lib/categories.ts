import { categoryOptions } from '~/lib/constant';

export { categoryOptions };

export const categoryValues = categoryOptions.map((option) => option.value) as unknown as readonly [
  CategoryValue,
  ...CategoryValue[],
];

export type CategoryValue = (typeof categoryOptions)[number]['value'];
