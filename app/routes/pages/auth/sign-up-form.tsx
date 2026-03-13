import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button, Input } from '@heroui/react';
import { signUpWithEmail, loginWithGoogle } from '~/services/auth/auth';
import { useNavigate } from 'react-router';

interface SignUpFormProps {
  onToggleForm?: () => void;
}

export function SignUpForm({ onToggleForm }: SignUpFormProps) {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

    const result = await signUpWithEmail(email, password, name);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || "Une erreur s'est produite lors de l'inscription.");
    }

    setIsLoading(false);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg shadow-black/5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          isRequired
          color="warning"
          variant="bordered"
          type="text"
          name="name"
          label="Nom complet"
          placeholder="Jean Dupont"
        />

        <Input
          isRequired
          color="warning"
          variant="bordered"
          type="email"
          name="email"
          label="Adresse email"
          placeholder="vous@exemple.com"
        />

        <Input
          isRequired
          color="warning"
          variant="bordered"
          type="password"
          name="password"
          label="Mot de passe"
          placeholder="••••••••"
        />

        <Input
          isRequired
          color="warning"
          variant="bordered"
          type="password"
          name="confirmPassword"
          label="Confirmer le mot de passe"
          placeholder="••••••••"
        />

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <Button
          type="submit"
          color="warning"
          isLoading={isLoading}
          className="mt-2 h-12 w-full rounded-xl font-semibold tracking-wide"
        >
          {isLoading ? 'Création en cours...' : 'Créer mon compte'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs font-medium text-gray-400">OU</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <Button
        variant="bordered"
        className="h-12 w-full rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
        onPress={async () => {
          const result = await loginWithGoogle('/');
          if (!result.success) {
            setError(result.error || "Erreur lors de l'inscription avec Google");
          }
        }}
      >
        <Icon icon="flat-color-icons:google" width="18" height="18" />
        Continuer avec Google
      </Button>

      {onToggleForm && (
        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà membre ?{' '}
          <button onClick={onToggleForm} className="font-semibold text-bg hover:underline">
            Se connecter
          </button>
        </p>
      )}
    </div>
  );
}
