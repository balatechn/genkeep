# GenKeep – Password Generator & Keeper

A modern, secure, centralized password management system for internal business use.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend    | Node.js 20 + Express + TypeScript   |
| ORM        | Prisma                              |
| Database   | PostgreSQL 16 (SQLite for local dev)|
| Auth       | JWT (access + refresh tokens)       |
| Encryption | AES-256-GCM (per-record IV)         |
| Deployment | Docker Compose + Coolify-ready      |

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ (or Docker)
- npm 10+

### 1. Clone & Setup Secrets
```bash
git clone <repo-url> genkeep
cd genkeep
node scripts/setup-env.js   # generates backend/.env with fresh secrets
```

### 2. Database
```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

### 3. Start Backend
```bash
cd backend
npm run dev
# API available at http://localhost:4000
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
# UI available at http://localhost:3000
```

Default credentials after seeding:
- **Admin:** `admin@genkeep.local` / `Admin@123!`
- **Viewer:** `viewer@genkeep.local` / `Viewer@123!`

---

## Docker Compose

```bash
# Copy and edit environment
cp .env.example .env
# Edit .env with your secrets (JWT, encryption key, DB password)

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health check: http://localhost:4000/api/health

---

## Coolify Deployment

1. Push to your Git repo.
2. In Coolify, create a new **Docker Compose** service.
3. Point to this repo; Coolify will pick up `docker-compose.yml`.
4. Add environment variables in Coolify's UI (from `.env.example`).
5. Deploy. Prisma migrations run automatically on backend start.

---

## Project Structure

```
genkeep/
├── frontend/              # React + Vite SPA
│   ├── src/
│   │   ├── api/           # Axios client + API functions
│   │   ├── components/    # Reusable UI + layout
│   │   ├── pages/         # Route-level pages
│   │   ├── store/         # Zustand stores (auth, ui)
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Helpers
│   └── Dockerfile
├── backend/
│   ├── prisma/            # Schema, migrations, seed
│   ├── src/
│   │   ├── config/        # DB client
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/     # Auth, validate, error
│   │   ├── routes/        # Express routers
│   │   └── services/      # Crypto, token, audit, generator
│   └── Dockerfile
├── docker/                # Nginx config
├── scripts/               # Setup helpers
├── docker-compose.yml
└── .env.example
```

---

## API Endpoints

| Method | Path                            | Auth    | Description              |
|--------|---------------------------------|---------|--------------------------|
| POST   | /api/v1/auth/login              | —       | Login                    |
| POST   | /api/v1/auth/refresh            | —       | Refresh tokens           |
| POST   | /api/v1/auth/logout             | User    | Logout                   |
| GET    | /api/v1/auth/me                 | User    | Current user             |
| GET    | /api/v1/entities                | User    | List entities            |
| POST   | /api/v1/entities                | Admin   | Create entity            |
| GET    | /api/v1/entities/types          | User    | List entity types        |
| GET    | /api/v1/credentials             | User    | List credentials         |
| POST   | /api/v1/credentials             | User    | Add credential           |
| POST   | /api/v1/credentials/:id/reveal  | User    | Reveal password (audited)|
| POST   | /api/v1/tools/generate-password | User    | Generate password        |
| GET    | /api/v1/reports/dashboard       | User    | Dashboard stats          |
| GET    | /api/v1/reports/expiry          | User    | Expiry report            |
| GET    | /api/v1/reports/logs            | Admin   | Activity logs            |
| GET    | /api/v1/users                   | Admin   | List users               |
| POST   | /api/v1/users                   | Admin   | Create user              |

---

## Security

- Passwords stored with **AES-256-GCM** encryption; never in plaintext
- Per-record random IV and GCM authentication tag
- bcrypt cost 12 for user password hashing
- JWT with short-lived access tokens (15 min) + refresh rotation
- Rate limiting on auth endpoints (10 req/15 min)
- Helmet security headers
- All password reveals are written to audit log
- CORS restricted to configured frontend URL
- Non-root Docker user

---

## UI Pages

| Route        | Page                |
|--------------|---------------------|
| `/login`     | Login               |
| `/`          | Dashboard           |
| `/entities`  | Entity Management   |
| `/vault`     | Password Vault      |
| `/generator` | Password Generator  |
| `/reports`   | Reports & Expiry    |
| `/users`     | User Management (admin) |
| `/settings`  | Settings            |
