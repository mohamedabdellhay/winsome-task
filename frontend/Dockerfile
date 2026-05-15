# Use Node.js 22 Alpine as base image
FROM node:22-alpine AS base

LABEL maintainer="Mohamed Abd El-Hay"
LABEL org.opencontainers.image.description="Winsome Hotel Booking Frontend"
LABEL version="1.0.3"


WORKDIR /app

# Copy package file and install dependencies
COPY package.json ./
RUN npm install

# ── Build stage ──────────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules

# Accept the public API URL at build time so Next.js can bake it in
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy source and build
COPY . .
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# standalone output includes only the files needed to run the server
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080

# standalone mode uses server.js directly (no npm start needed)
CMD ["node", "server.js"]