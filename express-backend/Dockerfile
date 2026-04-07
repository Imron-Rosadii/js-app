# Multi-stage build untuk Express.js + TypeScript + Prisma
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install semua dependencies (termasuk devDependencies untuk build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript ke JavaScript
RUN npm run build

# Stage production
FROM node:20-bookworm-slim

WORKDIR /app

# Install system dependencies untuk Prisma (Debian)
RUN apt-get update && apt-get install -y openssl ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema dan generate client di production
COPY prisma ./prisma/
RUN npx prisma generate

# Copy hasil build
COPY --from=builder /app/dist ./dist

# Create non-root user untuk security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port 8000
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Start aplikasi
CMD ["node", "dist/server.js"]