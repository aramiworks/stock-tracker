# ---------------------------------------------------------------------------
# Stage 1 — builder: install all deps, compile TS
# ---------------------------------------------------------------------------
FROM node:20-slim AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json ./

# Copy workspace package.json files needed for install
COPY apps/scraper/package.json apps/scraper/
COPY packages/prisma/package.json packages/prisma/
COPY packages/types/package.json packages/types/
COPY packages/validation/package.json packages/validation/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/eslint-config/package.json packages/eslint-config/

# Install all dependencies (including devDependencies for build)
RUN npm ci --workspace=@stock-tracker/scraper --workspace=@stock-tracker/prisma --workspace=@stock-tracker/types --workspace=@stock-tracker/validation --include-workspace-root

# Copy source files for workspace packages
COPY packages/ packages/
COPY apps/scraper/ apps/scraper/

# Build workspace packages, then the scraper
RUN npm run build --workspace=@stock-tracker/validation \
 && npm run build --workspace=@stock-tracker/types \
 && npm run build --workspace=@stock-tracker/prisma \
 && npm run build --workspace=@stock-tracker/scraper

# ---------------------------------------------------------------------------
# Stage 2 — runner: production image with Chromium for Playwright (INF-1359)
# ---------------------------------------------------------------------------
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install Chromium and dependencies for eventual Playwright usage (INF-1359)
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-noto-cjk \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    libxshmfence1 \
 && rm -rf /var/lib/apt/lists/*

ENV CHROMIUM_PATH=/usr/bin/chromium

# Copy root workspace manifests
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY apps/scraper/package.json apps/scraper/
COPY packages/prisma/package.json packages/prisma/
COPY packages/types/package.json packages/types/
COPY packages/validation/package.json packages/validation/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/eslint-config/package.json packages/eslint-config/

# Install production dependencies only
RUN npm ci --workspace=@stock-tracker/scraper --workspace=@stock-tracker/prisma --workspace=@stock-tracker/types --workspace=@stock-tracker/validation --include-workspace-root --omit=dev

# Copy built output from builder
COPY --from=builder /app/packages/validation/dist/ packages/validation/dist/
COPY --from=builder /app/packages/types/dist/ packages/types/dist/
COPY --from=builder /app/node_modules/.prisma/ node_modules/.prisma/
COPY --from=builder /app/apps/scraper/dist/ apps/scraper/dist/
COPY --from=builder /app/apps/scraper/trigger.config.ts apps/scraper/trigger.config.ts

CMD ["node", "apps/scraper/dist/index.js"]
