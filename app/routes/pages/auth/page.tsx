import { useState, useRef, useEffect } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { auth } from '~/auth.server';
import { LoginForm } from './login-form';
import { SignUpForm } from './sign-up-form';
import { cn } from '~/lib/utils';
import RotatingText, { type RotatingTextRef } from '~/components/ui/rotating-text';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (session?.user) {
    throw redirect('/');
  }

  return {};
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const rotatingRef = useRef<RotatingTextRef>(null);

  useEffect(() => {
    rotatingRef.current?.jumpTo(isLogin ? 0 : 1);
  }, [isLogin]);

  return (
    <div className=" bg-tertiary flex">
      <div className="w-full flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <h1 className="flex justify-center text-4xl font-bold text-black">
              <RotatingText
                ref={rotatingRef}
                texts={['Connectez-vous', 'Créer votre\ncompte']}
                auto={false}
                splitBy="characters"
                staggerDuration={0.03}
                staggerFrom="first"
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              />
            </h1>
          </div>

          <div className="mb-8 flex items-center justify-center">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                ' px-6 py-2 text-lg font-semibold transition-all duration-300',
                isLogin
                  ? ' text-dark border-b-1 border-secondary'
                  : 'text-dark/60 hover:text-gray-800 border-b-1 border-dark/40',
              )}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                ' px-6 py-2 text-lg font-semibold transition-all duration-300',
                !isLogin
                  ? ' text-dark border-b-1 border-secondary  '
                  : 'text-dark/60 hover:text-dark/40 border-b-1 border-dark/40 ',
              )}
            >
              Inscription
            </button>
          </div>

          <div className="relative">
            <div
              className={cn(
                'transition-all duration-500',
                isLogin ? 'opacity-100' : 'pointer-events-none absolute inset-0 -translate-x-4 opacity-0',
              )}
            >
              <LoginForm onToggleForm={() => setIsLogin(false)} />
            </div>

            <div
              className={cn(
                'transition-all duration-500',
                !isLogin ? 'opacity-100' : 'pointer-events-none absolute inset-0 translate-x-4 opacity-0',
              )}
            >
              <SignUpForm onToggleForm={() => setIsLogin(true)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
