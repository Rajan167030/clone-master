# 02 — Getting Started

## Prerequisites

- Node.js 20.19+ or 22.12+ (Vite will warn on older versions, but the app still runs).
- npm (comes with Node).
- Access to the project's MongoDB Atlas cluster, Cloudinary account, and Gmail app-password (or your own equivalents for local testing).

## 1. Install dependencies

From the repo root:

```bash
npm install
```

This installs both the frontend dependencies and the backend's dependencies (the backend is not a separate npm package — it shares the root `package.json`).

## 2. Environment variables

There are **two separate `.env` locations** — don't mix them up:

### `backend/.env` (backend/Express — required to run the API)

Copy `backend/.env.example` to `backend/.env` and fill in real values:

| Variable | Purpose |
|---|---|
| `PORT` | Port the Express server listens on (default `4000`) |
| `HOST_URL` | Public site URL, used to build absolute links/images inside outgoing emails |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign/verify auth tokens |
| `CLIENT_ORIGIN` | Comma-separated list of allowed CORS origins |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials, used to generate signed upload signatures |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | Gmail SMTP credentials for transactional email |
| `EMAIL_USER` / `EMAIL_PASS` | Fallback email credentials (some older code paths read these instead of the `SMTP_*` vars) |
| `NEWSLETTER_FROM_EMAIL` | Display name/address used as the "From" header for newsletter sends |
| `GROQ_API_URL` / `GROQ_API_KEY` / `GROQ_MODEL` | Groq API access for the AI chatbot |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis (used for rate limiting / caching) |
| `BULK_EMAIL_BATCH_SIZE` | Batch size when sending bulk campaign email |

> **Note on `SMTP_PASS`:** this must be a Gmail **app password** (16 characters, e.g. `xxxx xxxx xxxx xxxx`), not your normal Gmail login password — Google rejects normal passwords for SMTP. Generate one at myaccount.google.com → Security → App passwords, with 2-Step Verification enabled on the account.

### Root `.env` / `.env.local` (frontend/Vite)

- **`.env`** (committed) points the frontend at the **production** API by default:
  ```
  VITE_API_BASE_URL=https://clone-master123.vercel.app/api
  ```
- **`.env.local`** (gitignored — create this yourself for local dev) overrides it to point at your local backend instead:
  ```
  VITE_API_BASE_URL=http://localhost:4000/api
  ```
  Vite automatically prefers `.env.local` over `.env`, so once this file exists, `npm run dev` talks to your local Express server instead of production.

## 3. Run the backend

```bash
node backend/server.js
```

or with auto-restart on file changes:

```bash
npm run dev:server
```

**Run this from the `backend/` directory, or make sure your shell's cwd is `backend/` before starting it** — `server.js` loads `.env` relative to the process's current working directory (`dotenv.config({ path: ".env" })`), not relative to its own file location. Running `node backend/server.js` from the repo root will silently load the *root* `.env` (frontend-only) instead of `backend/.env`, leaving Mongo/Cloudinary/SMTP vars undefined. If you see mysterious 500s from image uploads or "Cloudinary not configured" errors, this is the first thing to check.

You should see:

```
MongoDB connected successfully.
API server running on http://localhost:4000
```

## 4. Run the frontend

From the repo root:

```bash
npm run dev
```

Vite serves the app at `http://localhost:8080`. If port 8080 is already in use it will silently pick the next free port (8081, 8082, …) — check the terminal output for the actual URL.

## 5. Log in as an admin

Admin login is at `/admin/login` (separate from the regular `/login`). Ask an existing superadmin for credentials, or seed one directly against the database — see `backend/models/account.model.js` for the `AdminAccount`/`SuperAdminAccount` discriminators, and [06-admin-panel-guide.md](./06-admin-panel-guide.md) for how admin creation works from inside the dashboard once you have at least one superadmin.

## Other useful scripts

| Command | What it does |
|---|---|
| `npm run build` | Production build of the frontend (`dist/`) |
| `npm run lint` | ESLint over the whole repo |
| `npm test` | Run the Vitest test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run preview` | Preview a production build locally |
