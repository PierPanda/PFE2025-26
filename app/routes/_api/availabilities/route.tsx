import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { validateJsonBody, validateSearchParams } from '~/lib/validation';
import { createAvailabilitySchema } from '~/lib/validation';
import { getAvailabilityByTeacherId } from '~/services/availabilities/get-availability.server';
import { createAvailability } from '~/services/availabilities/create-availability.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authentifyUser(request);
  const url = new URL(request.url);
  const availabilityId = url.searchParams.get('availabilityId');

  return getAvailabilityByTeacherId(availabilityId || session.user.id);
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await authentifyUser(request);

  if (request.method === 'POST') {
    const data = await validateJsonBody(request, createAvailabilitySchema);
    return createAvailability(data);
  }
}
