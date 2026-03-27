import { Outlet, Link } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { UserProfile } from '~/components/auth/user-profile';
import logo from '~/assets/images/LOGO_MAESTROO.png';
import { Button } from '@heroui/react';
import { InlineIcon } from '@iconify/react';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });
  return { user: session.user, session: session.session };
}

export default function AuthLayout() {
  const currentYear = new Date().getFullYear();

  const footerPages = [
    { label: 'Dashboard', to: '/' },
    { label: 'Profil', to: '/profile' },
    { label: 'Créer un cours', to: '/courses/create' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-primary p-2">
        <div className="flex h-16 w-full items-center justify-between px-12">
          <Link to="/" className="shrink-0">
            <img src={logo} alt="Maestroo" className="h-9 w-auto" />
          </Link>

          <div className="flex items-center gap-4">
            <UserProfile />
          </div>
        </div>
      </header>

      <Outlet />

      <div className="px-14 py-14">
        <footer className="mt-12 flex flex-col gap-4 rounded-2xl bg-black p-8">
          <div className="w-full flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
              <img src={logo} alt="Maestroo" className="mb-4 h-auto w-auto self-start md:h-10 brightness-0 invert" />
              <h5 className="text-center text-l font-semibold text-primary md:text-left">
                Maestroo - Connectez-vous avec les meilleurs professeurs de musique pour des cours en ligne
                personnalisés.
              </h5>
            </div>
            <div className="w-full md:w-1/3  flex  flex-col items-center justify-center">
              <h4 className="mb-2 text-2xl font-bold text-primary">Plan du site</h4>
              <ul className="space-y-2 pl-0 text-center text-lg text-primary md:pl-6 md:text-left">
                {footerPages.map((page) => (
                  <li key={page.to}>
                    <Link to={page.to} className="text-primary/90 transition-colors hover:text-primary">
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
              <Button
                variant="solid"
                color="primary"
                className="w-auto border-2 border-primary bg-primary text-xl font-bold text-black items-center self-center hover:bg-transparent hover:text-primary hover:border-primary md:self-end"
              >
                Contactez-nous
              </Button>
              <div className="flex gap-4 self-center md:self-end max-w-auto">
                <InlineIcon
                  icon="mdi:instagram"
                  className="mt-4 cursor-pointer text-4xl text-primary transition-colors duration-300 hover:text-primary/70"
                />
                <InlineIcon
                  icon="mdi:facebook"
                  className="mt-4 cursor-pointer text-4xl text-primary transition-colors duration-300 hover:text-primary/70"
                />
                <InlineIcon
                  icon="mdi:linkedin"
                  className="mt-4 cursor-pointer text-4xl text-primary transition-colors duration-300 hover:text-primary/70"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center mt-8">
            <a href="/legal/terms" className="text-sm text-primary/80 transition-colors hover:text-primary">
              Conditions d'utilisation
            </a>
            <a href="/legal/privacy" className="ml-4 text-sm text-primary/80 transition-colors hover:text-primary">
              Politique de confidentialité
            </a>
            <a href="/legal/cookies" className="ml-4 text-sm text-primary/80 transition-colors hover:text-primary">
              Politique des cookies
            </a>
            <a href="/legal/cgv" className="ml-4 text-sm text-primary/80 transition-colors hover:text-primary">
              Conditions générales de vente
            </a>
          </div>
          <div className="flex items-center justify-center">
            <p className="text-sm text-primary/80">© {currentYear} Maestroo. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
