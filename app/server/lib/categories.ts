export const categoryOptions = [
  { label: "Piano", value: "piano" },
  { label: "Guitare", value: "guitare" },
  { label: "Violon", value: "violon" },
  { label: "Batterie", value: "batterie" },
  { label: "Basse", value: "basse" },
  { label: "Saxophone", value: "saxophone" },
  { label: "Flûte", value: "flute" },
  { label: "Trompette", value: "trompette" },
  { label: "Violoncelle", value: "violoncelle" },
  { label: "Ukulélé", value: "ukulele" },
  { label: "Chant", value: "chant" },
  { label: "Chorale", value: "chorale" },
  { label: "Solfège", value: "solfege" },
  { label: "Clarinette", value: "clarinette" },
  { label: "Trombone", value: "trombone" },
  { label: "Hautbois", value: "hautbois" },
  { label: "Harpe", value: "harpe" },
  { label: "Accordéon", value: "accordeon" },
  { label: "Banjo", value: "banjo" },
  { label: "Mandoline", value: "mandoline" },
  { label: "Percussions", value: "percussions" },
  { label: "DJ", value: "dj" },
  { label: "Production-musicale", value: "production-musicale" },
  { label: "Autre", value: "autre" },
] as const;

export const categoryValues = categoryOptions.map(
  (option) => option.value,
) as unknown as readonly [CategoryValue, ...CategoryValue[]];

export type CategoryValue = (typeof categoryOptions)[number]["value"];
