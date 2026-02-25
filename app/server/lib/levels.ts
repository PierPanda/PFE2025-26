export const levelOptions = [
  { label: "Débutant", value: "debutant" },
  { label: "Intermédiaire", value: "intermediaire" },
  { label: "Avancé", value: "avance" },
] as const;

export const levelValues = levelOptions.map(
  (option) => option.value,
) as unknown as readonly [CourseLevel, ...CourseLevel[]];

export type CourseLevel = (typeof levelOptions)[number]["value"];
