import type { InferSelectModel } from "drizzle-orm";
import type {
  user,
  teachers,
  learners,
  courses,
  availabilities,
  bookings,
  ratings,
} from "~/server/lib/db/schema";

/**
 * Base models inferred from Drizzle schema
 */
export type User = InferSelectModel<typeof user>;
export type Teacher = InferSelectModel<typeof teachers>;
export type Learner = InferSelectModel<typeof learners>;
export type Course = InferSelectModel<typeof courses>;
export type Availability = InferSelectModel<typeof availabilities>;
export type Booking = InferSelectModel<typeof bookings>;
export type Rating = InferSelectModel<typeof ratings>;

/**
 * Models with relations
 */
export type TeacherWithUser = Teacher & {
  user: User;
};

export type TeacherWithUserAndCourses = Teacher & {
  user: User;
  courses: Course[];
};

export type CourseWithTeacher = Course & {
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

export type CreateCourseResponse = ServiceResponse<{ course: Course }>;
export type UpdateCourseResponse = ServiceResponse<{ course: Course }>;
export type DeleteCourseResponse = ServiceResponse<object>;

export type CreateTeacherResponse = ServiceResponse<{ teacher: Teacher }>;
export type UpdateTeacherResponse = ServiceResponse<{ teacher: Teacher }>;
export type DeleteTeacherResponse = ServiceResponse<object>;
