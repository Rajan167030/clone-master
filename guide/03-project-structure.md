# 03 — Project Structure

```
fc/
├── src/                       # Frontend (React + Vite + TypeScript)
│   ├── pages/                 # One file per route (see 04-frontend-guide.md)
│   ├── components/            # Shared/reusable components
│   │   └── ui/                 # shadcn/ui primitives (button, card, dialog, ...)
│   ├── lib/
│   │   ├── api.ts              # Every frontend↔backend API call lives here
│   │   ├── cloudinary.ts       # optimizeCloudinaryUrl() image URL helper
│   │   └── googleMaps.ts       # Google Maps URL → embeddable iframe URL helper
│   ├── hooks/                  # useSEO, useStructuredData, use-toast, etc.
│   ├── index.css               # Global styles + all custom keyframes/utility classes
│   ├── App.tsx                  # Route table
│   └── main.tsx                 # App entry point
│
├── backend/                    # Backend (Express + Mongoose, ESM)
│   ├── server.js                # Entry point — loads env, connects Mongo, starts Express
│   ├── app.js                   # Express app: CORS, JSON body parsing, route mounting
│   ├── config/
│   │   └── mongodb.js           # Mongo connection helper
│   ├── models/                  # One Mongoose model per file (see 05-backend-guide.md)
│   ├── controllers/             # Business logic, one file per domain
│   ├── routes/                  # Express routers, mounted in app.js
│   ├── middlewares/              # auth.middleware, admin.middleware, audit.middleware, error.middleware
│   └── utils/                    # email.js (Nodemailer), cloudinary.js (signed uploads), etc.
│
├── guide/                       # ← you are here. Full project documentation.
│
├── public/                       # Static assets served as-is (favicons, local images)
├── .env / .env.example / .env.local   # Frontend (Vite) env vars — see 02-getting-started.md
├── backend/.env / backend/.env.example # Backend env vars
├── package.json                  # Single package.json for both frontend and backend
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig*.json
```

## Frontend: pages vs. components

- **`src/pages/*.tsx`** — one component per route, wired up in `src/App.tsx`. These compose components and call `src/lib/api.ts` functions directly (no separate "container/presenter" split).
- **`src/components/*.tsx`** — anything reused across more than one page, or a self-contained landing-page section (e.g. `HeroSlider.tsx`, `GallerySection.tsx`, `ExploreNetwork.tsx`, `Footer.tsx`, `Navbar.tsx`).
- **`src/components/ui/*.tsx`** — shadcn/ui primitives (generated, rarely hand-edited directly).

## Backend: the request lifecycle

```
routes/*.routes.js         → maps an HTTP verb+path to a controller function,
                              and attaches any required middleware (requireAuth,
                              requireAdmin, requireSuperAdmin)
      │
      ▼
controllers/*.controller.js → validates input, talks to models, calls utils
      │                        (email sending, Cloudinary signing, etc.)
      ▼
models/*.model.js           → Mongoose schemas/discriminators
```

`backend/app.js` mounts each router under a prefix:

| Prefix | Router file | Covers |
|---|---|---|
| `/api/auth` | `routes/auth.routes.js` | Login (user/admin), registration |
| `/api/content` | `routes/content.routes.js` | All **public** read endpoints: events, blog, gallery, partners, testimonials, slider, funding applications, join requests, partner inquiries, investor leads |
| `/api/admin` | `routes/admin.routes.js` | Everything behind the admin dashboard — CRUD for events/blog/gallery/partners/testimonials, members, investors, tasks, admin chat, audit log, email campaigns, Cloudinary signing |
| `/api/dashboard` | `routes/dashboard.routes.js` | Logged-in member's own dashboard data |
| `/api/profile` | `routes/profile.routes.js` | Public profile pages (`/profile/:profileId`) |
| `/api/ai` | `routes/ai.routes.js` | AI chatbot (Groq) |
| `/api/early-access` | `routes/earlyaccess.routes.js` | Early-access signup flow |
| `/api/activity` | `routes/activity.routes.js` | Bangalore activity page data |

There's also `GET /` and `GET /api/health` for uptime/health checks (the latter reports Mongo connection state).
