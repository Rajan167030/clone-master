# 📁 Founders Connect — Complete File Guide

> Yeh document project ki **har file aur folder** ka purpose explain karta hai.

---

## 📦 Root Files (Project Root)

| File | Purpose |
|------|---------|
| `index.html` | Main HTML entry point — Vite iska use karta hai app load karne ke liye |
| `package.json` | Project dependencies, scripts (`dev`, `build`, etc.) |
| `package-lock.json` | Locked dependency versions (npm) |
| `bun.lock` / `bun.lockb` | Locked dependency versions (bun package manager) |
| `pnpm-lock.yaml` | Locked dependency versions (pnpm) |
| `vite.config.ts` | Vite bundler configuration — plugins, aliases, proxy setup |
| `vitest.config.ts` | Vitest testing framework configuration |
| `tailwind.config.ts` | Tailwind CSS theme customization — colors, fonts, animations |
| `postcss.config.js` | PostCSS plugins config (Tailwind, autoprefixer) |
| `tsconfig.json` | Root TypeScript config |
| `tsconfig.app.json` | TypeScript config for frontend app code |
| `tsconfig.node.json` | TypeScript config for Node/Vite config files |
| `eslint.config.js` | ESLint linting rules |
| `components.json` | shadcn/ui component configuration |
| `vercel.json` | Vercel deployment settings — rewrites & routes |
| `.env` / `.env.local` / `.env.example` | Environment variables (API URLs, keys) |
| `.gitignore` | Git ignore rules |
| `README.md` | Main project documentation |
| `ADMIN_DASHBOARD_GUIDE.md` | Admin dashboard usage guide |
| `ADMIN_QUICK_START.md` | Quick start guide for admin panel |
| `REGISTRATION_TROUBLESHOOTING.md` | Registration issues troubleshooting |

---

## 🌐 `src/` — Frontend Source Code

### Core Files

| File | Purpose |
|------|---------|
| `main.tsx` | App entry point — React DOM render, provider setup |
| `App.tsx` | Main app component — **All routes defined here** (React Router) |
| `App.css` | Global app-level CSS styles |
| `index.css` | Base CSS — design tokens, global styles, Tailwind imports |
| `vite-env.d.ts` | Vite TypeScript type declarations |

---

### 📄 `src/pages/` — All Website Pages

#### 🏠 Public Pages

| File | Purpose |
|------|---------|
| `Index.tsx` | **Homepage** — Landing page with hero, stats, testimonials |
| `About.tsx` | **About Us** page — Organization info |
| `Events.tsx` | **Events listing** page — Upcoming & past events |
| `EventDetails.tsx` | **Single event detail** page — Event info, registration, map |
| `Blog.tsx` | **Blog listing** page — All blog posts |
| `BlogDetails.tsx` | **Single blog post** page |
| `Gallery.tsx` | **Photo gallery** page |
| `Membership.tsx` | **Membership plans** page |
| `OurTeam.tsx` | **Team members** display page |
| `PastSpeakersInvestors.tsx` | **Past speakers & investors** showcase page |
| `CollegePartners.tsx` | **College partners** listing page |
| `ProductPage.tsx` | **Product/service** detail page |
| `PrivacyPolicy.tsx` | **Privacy Policy** page |
| `TermsOfService.tsx` | **Terms of Service** page |
| `ComingSoon.tsx` | **Coming Soon** placeholder page |
| `NotFound.tsx` | **404 Not Found** error page |
| `Search.tsx` | **Search** page — site-wide search functionality |
| `BangaloreActivity.tsx` | **Bangalore Activity/Event** — Special Bangalore chapter event page |

#### 🔐 Auth & Registration Pages

| File | Purpose |
|------|---------|
| `Login.tsx` | **Login** page — User authentication |
| `Register.tsx` | **General registration** page |
| `RegisterUser.tsx` | **User registration** form page |
| `RegisterFounder.tsx` | **Founder registration** form page |
| `RegisterInvestor.tsx` | **Investor registration** form page |
| `RegistrationHub.tsx` | **Registration hub** — Choose registration type (founder/investor/user) |
| `InvestorInviteRegister.tsx` | **Investor invite-only registration** page |
| `JoinUs.tsx` | **Join Us** page — Community joining form |

#### 👤 User Dashboard Pages

