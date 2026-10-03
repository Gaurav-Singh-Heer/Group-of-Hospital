# 🏥 Group of Hospital — Appointment Management System

**Group of Hospital** is a hospital appointment management system that lets users
sign up, log in, browse partner hospitals, book appointments, and get help from an
AI chatbot. It was originally created as a **4th Semester Backend Evaluation**
project and has since been cleaned up and hardened for deployment.

> 📄 See [`README_OCT_UPDATIONS.md`](./README_OCT_UPDATIONS.md) for the full list of
> improvements made in the October 2026 update.

## 🛠️ Tech Stack

- **Node.js** + **Express.js** — server and routing
- **EJS** — server-side HTML templating
- **MongoDB** + **Mongoose** — data storage
- **Google Gemini API** — "Sahayak" chatbot
- **bcryptjs** — password hashing · **connect-mongo** — persistent session store
- **Helmet, CORS, Compression, Morgan** — security, performance, and logging
- **Custom CSS design system** (`public/css/theme.css`) — one shared, responsive theme

## 📋 Features

- User **sign up / login** with session-based auth and **bcrypt-hashed passwords**
- Browse partner hospitals (GMCH-32, PGIMER, Max Healthcare)
- **Book appointments** through a form; data stored in MongoDB
- View, **cancel, and reschedule** your own appointments
- **My Profile** page to update your name and change your password
- **Admin dashboard** to view/search/filter and manage all appointments
- **Sahayak** AI chatbot for real-time health queries (Gemini API)
- **Persistent sessions** stored in MongoDB (survive restarts & serverless)
- Hardened HTTP headers, gzip compression, and request logging
- **Modern, fully responsive UI** with a unified design system, mobile navigation,
  and scroll animations across every page

## 🎨 User Interface

Every page shares a single design system defined in `public/css/theme.css` (CSS
variables for colors, spacing, typography, shadows) plus `public/js/ui.js` (mobile
nav toggle + scroll-reveal animations). This replaced several inconsistent, mostly
non-responsive stylesheets with one cohesive, mobile-first look. See
[`README_OCT_UPDATIONS.md`](./README_OCT_UPDATIONS.md) for the full before/after.

## 📁 Project Structure

```
.
├── index.js              # Entry point: connects DB, starts server, exports app (Vercel)
├── app.js                # Express app: middleware, routes, error handling
├── server.js             # Thin local-dev wrapper around index.js
├── config/
│   └── db.js             # Cached MongoDB connection
├── controllers/          # Route handlers (auth, patient, sahayak, profile, admin)
├── middlewares/          # logger, error handler, auth guards (requireAuth/requireAdmin)
├── models/               # Mongoose schemas (User, Patient, Appointment)
├── routes/               # Express routers
├── scripts/
│   └── makeAdmin.js      # CLI: promote a user to admin
├── views/                # EJS templates (pages + partials/)
├── public/
│   ├── css/theme.css     # Shared design system (colors, components, responsive)
│   ├── js/ui.js          # Shared UI behaviour (mobile nav, scroll reveal)
│   └── assets/           # Images
├── .env.example          # Template for required environment variables
└── vercel.json           # Vercel deployment config
```

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable         | Required | Description                                        |
| ---------------- | -------- | -------------------------------------------------- |
| `MONGO_URI`      | ✅       | MongoDB connection string (local or Atlas)         |
| `SESSION_SECRET` | ✅       | Long random string used to sign session cookies    |
| `GEMINI_API_KEY` | ✅       | Google Gemini API key for the Sahayak chatbot      |
| `PORT`           | ❌       | Port to listen on (defaults to `3000`)             |
| `NODE_ENV`       | ❌       | `development` or `production`                      |

## 🚀 Running Locally

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Gaurav-Singh-Heer/Group-of-Hospital.git
   cd Group-of-Hospital
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # then edit .env with your MONGO_URI, SESSION_SECRET, and GEMINI_API_KEY
   ```

4. **Make sure MongoDB is running** (local service or a MongoDB Atlas cluster).

5. **Start the server:**

   ```bash
   npm run dev     # development, auto-reload via nodemon
   # or
   npm start       # plain node
   ```

6. **Open your browser:**

   ```
   http://localhost:3000
   ```

## 👤 User & Admin Roles

New accounts are regular **users**. Admins can access the `/admin` dashboard to view,
search, filter, and delete appointments across all hospitals, **and manage user roles**.

### 🔑 How to make someone an admin

1. The person **registers a normal account** on the site (`/register`).
2. From the project folder on your machine, run the command below with **their email**:

   ```bash
   node scripts/makeAdmin.js your-email@example.com
   ```

   Example:

   ```bash
   node scripts/makeAdmin.js gauravheer2005@gmail.com
   # ✅ gauravheer2005@gmail.com is now an admin.
   ```

3. That account **logs out and logs back in** — it will now land on the `/admin` dashboard.

> ✅ Verified working against the live Atlas database. If you see
> `No user found with email: ...`, the email hasn't registered an account yet (step 1).

### Does this work after deployment? Yes.

Your deployed app and your local machine **share the same MongoDB Atlas database**, so
you manage admins exactly the same way — it just works.

The key insight: `makeAdmin.js` connects to whatever `MONGO_URI` points to, which is your
Atlas cluster — **the same database your Vercel deployment uses**. So:

> Running `node scripts/makeAdmin.js <email>` on your **local machine** promotes that user
> in the **production** database too.

You don't run anything *on* Vercel. You run it locally; the change lands in Atlas; your
deployed site sees it instantly. (This assumes your local `.env` has the same `MONGO_URI`
as your Vercel environment, which it does.)

**After the first admin exists, no terminal is needed at all** — an existing admin can
promote or demote any other user straight from the **Users & Roles** section of the
`/admin` dashboard (works on the deployed site too, since roles live in the shared
database). An admin cannot demote their own account, which prevents accidentally locking
everyone out.

> Role changes take effect the next time that user logs in (the role is read into the
> session at login). Admin logins are redirected to `/admin`.

As a no-code fallback you can also edit a user's `role` field directly in the
**MongoDB Atlas** web UI (Browse Collections → `users`).

## 🤖 Sahayak Chatbot

Sahayak is a health-query assistant powered by the **Gemini API** (`gemini-flash-latest`).
Responses are returned as formatted HTML for clean rendering in the UI. See the
[official Gemini docs](https://ai.google.dev/gemini-api/docs) for API details.

## ☁️ Deployment

This project is configured to deploy on **Vercel** as a serverless app. See the
**Deployment** section of [`README_OCT_UPDATIONS.md`](./README_OCT_UPDATIONS.md)
for a full step-by-step guide, including how to set environment variables and the
required MongoDB Atlas network settings.

## 👨‍💻 Developed By

Backend Evaluation Team – 4th Semester

- _Gaurav Singh Heer_
- _Agam_
- _Arshiya Gupta_
- _Aryan Kaushal_
