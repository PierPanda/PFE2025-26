import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button, Card, CardBody, Avatar, Spacer, Progress, Chip } from '@heroui/react';
import { signUp } from '../../server/lib/auth/client';
import { useNavigate } from 'react-router';

interface SignUpFormProps {
  onToggleForm?: () => void;
}

export function SignUpForm({ onToggleForm }: SignUpFormProps) {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await signUp.email({
        email,
        password,
        name,
      });

      if (authError) {
        setError("Erreur lors de l'inscription. Vérifiez vos informations.");
      } else if (data?.user) {
        navigate('/');
      }
    } catch {
      setError("Une erreur s'est produite lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 25) return 'danger';
    if (strength <= 50) return 'warning';
    if (strength <= 75) return 'primary';
    return 'success';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 25) return 'Faible';
    if (strength <= 50) return 'Moyen';
    if (strength <= 75) return 'Fort';
    return 'Très fort';
  };

  return (
    <div className="w-full">
      {/* Glass morphism card */}
      <Card className="relative rounded-lg border border-white/20 bg-transparent shadow-xl backdrop-blur-xl">
        <CardBody className="p-6">
          {/* Logo/Avatar section */}
          <div className="mb-6 flex flex-col items-center">
            <div className="relative">
              <Avatar
                className="mb-3 h-16 w-16 bg-linear-to-r from-emerald-700 to-cyan-600 shadow-lg ring-2 ring-white/30"
                fallback={
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon icon="line-md:account-small" width="48" height="48" className="text-white" />{' '}
                  </div>
                }
              />
              {/* Animated ring */}
              <div
                className="absolute inset-0 h-16 w-16 animate-spin rounded-full border border-emerald-400/50"
                style={{ animationDuration: '3s' }}
              ></div>
            </div>

            <div className="text-center">
              <h1 className="bg-linear-to-r from-emerald-700 to-cyan-600 bg-clip-text text-xl font-bold text-transparent">
                Rejoignez-nous
              </h1>
              <p className="mt-1 text-xs text-gray-600">Créez votre compte en quelques secondes</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3">
              {/* Name Input avec div flex */}
              <div className="flex items-center space-x-2 rounded-lg border-2 border-white/30 bg-white/80 p-3 shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out focus-within:border-emerald-500/50 focus-within:bg-white/95 hover:bg-white/90 hover:shadow-lg">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600">
                  <Icon icon="heroicons:user-solid" className="h-2.5 w-2.5 text-white" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Votre nom complet"
                  required
                  className="flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-500"
                />
              </div>

              {/* Email Input avec div flex */}
              <div className="flex items-center space-x-2 rounded-lg border-2 border-white/30 bg-white/80 p-3 shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out focus-within:border-emerald-500/50 focus-within:bg-white/95 hover:bg-white/90 hover:shadow-lg">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-cyan-600">
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

              <div className="space-y-1">
                {/* Password Input avec div flex */}
                <div className="flex items-center space-x-2 rounded-lg border-2 border-white/30 bg-white/80 p-3 shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out focus-within:border-emerald-500/50 focus-within:bg-white/95 hover:bg-white/90 hover:shadow-lg">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-600">
                    <Icon icon="heroicons:lock-closed-solid" className="h-2.5 w-2.5 text-white" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Créez un mot de passe"
                    required
                    onChange={handlePasswordChange}
                    className="flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-500"
                  />
                </div>

                {/* Password strength indicator */}
                {passwordStrength > 0 && (
                  <div className="space-y-0.5">
                    <Progress
                      value={passwordStrength}
                      color={getPasswordStrengthColor(passwordStrength)}
                      size="sm"
                      className="w-full"
                      classNames={{
                        base: 'bg-white/30 rounded-full overflow-hidden',
                        indicator: 'transition-all duration-300',
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Force: {getPasswordStrengthText(passwordStrength)}</span>
                      <Chip
                        size="sm"
                        color={getPasswordStrengthColor(passwordStrength)}
                        variant="flat"
                        className="text-xs"
                      >
                        {passwordStrength}%
                      </Chip>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input avec div flex */}
              <div className="flex items-center space-x-2 rounded-lg border-2 border-white/30 bg-white/80 p-3 shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out focus-within:border-emerald-500/50 focus-within:bg-white/95 hover:bg-white/90 hover:shadow-lg">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600">
                  <Icon icon="heroicons:shield-check-solid" className="h-2.5 w-2.5 text-white" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmez votre mot de passe"
                  required
                  className="flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-500"
                />
              </div>
            </div>

            {error && (
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-red-500/10 blur-sm"></div>
                <div className="relative rounded-lg border border-red-200/50 bg-red-50/80 px-3 py-2 text-sm font-medium text-red-700 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <Icon icon="heroicons:x-circle-solid" className="h-3 w-3 shrink-0" />
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
              className="relative w-full transform overflow-hidden rounded-lg bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className="relative z-10">{isLoading ? 'Création en cours...' : 'Créer mon compte'}</span>
              {/* Animated background */}
              <div className="absolute inset-0 bg-linear-to-r from-emerald-700 via-teal-700 to-cyan-700 opacity-0 transition-opacity duration-300 hover:opacity-100"></div>

              {/* Shimmer effect */}
              {!isLoading && (
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100">
                  <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
              )}
            </Button>

            {/* Loading progress */}
            {isLoading && (
              <Progress
                size="sm"
                isIndeterminate
                aria-label="Création en cours"
                className="w-full"
                classNames={{
                  base: 'bg-white/30 rounded-full overflow-hidden',
                  indicator: 'bg-gradient-to-r from-emerald-500 to-cyan-500',
                }}
              />
            )}
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-xs leading-relaxed text-gray-500">
              En créant un compte, vous acceptez nos{' '}
              <span className="cursor-pointer font-medium text-emerald-600 hover:text-emerald-700">
                conditions d'utilisation
              </span>{' '}
              et notre{' '}
              <span className="cursor-pointer font-medium text-emerald-600 hover:text-emerald-700">
                politique de confidentialité
              </span>
            </p>
          </div>

          {/* Toggle form section */}
          {onToggleForm && (
            <div className="mt-4 border-t border-white/20 pt-4 text-center">
              <p className="mb-2 text-xs text-gray-600">Déjà membre ?</p>

              <Button
                size="sm"
                variant="bordered"
                radius="full"
                onPress={onToggleForm}
                className="border border-blue-500/50 px-3 py-1 text-xs font-medium text-blue-700 transition-all duration-300 hover:bg-blue-50/50"
              >
                🏠 Me connecter
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