| File | Purpose |
|------|---------|
| `Dashboard.tsx` | **User dashboard** — Main dashboard after login |
| `Profile.tsx` | **User profile** page — View/edit profile |
| `Settings.tsx` | **User settings** page |
| `Community.tsx` | **Community** page — Community features |
| `CommunityDirectory.tsx` | **Community directory** — Browse community members |
| `CommunityMessages.tsx` | **Community messages** — Messaging between members |
| `Matchmaking.tsx` | **Matchmaking** — Founder-Investor matching feature |

#### 💰 Funding & Investor Pages

| File | Purpose |
|------|---------|
| `GetFunding.tsx` | **Get Funding** landing page |
| `FundingApplication.tsx` | **Funding application** form page |
| `QuickInvestorAccess.tsx` | **Quick investor access** — Fast investor onboarding |
| `FounderRoomEntry.tsx` | **Founder room** — Entry to founder-exclusive section |
| `InvestorRoomEntry.tsx` | **Investor room** — Entry to investor-exclusive section |
| `PartnerWithUs.tsx` | **Partner With Us** — Partnership inquiry form page |

#### 🛡️ Admin Pages

| File | Purpose |
|------|---------|
| `AdminLogin.tsx` | **Admin login** page |
| `Admin.tsx` | **Admin panel** — Main admin interface |
| `AdminDashboard.tsx` | **Admin dashboard** — Full analytics, content management, user management |
| `AdminMembers.tsx` | **Admin members** management — View/manage all members |
| `AdminInvestors.tsx` | **Admin investors** management — View/manage investors |
| `AdminTeam.tsx` | **Admin team** management — Add/edit/remove team members |
| `AdminSpeakerInvestors.tsx` | **Admin speaker/investor profiles** management |
| `AdminSais26Room.tsx` | **Admin SAIS26 Room** management |

#### 🎮 Special Feature Pages

| File | Purpose |
|------|---------|
| `Sais26RoomPage.tsx` | **SAIS26 Room** — Special interactive room page |
| `Sais26Leaderboard.tsx` | **SAIS26 Leaderboard** — Leaderboard for SAIS26 event |

---

### 🧩 `src/components/` — Reusable Components

#### Layout & Navigation

| File | Purpose |
|------|---------|
| `Navbar.tsx` | **Top navigation bar** — Main site navigation |
| `NavLink.tsx` | **Navigation link** — Individual nav link component |
| `Footer.tsx` | **Footer** — Site footer with links, socials, newsletter |
| `Sidebar.tsx` | **Sidebar** — Side navigation (dashboard/admin) |
| `Topbar.tsx` | **Top bar** — Secondary top bar for dashboard |
| `BackButton.tsx` | **Back button** — Navigation back button component |
| `ProtectedRoute.tsx` | **Protected route** — Auth guard for private pages |

#### Homepage Sections

| File | Purpose |
|------|---------|
| `HeroSlider.tsx` | **Hero slider** — Homepage hero banner with slides |
| `StatsSection.tsx` | **Stats section** — Numbers/metrics display |
| `UpcomingEventsSection.tsx` | **Upcoming events** section on homepage |
| `JoinUsSection.tsx` | **Join Us CTA** section on homepage |
| `JourneySection.tsx` | **Journey/timeline** section |
| `BlogSection.tsx` | **Blog preview** section on homepage |
| `GallerySection.tsx` | **Gallery preview** section on homepage |
| `InvestorsSection.tsx` | **Investors showcase** section |
| `SponsorsSection.tsx` | **Sponsors logos** section |
| `Testimonials.tsx` | **Testimonials** — User testimonials carousel |
| `FoundersConnectCTA.tsx` | **CTA banner** — Call-to-action component |
| `ExploreNetwork.tsx` | **Explore network** section |
| `PortfolioMarquee.tsx` | **Portfolio marquee** — Scrolling portfolio display |
| `PortfolioTable.tsx` | **Portfolio table** — Portfolio data in table format |

#### Forms & Modals

| File | Purpose |
|------|---------|
| `EventRegistrationForm.tsx` | **Event registration form** — Register for events |
| `SubscribeForm.tsx` | **Newsletter subscribe** form |
| `InvestorDetailsForm.tsx` | **Investor details** form — Investor profile form |
| `EditProfileModal.tsx` | **Edit profile modal** — Profile editing popup |
| `InvestorProfileModal.tsx` | **Investor profile modal** — View investor profile |
| `StartupProfileModal.tsx` | **Startup profile modal** — View startup profile |
| `PitchDeckViewerModal.tsx` | **Pitch deck viewer** — View uploaded pitch decks |
| `PhysicalCardOrdering.tsx` | **Physical card ordering** — Order physical member cards |
| `EmailVerificationBox.tsx` | **Email verification** — Email verify component |

