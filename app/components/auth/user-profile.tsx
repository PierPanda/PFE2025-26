import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { signOut } from "~/lib/auth-client";
import { useAuth } from "~/hooks/use-auth";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export function UserProfile() {
  const { user, isLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return <Icon icon="lucide:loader-circle" className="animate-spin" />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Link to="/profile">
        <div className="w-10 h-10 rounded-xl text-gray-600 bg-gray-200 flex items-center justify-center hover:opacity-80">
          <Icon icon="lucide:user" />
        </div>
      </Link>
      <Button
        variant="flat"
        color="danger"
        isIconOnly
        onPress={handleSignOut}
        disabled={isSigningOut}
        isLoading={isSigningOut}
      >
        <Icon icon="lucide:log-out" />
      </Button>
    </div>
  );
}
