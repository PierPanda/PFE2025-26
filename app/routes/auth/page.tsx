import { useState } from "react";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-6">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "Connexion" : "Inscription"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? "Connectez-vous pour accéder à l'application" : "Créez votre compte pour commencer"}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {isLogin ? <LoginForm /> : <SignUpForm />}
          
          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              {isLogin ? "Pas de compte ? Inscrivez-vous" : "Déjà un compte ? Connectez-vous"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}