#### Cards & Display

| File | Purpose |
|------|---------|
| `ProfileCard.tsx` | **Profile card** — User/member profile card display |
| `StatCard.tsx` | **Stat card** — Single statistic display card |
| `InvestorIdentityCard.tsx` | **Investor identity card** — Visual investor card |
| `ExpandingCardStack.tsx` | **Expanding card stack** — Animated stacking cards |
| `EventBannerImage.tsx` | **Event banner image** — Event header image component |

#### Maps & Visuals

| File | Purpose |
|------|---------|
| `EventLocationVisualizer.tsx` | **Event location visualizer** — Map/location display for events |
| `EventMapPreview.tsx` | **Event map preview** — Small map preview component |
| `Globe3DDemo.tsx` | **3D Globe demo** — Interactive 3D globe component |
| `WorldMapDemo.tsx` | **World map demo** — World map visualization |
| `Ballpit.tsx` | **Ballpit animation** — Interactive ball animation |

#### Admin Components

| File | Purpose |
|------|---------|
| `AdminAnalyticsOverview.tsx` | **Admin analytics** — Dashboard analytics charts/data |
| `AdminCookieConsent.tsx` | **Admin cookie consent** management |
| `QRAnalyticsDashboard.tsx` | **QR analytics dashboard** — QR code scan tracking |
| `ActivityResultsSection.tsx` | **Activity results** — Activity performance display |

#### Misc Components

| File | Purpose |
|------|---------|
| `AIChatbot.tsx` | **AI Chatbot** — AI-powered chat assistant |
| `CookieConsentBanner.tsx` | **Cookie consent banner** — GDPR cookie notice |
| `TeamChatWidget.tsx` | **Team chat widget** — Internal team chat |
| `Sais26Room.tsx` | **SAIS26 Room component** — Interactive room feature |

---

### 🧩 `src/components/ui/` — UI Library (shadcn/ui)

> Yeh sab **shadcn/ui** base components hain — reusable UI building blocks.

| File | Purpose |
|------|---------|
| `button.tsx` | Button component |
| `input.tsx` | Text input component |
| `textarea.tsx` | Textarea component |
| `select.tsx` | Select/dropdown component |
| `checkbox.tsx` | Checkbox component |
| `radio-group.tsx` | Radio button group |
| `switch.tsx` | Toggle switch |
| `slider.tsx` | Range slider |
| `label.tsx` | Form label |
| `form.tsx` | Form wrapper with validation |
| `card.tsx` | Card container |
| `dialog.tsx` | Modal dialog |
| `sheet.tsx` | Side sheet/drawer |
| `drawer.tsx` | Bottom drawer |
| `alert.tsx` | Alert message |
| `alert-dialog.tsx` | Confirmation dialog |
| `toast.tsx` | Toast notification |
| `toaster.tsx` | Toast container |
| `use-toast.ts` | Toast hook (re-export) |
| `sonner.tsx` | Sonner toast integration |
| `tabs.tsx` | Tab navigation |
| `accordion.tsx` | Collapsible accordion |
| `collapsible.tsx` | Collapsible section |
| `table.tsx` | Data table |
| `badge.tsx` | Badge/tag |
| `avatar.tsx` | User avatar |
| `tooltip.tsx` | Hover tooltip |
| `popover.tsx` | Popover dropdown |
| `hover-card.tsx` | Hover card |
| `dropdown-menu.tsx` | Dropdown menu |
| `context-menu.tsx` | Right-click context menu |
| `menubar.tsx` | Menu bar |
| `command.tsx` | Command palette |
| `navigation-menu.tsx` | Navigation menu |
| `breadcrumb.tsx` | Breadcrumb navigation |
| `pagination.tsx` | Page pagination |
| `progress.tsx` | Progress bar |
| `skeleton.tsx` | Loading skeleton |
| `separator.tsx` | Visual separator |
| `scroll-area.tsx` | Custom scrollbar area |
| `aspect-ratio.tsx` | Aspect ratio container |
| `calendar.tsx` | Date calendar picker |
| `carousel.tsx` | Image/content carousel |
| `chart.tsx` | Chart/graph component (Recharts) |
| `sidebar.tsx` | Sidebar layout component |
| `toggle.tsx` | Toggle button |
| `toggle-group.tsx` | Toggle button group |
| `input-otp.tsx` | OTP input component |
| `resizable.tsx` | Resizable panel |
| `glowing-effect.tsx` | Glowing border effect |
| `hero-parallax.tsx` | Parallax hero section |
| `3d-globe.tsx` | 3D globe component |
| `PixelTransition.tsx` | Pixel transition animation |
| `PixelTransition.css` | Pixel transition styles |

