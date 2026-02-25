import { Button, Card, CardFooter, Image, Chip } from "@heroui/react";
import { InlineIcon } from "@iconify/react";

export default function CourseCard({ course }: { course: any }) {
  const urlImage = `app/assets/categories/${course.category}.jpg`;

  return (
    <li key={course.id}>
      <Card isFooterBlurred className="border-none" radius="lg">
        <div className="relative">
          <Image
            alt="Courses image"
            className="object-cover"
            height={280}
            src={urlImage}
            width={380}
          />
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div className="flex absolute top-2 z-30 w-full justify-between px-2">
            <Chip
              className="text-tiny text-black bg-white w-20 text-center"
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
          <Chip
            className="text-tiny text-black bg-white text-center capitalize font-bold max-w-full absolute top-12 left-2 z-30 w-auto"
            color="default"
            radius="sm"
            size="sm"
            variant="flat"
          >
            {course.category}
          </Chip>
        </div>
        <div className="flex flex-col absolute bottom-2 w-full z-10 right-2 left-2">
          <CardFooter className="before:bg-white/10 border-white/20 border-1 overflow-hidden before:rounded-xl rounded-large w-[calc(100%-16px)] px-2 py-2 shadow-small z-10 gap-2">
            <div className="flex-col gap-1 flex">
              <p className="text-white font-bold text-lg">{course.title}</p>
              <p className="text-white font-medium text-sm">
                {course.teacherName}
              </p>
            </div>
            <div className="flex-col gap-2 flex course-end justify-between"></div>
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
