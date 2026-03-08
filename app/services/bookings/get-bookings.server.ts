import { and, eq, inArray } from "drizzle-orm";
import { db } from "~/server/lib/db/index.server";
import { bookings, courses } from "~/server/lib/db/schema";
import type {
  DbBooking,
  GetBookingResponse,
  GetBookingsResponse,
} from "../types";

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
export async function getBooking(
  bookingId: string,
): Promise<GetBookingResponse> {
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
    console.error("Error fetching booking:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la recuperation de la réservation.",
    };
  }
}

/**
 * Get all bookings for a learner
 */
export async function getBookingsByLearnerId(
  learnerId: string,
  status?: DbBooking["status"],
): Promise<GetBookingsResponse> {
  try {
    const bookingsList = await db.query.bookings.findMany({
      where: and(
        eq(bookings.learnerId, learnerId),
        status ? eq(bookings.status, status) : undefined,
      ),
      with: bookingRelations,
    });

    return {
      success: true,
      bookings: bookingsList,
    };
  } catch (error) {
    console.error("Error fetching bookings by learner ID:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la récuperation des réservations.",
    };
  }
}

/**
 * Get all bookings for a teacher through teacher courses
 */
export async function getBookingsByTeacherId(
  teacherId: string,
  status?: DbBooking["status"] | DbBooking["status"][],
): Promise<GetBookingsResponse> {
  try {
    const teacherCourses = await db.query.courses.findMany({
      where: eq(courses.teacherId, teacherId),
      columns: { id: true },
    });

    const courseIds = teacherCourses.map((course) => course.id);
    if (courseIds.length === 0) {
      return {
        success: true,
        bookings: [],
      };
    }

    let statusFilter:
      | ReturnType<typeof eq>
      | ReturnType<typeof inArray>
      | undefined;
    if (Array.isArray(status)) {
      statusFilter = inArray(bookings.status, status);
    } else if (status) {
      statusFilter = eq(bookings.status, status);
    }

    const bookingsList = await db.query.bookings.findMany({
      where: and(inArray(bookings.courseId, courseIds), statusFilter),
      with: bookingRelations,
    });

    return {
      success: true,
      bookings: bookingsList,
    };
  } catch (error) {
    console.error("Error fetching bookings by teacher ID:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la récuperation des réservations.",
    };
  }
}

/**
 * Get all bookings for a course
 */
export async function getBookingsByCourseId(
  courseId: string,
): Promise<GetBookingsResponse> {
  try {
    const bookingsList = await db.query.bookings.findMany({
      where: eq(bookings.courseId, courseId),
      with: bookingRelations,
    });

    return {
      success: true,
      bookings: bookingsList,
    };
  } catch (error) {
    console.error("Error fetching bookings by course ID:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la récuperation des réservations.",
    };
  }
}

/**
 * Get all bookings for an availability
 */
export async function getBookingsByAvailabilityId(
  availabilityId: string,
): Promise<GetBookingsResponse> {
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
    console.error("Error fetching bookings by availability ID:", error);
    return {
      success: false,
      error:
        "Une erreur s'est produite lors de la récuperation des réservations.",
    };
  }
}
