import iconError from '~/assets/images/ICON-ERROR.png';
import { Button } from '@heroui/react';

export default function Page() {
  return (
    <div className="flex flex-col w-screen h-screen bg-tertiary mx-auto gap-4 p-8 items-center justify-center text-center">
      <img src={iconError} alt="Error" className="w-auto h-32" />
      <h1 className="text-4xl font-bold">404 — Page non trouvée</h1>
      <p className="mt-4">Oupss ton morceaux à pas marché...</p>
      <Button
        onClick={() => (window.location.href = '/')}
        size="lg"
        radius="lg"
        color="secondary"
        className="w-full md:w-auto font-semibold bg-secondary text-tertiary border-2 border-secondary hover:border-secondary hover:bg-transparent hover:text-secondary"
      >
        Retour à l'accueil
      </Button>
    </div>
  );
}
