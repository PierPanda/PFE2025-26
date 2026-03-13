import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { authentifyUser } from '~/server/utils/authentify-user.server';
import { createLearnerSchema, updateLearnerSchema } from '~/lib/validation';
import { createLearner } from '~/services/learners/create-learner';
import { getLearner, getLearnerByUserId } from '~/services/learners/get-learner';
import { updateLearner } from '~/services/learners/update-learner';
import { deleteLearner } from '~/services/learners/delete-learner';

export async function loader({ request }: LoaderFunctionArgs) {
  await authentifyUser(request);

  const url = new URL(request.url);
  const learnerId = url.searchParams.get('id');
  const userId = url.searchParams.get('userId');

  if (learnerId) {
    const result = await getLearner(learnerId);
    if (!result.success) {
      return data({ error: result.error }, { status: 404 });
    }
    if (!result.learner) {
      return data({ error: 'Apprenant introuvable.' }, { status: 404 });
    }
    return result;
  }

  if (userId) {
    const result = await getLearnerByUserId(userId);
    if (!result.success) {
      return data({ error: result.error }, { status: 404 });
    }
    if (!result.learner) {
      return data({ error: 'Apprenant introuvable.' }, { status: 404 });
    }
    return result;
  }

  return data({ error: 'Learner ID or User ID required' }, { status: 400 });
}

export async function action({ request }: ActionFunctionArgs) {
  await authentifyUser(request);

  const method = request.method.toUpperCase();

  switch (method) {
    case 'POST': {
      const body = await request.json();
      const parsed = createLearnerSchema.safeParse(body);

      if (!parsed.success) {
        return data({ success: false, errors: parsed.error.flatten() }, { status: 400 });
      }

      const result = await createLearner(parsed.data);
      return data(result, { status: result.success ? 201 : 400 });
    }

    case 'PUT': {
      const url = new URL(request.url);
      const learnerId = url.searchParams.get('id');

      if (!learnerId) {
        return data({ success: false, error: 'Learner ID required' }, { status: 400 });
      }

      const body = await request.json();
      const parsed = updateLearnerSchema.safeParse(body);

      if (!parsed.success) {
        return data({ success: false, errors: parsed.error.flatten() }, { status: 400 });
      }

      const result = await updateLearner(learnerId, parsed.data);
      return data(result, { status: result.success ? 200 : 404 });
    }

    case 'DELETE': {
      const url = new URL(request.url);
      const learnerId = url.searchParams.get('id');

      if (!learnerId) {
        return data({ success: false, error: 'Learner ID required' }, { status: 400 });
      }

      const result = await deleteLearner(learnerId);
      return data(result, { status: result.success ? 200 : 404 });
    }

    default:
      return data({ error: 'Method not allowed' }, { status: 405 });
  }
}
