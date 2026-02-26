// better-auth schema
export {
  user,
  session,
  account,
  verification,
} from "./schema-definition/auth-schema";

// teacher schema
export { teachers } from "./schema-definition/teachers";

// learner schema
export { learners } from "./schema-definition/learners";

// availability schema
export { availabilities } from "./schema-definition/availabilities";

// booking schema
export { bookings, bookingStatus } from "./schema-definition/bookings";

// course schema
export { courses, category } from "./schema-definition/courses";

// rating schema
export { ratings } from "./schema-definition/ratings";

// relations
export {
  userRelations,
  sessionRelations,
  accountRelations,
} from "./schema-definition/auth-relations";

export { teachersRelations } from "./schema-definition/teachers-relations";

export { learnersRelations } from "./schema-definition/learners-relations";

export { coursesRelations } from "./schema-definition/courses-relations";

export { availabilitiesRelations } from "./schema-definition/availabilities-relations";

export { bookingsRelations } from "./schema-definition/bookings-relations";

export { ratingsRelations } from "./schema-definition/ratings-relations";
