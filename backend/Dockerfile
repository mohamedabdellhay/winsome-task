# Use Node.js 22 Alpine as base image
FROM node:22-alpine AS base

LABEL maintainer="Mohamed Abdellhay"
LABEL org.opencontainers.image.description="Winsome Hotel Booking Backend"
LABEL version="1.0.7"

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Set CI to true
ENV CI=true

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy Prisma schema so generate can run after install
COPY prisma ./prisma

# Install dependencies (skipping scripts to avoid TTY issues)
RUN pnpm install --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma client explicitly
RUN npx prisma generate

# Build the NestJS application (run tsc directly to avoid any nest-cli issues)
RUN npx nest build && ls -la dist/

# Production stage
FROM node:22-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy built application and runtime dependencies from base stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main"]