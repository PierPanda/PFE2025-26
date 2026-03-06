import { InlineIcon } from '@iconify/react';

export default function StarRating({ rating }: { rating: number | null }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <InlineIcon
          key={index}
          icon={index < Math.floor(rating ?? 0) ? 'mdi:star' : 'mdi:star-outline'}
          className="text-amber-400"
          width="24"
        />
      ))}
    </>
  );
}
