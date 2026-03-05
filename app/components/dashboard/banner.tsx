import { Link } from 'react-router';
import { Button } from '@heroui/react';
import { InlineIcon } from '@iconify/react';
import StatCard from './stat-card';

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
    <section className="space-y-12 my-24">
      <div className="space-y-5">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground text-center">
          Maîtrisez la musique avec des cours conçus pour vous.
        </h1>
        <p className="text-base md:text-lg max-w-3xl text-default-600 leading-relaxed text-center mx-auto">
          {userName ? `${userName}, ` : ''}
          découvrez des cours adaptés à votre niveau, échangez avec des professeurs passionnés et progressez à votre
          rythme, en ligne.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onPress={onFindCourses}
            size="lg"
            radius="lg"
            color="warning"
            className="font-semibold"
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
            className="font-semibold"
            startContent={<InlineIcon icon="lucide:music-2" />}
          >
            Devenir professeur
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 md:max-w-2xl mx-auto">
        {statistics.map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} title={stat.label} value={stat.value} />
        ))}
      </div>
    </section>
  );
}
