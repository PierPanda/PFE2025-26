import { Outlet, Link } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user';
import { UserProfile } from '~/components/auth/user-profile';
import logo from '~/assets/images/LOGO_MAESTROO.png';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
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
    { label: 'Créer un cours', to: '/course/create' },
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
      url: '/#popular-courses',
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
      url: '/courses?category=guitare',
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
      url: '/courses?category=piano',
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
      url: '/courses?category=chant',
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
      url: '/courses?category=flute',
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
      url: '/courses?category=batterie',
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
      url: '/courses?category=trombone',
    },
  ];

  return (
    <div className="min-h-screen bg-tertiary">
      <header className="sticky top-0 z-50 bg-tertiary py-2">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-12">
          <Link to="/" className="shrink-0">
            <img src={logo} alt="Maestroo" className="h-6 md:h-9 w-auto" />
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="md:hidden">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="light" size="sm" endContent={<InlineIcon icon="lucide:chevron-down" width="14" />}>
                    Catégories
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Catégories de cours">
                  {iconsHeader.map((item) => (
                    <DropdownItem key={item.title} href={item.url} startContent={item.icon}>
                      {item.title}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
            <UserProfile />
          </div>
        </div>
        <div className="hidden md:flex w-full px-10 lg:px-20 h-16 items-center bg-primary-light">
          <ul className="flex w-full items-center justify-between gap-6">
            {iconsHeader.map((item) => (
              <li key={item.title} className="group flex flex-col items-center justify-center">
                <Link
                  to={item.url}
                  className="flex flex-col items-center justify-center hover:bg-primary focus:bg-primary rounded-lg h-17 w-17 transition-colors cursor-pointer hover:text-tertiary focus:text-tertiary"
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
              <img
                src={logo}
                alt="Maestroo"
                className="h-10 md:h-10 w-auto mb-4 md:self-start self-center  brightness-0 invert"
              />
              <h5 className="text-center md:text-left text-l text-tertiary font-semibold">
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
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center mt-8">
            <p className="text-sm text-tertiary hover:text-amber-600">Conditions d'utilisation</p>
            <p className="text-sm text-tertiary hover:text-amber-600">Politique de confidentialité</p>
            <p className="text-sm text-tertiary hover:text-amber-600">Politique des cookies</p>
            <p className="text-sm text-tertiary hover:text-amber-600">Conditions générales de vente</p>
          </div>
          <div className="flex items-center justify-center">
            <p className="text-sm text-tertiary">© {currentYear} Maestroo. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
