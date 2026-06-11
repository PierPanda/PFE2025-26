import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { courses, ratings } from '~/server/lib/db/schema';
import type { GetRatingResponse, GetRatingsResponse } from '../types';

const MAX_RATINGS_LIMIT = 50;
const DEFAULT_RATINGS_LIMIT = 20;

const ratingWithLearner = {
  learner: {
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  },
} as const;

export async function getRatingsByCourse(courseId: string, limit = DEFAULT_RATINGS_LIMIT): Promise<GetRatingsResponse> {
  const safeLimit = Math.min(limit, MAX_RATINGS_LIMIT);
  try {
    const ratingsList = await db.query.ratings.findMany({
      where: eq(ratings.courseId, courseId),
      with: ratingWithLearner,
      orderBy: (r) => [desc(r.createdAt)],
      limit: safeLimit,
    });

    return { success: true, ratings: ratingsList };
  } catch (error) {
    console.error('Error fetching ratings by course ID:', error);
    return { success: false, error: "Une erreur s'est produite lors de la récupération des avis." };
  }
}

export async function getRatingsByTeacher(
  teacherId: string,
  limit = DEFAULT_RATINGS_LIMIT,
): Promise<GetRatingsResponse> {
  const safeLimit = Math.min(limit, MAX_RATINGS_LIMIT);
  try {
    const teacherCourses = await db.select({ id: courses.id }).from(courses).where(eq(courses.teacherId, teacherId));

    if (teacherCourses.length === 0) {
      return { success: true, ratings: [] };
    }

    const courseIds = teacherCourses.map((c) => c.id);

    const ratingsList = await db.query.ratings.findMany({
      where: inArray(ratings.courseId, courseIds),
      with: ratingWithLearner,
      orderBy: (r) => [desc(r.createdAt)],
      limit: safeLimit,
    });

    return { success: true, ratings: ratingsList };
  } catch (error) {
    console.error('Error fetching ratings by teacher ID:', error);
    return { success: false, error: "Une erreur s'est produite lors de la récupération des avis." };
  }
}

export async function getRatingsByLearnerId(
  learnerId: string,
  limit = DEFAULT_RATINGS_LIMIT,
): Promise<GetRatingsResponse> {
  const safeLimit = Math.min(limit, MAX_RATINGS_LIMIT);
  try {
    const ratingsList = await db.query.ratings.findMany({
      where: eq(ratings.learnerId, learnerId),
      with: ratingWithLearner,
      orderBy: (r) => [desc(r.createdAt)],
      limit: safeLimit,
    });

    return { success: true, ratings: ratingsList };
  } catch (error) {
    console.error('Error fetching ratings by learner ID:', error);
    return { success: false, error: "Une erreur s'est produite lors de la récupération des avis." };
  }
}

export async function getRatingById(ratingId: string): Promise<GetRatingResponse> {
  try {
    const rating = await db.query.ratings.findFirst({
      where: eq(ratings.id, ratingId),
    });

    return { success: true, rating: rating ?? null };
  } catch (error) {
    console.error('Error fetching rating by ID:', error);
    return { success: false, error: "Une erreur s'est produite lors de la récupération de l'avis." };
  }
}

export async function getRatingByLearnerAndCourse(learnerId: string, courseId: string): Promise<GetRatingResponse> {
  try {
    const rating = await db.query.ratings.findFirst({
      where: and(eq(ratings.learnerId, learnerId), eq(ratings.courseId, courseId)),
    });

    return { success: true, rating: rating ?? null };
  } catch (error) {
    console.error('Error fetching rating by learner and course:', error);
    return { success: false, error: "Une erreur s'est produite lors de la récupération de l'avis." };
  }
}
