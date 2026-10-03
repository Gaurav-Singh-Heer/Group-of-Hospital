# 🗓️ October 2026 Updates

This document records the changes made during the October 2026 cleanup and
hardening pass, why each change was made, and a complete deployment guide.

---

## 🔧 What Changed & Why

### 1. Fixed a crash-on-every-request bug on Linux / Vercel

- **Before:** `routes/appointments.js` imported `../models/appointment` (lowercase).
- **Problem:** macOS/Windows filesystems are case-insensitive so it worked locally,
  but Linux (which Vercel runs on) is case-sensitive — the import would throw
  `Cannot find module` and crash the route in production.
- **After:** import corrected to `../models/Appointment`.

### 2. Fixed the broken Vercel configuration

- **Before:** `vercel.json` pointed its build and routes at `index.js`, **but no
  `index.js` existed** — the entry point was `server.js`. Deploys could not boot.
- **After:** Added a proper `index.js` entry point that both starts a server
  locally and exports the Express `app` for Vercel's serverless runtime. Removed the
  invalid `@vercel/static` build for the EJS views (those are rendered by the app, not
  served statically).

### 3. Restructured the app into clear, testable modules

- **`config/db.js`** — a single, cached MongoDB connection helper. It validates that
  `MONGO_URI` is set and **caches the connection** so serverless invocations reuse one
  socket instead of reconnecting on every request.
- **`app.js`** — all Express setup (middleware, routes, error handling), exported as a
  plain app so it can be imported and tested without binding a port.
- **`index.js`** — connects the DB and only calls `app.listen()` when run directly
  (`require.main === module`), exporting `app` otherwise for Vercel.
- **`server.js`** — kept as a thin wrapper (`require('./index')`) for backward
  compatibility with anything that referenced it.

### 4. Enabled the security & performance middleware that was already installed

- `helmet`, `compression`, `morgan`, and `cors` were listed as dependencies but
  **never wired in** on the running server. They are now active in `app.js`:
  - `helmet` — secure HTTP headers (CSP disabled to keep existing inline scripts/styles working)
  - `compression` — gzip responses
  - `morgan` — HTTP request logging (`dev` locally, `combined` in production)
  - `cors` — cross-origin requests
- Added `app.set('trust proxy', 1)` so secure session cookies work behind Vercel's proxy.

### 5. Removed broken / unnecessary dependencies

- **Dropped `fs` and `path` from `package.json`** — these are Node.js built-ins. The
  npm packages of the same name are stubs/old copies and should never be installed.
- **Removed `body-parser`** — replaced with the built-in `express.json()` and
  `express.urlencoded()` (available since Express 4.16). Note: `body-parser` was used in
  the code but was *not* declared as a dependency, so installs could fail; this removes
  the mismatch entirely.
- **Moved `nodemon` to `devDependencies`** — it is a dev tool, not a runtime dependency.

### 6. Added resilient configuration & startup

- The server no longer crashes if MongoDB is unreachable at boot — it logs the error
  and keeps serving pages, retrying the connection on the next request.
- `SESSION_SECRET` falls back to a safe placeholder in development but should always be
  set in production.

### 7. Cleaned up the repo

- **Deleted `models/Apointment.js`** — a misspelled, unused duplicate of
  `models/Appointment.js` (dead code).
- **Added `.gitignore`** — ignores `node_modules/`, `.env`, logs, OS/editor files, and
  `.vercel`. (Previously there was none, risking committed secrets.)
- **Added `.env.example`** — documents every required environment variable.
- Added a **404 handler** that forwards to the existing error handler.
- Updated `package.json` metadata, added an `engines` field (`node >= 18`), and added a
  `dev` script (`nodemon`) alongside a plain `start` (`node`).

### 8. Fixed the Sahayak chatbot (Gemini model retired + crash bug)

- **Retired model:** the controller used `gemini-2.0-flash`, which Google has **removed**.
  Calls returned `404 ... model is no longer available`. Updated to **`gemini-flash-latest`**,
  a stable alias that automatically tracks the current Flash model so it won't break again
  the next time a specific version is retired.
  (Note: Google's suggested `gemini-3.8-flash` and `gemini-2.5-flash` were **not** available
  on this API key — `gemini-flash-latest` was verified working.)
- **Crash bug:** `sahayakController.sendMessage` had **no error handling** around the
  Gemini call. Any API error (e.g. a transient `503 high demand`) threw an unhandled
  rejection that **crashed the entire Node process** — on Vercel this would take the whole
  app down. Wrapped the call in `try/catch`; it now logs the error and returns a friendly
  `503` JSON message (`"Sahayak is busy right now..."`) while the server keeps running.

### 9. Connected a live MongoDB Atlas database

