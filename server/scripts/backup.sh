#!/usr/bin/env bash
# Backup diário: banco SQLite + pasta de uploads. Retenção: 14 dias.
# Uso: ./server/scripts/backup.sh  (agende no cron: 0 3 * * * /caminho/backup.sh)
set -euo pipefail

ORIGEM="${BACKUP_ORIGEM:-/var/www/invictus}"
DESTINO="${BACKUP_DESTINO:-/var/backups/invictus}"
DATA=$(date +%Y-%m-%d)

mkdir -p "$DESTINO"

# cópia segura do SQLite (usa o próprio sqlite para garantir consistência)
if command -v sqlite3 >/dev/null; then
  sqlite3 "$ORIGEM/data/invictus.db" ".backup '$DESTINO/invictus-$DATA.db'"
else
  cp "$ORIGEM/data/invictus.db" "$DESTINO/invictus-$DATA.db"
fi

tar -czf "$DESTINO/uploads-$DATA.tar.gz" -C "$ORIGEM" uploads

# retenção: apaga backups com mais de 14 dias
find "$DESTINO" -name 'invictus-*.db' -mtime +14 -delete
find "$DESTINO" -name 'uploads-*.tar.gz' -mtime +14 -delete

echo "Backup concluído: $DESTINO ($DATA)"
