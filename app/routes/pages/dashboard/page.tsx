import { authentifyUser } from "~/server/utils/authentify-user.server";
import type { Route } from "./+types/page";
import { useLoaderData } from "react-router";
import CourseCard from "~/components/ui/CourseCard";

export async function loader({ request }: Route.LoaderArgs) {
  await authentifyUser(request, { redirectTo: "/auth" });
  let courses = [];
  try {
    const apiUrl = new URL("/api/courses", request.url);
    const result = await fetch(apiUrl).then((res) => res.json());
    courses = result.courses;
  } catch (error) {
    console.error("Erreur lors de la récupération des cours :", error);
    return { user: null, courses: [] };
  }
  return { courses };
}

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Maestroo - Accueil" },
    { name: "description", content: "Bienvenue sur Maestroo" },
  ];
}

export default function Home() {
  const { courses } = useLoaderData();
  console.log("Courses reçues dans Home :", courses);
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {courses.map((course: any) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </ul>
  );
}
