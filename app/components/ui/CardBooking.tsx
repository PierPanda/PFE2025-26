import { Card, CardFooter, Image, Chip } from '@heroui/react';

export default function TeacherCourses({ booking }: { booking: any }) {
  const { course, booking: bookingData } = booking;
  const urlImage = `/categories/${course.category}.jpg`;
  return (
    <li key={booking.id} className="shrink-0">
      <Card isFooterBlurred className="border-none" radius="lg">
        <div className="relative">
          <Image alt="Course image" className="object-cover" height={280} src={urlImage} width={380} />
          <div className="absolute inset-0 bg-black/50 z-10" />
        </div>
        <div className="flex flex-col absolute bottom-2 w-full z-10 right-2 left-2">
          <p className="text-white font-bold text-2xl ml-4">{course.title}</p>
          <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden before:rounded-xl rounded-large w-[calc(100%-16px)] px-2 py-2 shadow-small z-10 gap-2">
            <div className="flex-1 flex flex-col">
              <p className="text-white text-sm">{course.description}</p>
              <p className="text-white text-sm">{bookingData.startTime.toLocaleString()}</p>
            </div>
            <div className="flex-col gap-2 flex items-end justify-between">
              <Chip
                className="text-tiny text-black bg-white text-center capitalize font-bold max-w-full"
                color="default"
                radius="sm"
                size="sm"
                variant="flat"
              >
                {course.category}
              </Chip>
            </div>
          </CardFooter>
        </div>
      </Card>
    </li>
  );
}