---

### 🔧 `src/lib/` — Utility & Helper Libraries

| File | Purpose |
|------|---------|
| `api.ts` | **Main API client** — Saare backend API calls yahan defined hain |
| `utils.ts` | **General utilities** — `cn()` class merging helper |
| `session.ts` | **Session management** — Login session, token storage |
| `formValidation.ts` | **Form validation** — Input validation rules |
| `blogs.ts` | **Blog utilities** — Blog data helpers |
| `events.ts` | **Events utilities** — Event data helpers |
| `cloudinary.ts` | **Cloudinary config** — Image upload/CDN setup |
| `drive.ts` | **Google Drive** — Drive integration helpers |
| `googleMaps.ts` | **Google Maps** — Maps API integration |
| `rating-criteria.ts` | **Rating criteria** — Event/startup rating definitions |

---

### 🪝 `src/hooks/` — Custom React Hooks

| File | Purpose |
|------|---------|
| `use-mobile.tsx` | **Mobile detection** hook — Responsive breakpoint check |
| `use-toast.ts` | **Toast notifications** hook — Show toast messages |
| `useCountingEffect.ts` | **Counting animation** hook — Number counting effect |
| `useSEO.ts` | **SEO management** hook — Dynamic meta tags |

---

### 🧪 `src/test/` — Tests

| File | Purpose |
|------|---------|
| `setup.ts` | Test environment setup |
| `example.test.ts` | Example test case |
| `newsletter.test.ts` | Newsletter feature tests |

---

## ⚙️ `backend/` — Backend Server (Node.js + Express + MongoDB)

### Core Files

| File | Purpose |
|------|---------|
| `server.js` | **Server startup** — Express server initialization, port listen |
| `app.js` | **Express app** — Middleware setup, route mounting, CORS |
| `package.json` | Backend dependencies |
| `.env` / `.env.example` | Backend environment variables (DB URL, JWT secret, email keys) |
| `vercel.json` | Backend Vercel deployment config |
| `debug_find_admin.js` | Debug script — Find admin users in DB |

---

### 🛤️ `backend/routes/` — API Routes

| File | Purpose |
|------|---------|
| `auth.routes.js` | **Authentication routes** — Login, register, logout, verify |
| `admin.routes.js` | **Admin routes** — Admin-only operations |
| `content.routes.js` | **Content routes** — Blog, events, gallery, testimonials CRUD |
| `activity.routes.js` | **Activity routes** — Bangalore activity, investor rooms, ratings |
| `profile.routes.js` | **Profile routes** — User profile CRUD |
| `dashboard.routes.js` | **Dashboard routes** — Dashboard data endpoints |
| `community.routes.js` | **Community routes** — Community features, messages |
| `matchmaking.routes.js` | **Matchmaking routes** — Founder-investor matching |
| `earlyaccess.routes.js` | **Early access routes** — Join requests, newsletter, funding |
| `team.routes.js` | **Team routes** — Team member management |
| `cookie-consent.routes.js` | **Cookie consent routes** — Cookie preference tracking |
| `ai.routes.js` | **AI routes** — AI chatbot (Groq API) |

---

### 🎮 `backend/controllers/` — Business Logic

