#!/usr/bin/env bash
# Backup the Ataribal100original database and product photos.
#
#   ./scripts/backup.sh                 # writes to ./backups
#   BACKUP_DIR=/mnt/nas ./scripts/backup.sh
#
# Requires pg_dump on the host (or run it inside the db container with
# `docker compose exec db pg_dump ...`).

set -euo pipefail

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
UPLOAD_DIR="${UPLOAD_DIR:-./data/uploads}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Backing up database..."
pg_dump "$DATABASE_URL" -Fc -f "$BACKUP_DIR/db-$STAMP.dump"

if [ -d "$UPLOAD_DIR" ]; then
  echo "Backing up product photos..."
  tar czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
else
  echo "No local upload directory at $UPLOAD_DIR (using remote storage?) — skipping photos."
fi

echo "Pruning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -type f \( -name 'db-*.dump' -o -name 'uploads-*.tar.gz' \) -mtime +"$RETENTION_DAYS" -delete

echo "Done:"
ls -lh "$BACKUP_DIR" | tail -n +1
