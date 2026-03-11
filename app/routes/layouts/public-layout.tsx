import { Outlet, Link } from 'react-router';
import logo from '~/assets/images/LOGO_MAESTROO.png';
import { Button } from '@heroui/react';
import { InlineIcon } from '@iconify/react';

export default function PublicLayout() {
  const currentYear = new Date().getFullYear();

  const footerPages = [
    { label: 'Dashboard', to: '/' },
    { label: 'Profil', to: '/profile' },
    { label: 'Créer un cours', to: '/courses/create' },
  ];
  return (
    <div className="min-h-screen bg-brand/10">
      <header className="sticky top-0 z-50 bg-white p-2">
        <div className="flex h-16 w-full items-center justify-between px-12">
          <Link to="/" className="shrink-0">
            <img src={logo} alt="Maestroo" className="h-9 w-auto" />
          </Link>
        </div>
      </header>

      <Outlet />

      <div className="p-4">
        <footer className="bg-white p-8 mt-12 flex flex-col md:flex gap-4 rounded-2xl">
          <div className="w-full flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
              <img src={logo} alt="Maestroo" className="h-auto md:h-10 w-auto mb-4 self-start" />
              <h5 className="text-center md:text-left text-l text-gray-600 font-semibold">
                Maestroo - Connectez-vous avec les meilleurs professeurs de musique pour des cours en ligne
                personnalisés.
              </h5>
            </div>
            <div className="w-full md:w-1/3  flex  flex-col items-center justify-center">
              <h4 className="text-2xl font-bold mb-2">Plan du site</h4>
              <ul className="space-y-2 text-lg text-gray-700 text-center md:text-left pl-0 md:pl-6">
                {footerPages.map((page) => (
                  <li key={page.to}>
                    <Link to={page.to}>{page.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
              <Button
                variant="solid"
                color="primary"
                className="w-auto bg-amber-600 text-xl font-bold border-3 border-amber-600 text-white hover:bg-transparent hover:text-amber-600 hover:border-amber-600 items-center self-center md:self-end"
              >
                Contactez-nous
              </Button>
              <div className="flex gap-4 self-center md:self-end max-w-auto">
                <InlineIcon
                  icon="mdi:instagram"
                  className="text-4xl mt-4 text-amber-600 hover:text-yellow-400 cursor-pointer transition-colors duration-300"
                />
                <InlineIcon
                  icon="mdi:facebook"
                  className="text-4xl mt-4 text-amber-600 hover:text-yellow-400 cursor-pointer transition-colors duration-300"
                />
                <InlineIcon
                  icon="mdi:linkedin"
                  className="text-4xl mt-4 text-amber-600 hover:text-yellow-400 cursor-pointer transition-colors duration-300"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center mt-8">
            <a href="/legal/terms" className="text-sm text-gray-500 hover:text-amber-600">
              Conditions d'utilisation"
            </a>
            <a href="/legal/privacy" className="text-sm text-gray-500 hover:text-amber-600 ml-4">
              Politique de confidentialité
            </a>
            <a href="/legal/coookies" className="text-sm text-gray-500 hover:text-amber-600 ml-4">
              Politique des cookies
            </a>
            <a href="/legal/cgv" className="text-sm text-gray-500 hover:text-amber-600 ml-4">
              Conditions générales de vente
            </a>
          </div>
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-500">© {currentYear} Maestroo. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
