import { Card, CardBody, Image, Chip } from '@heroui/react';
import { InlineIcon } from '@iconify/react';

export default function CardCourses({ course }: { course: any }) {
  const urlImage = `/categories/${course.category}.jpg`;

  // Générer les étoiles de notation
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <InlineIcon
        key={index}
        icon={index < Math.floor(rating) ? 'mdi:star' : 'mdi:star-outline'}
        className={index < Math.floor(rating) ? 'text-amber-400' : 'text-amber-400'}
        width="24"
      />
    ));
  };

  return (
    <li key={course.id} className="shrink-0">
      <Card className="border-none bg-white max-w-80 h-full p-2" radius="lg" shadow="lg">
        <div className="relative">
          <Image alt="Courses image" className="object-cover rounded-t-lg" height={150} src={urlImage} width={350} />
          <Chip
            className="absolute top-3 right-3 text-sm font-bold z-10 text-white bg-amber-400"
            radius="lg"
            startContent={<InlineIcon icon="mdi:clock-outline" width="18" />}
          >
            60 min
          </Chip>
        </div>
        <CardBody className="">
          <div className="flex gap-1 mb-3 font-bold">{renderStars(course.rating || 4.5)}</div>
          <p className="text-3xl font-bold text-black mb-2">{course.price}€</p>
          <p className="text-amber-400 font-semibold text-sm uppercase mb-1">{course.teacherName}</p>
          <h3 className="text-orange-500 font-bold text-2xl mb-2">{course.title}</h3>
          <p className="text-gray-700 text-sm">{course.description}</p>
        </CardBody>
      </Card>
    </li>
  );
}
