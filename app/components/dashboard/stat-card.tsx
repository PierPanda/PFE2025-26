import { InlineIcon } from '@iconify/react';
import { Card } from '@heroui/react';

type StatCardProps = {
  icon: string;
  title: string;
  value: string | number;
};

export default function StatCard({ icon, title, value }: StatCardProps) {
  return (
    <Card className="flex-1 p-2 md:p-4 bg-transparent flex flex-col items-center text-center" radius="lg" shadow="none">
      <InlineIcon icon={icon} className="h-5 w-5 md:h-7 md:w-7 mb-2 text-tertiary" />
      <p className="text-2xl font-bold text-tertiary">{value}</p>
      <p className="text-xs text-tertiary font-medium">{title}</p>
    </Card>
  );
}
