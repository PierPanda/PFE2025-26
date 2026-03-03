import { useNavigate } from 'react-router';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { signOut } from '~/lib/auth-client';
import { useAuth } from '~/hooks/use-auth';

export function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100">
          {user.image ? (
            <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-brand" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-black">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-gray-800">{user.name}</span>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Menu utilisateur"
        onAction={(key) => {
          if (key === 'profile') navigate('/profile');
          if (key === 'logout') handleSignOut();
        }}
      >
        <DropdownItem key="profile">Mon profil</DropdownItem>
        <DropdownItem key="logout" color="danger" className="text-danger">
          Déconnexion
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
