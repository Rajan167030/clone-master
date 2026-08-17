# Founders Connect — Project Guide

This folder is the complete developer guide for the Founders Connect platform: a startup/investor networking site with a React frontend, an Express + MongoDB backend, and a full admin dashboard for running the community (events, blog, gallery, partners, members, investors, tasks, email campaigns).

Read the guides in this order if you're new to the codebase:

1. **[01-overview.md](./01-overview.md)** — What the project is, the tech stack, and how the pieces fit together.
2. **[02-getting-started.md](./02-getting-started.md)** — Clone, install, configure environment variables, and run both the frontend and backend locally.
3. **[03-project-structure.md](./03-project-structure.md)** — Folder-by-folder map of the repository.
4. **[04-frontend-guide.md](./04-frontend-guide.md)** — Pages, routes, shared components, and frontend conventions.
5. **[05-backend-guide.md](./05-backend-guide.md)** — API routes, database models, auth, and the account role system.
6. **[06-admin-panel-guide.md](./06-admin-panel-guide.md)** — How to actually run the platform day-to-day from `/admin`: managing events, partners, members, investors, tasks, and email.
7. **[07-deployment.md](./07-deployment.md)** — How the app is deployed (Vercel) and what environment variables production needs.
8. **[08-troubleshooting.md](./08-troubleshooting.md)** — Known gotchas and their fixes: the Mongoose discriminator role-change bug, Cloudinary's restricted-media 401, Gmail SMTP setup, and local dev networking quirks.

## Quick facts

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui, deployed on Vercel.
- **Backend**: Express + Mongoose (MongoDB), deployed as Vercel serverless functions.
- **Auth**: JWT-based, with five account roles — `user`, `investor`, `founder`, `admin`, `superadmin`.
- **Media**: Cloudinary for all image hosting/optimization.
- **Email**: Nodemailer over Gmail SMTP.
- **Local dev ports**: frontend `:8080` (Vite), backend `:4000` (Express).

This guide is written from the actual code as of the time it was generated — if something here goes stale, trust the code (`git log`, the file itself) over this document, and update the relevant `.md` file alongside your change.
