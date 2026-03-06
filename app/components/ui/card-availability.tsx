import { formatTime } from '~/lib/utils';

interface Availability {
  id: string;
  dayOfWeek?: string;
  startTime: Date | string;
  endTime: Date | string;
  [key: string]: any;
}

export default function CardAvailability({ availability }: { availability: Availability }) {
  return (
    <div className="rounded-lg p-4 min-w-max font-bold text-black bg-orange-500">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{availability.dayOfWeek}</h3>
      </div>
      <p className="">
        {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
      </p>
    </div>
  );
}
