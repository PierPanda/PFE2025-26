#!/bin/sh
set -eu

: "${BOOKINGS_COMPLETE_ENDPOINT:?BOOKINGS_COMPLETE_ENDPOINT is required}"
: "${BOOKINGS_COMPLETE_CRON_SECRET:?BOOKINGS_COMPLETE_CRON_SECRET is required}"

curl -fsS -X POST "$BOOKINGS_COMPLETE_ENDPOINT" \
  --max-time 30 \
  --retry 3 \
  --retry-all-errors \
  -H "Authorization: Bearer $BOOKINGS_COMPLETE_CRON_SECRET"
