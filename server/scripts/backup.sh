#!/usr/bin/env bash
# Backup diário: banco PostgreSQL (pg_dump) + pasta de uploads. Retenção: 14 dias.
# Uso: ./server/scripts/backup.sh   (agende no cron: 0 3 * * * /caminho/backup.sh)
set -euo pipefail

ORIGEM="${BACKUP_ORIGEM:-/var/www/invictus}"
DESTINO="${BACKUP_DESTINO:-/var/backups/invictus}"
PGHOST="${PGHOST:-db}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-invictus_app}"
PGDATABASE="${PGDATABASE:-invictus}"
DATA=$(date +%Y-%m-%d)

mkdir -p "$DESTINO"

# dump em formato custom (comprime e permite restauração seletiva)
PGPASSWORD="${PGPASSWORD:?defina PGPASSWORD no ambiente/cron}" \
  pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -Fc -f "$DESTINO/invictus-$DATA.dump"

tar -czf "$DESTINO/uploads-$DATA.tar.gz" -C "$ORIGEM" uploads

# retenção: apaga backups com mais de 14 dias
find "$DESTINO" -name 'invictus-*.dump' -mtime +14 -delete
find "$DESTINO" -name 'uploads-*.tar.gz' -mtime +14 -delete

echo "Backup concluido: $DESTINO ($DATA)"