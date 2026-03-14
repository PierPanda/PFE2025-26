import { count } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { courses, learners, teachers } from '~/server/lib/db/schema';
import type { GetAppStatsResponse } from '~/services/types';

export async function getCoursesCount(): Promise<number> {
  const [result] = await db.select({ value: count() }).from(courses);
  return Number(result?.value ?? 0);
}

export async function getTeachersCount(): Promise<number> {
  const [result] = await db.select({ value: count() }).from(teachers);
  return Number(result?.value ?? 0);
}

export async function getLearnersCount(): Promise<number> {
  const [result] = await db.select({ value: count() }).from(learners);
  return Number(result?.value ?? 0);
}

export async function getAppStats(): Promise<GetAppStatsResponse> {
  try {
    const [coursesCount, teachersCount, learnersCount] = await Promise.all([
      getCoursesCount(),
      getTeachersCount(),
      getLearnersCount(),
    ]);

    return {
      success: true,
      stats: {
        coursesCount,
        teachersCount,
        learnersCount,
      },
    };
  } catch (error) {
    console.error('Error fetching app stats:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération des statistiques.",
    };
  }
}
