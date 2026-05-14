# Use Node.js 22 Alpine as base image
FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Set CI to true and configure pnpm to ignore scripts to avoid TTY and approval errors
ENV CI=true
RUN pnpm config set ignore-scripts true

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy Prisma schema so postinstall can generate the client
COPY prisma ./prisma

# Install dependencies
RUN pnpm install --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npx nest build

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