| File | Purpose |
|------|---------|
| `auth.controller.js` | **Auth logic** — Login, register, password hashing, JWT |
| `admin.controller.js` | **Admin logic** — Admin CRUD, user management |
| `content.controller.js` | **Content logic** — Blog, events, gallery, testimonials, sliders, notices, partners CRUD |
| `activity-admin.controller.js` | **Activity admin** — Bangalore activity management |
| `dashboard.controller.js` | **Dashboard logic** — Dashboard data aggregation |
| `profile.controller.js` | **Profile logic** — User profile update, avatar upload |
| `community.controller.js` | **Community logic** — Community post management |
| `community-directory.controller.js` | **Community directory** — Member listing, search |
| `community-messages.controller.js` | **Community messages** — Direct messaging between users |
| `matchmaking.controller.js` | **Matchmaking logic** — Founder-investor matching algorithm |
| `investor-invite.controller.js` | **Investor invite logic** — Invite management, registration |
| `funding.controller.js` | **Funding logic** — Funding application processing |
| `join.controller.js` | **Join request logic** — Join request processing |
| `team.controller.js` | **Team logic** — Team member CRUD |
| `newsletter.controller.js` | **Newsletter logic** — Subscriber management, email sending |
| `campaigns.controller.js` | **Campaign logic** — Email campaign management |
| `email-automation.controller.js` | **Email automation** — Automated email sequences |
| `email-verification.controller.js` | **Email verification** — Verify user email addresses |
| `event-attendance.controller.js` | **Event attendance** — Track event attendance |
| `cookie-consent.controller.js` | **Cookie consent logic** — Store cookie preferences |
| `groq.controller.js` | **AI chatbot logic** — Groq LLM API integration |
| `partner-inquiry.controller.js` | **Partner inquiry** — Partnership form handling |
| `partner-type.controller.js` | **Partner type logic** — Partner category management |
| `admin-chat.controller.js` | **Admin chat** — Admin messaging system |
| `task.controller.js` | **Task management** — Admin task tracking |
| `audit.controller.js` | **Audit logging** — System audit trail |

---

### 📊 `backend/models/` — Database Models (MongoDB/Mongoose)

| File | Purpose |
|------|---------|
| `index.js` | **Model registry** — All models ko export karta hai |
| `account.model.js` | **User account** — User data schema (name, email, role, etc.) |
| `activity.model.js` | **Activity** — Event activities schema |
| `admin-message.model.js` | **Admin message** — Admin-to-admin chat messages |
| `audit-log.model.js` | **Audit log** — System action tracking |
| `blog-content.model.js` | **Blog content** — Blog post schema |
| `campaign.model.js` | **Campaign** — Email campaign schema |
| `community.model.js` | **Community post** — Community feed posts |
| `cookie-consent.model.js` | **Cookie consent** — User cookie preferences |
| `dashboard.model.js` | **Dashboard** — User dashboard config/data |
| `email-verification.model.js` | **Email verification** — Verification token storage |
| `event-attendance.model.js` | **Event attendance** — Event check-in records |
| `event-content.model.js` | **Event content** — Event details schema |
| `funding-application.model.js` | **Funding application** — Startup funding requests |
| `gallery-image.model.js` | **Gallery image** — Photo gallery entries |
| `investor-invite.model.js` | **Investor invite** — Investor invitation records |
| `investor-lead.model.js` | **Investor lead** — Quick investor access leads |
| `join-request.model.js` | **Join request** — Community join applications |
| `matchmaking.model.js` | **Matchmaking** — Founder-investor match data |
| `newsletter-subscriber.model.js` | **Newsletter subscriber** — Email subscriber list |
| `partner-inquiry.model.js` | **Partner inquiry** — Partnership inquiry submissions |
| `partner-logo.model.js` | **Partner logo** — Partner brand logos |
| `partner-type.model.js` | **Partner type** — Partner categories |
| `qr-scan-analytics.model.js` | **QR scan analytics** — QR code tracking data |
| `send-log.model.js` | **Send log** — Email send history |
| `site-notice.model.js` | **Site notice** — Website announcement banners |
| `slider-promotion.model.js` | **Slider promotion** — Homepage slider content |
| `speaker-investor-profile.model.js` | **Speaker/investor profile** — Speaker & investor showcase data |
| `suppression.model.js` | **Suppression list** — Email suppression/unsubscribe |
| `task.model.js` | **Task** — Admin task items |
| `team.model.js` | **Team member** — Team member profiles |
| `template.model.js` | **Email template** — Email template storage |
| `testimonial.model.js` | **Testimonial** — User testimonials |

---

### 🛡️ `backend/middlewares/` — Middleware

| File | Purpose |
|------|---------|
| `auth.middleware.js` | **Auth middleware** — JWT token verification |
| `admin.middleware.js` | **Admin middleware** — Admin role check |
| `audit.middleware.js` | **Audit middleware** — Log actions for audit trail |
| `error.middleware.js` | **Error middleware** — Global error handler |

