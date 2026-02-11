#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Sözhane — Production Start Script
# Always runs seed (idempotent — skips existing data).
# ═══════════════════════════════════════════════════════════════

set -e

echo "🚀 Sözhane başlatılıyor..."
echo "   NODE_ENV:  ${NODE_ENV:-development}"
echo "   DATABASE:  ${DATABASE_PATH:-./sozhane.db}"
echo "   PORT:      ${PORT:-3000}"
echo ""

# Ensure data directories exist
mkdir -p "$(dirname "${DATABASE_PATH:-./sozhane.db}")"
mkdir -p "${PDF_DIR:-./generated-pdfs}"

# Run idempotent seed (creates tables + inserts missing templates)
# INSERT OR IGNORE ensures safe re-runs. Demo user skipped in production.
node scripts/seed.js

echo ""
echo "🌐 Server başlatılıyor (port: ${PORT:-3000})..."

# Standalone build varsa onu çalıştır (Next'in önerdiği doğru yol)
if [ -f ".next/standalone/server.js" ]; then
  export PORT="${PORT:-3000}"
  export HOSTNAME="0.0.0.0"
  exec node .next/standalone/server.js
fi

# Fallback (lokal/dev)
exec node_modules/.bin/next start -H 0.0.0.0 -p "${PORT:-3000}"