- Replaced the local `mongodb://localhost` placeholder in `.env` with a real **MongoDB
  Atlas** `mongodb+srv://...` connection string pointing at the `group-of-hospital` database.
- Generated a strong random **`SESSION_SECRET`** (48 random bytes, hex) instead of the
  placeholder text.
- Added the Atlas **IP Access List** entry `0.0.0.0/0` ("allow from anywhere"), which is
  required for Vercel's rotating serverless IPs.
- Verified the app connects (`MongoDB connected`) and serves pages against the live cluster.

### 10. Complete UI overhaul — unified, modern, responsive design

The front end previously used **five inconsistent stylesheets** plus large blocks of
page-specific inline CSS, two clashing color schemes (purple↔cyan vs magenta↔indigo),
three different fonts, and — on most pages — **no responsiveness at all**. The entire
UI was rebuilt on a single design system.

**New shared foundation:**

- **`public/css/theme.css`** — one design system for the whole site: CSS variables for
  the brand palette (unified indigo → cyan with a teal accent), spacing, typography
  (Plus Jakarta Sans + Inter), radii, and shadows; plus reusable components — sticky
  glass navbar, buttons, cards, forms, footer, chatbot, and a mobile menu.
- **`public/js/ui.js`** — shared behaviour: the mobile hamburger-menu toggle and
  `IntersectionObserver`-based scroll-reveal animations.

**Every page was redesigned to use it:**

| Page | What changed |
| ---- | ------------ |
| `login.ejs` / `signUp.ejs` | New split-panel layout (branded aside + clean form); kept all client-side validation |
| `index.ejs` (landing) | Rebuilt as a real marketing page: hero, stats, services, hospitals, testimonials, CTA, footer (previously referenced a missing `main.js` and had dead code) |
| `home.ejs` (dashboard) | New hero, feature/hospital cards, modern navbar with user chip; kept GSAP + full Sahayak chatbot |
| `about.ejs` | Rebuilt banner, mission, services, **team carousel** (JS preserved + bounds-checked), testimonials |
| `contact.ejs` | Two-column card layout with icon contact list; kept the form handler |
| `appointments.ejs` | Modern table + mobile card view, legend, avatars; kept the past/future date color-coding JS |
| `no-appointments.ejs` | Friendly empty state with navbar and clear call-to-action |
| `views/partials/*` | `hospital_header`, `dept_cards`, `hopital_appointments`, `hospital_footer` all restyled to the shared theme |
| `hospital/gmch`, `max`, `pgimer` | Hero wrapped in a container, restyled department carousel, booking form, and contact/map sections |

**Bugs fixed along the way:**

- **Hardcoded `http://localhost:3000` in `fetch()` calls** (login, signup, chatbot, and
  all three hospital booking forms) — these would have **failed in production on Vercel**.
  Changed to relative URLs (`/login`, `/sahayak`, `/home`, etc.).
- **`PGMIGER` typo** — the PGIMER booking form saved the hospital name as `"PGMIGER"`.
  Corrected to `"PGIMER"`.
- **Relative asset paths** (`../assets/...`, `./assets/...`) normalized to root-relative
  (`/assets/...`) so images resolve correctly regardless of the page's URL depth.
- **Deleted `views/index2.ejs`** — an orphaned alternate layout with a broken `include`
  path that no route rendered (dead code).

**Verification:** all 11 live templates were rendered with mock data (0 errors) and the
server was booted to confirm `/`, `/login`, `/register`, `/css/theme.css`, and
`/js/ui.js` all return `200`.

### 11. New functionality — auth hardening, appointment management, profiles, admin

A round of real features was added on top of the UI work.

**1. Passwords are now hashed (bcryptjs).**
Previously passwords were stored **in plain text** — a serious security hole. Signup now
hashes with `bcrypt` (10 salt rounds) and login uses `bcrypt.compare`. Any pre-existing
plain-text password is detected and **transparently upgraded to a hash** on the user's
next successful login, so existing accounts keep working.

**2. Cancel & reschedule appointments.**
The Appointments page now has **Cancel** and **Reschedule** buttons per row.
New ownership-checked routes:
- `DELETE /appointments/:id` — cancel (only your own)
- `PUT /appointments/:id` — reschedule the date (only your own)

A modal collects the new date; the server rejects attempts to modify another user's
appointment with a `403`.

**3. My Profile page (`/profile`).**
A new page to view account details and an appointment count, update the display name,
and change the password (verifying the current one first). Linked from the navbar and
the user chip.

**4. Admin dashboard (`/admin`).**
- Added a `role` field (`user` | `admin`) to the User model.
- New `requireAuth` / `requireAdmin` guards in `middlewares/auth.js`.
- Admins get a dashboard with stat cards, **search** (name/email/department),
  **hospital filter**, and the ability to **delete any appointment**.
