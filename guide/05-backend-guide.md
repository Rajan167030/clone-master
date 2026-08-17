# 05 — Backend Guide

## Auth & account roles

`backend/models/account.model.js` defines a base `Account` schema with `discriminatorKey: "role"`, and five sub-models built on it:

- `UserAccount` (`role: "user"`)
- `InvestorAccount` (`role: "investor"`)
- `FounderAccount` (`role: "founder"`)
- `AdminAccount` (`role: "admin"`)
- `SuperAdminAccount` (`role: "superadmin"`)

Auth is JWT-based (`jsonwebtoken`), issued/verified via helpers referenced across `backend/controllers/auth.controller.js` and `backend/middlewares/auth.middleware.js`. The frontend stores the token and decoded account (`SessionAccount`) and sends it as `Authorization: Bearer <token>` on every authenticated request.

Middlewares (`backend/middlewares/`):

- `auth.middleware.js` → `requireAuth` — any logged-in account.
- `admin.middleware.js` → `requireAdmin` (accepts `role === "admin"` **or** `"superadmin"`), `requireSuperAdmin` (superadmin only — used for the most sensitive actions, e.g. creating other admins).
- `audit.middleware.js` — logs admin actions to the `AuditLog` collection for the Team & Access → Activity Log tab.
- `error.middleware.js` — `notFoundHandler` / `errorHandler`, mounted last in `app.js`.

⚠️ **Never change `account.role` via `account.save()` or `Model.updateOne()`** — see [08-troubleshooting.md](./08-troubleshooting.md) for why, and use the raw-driver pattern in `updateAdminRole` (`backend/controllers/task.controller.js`) as the reference implementation.

## Models (`backend/models/`)

| Model | Powers |
|---|---|
| `account.model.js` | All login accounts (base + 5 discriminators) |
| `dashboard.model.js` | A member's own dashboard/profile data |
| `event-content.model.js` | Events (`slug`, `bannerImage`, `mobileBannerImage`, `mapUrl`, `locationLabel`, `dateLabel`, FAQs, etc.) |
| `blog-content.model.js` | Blog posts |
| `gallery-image.model.js` | Gallery photos |
| `partner-logo.model.js` | Partner/sponsor logos shown in "Our Partners" |
| `partner-type.model.js` | Partner category taxonomy |
| `partner-inquiry.model.js` | Submissions from `/partner-with-us` |
| `testimonial.model.js` | Success-story testimonials |
| `slider-promotion.model.js` | Extra hero-slider slides (beyond the hardcoded first slide) |
| `funding-application.model.js` | Submissions from `/funding-application` |
| `join-request.model.js` | Submissions from `/join-us` |
| `investor-lead.model.js` | Investor lead-capture submissions (Name/Email/Phone/VC name/investment interest) |
| `investor-invite.model.js` | Admin-generated, reusable investor invite links/tokens |
| `speaker-investor-profile.model.js` | Past speakers/investors directory |
| `site-notice.model.js` | Sitewide announcement banner/modal |
| `task.model.js` | Admin task-tracking |
| `admin-message.model.js` | Internal admin chat messages |
| `audit-log.model.js` | Admin action audit trail |
| `send-log.model.js` / `suppression.model.js` | Email delivery logging + bounce/suppression tracking |
| `newsletter-subscriber.model.js` | Footer newsletter signups |
| `campaign.model.js` / `template.model.js` | Bulk email campaigns and reusable templates |
| `team.model.js` | "Our Team" page content |
| `qr-scan-analytics.model.js` | QR code scan tracking (physical membership cards) |
| `activity.model.js` | Bangalore activity page data |
| `email-verification.model.js` | OTP-based email verification codes |

## Public vs. admin content endpoints

Almost every content type (events, blog, gallery, partners, testimonials, slider promotions) has the same shape: a **public** read-only endpoint under `/api/content/...` and a full **admin CRUD** set under `/api/admin/...`, both implemented in `backend/controllers/content.controller.js`. When adding a new content type, follow this existing pattern rather than inventing a new one:

```
GET    /content/<things>              → listPublic<Things>   (public, only isPublished/isActive)
GET    /admin/<things>                → listAdmin<Things>    (requireAdmin, all records)
POST   /admin/<things>                → createAdmin<Thing>   (requireAdmin)
PATCH  /admin/<things>/:id            → updateAdmin<Thing>   (requireAdmin)
DELETE /admin/<things>/:id            → deleteAdmin<Thing>   (requireAdmin)
```

Admin create/update handlers typically run a `sanitize*Payload()` helper first (also in `content.controller.js`) to whitelist/trim fields before writing to Mongo.

## Image uploads: signed direct-to-Cloudinary

The backend never receives the image file itself. The flow is:

1. Frontend calls `getCloudinaryUploadSignatureApi(token, { folder })` → hits `POST /api/admin/cloudinary/sign-upload`.
2. Backend (`backend/utils/cloudinary.js` → `createCloudinaryUploadSignature`) generates a timestamp + HMAC signature using `CLOUDINARY_API_SECRET`, and returns `{ cloudName, apiKey, folder, timestamp, signature, uploadUrl }`. It never sends the secret itself to the browser.
3. Frontend builds a `FormData` with the file + those signed fields and `POST`s it **directly to Cloudinary** (`uploadUrl`), bypassing the Express server entirely.
4. Cloudinary responds with `{ secure_url, ... }`; the frontend stores that URL string on whichever form field it belongs to (`bannerImage`, `logoUrl`, etc.) and saves the record normally.

This pattern is copy-pasted per entity in `AdminDashboard.tsx` (event banner, event mobile banner, gallery image, blog cover, notice banner, partner logo) rather than abstracted into a shared hook — if you add a new image field, follow the existing `handle*Upload` functions as a template (folder convention: `founders-connect/<entity>`).

## Email

`backend/utils/email.js` wraps Nodemailer, auto-injecting the logo/footer (using `HOST_URL`) into every outgoing email, and logging every send attempt to `SendLog` (with `Suppression` tracking bounces/opt-outs). Used for:

- Email OTP verification (registration flows)
- Join/partner request approval emails (with generated login credentials on first approval)
- Admin account creation (generated password sent by email)
- Newsletter/campaign sends

## AI Chatbot

`backend/routes/ai.routes.js` + `backend/controllers/groq.controller.js` proxy chat requests to the Groq API (`GROQ_API_URL`/`GROQ_API_KEY`/`GROQ_MODEL`), keeping the API key server-side.
