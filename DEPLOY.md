# 🚀 Deploying Civitra to Vercel

## Prerequisites
- A [Vercel](https://vercel.com) account (free tier works)
- A [Neon](https://neon.tech) account (free tier: 0.5GB storage)
- A [GitHub](https://github.com) account
- Git installed on your machine

---

## Step 1: Switch Database to PostgreSQL

The project currently uses **SQLite** for local development. Vercel's serverless environment doesn't support file-based databases, so we need to switch to PostgreSQL.

### 1a. Open `prisma/schema.prisma` and change the provider:

```diff
 datasource db {
-  provider = "sqlite"
+  provider = "postgresql"
   url      = env("DATABASE_URL")
 }
```

Also change all `@default(cuid())` to `@default(uuid())` for PostgreSQL compatibility:

```diff
- id String @id @default(cuid())
+ id String @id @default(uuid())
```

Do this for **all 6 models** (User, Vehicle, ViolationType, Violation, Payment, OtpVerification).

### 1b. Add the `@@index` back to OtpVerification:

```prisma
model OtpVerification {
  id        String   @id @default(uuid())
  email     String
  otp       String
  expiresAt DateTime
  createdAt DateTime @default(now())
  verified  Boolean  @default(false)

  @@index([email])
}
```

### 1c. Commit the change:

```bash
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL for Vercel deployment"
```

---

## Step 2: Create Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Click **"Create Project"**
3. Name it `civitra` and select a region close to you
4. Click **"Create Project"**
5. Copy the **connection string** — it looks like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/civitra?sslmode=require
   ```
6. Save this — you'll need it as `DATABASE_URL`

---

## Step 3: Push Code to GitHub

```bash
cd civitra

# Initialize git (if not already)
git init

# Create .gitignore if missing
echo "node_modules/
.next/
db/*.db
.env
.env.local
*.log" > .gitignore

git add .
git commit -m "Civitra - Citizen-Police Integrated Traffic Management System"

# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/civitra.git
git branch -M main
git push -u origin main
```

---

## Step 4: Run Database Migrations

On your local machine, temporarily set the DATABASE_URL to your Neon connection string:

```bash
# Set environment variable (use your actual Neon URL)
export DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/civitra?sslmode=require"

# Push schema to Neon
npx prisma db push

# Seed the database with sample data
npx prisma db seed
```

---

## Step 5: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Add New" → "Project"**
3. Select your `civitra` repository from GitHub
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `next build` (default)
   - **Output Directory**: Leave default
5. Add **Environment Variables**:
   - `DATABASE_URL` = your Neon PostgreSQL connection string
   - `JWT_SECRET` = a strong random string (generate one with `openssl rand -base64 32`)
   - `NODE_ENV` = `production`
6. Click **"Deploy"** 🎉

---

## Step 6: Access Your App

Vercel will give you a URL like: `civitra.vercel.app`

You can also add a custom domain in Vercel dashboard → Settings → Domains.

---

## Test Accounts (after seeding)

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Admin   | admin@civitra.com    | admin123    |
| Police  | rahman@civitra.com   | police123   |
| Police  | karim@civitra.com    | police123   |
| Citizen | ahmed@civitra.com    | citizen123  |
| Citizen | fatima@civitra.com   | citizen123  |
| Citizen | rafiq@civitra.com    | citizen123  |

---

## Updating After Code Changes

```bash
git add .
git commit -m "your commit message"
git push
```

Vercel auto-deploys on every push to main!

---

## Troubleshooting

### "Prisma Client could not be generated"
- Make sure `postinstall` script runs `prisma generate` (check package.json)
- Check that `DATABASE_URL` is set in Vercel environment variables
- Make sure `prisma/schema.prisma` has `provider = "postgresql"`

### "Database connection error"
- Verify `DATABASE_URL` is correct in Vercel environment variables
- Make sure Neon database is active (not suspended — free tier suspends after inactivity)
- Check Neon dashboard for connection limits

### "500 Internal Server Error"
- Check Vercel function logs: Dashboard → your project → Deployments → click deployment → Function Logs
- Verify all environment variables are set correctly
- Make sure the Prisma schema matches the database (run `npx prisma db push` again)

### "Build fails with Prisma errors"
- Ensure the `postinstall` script in package.json includes `prisma generate`
- Try adding `prisma generate` to the Build Command in Vercel: `prisma generate && next build`

### "Local development breaks after switching to PostgreSQL"
- For local dev, you can switch back to SQLite in `prisma/schema.prisma` and use `file:./dev.db` as DATABASE_URL
- Or install PostgreSQL locally
- Or use the Neon database URL for local development too