- Admin logins are redirected to `/admin`; non-admins get `403`.
- `scripts/makeAdmin.js <email>` promotes an existing user to admin from the CLI
  (used once to bootstrap the first admin).
- **In-dashboard user management:** a **Users & Roles** table on `/admin` lets an admin
  promote/demote any other user with one click (`PUT /admin/users/:id/role`) — no terminal
  needed, and it works on the deployed site since roles live in the shared DB. A guard
  prevents an admin from demoting their **own** account (avoids locking everyone out).

**5. Persistent sessions (connect-mongo).**
Sessions are now stored in MongoDB instead of in memory. This fixes the previously
documented serverless limitation — logins now **survive restarts and work on Vercel**,
where the in-memory store would drop sessions between invocations. (Note: connect-mongo
v6 is ESM-first, so under CommonJS it's loaded via `require('connect-mongo').default`.)

**New routes/controllers/views:** `routes/profileRoutes.js`, `routes/adminRoutes.js`,
`controllers/profileController.js`, `controllers/adminController.js`,
`middlewares/auth.js`, `views/profile.ejs`, `views/admin.ejs`, `scripts/makeAdmin.js`.

**Verification:** a full end-to-end flow was run against the live Atlas DB — register →
login → book → reschedule → cancel, profile load, admin promote → admin dashboard +
search, and confirmation that the stored password is a `$2b$` bcrypt hash and that
non-admins receive `403` on `/admin`.

### 📂 Files Added / Changed / Removed

| Action      | File                           |
| ----------- | ------------------------------ |
| ➕ Added     | `index.js`                     |
| ➕ Added     | `app.js`                       |
| ➕ Added     | `config/db.js`                 |
| ➕ Added     | `.gitignore`                   |
| ➕ Added     | `.env.example`                 |
| ➕ Added     | `README_OCT_UPDATIONS.md`      |
| ➕ Added     | `public/css/theme.css` (shared design system) |
| ➕ Added     | `public/js/ui.js` (shared UI behaviour) |
| ➕ Added     | `middlewares/auth.js` (requireAuth / requireAdmin) |
| ➕ Added     | `controllers/profileController.js`, `routes/profileRoutes.js`, `views/profile.ejs` |
| ➕ Added     | `controllers/adminController.js`, `routes/adminRoutes.js`, `views/admin.ejs` |
| ➕ Added     | `scripts/makeAdmin.js` (promote a user to admin) |
| ✏️ Changed   | `models/User.js` (added `role` field) |
| ✏️ Changed   | `controllers/authController.js` (bcrypt hashing + legacy upgrade + role in session) |
| ✏️ Changed   | `routes/appointments.js` (cancel/reschedule routes + auth guard) |
| ✏️ Changed   | `app.js` (connect-mongo session store + new routes) |
| ✏️ Changed   | `server.js` (now a thin wrapper) |
| ✏️ Changed   | `vercel.json`                  |
| ✏️ Changed   | `package.json`                 |
| ✏️ Changed   | `routes/appointments.js` (import fix) |
| ✏️ Changed   | `controllers/sahayakController.js` (model + error handling) |
| ✏️ Changed   | `.env` (real Atlas URI, session secret, Gemini key — gitignored) |
| ✏️ Changed   | All `views/*.ejs` + `views/partials/*.ejs` (full UI redesign) |
| ✏️ Changed   | `README.md`                    |
| 🗑️ Removed   | `models/Apointment.js`         |
| 🗑️ Removed   | `views/index2.ejs` (orphan, broken include) |

> ℹ️ `Server_log.js` and the old per-page stylesheets (`public/home.css`,
> `login.css`, `signUp.css`, `contact.css`, `css/style.min.css`) were left in place but
> are **no longer referenced** by any view — they can be deleted in a future cleanup.

---

## ☁️ Deployment Guide (Vercel)

The app is configured to deploy to **Vercel** as a serverless Node app. You'll need a
cloud MongoDB (MongoDB Atlas) because Vercel cannot reach a database on your laptop.

### Step 1 — Set up MongoDB Atlas (free tier)

1. Create an account at <https://www.mongodb.com/atlas> and create a **free M0 cluster**.
2. Under **Database Access**, create a database user with a username and password.
3. Under **Network Access**, add IP `0.0.0.0/0` (allow from anywhere) — Vercel's
   serverless functions use dynamic IPs, so you can't whitelist a single address.
4. Click **Connect → Drivers** and copy the connection string. It looks like:

   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/group-of-hospital?retryWrites=true&w=majority
   ```

   Replace `<user>` / `<password>` and add your database name (`group-of-hospital`).

### Step 2 — Push your code to GitHub

```bash
git add .
git commit -m "Harden app and prepare for deployment"
git push origin main
```

> Make sure `.env` is **not** committed — it's now in `.gitignore`.

### Step 3 — Import the project into Vercel

1. Go to <https://vercel.com>, sign in with GitHub, and click **Add New → Project**.
2. Select the **Group-of-Hospital** repository and click **Import**.
3. Framework preset: **Other** (the included `vercel.json` handles the build).

### Step 4 — Add environment variables in Vercel

In the project's **Settings → Environment Variables**, add these for the
**Production** (and Preview) environments:

| Key              | Value                                             |
| ---------------- | ------------------------------------------------- |
| `MONGO_URI`      | your Atlas connection string from Step 1          |
| `SESSION_SECRET` | a long random string                              |
| `GEMINI_API_KEY` | your Google Gemini API key                        |
| `NODE_ENV`       | `production`                                      |

> Do **not** set `PORT` on Vercel — the platform manages it.

### Step 5 — Deploy

Click **Deploy**. Vercel installs dependencies, builds `index.js` with
`@vercel/node`, and routes all traffic to the app. When it finishes you'll get a URL
like `https://group-of-hospital.vercel.app`.

Every subsequent `git push` to `main` triggers an automatic redeploy.

### Step 6 — Verify

- Visit the deployment URL → you should see the landing page.
- Sign up / log in → confirms sessions and MongoDB are working.
- Book an appointment, then open **Appointments** → confirms writes/reads.
- Try the **Sahayak** chatbot → confirms the Gemini key is set.

### 🧰 Deploying via the Vercel CLI (alternative)

```bash
npm i -g vercel
vercel          # first run links/creates the project (preview deploy)
vercel --prod   # promote to production
```

Add env vars from the CLI with:

```bash
vercel env add MONGO_URI
vercel env add SESSION_SECRET
vercel env add GEMINI_API_KEY
vercel env add NODE_ENV
```

### ⚠️ Deployment Notes & Gotchas

- **Serverless cold starts:** the first request after idle may be slow while the DB
  reconnects — this is normal for the free tier.
- **Sessions persist in MongoDB** via `connect-mongo` (added in the functionality update),
  so logins now survive restarts and serverless invocations on Vercel. ✅ (This replaces
  the earlier in-memory store, which dropped sessions between serverless invocations.)
- **Atlas network access** must allow `0.0.0.0/0` or Vercel cannot connect.

---

## ▶️ Quick Local Checklist

```bash
npm install
cp .env.example .env     # then fill in MONGO_URI, SESSION_SECRET, GEMINI_API_KEY
npm run dev              # http://localhost:3000
```

---

## ✅ Verification (tested locally against the live Atlas cluster)

| Check                        | Result                                            |
| ---------------------------- | ------------------------------------------------- |
| `npm install`                | ✅ succeeds                                        |
| Server boots                 | ✅ `Server running at http://localhost:3000`       |
| MongoDB Atlas connection     | ✅ `MongoDB connected` (db: `group-of-hospital`)   |
| `GET /`                      | ✅ `200`                                           |
| `GET /login`                 | ✅ `200`                                           |
| `POST /sahayak` (chatbot)    | ✅ returns a Gemini reply (`gemini-flash-latest`)  |
| Gemini `503` handling        | ✅ server stays up, returns friendly error message |
| `GET /register`              | ✅ `200`                                           |
| `GET /css/theme.css`         | ✅ `200` (shared design system loads)              |
| `GET /js/ui.js`              | ✅ `200` (shared UI script loads)                  |
| All 11 EJS templates render  | ✅ rendered with mock data, 0 errors               |
| Passwords hashed (bcrypt)    | ✅ stored as `$2b$...`, legacy plain-text upgraded |
| Cancel / reschedule          | ✅ `DELETE`/`PUT` work, `403` on others' records   |
| My Profile page              | ✅ loads, name + password change work              |
| Admin dashboard              | ✅ admin `200` + search/filter, non-admin `403`    |
| `makeAdmin.js` script        | ✅ promotes a user to admin                        |
| In-dashboard promote/demote  | ✅ role toggles work; self-demotion blocked        |
| Persistent sessions          | ✅ login survives via MongoDB-backed session store |

> The Gemini API occasionally returns a transient `503 "high demand"` — a retry
> succeeds, and thanks to the new error handling the server no longer crashes when it
> happens.

## 🔐 Security Reminders

- The real `.env` (Atlas URI, session secret, Gemini key) is **gitignored** and never
  committed. The same values must be added as **Environment Variables** in Vercel.
- If any secret (DB password, API key) was ever shared in plain text, **rotate it**:
  - **DB password:** Atlas → Database Access → Edit user → Edit Password.
  - **Gemini key:** Google AI Studio → delete and regenerate the key.
  After rotating, update `.env` locally and the Vercel environment variables.
