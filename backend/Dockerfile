# ============================================================
# Stage 1: Builder
# Installs all deps (including devDeps), generates Prisma
# client, and compiles TypeScript → dist/
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer cache: only reinstall on dependency change)
COPY package*.json ./

# Install ALL dependencies (devDeps needed for tsc)
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy tsconfig and source separately for better layer caching
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript → dist/
RUN npm run build


# ============================================================
# Stage 2: Production
# Lean image with only compiled JS + production dependencies
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

# curl needed for HEALTHCHECK
RUN apk add --no-cache curl

# Create non-root user with explicit UID/GID
RUN addgroup -g 1001 -S nodejs \
 && adduser -S appuser -u 1001 -G nodejs

# Set NODE_ENV before installing deps so npm/packages behave in production mode
ENV NODE_ENV=production

# Copy package files and install production deps only
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy Prisma schema + generated client from builder (no re-generate needed)
COPY --from=builder --chown=appuser:nodejs /app/prisma ./prisma
COPY --from=builder --chown=appuser:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy compiled JS from builder stage (no source .ts files in image)
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist

# Switch to non-root user
USER appuser

# Health check using the GET / route in app.ts
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

EXPOSE 5000

# Runs the compiled JS directly — no ts-node overhead
CMD ["node", "dist/app.js"]
