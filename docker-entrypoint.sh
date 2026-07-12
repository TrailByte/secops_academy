#!/bin/sh
set -e

echo "╔══════════════════════════════════════╗"
echo "║       SecOps Academy — Startup       ║"
echo "╚══════════════════════════════════════╝"

# ── Wait for PostgreSQL ────────────────────────────────────────────────────────
echo "⏳  Waiting for database..."
until node -e "
const { Pool } = require('pg');
new Pool({ connectionString: process.env.DATABASE_URL })
  .query('SELECT 1')
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
" 2>/dev/null; do
  echo "    Not ready yet, retrying in 2s..."
  sleep 2
done
echo "✓  Database is ready."

# ── Schema migration ───────────────────────────────────────────────────────────
echo "⏳  Pushing schema..."
npx drizzle-kit push
echo "✓  Schema up to date."

# ── Seed content ──────────────────────────────────────────────────────────────
echo "⏳  Seeding content..."
npx tsx script/seed-learning-paths.ts         && echo "  ✓ Learning paths"
npx tsx script/seed-malware-analysis.ts       && echo "  ✓ Malware Analysis modules"
npx tsx script/seed-android-security-model.ts && echo "  ✓ Android Security modules"
npx tsx script/seed-android-challenges.ts     && echo "  ✓ Android Security challenges"
echo "✓  Content ready."

# ── Auto-promote admin ────────────────────────────────────────────────────────
if [ -n "$ADMIN_EMAIL" ]; then
  echo "⏳  Setting up admin: $ADMIN_EMAIL"
  node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query(
  'UPDATE users SET is_admin = true WHERE email = \$1',
  [process.env.ADMIN_EMAIL]
).then(r => {
  if (r.rowCount > 0) console.log('  ✓ Admin promoted:', process.env.ADMIN_EMAIL);
  else console.log('  · Admin user not found yet — register first, then restart.');
  pool.end();
  process.exit(0);
}).catch(e => { console.error(e.message); pool.end(); process.exit(0); });
"
fi

# ── Start ─────────────────────────────────────────────────────────────────────
echo ""
echo "🚀  SecOps Academy running on http://localhost:5000"
echo ""
exec node dist/index.cjs
