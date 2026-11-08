#!/bin/sh
set -e

echo ">> Applying Prisma migrations..."
attempts=0
max_attempts=15
until npx prisma migrate deploy; do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge "$max_attempts" ]; then
    echo "!! Could not apply migrations after $max_attempts attempts. Exiting."
    exit 1
  fi
  echo ">> Database not ready yet (attempt $attempts/$max_attempts). Retrying in 3s..."
  sleep 3
done

echo ">> Starting NestJS server..."
exec node dist/main.js
