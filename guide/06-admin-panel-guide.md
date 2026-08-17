# 06 — Admin Panel Guide

Everything below happens at `/admin` (login at `/admin/login`), implemented in the single large `src/pages/AdminDashboard.tsx` file, tab by tab.

## Roles & who can do what

- **Admin**: access to the dashboard and most day-to-day content management.
- **Superadmin**: everything an admin can do, plus creating/deleting other admin accounts and generating investor invite links.
- There is **no limit** on how many admins can exist.

## Team & Access tab

- **Create Admin**: generates a random password and emails it to the new admin along with their login link.
- **Promote a member to admin**: from the Members tab, "Promote to Admin" keeps the person's existing login/email but changes their role — uses the raw-driver role update under the hood (see [08-troubleshooting.md](./08-troubleshooting.md)).
- **Delete**: hard-deletes the account (not a soft/demote). Deleting is the only way to free up an email address for reuse.
- **Activity/Audit Log**: every admin action is recorded here (via `audit.middleware.js`).

## Events tab

- **New Event** opens the create form. Required: slug, title, short description, at least a desktop banner image.
- **Banner images**: toggle between "URL" (paste a link) and "Upload" (direct-to-Cloudinary upload, see [05-backend-guide.md](./05-backend-guide.md)) for both the desktop and mobile banner. Recommended desktop size: 1920×1080 (16:9).
- **Location**: `Location Label` is the human-readable text (e.g. "Indiranagar, Bangalore"). `Google Maps URL` is a separate field — paste any Google Maps share/place link and a live embedded map preview renders right below it, so you can confirm the pin is in the right spot before saving. The same URL renders as an embedded map on the public event page.
- Events also carry `about`, `expectations`, `differentiators`, `audience`, `faqs` (as line-separated lists — FAQs use a `question || answer` format per line) and `registrationUrl` (external Luma/Eventbrite/etc. link).

## Blog tab

Standard CRUD: title, slug, cover image (URL or upload), body content, published/draft toggle.

## Gallery tab

Upload/manage the photos shown in the "Community Moments" marquee on the landing page and the `/gallery` page. Clicking any gallery image on the public site opens a full-screen lightbox (click, Escape, or backdrop-click to close).

## Partners tab

- **Add/Edit Partner**: name, category (General / College / E-Cell / Sponsor), display order, **logo** (URL or upload — same toggle pattern as event banners), website URL, logo width/height overrides, active toggle.
- Only partners with `isActive: true` show up in the public "Our Partners" section (`PortfolioMarquee.tsx`).

## Members / Investors tabs

- **Members**: full directory of all accounts (any role), with the ability to promote a member to admin.
- **Investors**: directory of investor accounts and investor **leads** (people who filled the investor lead-capture form). Investor *registration* itself is invite-only — generate a reusable invite link here and share it; anyone with the link can self-register as an investor via `/register/investor?token=...`.

## Join Us / Partner requests

Both flows are approve/pending/deny workflows:

- **Join Us** (from `/join-us`): approving a request creates a real member account (if one doesn't already exist for that email) and emails login credentials. Re-approving an already-approved request doesn't create a duplicate account.
- **Partner With Us** (from `/partner-with-us`): same approve/deny pattern, presented as a dropdown per row instead of separate buttons.

## Funding Applications

Read-only list of submissions from `/funding-application` (name, startup details, traction, ask, etc.) for the team to review and follow up on manually.

## Tasks

Simple internal task tracker: create a task, assign it to an admin, track status, delete when done.

## Admin Chat

Internal real-time-ish chat between admins (polling-based), with `@mention` support.

## Newsletter / Email Automation

- View newsletter subscribers (footer signup form).
- Send bulk campaign emails using reusable templates, with delivery logged per-recipient in `SendLog`/`Suppression` (so you can see failures/bounces, not just "sent").

## Analytics tab

A simplified set of charts (built with `recharts`) summarizing member growth, event registrations, etc. — see `src/components/AdminAnalyticsOverview.tsx`.
