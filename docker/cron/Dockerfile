FROM alpine:3.20

RUN apk add --no-cache curl ca-certificates tzdata && update-ca-certificates

COPY complete-bookings.sh /usr/local/bin/complete-bookings.sh
COPY remind-bookings.sh /usr/local/bin/remind-bookings.sh
COPY crontab /etc/crontabs/root

RUN chmod +x /usr/local/bin/complete-bookings.sh /usr/local/bin/remind-bookings.sh

CMD ["crond", "-f", "-l", "8", "-L", "/dev/stdout"]