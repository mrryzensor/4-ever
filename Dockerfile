# ==========================================
# 4-EVER / 2DATE - ATELIER NUPCIAL SAAS
# Production Dockerfile for Coolify & Docker
# ==========================================

# 1. Base / Dependencies & Build Stage (Node 22 LTS Alpine)
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm 9 and build tools
RUN npm install -g pnpm@9
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package definitions
COPY package.json pnpm-lock.yaml ./

# Ensure devDependencies are installed for building Vite & Tailwind
ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile

# Copy application source code and static assets
COPY . .

# Generate all public web assets & compile production bundle
RUN pnpm build

# 2. Production Runner Stage (Node 22 LTS Alpine)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV SQL_DB_NAME=2date_db

# Install pnpm 9 in runner
RUN npm install -g pnpm@9

# Create non-root system user & directories
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser && \
    mkdir -p /app/uploads && \
    chown -R appuser:nodejs /app/uploads

# Install only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

# Copy built application and client assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/Logo.webp ./Logo.webp
COPY --from=builder /app/Logo.png ./Logo.png

# Ensure permissions
RUN chown -R appuser:nodejs /app

USER appuser

# Expose web server port
EXPOSE 3000

# Persistent volume for audio, covers, and guest uploads
VOLUME ["/app/uploads"]

# Health check endpoint
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Start the application server
CMD ["node", "dist/server.cjs"]
