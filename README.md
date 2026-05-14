# Winsome Hotel Booking System

A production-style hotel booking management system scaffolded with NestJS, PostgreSQL, Prisma, JWT auth for the backend, and Next.js 14 with Tailwind CSS for the frontend.

## Prerequisites

- Node.js 20+ or compatible
- npm or pnpm
- Docker

## Setup

```bash
cd backend
cp .env.example .env
# optionally adjust .env values

docker compose up -d
npm install
npx prisma migrate dev --name init
npm run start:dev
```

In another terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## API docs

Open `http://localhost:3001/api/docs`

## Notes

- Backend server listens on `3001`
- Frontend runs on `3000`
- Authentication uses JWT and stores token in `localStorage` and cookie
- Route protection is enforced in `frontend/src/middleware.ts`
