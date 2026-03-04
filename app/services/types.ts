import { user, teachers, learners, courses, availabilities, bookings, ratings } from '~/server/lib/db/schema';

/**
 * Base models inferred from Drizzle schema using $inferSelect
 * Prefixed with "Db" to avoid conflicts with app/types/* (e.g., User)
 */
export type DbUser = typeof user.$inferSelect;
export type DbTeacher = typeof teachers.$inferSelect;
export type DbLearner = typeof learners.$inferSelect;
export type DbCourse = typeof courses.$inferSelect;
export type DbAvailability = typeof availabilities.$inferSelect;
export type DbBooking = typeof bookings.$inferSelect;
export type DbRating = typeof ratings.$inferSelect;

/**
 * Models with relations
 */
export type TeacherWithUser = DbTeacher & {
  user: DbUser;
};

export type TeacherWithUserAndCourses = DbTeacher & {
  user: DbUser;
  courses: DbCourse[];
};

export type CourseWithTeacher = DbCourse & {
  teacher: TeacherWithUser;
};

/**
 * Service response types - Discriminated union pattern
 */
type ServiceSuccess<T> = {
  success: true;
  message?: string;
} & T;

type ServiceError = {
  success: false;
  error: string;
};

export type ServiceResponse<T> = ServiceSuccess<T> | ServiceError;

/**
 * Specific response types for each service
 */
export type GetCourseResponse = ServiceResponse<{
  course: CourseWithTeacher | null;
}>;
export type GetCoursesResponse = ServiceResponse<{
  courses: CourseWithTeacher[];
  filters?: { minPrice: number; maxPrice: number };
}>;
export type GetCoursesByTeacherResponse = ServiceResponse<{
  courses: DbCourse[];
}>;

export type GetTeacherResponse = ServiceResponse<{
  teacher: TeacherWithUserAndCourses | null;
}>;

export type GetAppStatsResponse = ServiceResponse<{
  stats: {
    coursesCount: number;
    teachersCount: number;
    learnersCount: number;
  };
}>;

export type CreateCourseResponse = ServiceResponse<{ course: DbCourse }>;
export type UpdateCourseResponse = ServiceResponse<{ course: DbCourse }>;
export type DeleteCourseResponse = ServiceResponse<object>;

export type CreateTeacherResponse = ServiceResponse<{ teacher: DbTeacher }>;
export type UpdateTeacherResponse = ServiceResponse<{ teacher: DbTeacher }>;
export type DeleteTeacherResponse = ServiceResponse<object>;