---

### ⚙️ `backend/config/` — Configuration

| File | Purpose |
|------|---------|
| `mongodb.js` | **MongoDB connection** — Database connection setup |
| `agenda.js` | **Agenda.js** — Job scheduling (cron jobs, email automation) |

---

### 🔧 `backend/utils/` — Utility Functions

| File | Purpose |
|------|---------|
| `email.js` | **Email sender** — Nodemailer/SES email sending |
| `jwt.js` | **JWT utilities** — Token generation & verification |
| `password.js` | **Password utilities** — Hashing & comparison |
| `cloudinary.js` | **Cloudinary** — Image upload to Cloudinary CDN |
| `cache.js` | **Cache** — In-memory caching layer |
| `template.js` | **Template renderer** — Email template rendering |
| `dashboard-payload.js` | **Dashboard payload** — Dashboard data builder |
| `dashboard-template.js` | **Dashboard template** — Dashboard HTML template |
| `role-details.js` | **Role details** — User role definitions & permissions |
| `profile-utils.js` | **Profile utilities** — Profile data helpers |
| `activity-email-templates.js` | **Activity email templates** — Activity notification emails |
| `activity-rating.js` | **Activity rating** — Rating calculation logic |

---

### 📜 `backend/scripts/` — Database Scripts

| File | Purpose |
|------|---------|
| `seed-admin-user.js` | **Seed admin** — Create initial admin user |
| `seed-auth-data.js` | **Seed auth data** — Seed authentication test data |
| `seed-blogs.js` | **Seed blogs** — Populate sample blog posts |
| `seed-partner-types.js` | **Seed partner types** — Create partner categories |
| `create-bangalore-investor-credentials.js` | Create Bangalore investor accounts |
| `create-multiple-partners.js` | Bulk create partner entries |
| `backfill-activity-investor-passwords.js` | Fix investor passwords |
| `reset-bangalore-investor-passwords.js` | Reset Bangalore investor passwords |
| `remove-activity-investor.js` | Remove activity investors |
| `shorten-activity-descriptions.js` | Trim long activity descriptions |
| `truncate-startup-descriptions.js` | Trim long startup descriptions |
| `test-create-partner.js` | Test partner creation |
| `test-send-email.js` | Test email sending |

---

## 🌐 `api/` — Vercel Serverless API

| File | Purpose |
|------|---------|
| `index.js` | **Serverless entry** — Vercel serverless function wrapper for backend |

---

## ☁️ `aws/` — AWS Migration

| File | Purpose |
|------|---------|
| `AWS_MIGRATION_GUIDE.md` | AWS migration documentation & guide |

---

## 📁 `public/` — Static Public Assets

| File | Purpose |
|------|---------|
| `favicon.svg` | Browser tab favicon |
| `founders_connect_global_logo.jpg` | Founders Connect logo image |
| `hero-founders-connect.webp` | Hero section background image |
| `Screenshot 2026-04-23 004018.png` | Screenshot asset |
| `index.html` | Fallback HTML page |
| `manifest.webmanifest` | PWA manifest — App name, icons, theme |
| `robots.txt` | SEO — Search engine crawler rules |
| `sitemap.xml` | SEO — XML sitemap for search engines |
| `sw.js` | **Service Worker** — PWA offline support & caching |

---

## 📚 `guide/` — Developer Guide (Multi-part)

| File | Purpose |
|------|---------|
| `README.md` | Guide index/table of contents |
| `01-overview.md` | Project overview |
| `02-getting-started.md` | Setup instructions |
| `03-project-structure.md` | Folder structure explanation |
| `04-frontend-guide.md` | Frontend development guide |
| `05-backend-guide.md` | Backend development guide |
| `06-admin-panel-guide.md` | Admin panel usage guide |
| `07-deployment.md` | Deployment instructions |
| `08-troubleshooting.md` | Common issues & fixes |

---

## 📖 `readme/`

| File | Purpose |
|------|---------|
| `DEVELOPER_GUIDE.md` | Detailed developer documentation |

---

## 🏗️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + TypeScript + Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Routing** | React Router |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (JSON Web Tokens) |
| **Email** | Nodemailer / AWS SES |
| **Images** | Cloudinary CDN |
| **Maps** | Google Maps API |
| **AI** | Groq LLM API |
| **Deployment** | Vercel |
| **Testing** | Vitest |
