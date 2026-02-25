import { Button, Card, CardFooter, Image, Chip } from "@heroui/react";
import { InlineIcon } from "@iconify/react";

export default function CourseCard({ course }: { course: any }) {
  console.log("Course reçue dans CourseCard :", course);
  //   const { course, teachers } = course;
  const urlImage = `app/assets/category/${course.category}.jpg`;
  console.log("course reçues dans TeachercoursesComming :", course);
  // Section Teacher : Cours à venir

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
        </div>
        <div className="flex flex-col absolute bottom-2 w-full z-10 right-2 left-2">
          <p className="text-white font-bold text-2xl ml-4">{course.title}</p>
          <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden before:rounded-xl rounded-large w-[calc(100%-16px)] px-2 py-2 shadow-small z-10 gap-2">
            <div className="flex-1 flex flex-col">
              <p className="text-white text-sm">{course.description}</p>
            </div>
            <div className="flex-col gap-2 flex course-end justify-between">
              <Chip
                className="text-tiny text-black bg-white text-center capitalize font-bold max-w-full"
                color="default"
                radius="sm"
                size="sm"
                variant="flat"
              >
                {course.category}
              </Chip>
              {/* {!teachers ? (
                <Button
                  className="text-tiny text-white bg-black/70 w-20 text-center"
                  color="default"
                  radius="sm"
                  size="sm"
                  variant="flat"
                >
                  Réserver
                </Button>
              ) : (
                <Button
                  className="text-tiny text-white bg-black/70 w-20 text-center"
                  color="default"
                  radius="sm"
                  size="sm"
                  variant="flat"
                >
                  Modifier
                </Button>
              )} */}
            </div>
          </CardFooter>
        </div>
      </Card>
    </li>
  );
}
