import { data } from 'react-router';
import { getAppStats } from '~/services/stats/get-app-stats.server';

export async function loader() {
  const result = await getAppStats();

  if (!result.success) {
    return data(result, { status: 500 });
  }

  return data(result, { status: 200 });
}
