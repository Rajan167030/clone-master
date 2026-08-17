# 01 — Overview

## What this project is

Founders Connect is a startup/investor networking platform. The public site lets visitors:

- Browse and register for **events** (with an image slider, listing page, and detail pages).
- Read the **blog**.
- View a **gallery** of community photos.
- See **partners/sponsors** and **testimonials**.
- Apply for **funding** (a multi-step form that lands in the admin dashboard).
- **Join** the community (a multi-step application, approved/denied from the admin dashboard).
- **Partner** with the organization (another multi-step application).
- Register as a **user** or **founder** (self-service) or as an **investor** (invite-only, gated by an admin-generated invite link).

Everything an admin needs to run the community lives behind `/admin` — a single-page dashboard with tabs for events, blog, gallery, partners, members, investors, join/partner requests, tasks, an internal admin chat, and email campaigns.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript, built with Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Animation | Framer Motion, GSAP (`ScrollTrigger`) |
| Routing | React Router v6 |
| Backend framework | Express (Node.js, ESM) |
| Database | MongoDB via Mongoose |
| Auth | JWT (`jsonwebtoken`), password hashing via `bcryptjs` |
| Media hosting | Cloudinary (signed direct uploads from the browser) |
| Email | Nodemailer over Gmail SMTP |
| AI | Groq API (chat completions) for the site's AI chatbot |
| Deployment | Vercel (frontend static build + backend as serverless functions) |

## How the pieces fit together

```
Browser (React SPA, :8080 in dev)
      │  fetch() calls to VITE_API_BASE_URL
      ▼
Express API (:4000 in dev, Vercel serverless in prod)
      │
      ├─ MongoDB (Mongoose models) — all persistent data
      ├─ Cloudinary — image storage/optimization (signed uploads)
      ├─ Gmail SMTP (Nodemailer) — transactional email (OTP, approvals, admin credentials)
      └─ Groq API — AI chatbot responses
```

The frontend never talks to MongoDB, Cloudinary, or SMTP directly — it always goes through the Express API. The one exception is **image uploads**: the backend issues a *signed upload signature* (via `/admin/cloudinary/sign-upload` or its public equivalent), and the browser then uploads the file directly to Cloudinary using that signature. This keeps large file bodies off the API server. See [05-backend-guide.md](./05-backend-guide.md) for details.

## Account roles

The whole app is built around one `Account` collection with a Mongoose **discriminator** (`role` field) splitting it into five sub-types:

- `user` — general member
- `investor` — created only via an admin-generated invite link, or promoted from a lead
- `founder` — self-registers
- `admin` — created by a superadmin from the Team & Access tab
- `superadmin` — full access, can create/manage other admins

See [05-backend-guide.md](./05-backend-guide.md) for how roles are enforced, and [08-troubleshooting.md](./08-troubleshooting.md) for an important gotcha around changing a role after account creation.
