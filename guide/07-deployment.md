# 07 — Deployment

The app is deployed on **Vercel** as a single project that serves both the static frontend build and the backend as a serverless function.

## How it's wired (`vercel.json`)

```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "(.*)", "destination": "/index.html" }
  ]
}
```

- Any request to `/api/*` is routed to `api/index.js` — a serverless function wrapper (`export default async function handler(req, res) { ... }`) that lazily connects to MongoDB on cold start and then delegates to the same Express `app` (`backend/app.js`) used in local dev.
- Every other request falls through to `index.html` (the built React SPA), so client-side routing works correctly on refresh/deep links.

## Build

Vercel runs the standard `npm run build` (Vite) to produce the static frontend in `dist/`. No separate backend build step is needed — the serverless function imports the backend source directly (ESM).

## Environment variables in production

All the variables documented in [02-getting-started.md](./02-getting-started.md) under `backend/.env` must also be set in the Vercel project's Environment Variables settings (Project → Settings → Environment Variables), since `api/index.js` doesn't read a `.env` file in production — Vercel injects them into `process.env` directly.

The frontend's `VITE_API_BASE_URL` is baked into the build at build time (Vite inlines `import.meta.env.*` at build time, not runtime), so make sure it's set correctly in Vercel's environment for the frontend build to point at the deployed API (typically the same origin, `https://<your-domain>/api`).

## Cloudinary — one manual setting to check

If uploaded PDFs/attachments (e.g. event flyers, funding pitch decks) show a blocked/Cloudflare page instead of downloading, it's almost always Cloudinary's **"Restricted media types"** account security setting blocking public delivery of non-image file types. Fix from the Cloudinary dashboard: Settings → Security → uncheck the media types you need to serve publicly (or configure delivery restrictions appropriately). This is an account-level setting, not something fixable from application code.

## Deploying

```bash
git push origin main
```

Vercel auto-deploys on push to the connected branch (typically `main`). Check the Vercel dashboard's deployment logs if a deploy fails — the most common causes are a missing environment variable or a MongoDB Atlas IP-allowlist issue (make sure `0.0.0.0/0`, or Vercel's IP ranges, are allowed in Atlas Network Access if deploys can't connect).
