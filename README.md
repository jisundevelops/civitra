# Civitra 🚦

**Citizen-Police Integrated Traffic Management System**

A full-stack web application for digital traffic violation management, allowing citizens to view/pay violations, traffic police to issue tickets, and admins to manage the system.

## Features

### 👤 Citizen
- View personal violations and fines
- Pay fines online (simulated payment)
- Download payment receipts
- Update profile information
- Forgot password with OTP verification

### 🚔 Traffic Police
- Issue digital violation tickets
- View all violations with search & filter
- Update or cancel issued tickets
- Filter by status, date, location

### 👮 Admin
- Dashboard with real-time statistics
- Manage users (create officers, edit, deactivate)
- Configure violation types (full CRUD)
- Generate reports (daily, weekly, monthly)
- View all records with server-side filtering

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Auth**: JWT + bcrypt
- **Deployment**: Vercel

## Quick Start

```bash
# Clone the repo
git clone https://github.com/jisundevelops/civitra.git
cd civitra

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Push database schema
npx prisma db push

# Seed with sample data
npx prisma db seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Accounts

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Admin   | admin@civitra.com    | admin123    |
| Police  | rahman@civitra.com   | police123   |
| Police  | karim@civitra.com    | police123   |
| Citizen | ahmed@civitra.com    | citizen123  |
| Citizen | fatima@civitra.com   | citizen123  |
| Citizen | rafiq@civitra.com    | citizen123  |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT tokens |

## Deployment

See [DEPLOY.md](./DEPLOY.md) for step-by-step Vercel deployment instructions.

## License

This project is for educational purposes (UITS Software Engineering Lab).
