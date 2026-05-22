import { Link } from 'react-router';
import { Button } from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import StatCard from './stat-card';
import heroBannerImage from '~/assets/images/silhouette-of-a-woman-with-raised-hands-on-a-conce-2026-01-09-08-42-41-utc.jpg';

type BannerProps = {
  userName?: string;
  stats?: {
    coursesCount: number;
    teachersCount: number;
    learnersCount: number;
  };
  onFindCourses?: () => void;
};

export default function Banner({ userName, stats, onFindCourses }: BannerProps) {
  const formatCount = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

  const statistics = [
    {
      icon: 'lucide:graduation-cap',
      value: formatCount(stats?.coursesCount ?? 0),
      label: 'Cours sur la plateforme',
    },
    {
      icon: 'lucide:user',
      value: formatCount(stats?.teachersCount ?? 0),
      label: 'Professeurs passionnés',
    },
    {
      icon: 'lucide:users',
      value: formatCount(stats?.learnersCount ?? 0),
      label: 'Élèves inscrits',
    },
  ];
  return (
    <section
      className="relative h-auto min-h-[60vh] md:h-180 rounded-2xl bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
      style={{ backgroundImage: `url(${heroBannerImage})` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-black/45" />
      <div className="space-y-5 z-10 p-4">
        <h1 className="text-3xl md:text-5xl text-tertiary font-extrabold tracking-tight text-center px-4 md:px-16 lg:px-32">
          Maîtrisez la musique avec des cours conçus pour vous.
        </h1>
        <p className="text-base md:text-lg max-w-3xl text-tertiary leading-relaxed text-center mx-auto">
          {userName ? `${userName}, ` : ''}
          découvrez des cours adaptés à votre niveau, échangez avec des professeurs passionnés et progressez à votre
          rythme, en ligne.
        </p>

        <div className="flex flex-col  md:flex-row gap-4 justify-center">
          <Button
            onPress={onFindCourses}
            size="lg"
            radius="lg"
            color="secondary"
            className="w-full md:w-auto font-semibold bg-secondary text-tertiary border-2 border-secondary hover:border-secondary hover:bg-transparent hover:text-secondary"
            startContent={<InlineIcon icon="lucide:search" />}
          >
            Trouver un cours
          </Button>

          <Button
            as={Link}
            to="/teacher"
            size="lg"
            radius="lg"
            variant="flat"
            className="w-full md:w-auto font-semibold bg-tertiary text-dark border-2 border-tertiary hover:border-tertiary hover:bg-transparent hover:text-tertiary"
            startContent={<InlineIcon icon="lucide:music-2" />}
          >
            Devenir professeur
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:max-w-2xl mx-auto w-full px-4">
        {statistics.map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} title={stat.label} value={stat.value} />
        ))}
      </div>
    </section>
  );
}
