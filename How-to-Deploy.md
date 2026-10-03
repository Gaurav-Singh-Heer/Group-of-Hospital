# 🚀 How to Deploy (Vercel)

This project is pre-configured to deploy on **Vercel** as a serverless app
(`vercel.json` points at `index.js`). You need a **MongoDB Atlas** database (the app
can't reach a database running on your laptop from Vercel) — this is already set up.

> ✅ Prerequisites (already done for this project):
> - Code is pushed to GitHub (`main` branch)
> - MongoDB Atlas cluster exists, with **Network Access = `0.0.0.0/0`**
> - `.env` is **gitignored** (secrets are never committed)

---

## Step 1 — Import the repo into Vercel

1. Go to **[vercel.com](https://vercel.com)** → sign in with your **GitHub** account.
2. Click **Add New → Project**.
3. Find **`Group-of-Hospital`** → click **Import**.
4. **Project Name:** must be **lowercase** (letters, digits, `.`, `_`, `-`; no `---`).
   e.g. `group-of-hospital`. This only sets the URL label — it doesn't affect your code.
5. **Framework / Application Preset:** `Other` (or `Express`) is fine — your `vercel.json`
   handles the actual build either way.
6. **Root Directory:** leave as `./`.
7. **Don't click Deploy yet** — add the environment variables first (next step).

---

## Step 2 — Add Environment Variables

Still on the import screen, expand **Environment Variables** and add these **4**
(copy the values from your local `.env` file). Set each for **Production and Preview**.

| Key              | Value                                 |
| ---------------- | ------------------------------------- |
| `MONGO_URI`      | your `mongodb+srv://...` Atlas string |
| `SESSION_SECRET` | your long random string               |
| `GEMINI_API_KEY` | your Gemini key                       |
| `NODE_ENV`       | `production`                          |

> ⚠️ **Do not add `PORT`** — Vercel manages that itself.

---

## Step 3 — Deploy

Click **Deploy**. Wait ~1–2 minutes. You'll get a live URL like
`https://group-of-hospital.vercel.app`.

---

## Step 4 — Verify it works

On the live URL, check:

- Landing page loads and styling looks right
- **Register → login → book an appointment** (confirms Atlas + sessions)
- Log in as an admin (e.g. `gauravheer2005@gmail.com`) → lands on `/admin`
- Try the **Sahayak** chatbot

After this, **every `git push` to `main` auto-redeploys**.

---

## 🔑 Making an admin after deployment

Your deployed app and your local machine **share the same MongoDB Atlas database**, so
you manage admins the same way. The `makeAdmin.js` script connects to whatever
`MONGO_URI` points to — the same database Vercel uses:

```bash
node scripts/makeAdmin.js someone@example.com
```

Run it **locally**; the change lands in Atlas; your deployed site sees it instantly.
After the first admin exists, you can also promote/demote users from the **Users & Roles**
section of the `/admin` dashboard — no terminal needed. See `README.md` for details.

---

## 🧰 Alternative: deploy via the Vercel CLI

```bash
npm i -g vercel      # install once
vercel               # first run links/creates the project (preview deploy)
vercel --prod        # promote to production
```

Add the env vars from the CLI:

```bash
vercel env add MONGO_URI
vercel env add SESSION_SECRET
vercel env add GEMINI_API_KEY
vercel env add NODE_ENV
```

> Note: `vercel login` is interactive, so run these yourself in a terminal.

---

## ⚠️ Troubleshooting

- **Build error or blank page** — the `@vercel/node` builder in `vercel.json` can
  occasionally clash with a framework preset. If this happens, note the exact error.
- **Can't connect to database** — confirm Atlas **Network Access** allows `0.0.0.0/0`
  and that `MONGO_URI` in Vercel matches your `.env`.
- **Logins don't persist** — ensure `SESSION_SECRET` is set in Vercel. (Sessions are
  stored in MongoDB via `connect-mongo`, so they survive serverless invocations.)
- **Chatbot not responding** — ensure `GEMINI_API_KEY` is set and valid.
- **"Project names must be lowercase"** — rename the Vercel project to all lowercase,
  e.g. `group-of-hospital`.
