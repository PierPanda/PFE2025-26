#!/bin/sh
set -eu

: "${BOOKINGS_REMIND_ENDPOINT:?BOOKINGS_REMIND_ENDPOINT is required}"
: "${BOOKINGS_REMIND_CRON_SECRET:?BOOKINGS_REMIND_CRON_SECRET is required}"

curl -fsS -X POST "$BOOKINGS_REMIND_ENDPOINT" \
  --max-time 30 \
  --retry 3 \
  --retry-all-errors \
  -H "Authorization: Bearer $BOOKINGS_REMIND_CRON_SECRET"
