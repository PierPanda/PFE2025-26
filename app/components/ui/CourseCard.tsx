import { Card, CardBody, Image, Chip } from "@heroui/react";
import { InlineIcon } from "@iconify/react";
import type { CourseWithTeacher } from "~/services/types";

export default function CourseCard({ course }: { course: CourseWithTeacher }) {
  const urlImage = `app/assets/categories/${course.category}.jpg`;
  return (
    <li key={course.id} className="shrink-0">
      <Card
        className="border-none bg-white max-w-80 h-full p-2"
        radius="lg"
        shadow="lg"
      >
        <div className="relative">
          <Image
            alt="Courses image"
            className="object-cover rounded-t-lg"
            height={150}
            src={urlImage}
            width={350}
          />
          <Chip
            className="absolute top-3 right-3 text-sm font-bold z-10 text-white bg-amber-400"
            radius="lg"
            startContent={<InlineIcon icon="mdi:clock-outline" width="18" />}
          >
            60 min
          </Chip>
        </div>
        <CardBody>
          <p className="text-3xl font-bold text-black mb-2">{course.price}€</p>
          <p className="text-amber-400 font-semibold text-sm uppercase mb-1">
            {course.teacher.user.name}
          </p>
          <h3 className="text-orange-500 font-bold text-2xl mb-2">
            {course.title}
          </h3>
          <p className="text-gray-700 text-sm">{course.description}</p>
        </CardBody>
      </Card>
    </li>
  );
}
