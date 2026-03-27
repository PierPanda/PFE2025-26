type CourseDescriptionProps = {
  description: string | null;
};

export default function CourseDescription({ description }: CourseDescriptionProps) {
  if (!description) return null;

  return (
    <div className="space-y-2">
      <h2 className="mb-3 text-xl font-semibold">Description</h2>
      <p className="leading-relaxed text-brand-dark/80">{description}</p>
    </div>
  );
}
