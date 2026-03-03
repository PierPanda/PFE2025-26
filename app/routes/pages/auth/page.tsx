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
    <div className="min-h-screen bg-brand/10 px-4 py-14">
      <div className="mx-auto max-w-md">
        <p className="text-lg text-center font-semibold tracking-[0.3em] text-brand uppercase mb-10">
          VOTRE MUSIQUE COMMENCE ICI
        </p>
        <div className="mb-10 text-center">
          <h1 className="flex justify-center text-4xl font-bold text-gray-900">
            <RotatingText
              ref={rotatingRef}
              texts={['Connexion', 'Inscription']}
              auto={false}
              splitBy="characters"
              staggerDuration={0.03}
              staggerFrom="first"
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            />
          </h1>
        </div>

        <div className="mb-8 flex items-center justify-center gap-1">
          <button
            onClick={() => setIsLogin(true)}
            className={cn(
              'rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300',
              isLogin ? 'bg-brand text-black shadow-md' : 'text-gray-500 hover:text-gray-800',
            )}
          >
            Connexion
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={cn(
              'rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300',
              !isLogin ? 'bg-brand text-black shadow-md' : 'text-gray-500 hover:text-gray-800',
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
  );
}
