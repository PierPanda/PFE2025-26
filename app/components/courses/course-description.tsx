type CourseDescriptionProps = {
  description: string | null;
};

export default function CourseDescription({ description }: CourseDescriptionProps) {
  if (!description) return null;

  return (
    <div>
      <h2 className="mb-3 text-xl font-semibold text-gray-900">Description</h2>
      <p className="leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}
