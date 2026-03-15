# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Nuxt app
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3030
ENV HOST=0.0.0.0
ENV NITRO_PORT=3030
ENV NITRO_HOST=0.0.0.0

# Only copy built output
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json

# Install only production deps needed at runtime (pg adapter, prisma engine, etc.)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package-lock.json* ./

EXPOSE 3030

# Run DB migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node .output/server/index.mjs"]
