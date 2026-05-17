# Winsome Hotel Booking Management System

A production-style hotel booking system built with **NestJS**, **PostgreSQL**, **Prisma**, and **JWT** on the backend, and **Next.js** with **Tailwind CSS** on the frontend.

## 🔑 Test Credentials

| Role  | Email                  | Password |
|-------|------------------------|----------|
| Admin | abdellhay@example.com  | password |

---

## Live Demo

| Service   | URL                                          |
|-----------|----------------------------------------------|
| Frontend  | http://46.224.39.106:8080                    |
| Backend   | http://46.224.39.106:3001                    |
| Swagger   | http://46.224.39.106:3001/api/docs           |

---

## Overview

This workspace is a monorepo containing both the backend API and frontend application:

- `backend/` — NestJS server with Prisma, JWT auth, hotel management, room booking, and dashboard.
- `frontend/` — Next.js app for customers, hotel managers, and admins.
- `docker-compose.yml` — orchestrates backend, frontend, and PostgreSQL locally.

---

## Repository Structure

```text
Winsome-task/
├── backend/
│   ├── prisma/               # Schema, migrations, and seed
│   ├── src/
│   │   ├── auth/             # JWT auth, guards, roles
│   │   ├── hotels/           # Hotels CRUD
│   │   ├── rooms/            # Rooms management
│   │   ├── bookings/         # Booking flow + availability logic
│   │   ├── dashboard/        # Stats endpoint
│   │   └── prisma/           # PrismaService
│   ├── test/                 # E2E tests
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Axios instance, helpers
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── docker-compose.production.yml
├── .env.example
└── README.md
```

---

## Features

- JWT authentication with role-based access: **Admin**, **Hotel Manager**, **User**
- Hotels CRUD with search by name / city and pagination
- Room management per hotel (type, capacity, price, availability)
- Date-aware booking with overlapping reservation checks and atomic availability updates
- Booking lifecycle: Pending → Confirmed / Cancelled
- Dashboard with revenue totals and booking stats
- Swagger / OpenAPI docs at `/api/docs`
- Dockerized setup for local and production

---

## Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose

---

## Quick Start with Docker (Recommended)

### 1. Clone the repository

```bash
git clone <repo-url> winsome-task
cd winsome-task
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

> ⚠️ Open `.env` and fill in your values before running — especially `JWT_SECRET` and DB credentials.

### 3. Start all services

```bash
docker compose up -d --build
```

| Service   | URL                              |
|-----------|----------------------------------|
| Frontend  | http://localhost:8080            |
| Backend   | http://localhost:3001            |
| Swagger   | http://localhost:3001/api/docs   |

### Use prebuilt Docker Hub images

```bash
cp .env.example .env
docker compose -f docker-compose.production.yml up -d
```

Pulls:
- `mohamedabdellhay/winsome-task-backend:latest`
- `mohamedabdellhay/winsome-task-frontend:latest`

---

## Local Development (Without Docker)

### Backend

```bash
cd backend
cp .env.example .env       # fill in DB credentials and JWT_SECRET
pnpm install
pnpm prisma migrate dev --name init
pnpm prisma db seed        # seeds default admin, manager, and user accounts
pnpm run start:dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:3001
pnpm install
pnpm run dev
```

---

## Role Permissions

| Action                     | Admin | Hotel Manager | User |
|----------------------------|:-----:|:-------------:|:----:|
| Create / Edit / Delete hotel | ✅   | ❌            | ❌  |
| Add / Edit rooms            | ❌   | ✅            | ❌  |
| Create booking              | ❌   | ❌            | ✅  |
| View own bookings           | ✅   | ✅            | ✅  |
| Confirm / Cancel booking    | ✅   | ❌            | ❌  |
| View dashboard stats        | ✅   | ❌            | ❌  |

---

## API Reference

Full docs available at `http://localhost:3001/api/docs` (Swagger UI).

| Method | Endpoint                    | Auth      | Description              |
|--------|-----------------------------|-----------|--------------------------|
| POST   | /auth/register              | Public    | Register new user        |
| POST   | /auth/login                 | Public    | Login and get JWT token  |
| GET    | /hotels                     | Public    | List hotels (search/page)|
| POST   | /hotels                     | Admin     | Create hotel             |
| PATCH  | /hotels/:id                 | Admin     | Update hotel             |
| DELETE | /hotels/:id                 | Admin     | Delete hotel             |
| GET    | /rooms                      | JWT       | List rooms by hotel      |
| POST   | /rooms                      | Manager   | Add room to hotel        |
| PATCH  | /rooms/:id                  | Manager   | Update room              |
| POST   | /bookings                   | User      | Create booking           |
| GET    | /bookings                   | JWT       | Get bookings             |
| PATCH  | /bookings/:id/status        | Admin     | Update booking status    |
| GET    | /dashboard/stats            | Admin     | Get dashboard stats      |

---

## Testing

### Unit tests

```bash
cd backend
pnpm test
```

### Unit tests with coverage

```bash
cd backend
pnpm test:cov
```

### End-to-end tests

```bash
cd backend
pnpm test:e2e
```

> E2E tests run against a separate test database. Make sure `DATABASE_URL_TEST` is set in your `.env` before running.

---

## Environment Variables

See `.env.example` for all required variables. Key ones:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/hotel_booking

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# App
PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Troubleshooting

| Problem | Solution |
|--------|----------|
| Prisma migration fails | Make sure the PostgreSQL container is running and `DATABASE_URL` is correct |
| Frontend can't reach API | Check that `NEXT_PUBLIC_API_URL=http://localhost:3001` is set in `frontend/.env.local` |
| Port already in use | Run `docker compose down` then retry, or change ports in `.env` |
| Docker build fails | Run `docker compose down -v` to clear volumes, then `docker compose up --build` |

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | NestJS, TypeScript, Prisma        |
| Database  | PostgreSQL                        |
| Auth      | JWT, bcrypt, Role-based guards    |
| Frontend  | Next.js, TypeScript, Tailwind CSS |
| Forms     | React Hook Form, Zod              |
| Docs      | Swagger / OpenAPI                 |
| DevOps    | Docker, Docker Compose            |
