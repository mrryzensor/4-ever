# ==========================================
# 4-EVER / 2DATE - ATELIER NUPCIAL SAAS
# High Performance Multi-stage Dockerfile
# ==========================================

# 1. Base stage with Corepack & Alpine dependencies
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN apk add --no-cache libc6-compat

# 2. Dependencies stage (cached independently)
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 3. Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm build

# 4. Production Runner stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV SQL_DB_NAME=2date_db

# Create non-root system user & uploads volume
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser && \
    mkdir -p /app/uploads && \
    chown -R appuser:nodejs /app/uploads

# Install only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@9 --activate && \
    pnpm install --prod --frozen-lockfile && \
    rm -rf /root/.local /root/.cache /root/.pnpm-store

# Copy build artifacts and static assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/Logo.webp ./Logo.webp
COPY --from=builder /app/Logo.png ./Logo.png

# Set ownership
RUN chown -R appuser:nodejs /app

USER appuser

EXPOSE 3000

VOLUME ["/app/uploads"]

# Fast startup healthcheck
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
