# 04 — Frontend Guide

## Routing

All routes are defined in `src/App.tsx`. A handful of high-traffic pages (`Index`, `Login`, `RegisterUser`, `RegisterInvestor`, `RegisterFounder`, `Dashboard`, `AdminDashboard`, `AdminLogin`, `AdminSpeakerInvestors`, `AdminInvestors`, `AdminMembers`, `Profile`, `NotFound`) are imported eagerly; everything else is `React.lazy`-loaded to keep the initial bundle small.

| Path | Page | Notes |
|---|---|---|
| `/` | `Index.tsx` | Landing page — composes `HeroSlider`, `StatsSection`, `PortfolioMarquee` ("Our Partners"), `ExploreNetwork`, `InvestorsSection`, `UpcomingEventsSection`, `BlogSection`, `GallerySection`, `Testimonials`, `JoinUsSection`, `Footer` |
| `/events`, `/events/:slug` | `Events.tsx`, `EventDetails.tsx` | Public event listing/detail |
| `/blog`, `/blog/:slug` | `Blog.tsx`, `BlogDetails.tsx` | Public blog |
| `/gallery` | `Gallery.tsx` | Public gallery |
| `/about`, `/membership`, `/privacy-policy`, `/terms-of-service` | Static-ish content pages |
| `/join-us` | `JoinUs.tsx` | Multi-step "join the community" application (email-verified, admin-reviewed) |
| `/partner-with-us` | `PartnerWithUs.tsx` | Multi-step partnership inquiry form |
| `/get-funding`, `/funding-application` | `GetFunding.tsx`, `FundingApplication.tsx` | Funding info page + 5-step application form |
| `/register/user`, `/register/founder` | `RegisterUser.tsx`, `RegisterFounder.tsx` | Self-service registration (email OTP gated) |
| `/register/investor` | `RegisterInvestor.tsx` | **Invite-only** — requires a valid `?token=` from an admin-generated link |
| `/login`, `/login/user`, `/login/founder` | `Login.tsx` | Member login |
| `/admin/login` | `AdminLogin.tsx` | Separate admin login |
| `/admin` | `AdminDashboard.tsx` | The whole admin panel (see [06-admin-panel-guide.md](./06-admin-panel-guide.md)) |
| `/admin/speaker-investors`, `/admin/investors`, `/admin/members` | Dedicated admin directory pages |
| `/dashboard` | `Dashboard.tsx` | Logged-in member's own dashboard |
| `/profile/:profileId` | `Profile.tsx` | Public member profile card |

`ProtectedRoute` (`src/components/ProtectedRoute.tsx`) wraps any route that needs auth, taking an `allowedRoles` array and a `redirectTo` fallback.

## Data fetching: `src/lib/api.ts`

Every single backend call goes through this one file. The pattern is:

```ts
const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const getPublicEventsApi = () =>
  request<{ events: DynamicEvent[] }>("/content/events", { method: "GET" });

export const createAdminPartnerApi = (token: string, payload: ...) =>
  request<{ message: string; partner: PartnerLogo }>("/admin/partners", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
```

Conventions to follow when adding a new API call:

- Public (unauthenticated) calls: `getPublic*Api` / `submit*Api`, hit `/content/...`.
- Admin calls: `*AdminApi`, take a `token: string` as the first argument, hit `/admin/...`, send `Authorization: Bearer <token>`.
- Every response/request shape gets an exported TypeScript `type`/`interface` next to the function.

## Images: always go through `optimizeCloudinaryUrl`

`src/lib/cloudinary.ts` exposes `optimizeCloudinaryUrl(url, width?)`, which injects Cloudinary's `f_auto,q_auto,c_limit,w_<width>` transformation into any Cloudinary URL (auto format + auto quality + capped width). Every image pulled from the CMS (`bannerImage`, `logoUrl`, gallery images, blog cover images, etc.) should be passed through this before rendering — never render a raw, unoptimized Cloudinary URL.

For **event photos specifically**, don't render a raw `<img>` with `object-cover` — use `src/components/EventBannerImage.tsx` instead. It renders a blurred, scaled backdrop copy plus a foreground `object-contain` image, so a photo of any aspect ratio displays in full without being cropped. It's already wired into `Events.tsx`, `EventDetails.tsx`, and `UpcomingEventsSection.tsx` — any new place that renders an event banner should use it too.

## Maps: `src/lib/googleMaps.ts` + `src/components/EventMapPreview.tsx`

`getGoogleMapsEmbedUrl(mapUrl)` converts whatever a user pastes from Google Maps (a `/place/...@lat,lng` link, a `?q=` link, or a share link) into a `/maps?...&output=embed` URL suitable for an `<iframe>`. `EventMapPreview` wraps this in a component — pass it an event's `mapUrl` and it renders the embedded map (or nothing, if `mapUrl` is empty). Used in both the admin event form (live preview while typing) and the public `EventDetails.tsx` page.

## Animation conventions

- **Scroll-reveal on landing-page sections**: any section with the `.gsap-section` class gets a fade+slide-up reveal via a shared `gsap.context()` in `Index.tsx`, triggered by `ScrollTrigger` at `"top 80%"`. The tween uses `clearProps: "transform"` so it doesn't leave a stray inline `transform` behind — **this matters** because a lingering `transform` on an ancestor breaks `position: sticky`/`position: fixed` for any descendant (see [08-troubleshooting.md](./08-troubleshooting.md)).
- **Sticky-stack scroll effect** (Testimonials → Join Us → Footer on the landing page): each section is `position: sticky; top: 0` with an increasing `z-index`, so each one pins to the top and gets visually covered by the next as the user scrolls.
- **Curtain reveal on multi-step forms**: `.animate-curtain-reveal` (defined in `src/index.css`) plays a `clip-path` wipe from top-to-bottom whenever a form step (re)mounts or toggles from `display:none` to visible. Used across `FundingApplication.tsx`, `JoinUs.tsx`, `PartnerWithUs.tsx`, `RegisterUser.tsx`, `RegisterFounder.tsx` so every "Next" click plays the same transition.
- **Navbar dropdown curtain**: desktop dropdowns use a `scaleY(0)→scaleY(1)` reveal from `origin-top` on hover; mobile menu/sub-menus use a `grid-rows-[0fr]→[1fr]` reveal on click, always mounted (not conditionally rendered) so the transition can play.
- **Metallic buttons**: `.btn-metallic` + `.btn-metallic-silver` / `.btn-metallic-purple` (in `src/index.css`) give a brushed-metal gradient body plus a light-sweep animation on hover. Used on the "Join us" and "Login" buttons.

## Notable custom components

| Component | Purpose |
|---|---|
| `ExpandingCardStack.tsx` | Horizontal row of cards where clicking one expands it (desktop) or a vertical accordion-style stack (mobile). Used by `ExploreNetwork.tsx`. |
| `EventBannerImage.tsx` | No-crop event photo renderer (see above). |
| `EventMapPreview.tsx` | Embedded Google Map from a pasted Maps URL (see above). |
| `Navbar.tsx` | Site header — sticky, glassmorphism background (`bg-white/60 backdrop-blur-lg`), curtain-reveal dropdowns, role-aware "Login"/"Dashboard"/"Admin Panel" button. |
| `Footer.tsx` | CSS Grid footer (`grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1.3fr]` on large screens) — logo/about, Explore, Community, About, Contact Info, Newsletter. |
| `AIChatbot.tsx` | Floating chat widget, mounted once in `App.tsx` outside the route table so it persists across navigation. |
