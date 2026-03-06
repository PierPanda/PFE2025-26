import { formatTime } from '~/lib/utils';
import type { AvailabilityFormInput } from '~/types/availability';

type CardAvailabilityProps = {
  availability: AvailabilityFormInput;
};

export default function CardAvailability({ availability }: CardAvailabilityProps) {
  return (
    <div className="rounded-lg p-4 min-w-max font-bold text-black bg-orange-500">
      <div className="flex items-center justify-between"></div>
      <p className="">
        {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
      </p>
    </div>
  );
}
