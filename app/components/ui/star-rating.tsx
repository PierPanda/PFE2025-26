import { InlineIcon } from '@iconify/react';

export default function StarRating({ rating, width = '24' }: { rating: number | null; width?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <InlineIcon
          key={index}
          icon={index < Math.floor(rating ?? 0) ? 'mdi:star' : 'mdi:star-outline'}
          className="text-amber-400"
          width={width}
        />
      ))}
    </div>
  );
}
