import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button, Card, CardBody, Avatar, Spacer, Progress } from '@heroui/react';
import { signIn } from '../../server/lib/auth/client';
import { useNavigate } from 'react-router';

interface LoginFormProps {
  onToggleForm?: () => void;
}

export function LoginForm({ onToggleForm }: LoginFormProps) {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error: authError } = await signIn.email({
        email,
        password,
      });

      if (authError) {
        setError('Erreur de connexion. Vérifiez vos identifiants.');
      } else if (data?.user) {
        navigate('/');
      }
    } catch {
      setError("Une erreur s'est produite lors de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="relative rounded-lg border border-white/20 bg-transparent shadow-xl backdrop-blur-xl">
        <CardBody className="p-6">
          {/* Logo/Avatar section */}
          <div className="mb-6 flex flex-col items-center">
            <Avatar
              className="mb-3 h-16 w-16 bg-linear-to-br from-blue-500 to-purple-600 shadow-lg ring-2 ring-white/30"
              fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <Icon icon="line-md:account-small" width="48" height="48" className="text-white" />{' '}
                </div>
              }
            />

            <div className="text-center">
              <h1 className="bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-bold text-transparent">
                Bienvenue
              </h1>
              <p className="mt-1 text-sm text-gray-600">Connectez-vous pour continuer</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {/* Email Input avec div flex */}
              <div className="flex items-center space-x-2 rounded-lg border-2 border-white/30 bg-white/80 p-3 shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out focus-within:border-blue-500/50 focus-within:bg-white/95 hover:bg-white/90 hover:shadow-lg">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600">
                  <Icon icon="heroicons:envelope-solid" className="h-2.5 w-2.5 text-white" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Votre adresse email"
                  required
                  className="flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-500"
                />
              </div>

              {/* Password Input avec div flex */}
              <div className="flex items-center space-x-2 rounded-lg border-2 border-white/30 bg-white/80 p-3 shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out focus-within:border-blue-500/50 focus-within:bg-white/95 hover:bg-white/90 hover:shadow-lg">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600">
                  <Icon icon="heroicons:lock-closed-solid" className="h-2.5 w-2.5 text-white" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Votre mot de passe"
                  required
                  className="flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-500"
                />
              </div>
            </div>

            {error && (
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-red-500/10 blur-sm"></div>
                <div className="relative rounded-xl border border-red-200/50 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <Icon icon="heroicons:x-circle-solid" className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              </div>
            )}

            <Spacer y={1} />

            <Button
              type="submit"
              size="md"
              radius="lg"
              isLoading={isLoading}
              disabled={isLoading}
              className="relative w-full transform overflow-hidden rounded-lg bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className="relative z-10">{isLoading ? 'Connexion...' : 'Se connecter'}</span>
              {/* Animated background */}
              <div className="absolute inset-0 bg-linear-to-r from-blue-700 via-purple-700 to-indigo-700 opacity-0 transition-opacity duration-300 hover:opacity-100"></div>

              {/* Ripple effect */}
              {!isLoading && (
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100">
                  <div className="absolute inset-0 animate-pulse bg-linear-to-r from-white/10 to-white/5"></div>
                </div>
              )}
            </Button>

            {/* Loading progress */}
            {isLoading && (
              <Progress
                size="sm"
                isIndeterminate
                aria-label="Connexion en cours"
                className="w-full"
                classNames={{
                  base: 'bg-white/30 rounded-full overflow-hidden',
                  indicator: 'bg-gradient-to-r from-blue-500 to-purple-500',
                }}
              />
            )}
          </form>

          {/* Toggle form section */}
          {onToggleForm && (
            <div className="mt-4 border-t border-white/20 pt-4 text-center">
              <p className="mb-2 text-xs text-gray-600">Première visite ?</p>

              <Button
                size="sm"
                variant="bordered"
                radius="full"
                onPress={onToggleForm}
                className="border border-emerald-500/50 px-3 py-1 text-xs font-medium text-emerald-700 transition-all duration-300 hover:bg-emerald-50/50"
              >
                ✨ Créer un compte
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
