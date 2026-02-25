import type { Route } from "./+types/auth-layout";
import { Outlet } from "react-router";
import { UserProfile } from "~/components/auth/user-profile";
import { authentifyUser } from "~/server/utils/authentify-user.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authentifyUser(request, { redirectTo: "/auth" });
  return { user: session.user };
}

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Maestroo</h1>
            <UserProfile />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
