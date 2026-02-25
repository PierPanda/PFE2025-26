import { Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
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

export function meta() {
  return [
    { title: "Maestroo - Accueil" },
    { name: "description", content: "Votre musique commence ici." },
  ];
}

export default function Home() {
  const { courses } = useLoaderData();
  console.log("Courses reçues dans Home :", courses);
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="rounded-2xl bg-brand/10 p-8 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Bienvenue !</h2>
        <p className="text-gray-500">Votre musique commence ici.</p>
        <Link
          to="/courses/create"
          className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          + Créer un cours
        </Link>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.map((course: any) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </ul>
    </main>
  );
}
