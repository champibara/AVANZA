#!/bin/sh
set -e

# Inicializar base de datos si no existe
if [ ! -f "$DATABASE_URL" ]; then
  echo "Inicializando base de datos por primera vez..."
  mkdir -p "$(dirname "$DATABASE_URL")"
  node /app/scripts/init-db.js
  echo "Base de datos inicializada."
fi

# Ejecutar seed si no hay operadores
node /app/scripts/seed.js

echo "Iniciando servidor..."
exec "$@"
