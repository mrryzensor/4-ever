# ==========================================
# 4-EVER / 2DATE - ATELIER NUPCIAL SAAS
# Production Dockerfile for Coolify & Docker
# ==========================================

# 1. Base / Dependencies & Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm & necessary build tools
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache libc6-compat

# Copy dependency definitions
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy source code and assets
COPY . .

# Generate all public web assets & build production bundle
RUN pnpm build

# 2. Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV SQL_DB_NAME=2date_db

# Create non-root user & directories
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser && \
    mkdir -p /app/uploads && \
    chown -R appuser:nodejs /app/uploads

# Install pnpm for production dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package definitions and install only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

# Copy built application and client assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/Logo.webp ./Logo.webp
COPY --from=builder /app/Logo.png ./Logo.png

# Ensure uploads directory is writable
RUN chown -R appuser:nodejs /app

USER appuser

# Expose web server port
EXPOSE 3000

# Persistent volume for audio, user covers and guest photo uploads
VOLUME ["/app/uploads"]

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Start the application server
CMD ["node", "dist/server.cjs"]
