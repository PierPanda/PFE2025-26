import { Button, Card, CardFooter, Image, Chip } from "@heroui/react";
import { InlineIcon } from "@iconify/react";
import type { Course } from "~/types/course";

export default function CourseCard({ course }: { course: Course }) {
  const urlImage = `app/assets/categories/${course.category}.jpg`;

  return (
    <li key={course.id} className="shrink-0">
      <Card isFooterBlurred className="border-none" radius="lg">
        <div className="relative">
          <Image
            alt="Courses image"
            className="object-cover"
            height={280}
            src={urlImage}
            width={380}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/50 to-black/10 z-10" />
          <div className="flex absolute top-2 z-30 w-full justify-between px-2 gap-2">
            <Chip
              className="text-tiny text-black bg-white text-center font-semibold"
              color="default"
              radius="sm"
              size="sm"
              variant="flat"
            >
              {course.price} €
            </Chip>
            <Chip
              className="text-tiny text-white text-center w-auto"
              color="default"
              radius="sm"
              size="sm"
              variant="flat"
            >
              {course.duration} min
              <InlineIcon
                icon="lucide:clock"
                className="inline-block ml-1"
                width={16}
                height={16}
              />
            </Chip>
          </div>
          <div className="absolute top-12 left-2 z-30 flex gap-2">
            <Chip
              className="text-tiny text-black bg-white text-center capitalize font-bold max-w-full"
              color="default"
              radius="sm"
              size="sm"
              variant="flat"
            >
              {course.category}
            </Chip>
            {course.level ? (
              <Chip
                className="text-tiny text-white text-center capitalize"
                color="default"
                radius="sm"
                size="sm"
                variant="flat"
              >
                {course.level}
              </Chip>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col absolute bottom-2 w-full z-10 right-2 left-2">
          <div className="px-2 pb-2">
            <p className="text-white font-bold text-2xl leading-tight">
              {course.title}
            </p>
            <p className="text-white/80 text-sm mt-1">
              {course.teacherName ?? "Enseignant à venir"}
            </p>
          </div>
          <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden before:rounded-xl rounded-large w-[calc(100%-16px)] px-2 py-2 shadow-small z-10 gap-3">
            <div className="flex-1 flex flex-col min-w-0">
              <p className="text-white text-sm line-clamp-2">
                {course.description}
              </p>
            </div>
            <div className="flex-col gap-2 flex items-end justify-between">
              <Chip
                className="text-tiny text-white text-center w-auto"
                color="default"
                radius="sm"
                size="sm"
                variant="flat"
              >
                {course.duration} min
                <InlineIcon
                  icon="lucide:clock"
                  className="inline-block ml-1"
                  width={16}
                  height={16}
                />
              </Chip>
              <Chip
                className="text-tiny text-black bg-white text-center font-bold max-w-full"
                color="default"
                radius="sm"
                size="sm"
                variant="flat"
              >
                {course.price} €
              </Chip>
            </div>
          </CardFooter>
          <Button
            radius="sm"
            className="mt-2 w-full z-20 bg-white text-black hover:bg-white/90"
          >
            Réserver le cours
          </Button>
        </div>
      </Card>
    </li>
  );
}
