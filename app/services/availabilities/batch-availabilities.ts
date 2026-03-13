import type { CreateAvailabilityInput } from '~/types/availability';
import type { ServiceResponse } from '../types';
import { createAvailability } from './create-availability';
import { deleteAvailability } from './delete-availability';

/**
 * Batch insert + delete availabilities.
 * Note: neon-http does not support true transactions — partial failures are
 * possible. Each operation is attempted independently and failures are
 * aggregated into the response.
 */
export async function batchUpdateAvailabilities(
  add: CreateAvailabilityInput[],
  deleteIds: string[],
): Promise<ServiceResponse<object>> {
  const results = await Promise.all([
    ...add.map((s) => createAvailability(s)),
    ...deleteIds.map((id) => deleteAvailability(id)),
  ]);

  const errors = results
    .filter((r) => !r.success)
    .map((r) => ('error' in r && r.error ? String(r.error) : null))
    .filter((e): e is string => e !== null);

  if (errors.length > 0) {
    return {
      success: false,
      error: 'Une ou plusieurs opérations ont échoué : ' + errors.join(' '),
    };
  }

  return { success: true };
}
