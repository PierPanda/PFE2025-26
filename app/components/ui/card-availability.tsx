import { formatTime } from '~/lib/utils';
import type { AvailabilityWithTeacher } from '~/services/types';

type CardAvailabilityProps = {
  availability: AvailabilityWithTeacher;
};

export default function CardAvailability({ availability }: CardAvailabilityProps) {
  return (
    <div className="rounded-lg p-4 min-w-max font-bold text-black bg-orange-500">
      <p>
        {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
      </p>
    </div>
  );
}
