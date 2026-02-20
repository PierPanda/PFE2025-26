import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  CardBody,
  Avatar,
  Spacer,
  Progress,
} from "@heroui/react";
import { signUpWithEmail, loginWithGoogle } from "~/services/auth/auth";
import { useNavigate } from "react-router";

interface SignUpFormProps {
  onToggleForm?: () => void;
}

export function SignUpForm({ onToggleForm }: SignUpFormProps) {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    const result = await signUpWithEmail(email, password, name);

    if (result.success) {
      navigate("/");
    } else {
      setError(
        result.error || "Une erreur s'est produite lors de l'inscription.",
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full">
      <Card className="relative backdrop-blur-xl bg-transparent border border-white/20 shadow-xl rounded-lg">
        <CardBody className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar
                className="w-16 h-16 mb-3 ring-2 ring-white/30 shadow-lg bg-linear-to-r from-emerald-700 to-cyan-600"
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon
                      icon="line-md:account-small"
                      width="48"
                      height="48"
                      className="text-white"
                    />{" "}
                  </div>
                }
              />
              <div
                className="absolute inset-0 w-16 h-16 rounded-full border border-emerald-400/50 animate-spin"
                style={{ animationDuration: "3s" }}
              ></div>
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold bg-linear-to-r from-emerald-700 to-cyan-600 bg-clip-text text-transparent">
                Rejoignez-nous
              </h1>
              <p className="text-gray-600 text-xs mt-1">
                Créez votre compte en quelques secondes
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-white/30 rounded-lg p-3 shadow-md hover:shadow-lg hover:bg-white/90 focus-within:bg-white/95 focus-within:border-emerald-500/50 transition-all duration-300 ease-in-out">
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 shrink-0">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Votre nom complet"
                  required
                  className="flex-1 bg-transparent placeholder:text-gray-500 text-gray-900 outline-none text-base"
                />
              </div>

              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-white/30 rounded-lg p-3 shadow-md hover:shadow-lg hover:bg-white/90 focus-within:bg-white/95 focus-within:border-emerald-500/50 transition-all duration-300 ease-in-out">
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-linear-to-br from-teal-500 to-cyan-600 shrink-0">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Votre adresse email"
                  required
                  className="flex-1 bg-transparent placeholder:text-gray-500 text-gray-900 outline-none text-base"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-white/30 rounded-lg p-3 shadow-md hover:shadow-lg hover:bg-white/90 focus-within:bg-white/95 focus-within:border-emerald-500/50 transition-all duration-300 ease-in-out">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 shrink-0">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Créez un mot de passe"
                    required
                    className="flex-1 bg-transparent placeholder:text-gray-500 text-gray-900 outline-none text-base"
                  />
                </div>
              </div>

              {/* Confirm Password Input avec div flex */}
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-white/30 rounded-lg p-3 shadow-md hover:shadow-lg hover:bg-white/90 focus-within:bg-white/95 focus-within:border-emerald-500/50 transition-all duration-300 ease-in-out">
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-linear-to-br from-blue-500 to-purple-600 shrink-0">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmez votre mot de passe"
                  required
                  className="flex-1 bg-transparent placeholder:text-gray-500 text-gray-900 outline-none text-base"
                />
              </div>
            </div>

            {error && (
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/10 blur-sm rounded-lg"></div>
                <div className="relative bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-3 h-3 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
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
              className="w-full rounded-lg relative overflow-hidden bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-medium shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="relative z-10">
                {isLoading ? "Création en cours..." : "Créer mon compte"}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-emerald-700 via-teal-700 to-cyan-700 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

              {!isLoading && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              )}
            </Button>

            {isLoading && (
              <Progress
                size="sm"
                isIndeterminate
                aria-label="Création en cours"
                className="w-full"
                classNames={{
                  base: "bg-white/30 rounded-full overflow-hidden",
                  indicator: "bg-gradient-to-r from-emerald-500 to-cyan-500",
                }}
              />
            )}
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white/50 backdrop-blur-sm px-4 py-1 rounded-full text-gray-500 font-medium">
                OU
              </span>
            </div>
          </div>

          <Button
            size="md"
            radius="md"
            variant="bordered"
            onPress={async () => {
              const result = await loginWithGoogle("/");
              if (!result.success) {
                setError(
                  result.error || "Erreur lors de l'inscription avec Google",
                );
              }
            }}
            className="w-full rounded-lg bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-center gap-3">
              <Icon icon="flat-color-icons:google" width="18" height="18" />
              <span>Continuer avec Google</span>
            </div>
          </Button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              En créant un compte, vous acceptez nos{" "}
              <span className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium">
                conditions d'utilisation
              </span>{" "}
              et notre{" "}
              <span className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium">
                politique de confidentialité
              </span>
            </p>
          </div>

          {onToggleForm && (
            <div className="mt-4 pt-4 border-t border-white/20 text-center">
              <p className="text-xs text-gray-600 mb-2">Déjà membre ?</p>

              <Button
                size="sm"
                variant="bordered"
                radius="full"
                onPress={onToggleForm}
                className="font-medium transition-all duration-300 border border-blue-500/50 text-blue-700 hover:bg-blue-50/50 text-xs px-3 py-1"
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
