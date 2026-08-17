# 08 — Troubleshooting & Known Gotchas

## "I changed `account.role` but it didn't save" (Mongoose discriminator bug)

**Symptom**: promoting a user to admin, or toggling Admin ↔ Super Admin, appears to succeed (no error) but the account's role never actually changes.

**Cause**: `Account` uses `discriminatorKey: "role"`. Once a document is hydrated as a specific discriminator (e.g. `InvestorAccount`), Mongoose locks the `role` path to that discriminator's schema. Both `account.role = "admin"; account.save()` **and** `Account.updateOne({...}, { role: "admin" })` will silently no-op (or throw a cast error) when crossing discriminator types — it never persists.

**Fix**: bypass Mongoose's schema casting entirely and write through the raw MongoDB driver:

```js
await Account.collection.updateOne({ _id: existing._id }, { $set: { role } });
```

See `updateAdminRole` in `backend/controllers/task.controller.js` for the reference implementation. If you ever add another place that changes an account's role, use this same pattern — don't reach for `.save()` or `Model.updateOne()`.

## Backend can't find Cloudinary/Mongo/SMTP env vars locally

**Symptom**: local dev backend starts and even connects to MongoDB, but Cloudinary uploads 500, or you see "Cloudinary not configured."

**Cause**: `backend/server.js` runs `dotenv.config({ path: ".env" })`, which resolves `.env` relative to the process's **current working directory**, not relative to `server.js`'s own location. If you run `node backend/server.js` from the repo root, it loads the root `.env` (frontend-only, just `VITE_API_BASE_URL`) instead of `backend/.env`.

**Fix**: `cd backend` first, then `node server.js` (or use `npm run dev:server` / `npm run start:server`, which are also expected to be run with `backend/` as the working directory in most setups — if in doubt, `cd backend && node server.js` is always correct).

## Uploaded PDF/attachment shows a Cloudflare-branded block page

See [07-deployment.md](./07-deployment.md#cloudinary--one-manual-setting-to-check) — this is Cloudinary's "Restricted media types" account setting, fixed from the Cloudinary dashboard, not in code.

## A `position: sticky` or `position: fixed` element is in the wrong place

**Symptom**: a sticky navbar section, or a modal/lightbox using `position: fixed`, renders pinned to some arbitrary point on the page instead of the viewport.

**Cause**: any CSS `transform` (even an identity one, even briefly during an animation) on an **ancestor** element creates a new containing block. Any `position: fixed` descendant then anchors to that ancestor's box instead of the true viewport, and any `position: sticky` descendant starts tracking that ancestor instead of the scroll container.

Two concrete instances of this bug that were hit and fixed in this codebase:
1. GSAP's `.gsap-section` scroll-reveal tween left a stale inline `transform` on sections after the animation completed — fixed by adding `clearProps: "transform"` to the tween config in `Index.tsx`.
2. `GallerySection`'s lightbox modal (`position: fixed`) could render trapped inside the section's own (still-mid-animation) transformed box if opened before the section's GSAP reveal fired — fixed by rendering the modal through a React **portal** to `document.body` (`createPortal`), which escapes any ancestor's transform entirely. See `src/components/GallerySection.tsx`.

**Rule of thumb**: any new modal/lightbox/overlay that uses `position: fixed` should be rendered via `createPortal(..., document.body)`, not left as a normal descendant — don't rely on "nothing has a transform right now," because a future animation elsewhere in the tree can silently break it.

## Playwright/local sandbox can't reach `localhost:4000` or external hosts

If you're running browser automation (Playwright) against the local dev servers from certain sandboxed/CI environments, you may see `ERR_CONNECTION_REFUSED` for `localhost:4000` API calls, or failures loading external resources (e.g. Google Maps tile servers), even though a direct `curl` to the same URL succeeds from the shell. This is an environment networking limitation, not an application bug — verify the underlying logic separately (e.g. check the constructed URL/response shape directly) rather than assuming the feature is broken.

## Admin "Delete" doesn't actually remove the account

Make sure you're calling the delete API with the hard-delete flag (`deleteAdminAccountApi(token, id, true)`); a soft delete only demotes the account and keeps the email address "in use," causing a confusing "Email already in use" error if someone tries to recreate an account with that same email.
