import { Outlet, Link } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user';
import { UserProfile } from '~/components/auth/user-profile';
import logo from '~/assets/images/LOGO_MAESTROO.png';
import { Button } from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import iconGuitare from '~/assets/icons_header/balalaika.svg';
import iconPiano from '~/assets/icons_header/piano.svg';
import iconChant from '~/assets/icons_header/microphone.svg';
import iconFlute from '~/assets/icons_header/flute.svg';
import iconBatterie from '~/assets/icons_header/drum-set.svg';
import iconTrombone from '~/assets/icons_header/trumpet.svg';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request, { redirectTo: '/auth' });
  return { user: session.user, session: session.session };
}

export default function AuthLayout() {
  const currentYear = new Date().getFullYear();

  const footerPages = [
    { label: 'Dashboard', to: '/' },
    { label: 'Profil', to: '/profile' },
    { label: 'Créer un cours', to: '/cours/create' },
  ];

  const iconsHeader = [
    {
      title: 'populaire',
      icon: (
        <InlineIcon
          icon="tabler:flame-filled"
          className="h-5 w-auto md:h-6 md:w-6 text-primary transition-colors group-hover:text-tertiary "
        />
      ),
      url: '/#cours-populaires',
    },
    {
      title: 'Guitare',
      icon: (
        <img
          alt="Guitare"
          className="h-5 w-auto md:h-6 md:w-6 transition-opacity text-tertiary group-hover:text-tertiary"
          src={iconGuitare}
        />
      ),
      url: '/cours/guitare',
    },
    {
      title: 'piano',
      icon: (
        <img
          alt="Piano"
          className="h-5 w-auto md:h-6 md:w-6 transition-opacity text-tertiary group-hover:text-tertiary"
          src={iconPiano}
        />
      ),
      url: '/cours/piano',
    },
    {
      title: 'chant',
      icon: (
        <img
          alt="Chant"
          className="h-5 w-auto md:h-6 md:w-6 transition-opacity text-tertiary group-hover:text-tertiary"
          src={iconChant}
        />
      ),
      url: '/cours/chant',
    },
    {
      title: 'flute',
      icon: (
        <img
          alt="Flûte"
          className="h-5 w-auto md:h-6 md:w-6 transition-opacity text-tertiary group-hover:text-tertiary"
          src={iconFlute}
        />
      ),
      url: '/cours/flute',
    },
    {
      title: 'batterie',
      icon: (
        <img
          alt="Batterie"
          className="h-5 w-auto md:h-6 md:w-6 transition-opacity text-tertiary group-hover:text-tertiary"
          src={iconBatterie}
        />
      ),
      url: '/cours/batterie',
    },
    {
      title: 'trombone',
      icon: (
        <img
          alt="Trombone"
          className="h-5 w-auto md:h-6 md:w-6 transition-opacity text-tertiary group-hover:text-tertiary"
          src={iconTrombone}
        />
      ),
      url: '/cours/trombone',
    },
  ];

  return (
    <div className="min-h-screen bg-tertiary">
      <header className="sticky top-0 z-50 bg-tertiary py-2">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-12">
          <Link to="/" className="shrink-0">
            <img src={logo} alt="Maestroo" className="h-6 md:h-9 w-auto" />
          </Link>

          <div className="flex items-center gap-4">
            <UserProfile />
          </div>
        </div>
        <div className="w-full px-2 md:px-60 h-16 flex items-center justify-between bg-primary-light p-10">
          <ul className="flex w-full items-center justify-between gap-6 overflow-x-scroll overflow-hidden md:overflow-visible">
            {iconsHeader.map((item) => (
              <li key={item.title} className="group flex flex-col items-center justify-center">
                <Link
                  to={item.url}
                  className="flex flex-col items-center justify-center hover:bg-primary  focus:bg-primary rounded-lg h-17 w-17 transition-colors cursor-pointer hover:text-tertiary focus:text-tertiary"
                >
                  {item.icon}
                  <span className="mt-1 text-xs">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <Outlet />

      <div className="p-4 md:p-14">
        <footer className="mt-12 flex flex-col gap-4 rounded-2xl bg-black p-8">
          <div className="w-full flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
              <img src={logo} alt="Maestroo" className="h-10 md:h-10 w-auto mb-4 self-center  brightness-0 invert" />
              <h5 className="text-center md:text-center text-l text-tertiary font-semibold">
                Maestroo - Connectez-vous avec les meilleurs professeurs de musique pour des cours en ligne
                personnalisés.
              </h5>
            </div>
            <div className="w-full md:w-1/3  flex  flex-col items-center justify-center">
              <h4 className="mb-2 text-2xl font-bold text-tertiary">Plan du site</h4>
              <ul className="space-y-2 pl-0 text-center text-lg text-tertiary md:pl-6 md:text-left">
                {footerPages.map((page) => (
                  <li key={page.to}>
                    <Link to={page.to} className="text-tertiary/90 transition-colors hover:text-tertiary">
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
              <Button
                variant="solid"
                color="default"
                className="w-auto border-2 border-tertiary bg-tertiary text-xl font-bold text-black items-center self-center hover:bg-transparent hover:text-tertiary hover:border-tertiary  md:self-end"
              >
                Contactez-nous
              </Button>
              <div className="flex gap-4 self-center md:self-end max-w-auto">
                <InlineIcon
                  icon="mdi:instagram"
                  className="mt-4 cursor-pointer text-4xl text-tertiary transition-colors duration-300 hover:text-tertiary/70"
                />
                <InlineIcon
                  icon="mdi:facebook"
                  className="mt-4 cursor-pointer text-4xl text-tertiary transition-colors duration-300 hover:text-tertiary/70"
                />
                <InlineIcon
                  icon="mdi:linkedin"
                  className="mt-4 cursor-pointer text-4xl text-tertiary transition-colors duration-300 hover:text-tertiary/70"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center mt-8">
            <a href="/legal/terms" className="text-sm text-tertiary hover:text-amber-600">
              Conditions d'utilisation
            </a>
            <a href="/legal/privacy" className="text-sm text-tertiary hover:text-amber-600 ml-4">
              Politique de confidentialité
            </a>
            <a href="/legal/cookies" className="text-sm text-tertiary hover:text-amber-600 ml-4">
              Politique des cookies
            </a>
            <a href="/legal/cgv" className="text-sm text-tertiary hover:text-amber-600 ml-4">
              Conditions générales de vente
            </a>
          </div>
          <div className="flex items-center justify-center">
            <p className="text-sm text-tertiary">© {currentYear} Maestroo. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
