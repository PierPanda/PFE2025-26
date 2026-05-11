CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "bookings"
ADD CONSTRAINT "no_overlapping_bookings"
EXCLUDE USING gist (
  "availabilityId" WITH =,
  tsrange("startTime", "endTime") WITH &&
)
WHERE ("status" IN ('pending', 'confirmed'));
