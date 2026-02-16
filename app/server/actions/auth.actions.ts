import { authClient } from "../lib/auth/client";

/**
 * Server action for email/password login
 */
export async function loginWithEmail(email: string, password: string) {
  try {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: "Erreur de connexion. Vérifiez vos identifiants.",
      };
    }

    if (!data?.user) {
      return {
        success: false,
        error: "Erreur lors de la connexion.",
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la connexion.",
    };
  }
}

/**
 * Server action for email/password signup
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
) {
  try {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (error) {
      return {
        success: false,
        error: "Erreur lors de l'inscription. Vérifiez vos informations.",
      };
    }

    if (!data?.user) {
      return {
        success: false,
        error: "Erreur lors de l'inscription.",
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de l'inscription.",
    };
  }
}

/**
 * Server action for Google OAuth
 */
export async function loginWithGoogle(callbackURL: string = "/") {
  try {
    await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
    return { success: true };
  } catch (error) {
    console.error("Google login error:", error);
    return {
      success: false,
      error: "Erreur lors de la connexion avec Google.",
    };
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  strength: number;
  message?: string;
} {
  let strength = 0;

  if (password.length < 8) {
    return {
      isValid: false,
      strength: 0,
      message: "Le mot de passe doit contenir au moins 8 caractères.",
    };
  }

  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;

  return {
    isValid: true,
    strength,
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
