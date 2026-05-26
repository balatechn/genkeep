#!/usr/bin/env node
/**
 * GenKeep – One-shot environment setup helper
 * Run: node scripts/setup-env.js
 */
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

const rootDir = path.join(__dirname, '..');

function gen64hex() { return crypto.randomBytes(64).toString('hex'); }
function gen32hex() { return crypto.randomBytes(32).toString('hex'); }

const envContent = `# ── Application ─────────────────────────────────────────────────
NODE_ENV=development
PORT=4000

# ── Database ─────────────────────────────────────────────────────
DB_NAME=genkeep
DB_USER=genkeep
DB_PASSWORD=${crypto.randomBytes(16).toString('hex')}
DATABASE_URL=postgresql://genkeep:${crypto.randomBytes(16).toString('hex')}@localhost:5432/genkeep

# ── JWT ──────────────────────────────────────────────────────────
JWT_SECRET=${gen64hex()}
JWT_REFRESH_SECRET=${gen64hex()}
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ── Encryption ───────────────────────────────────────────────────
MASTER_ENCRYPTION_KEY=${gen32hex()}

# ── Session ──────────────────────────────────────────────────────
SESSION_TIMEOUT_MINUTES=30

# ── CORS ─────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000

# ── Frontend ─────────────────────────────────────────────────────
VITE_API_URL=http://localhost:4000
`;

const envPath = path.join(rootDir, 'backend', '.env');
if (fs.existsSync(envPath)) {
  console.log('⚠️  backend/.env already exists – skipping to avoid overwriting.');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅  backend/.env generated with fresh random secrets.');
}

// Also write frontend .env.local
const feEnvPath = path.join(rootDir, 'frontend', '.env.local');
if (!fs.existsSync(feEnvPath)) {
  fs.writeFileSync(feEnvPath, 'VITE_API_URL=http://localhost:4000\n');
  console.log('✅  frontend/.env.local generated.');
}

console.log('\n🚀 Next steps:');
console.log('   1. Ensure PostgreSQL is running');
console.log('   2. cd backend && npx prisma migrate dev --name init');
console.log('   3. npm run seed');
console.log('   4. npm run dev  (backend)');
console.log('   5. cd ../frontend && npm run dev');
console.log('\n   OR use Docker:  docker compose up --build');
