import { and, asc, count, desc, eq, gt, inArray, lt, ne, or, sql } from 'drizzle-orm';
import { db } from '~/server/lib/db/index.server';
import { bookings, courses } from '~/server/lib/db/schema';
import type { DbBooking, GetBookingResponse, GetBookingsResponse } from '../types';

export type BookingFilter = 'all' | 'upcoming' | 'cancelled' | 'completed';

type GetBookingsOptions = {
  status?: DbBooking['status'];
  filter?: BookingFilter;
  limit?: number;
  offset?: number;
  orderDirection?: 'asc' | 'desc';
};

type GetTeacherBookingsOptions = Omit<GetBookingsOptions, 'status'> & {
  status?: DbBooking['status'] | DbBooking['status'][];
};

function buildFilterCondition(filter?: BookingFilter) {
  const now = new Date();
  if (filter === 'upcoming') return and(gt(bookings.startTime, now), ne(bookings.status, 'cancelled'));
  if (filter === 'cancelled') return eq(bookings.status, 'cancelled');
  if (filter === 'completed') return eq(bookings.status, 'completed');
  return undefined;
}

const bookingRelations = {
  course: {
    with: {
      teacher: {
        with: {
          user: true,
        },
      },
    },
  },
  availability: {
    with: {
      teacher: {
        with: {
          user: true,
        },
      },
    },
  },
  learner: {
    with: {
      user: true,
    },
  },
} as const;

/**
 * Get a single booking by ID
 */
export async function getBooking(bookingId: string): Promise<GetBookingResponse> {
  try {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: bookingRelations,
    });

    return {
      success: true,
      booking: booking ?? null,
    };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la récupération de la réservation.",
    };
  }
}

/**
 * Get all bookings for a learner
 */
export async function getBookingsByLearnerId(
  learnerId: string,
  options?: GetBookingsOptions,
): Promise<GetBookingsResponse> {
  try {
    const { status, filter, limit, offset, orderDirection = 'desc' } = options ?? {};
    const whereCondition = and(
      eq(bookings.learnerId, learnerId),
      status ? eq(bookings.status, status) : undefined,
      buildFilterCondition(filter),
    );

    const [bookingsList, totalResult] = await Promise.all([
      db.query.bookings.findMany({
        where: whereCondition,
        with: bookingRelations,
        orderBy: (b) => [orderDirection === 'asc' ? asc(b.startTime) : desc(b.startTime)],
        limit,
        offset,
      }),
      limit !== undefined ? db.select({ total: count() }).from(bookings).where(whereCondition) : Promise.resolve(null),
    ]);

    return {
      success: true,
      bookings: bookingsList,
      total: totalResult !== null ? Number(totalResult[0]?.total ?? 0) : undefined,
    };
  } catch (error) {
    console.error('Error fetching bookings by learner ID:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la recuperation des réservations.",
    };
  }
}

/**
 * Get all bookings for a teacher through teacher courses
 */
export async function getBookingsByTeacherId(
  teacherId: string,
  options?: GetTeacherBookingsOptions,
): Promise<GetBookingsResponse> {
  try {
    const { status, filter, limit, offset, orderDirection = 'desc' } = options ?? {};

    const teacherCourses = await db.query.courses.findMany({
      where: eq(courses.teacherId, teacherId),
      columns: { id: true },
    });

    const courseIds = teacherCourses.map((course) => course.id);
    if (courseIds.length === 0) {
      return { success: true, bookings: [], total: 0 };
    }

    let statusFilter: ReturnType<typeof eq> | ReturnType<typeof inArray> | undefined;
    if (Array.isArray(status)) {
      statusFilter = inArray(bookings.status, status);
    } else if (status) {
      statusFilter = eq(bookings.status, status);
    }

    const whereCondition = and(inArray(bookings.courseId, courseIds), statusFilter, buildFilterCondition(filter));

    const [bookingsList, totalResult] = await Promise.all([
      db.query.bookings.findMany({
        where: whereCondition,
        with: bookingRelations,
        orderBy: (b) => [orderDirection === 'asc' ? asc(b.startTime) : desc(b.startTime)],
        limit,
        offset,
      }),
      limit !== undefined ? db.select({ total: count() }).from(bookings).where(whereCondition) : Promise.resolve(null),
    ]);

    return {
      success: true,
      bookings: bookingsList,
      total: totalResult !== null ? Number(totalResult[0]?.total ?? 0) : undefined,
    };
  } catch (error) {
    console.error('Error fetching bookings by teacher ID:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la recuperation des réservations.",
    };
  }
}

export async function hasCompletedBookingForCourse(
  learnerId: string,
  courseId: string,
): Promise<{ success: true; exists: boolean } | { success: false; error: string }> {
  try {
    const [{ bookingCount }] = await db
      .select({ bookingCount: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.learnerId, learnerId),
          eq(bookings.courseId, courseId),
          ne(bookings.status, 'cancelled'),
          or(eq(bookings.status, 'completed'), lt(bookings.endTime, sql`now()`)),
        ),
      );

    return { success: true, exists: bookingCount > 0 };
  } catch (error) {
    console.error('Error checking completed booking for course:', error);
    return { success: false, error: "Une erreur s'est produite lors de la vérification de la réservation." };
  }
}

/**
 * Get all bookings for a course
 */
export async function getBookingsByCourseId(courseId: string): Promise<GetBookingsResponse> {
  try {
    const bookingsList = await db.query.bookings.findMany({
      where: eq(bookings.courseId, courseId),
      with: bookingRelations,
      orderBy: (booking) => [desc(booking.startTime)],
    });

    return {
      success: true,
      bookings: bookingsList,
    };
  } catch (error) {
    console.error('Error fetching bookings by course ID:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la recuperation des réservations.",
    };
  }
}

/**
 * Get all bookings for an availability
 */
export async function getBookingsByAvailabilityId(availabilityId: string): Promise<GetBookingsResponse> {
  try {
    const bookingsList = await db.query.bookings.findMany({
      where: eq(bookings.availabilityId, availabilityId),
      with: bookingRelations,
    });

    return {
      success: true,
      bookings: bookingsList,
    };
  } catch (error) {
    console.error('Error fetching bookings by availability ID:', error);
    return {
      success: false,
      error: "Une erreur s'est produite lors de la recuperation des réservations.",
    };
  }
}
