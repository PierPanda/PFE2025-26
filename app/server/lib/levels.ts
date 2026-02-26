export const levelOptions = [
  { label: "débutant", value: "debutant" },
  { label: "intermédiaire", value: "intermediaire" },
  { label: "avancé", value: "avance" },
] as const;

export const levelValues = levelOptions.map(
  (option) => option.value,
) as unknown as readonly [CourseLevel, ...CourseLevel[]];

export type CourseLevel = (typeof levelOptions)[number]["value"];
