export const categoryOptions = [
  { label: "piano", value: "piano" },
  { label: "guitare", value: "guitare" },
  { label: "violon", value: "violon" },
  { label: "batterie", value: "batterie" },
  { label: "basse", value: "basse" },
  { label: "saxophone", value: "saxophone" },
  { label: "flûte", value: "flute" },
  { label: "trompette", value: "trompette" },
  { label: "violoncelle", value: "violoncelle" },
  { label: "ukulélé", value: "ukulele" },
  { label: "chant", value: "chant" },
  { label: "chorale", value: "chorale" },
  { label: "solfège", value: "solfege" },
  { label: "clarinette", value: "clarinette" },
  { label: "trombone", value: "trombone" },
  { label: "hautbois", value: "hautbois" },
  { label: "harpe", value: "harpe" },
  { label: "accordéon", value: "accordeon" },
  { label: "banjo", value: "banjo" },
  { label: "mandoline", value: "mandoline" },
  { label: "percussions", value: "percussions" },
  { label: "dj", value: "dj" },
  { label: "production musicale", value: "production-musicale" },
  { label: "autre", value: "autre" },
] as const;

export const categoryValues = categoryOptions.map(
  (option) => option.value,
) as unknown as readonly [CategoryValue, ...CategoryValue[]];

export type CategoryValue = (typeof categoryOptions)[number]["value"];
