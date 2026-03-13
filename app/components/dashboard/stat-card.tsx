import { InlineIcon } from '@iconify/react';
import { Card } from '@heroui/react';

type StatCardProps = {
  icon: string;
  title: string;
  value: string | number;
};

export default function StatCard({ icon, title, value }: StatCardProps) {
  return (
    <Card className="p-4 bg-bg/15 flex flex-col items-center text-center" radius="lg" shadow="none">
      <InlineIcon icon={icon} className="h-7 w-7 text-warning mb-2" />
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-default-500 font-medium">{title}</p>
    </Card>
  );
}
