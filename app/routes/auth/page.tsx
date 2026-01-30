import { useState } from "react";
import { Button } from "@heroui/react";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { auth } from "../../server/lib/auth";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (session?.user) {
    throw redirect("/");
  }

  return {};
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Form container with smooth transitions */}
      {/* Form selector */}
      <div className="flex justify-center pt-8 pb-4">
        <div className="flex items-center space-x-4 backdrop-blur-sm bg-white/20 rounded-full p-2 border border-white/30 shadow-lg">
          <Button
            size="sm"
            radius="full"
            variant={isLogin ? "solid" : "light"}
            color={isLogin ? "primary" : "default"}
            onPress={() => setIsLogin(true)}
            className={`px-6 font-medium transition-all duration-300 ${
              isLogin
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 bg-transparent"
            }`}
          >
            Connexion
          </Button>
          <Button
            size="sm"
            radius="full"
            variant={!isLogin ? "solid" : "light"}
            color={!isLogin ? "success" : "default"}
            onPress={() => setIsLogin(false)}
            className={`px-6 font-medium transition-all duration-300 ${
              !isLogin
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 bg-transparent"
            }`}
          >
            Inscription
          </Button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full relative max-w-md mx-auto">
          {/* Transition wrapper */}
          <div className="relative">
            <div
              className={`transition-all duration-700 ease-in-out transform ${
                isLogin
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0 pointer-events-none absolute top-0 left-0 w-full"
              }`}
            >
              <LoginForm onToggleForm={() => setIsLogin(false)} />
            </div>

            <div
              className={`transition-all duration-700 ease-in-out transform ${
                !isLogin
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0 pointer-events-none absolute top-0 left-0 w-full"
              }`}
            >
              <SignUpForm onToggleForm={() => setIsLogin(true)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
