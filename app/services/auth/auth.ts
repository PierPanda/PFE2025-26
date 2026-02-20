// Auth service - Client-side authentication functions
import { signIn, signOut, signUp, getSession } from "~/server/lib/auth/client";

/**
 * Login with email and password
 */
export async function loginWithEmail(email: string, password: string) {
  try {
    const result = await signIn.email({
      email,
      password,
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message || "Erreur de connexion",
      };
    }

    return {
      success: true,
      user: result.data?.user,
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
 * Login with Google OAuth
 */
export async function loginWithGoogle(callbackURL: string = "/") {
  try {
    const result = await signIn.social({
      provider: "google",
      callbackURL,
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message || "Erreur de connexion Google",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Google login error:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la connexion Google.",
    };
  }
}

/**
 * Register with email and password
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
) {
  try {
    const result = await signUp.email({
      email,
      password,
      name,
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message || "Erreur d'inscription",
      };
    }

    return {
      success: true,
      user: result.data?.user,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de l'inscription.",
    };
  }
}

// Alias for signUp
export const signUpWithEmail = registerWithEmail;

/**
 * Logout current user
 */
export async function logout() {
  try {
    await signOut();
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la déconnexion.",
    };
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const session = await getSession();
    return {
      success: true,
      session: session.data,
    };
  } catch (error) {
    console.error("Get session error:", error);
    return {
      success: false,
      session: null,
    };
  }
}
