# ---------------------------------------------------------------------------
# Stage 1 — builder: install all deps, compile TS
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json ./

# Copy workspace package.json files needed for install
COPY apps/subgraphs/auth/package.json apps/subgraphs/auth/
COPY apps/services/auth/package.json apps/services/auth/
COPY packages/prisma/package.json packages/prisma/
COPY packages/types/package.json packages/types/
COPY packages/validation/package.json packages/validation/
COPY packages/nestjs-common/package.json packages/nestjs-common/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/eslint-config/package.json packages/eslint-config/

# Install all dependencies (including devDependencies for build)
RUN npm ci --workspace=@stock-tracker/subgraph-auth --workspace=@stock-tracker/auth-service --workspace=@stock-tracker/prisma --workspace=@stock-tracker/types --workspace=@stock-tracker/validation --workspace=@stock-tracker/nestjs-common --include-workspace-root

# Copy source files for workspace packages
COPY packages/ packages/
COPY apps/subgraphs/auth/ apps/subgraphs/auth/
COPY apps/services/auth/ apps/services/auth/

# Build workspace packages, then the subgraph.
# auth-service is NOT built here — its package.json `exports`
# points at TS source (./src/trpc/trpc.router.ts), so the subgraph's tsc resolves
# types directly from source. We only need its src + node_modules present.
RUN npm run build --workspace=@stock-tracker/validation \
 && npm run build --workspace=@stock-tracker/types \
 && npm run build --workspace=@stock-tracker/prisma \
 && npm run build --workspace=@stock-tracker/nestjs-common \
 && npm run build --workspace=@stock-tracker/subgraph-auth

# ---------------------------------------------------------------------------
# Stage 2 — runner: production image
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy root workspace manifests
COPY package.json package-lock.json ./

# Copy workspace package.json files
# auth-service is listed as a dep of subgraph-auth, so npm ci needs its
# package.json present even though we don't run it here.
COPY apps/subgraphs/auth/package.json apps/subgraphs/auth/
COPY apps/services/auth/package.json apps/services/auth/
COPY packages/types/package.json packages/types/
COPY packages/validation/package.json packages/validation/
COPY packages/nestjs-common/package.json packages/nestjs-common/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/eslint-config/package.json packages/eslint-config/

# Install production dependencies only
RUN npm ci --workspace=@stock-tracker/subgraph-auth --workspace=@stock-tracker/auth-service --workspace=@stock-tracker/types --workspace=@stock-tracker/validation --workspace=@stock-tracker/nestjs-common --include-workspace-root --omit=dev

# Copy built output from builder
COPY --from=builder /app/packages/validation/dist/ packages/validation/dist/
COPY --from=builder /app/packages/types/dist/ packages/types/dist/
COPY --from=builder /app/apps/subgraphs/auth/dist/ apps/subgraphs/auth/dist/

EXPOSE 4002

CMD ["node", "apps/subgraphs/auth/dist/server.js"]
