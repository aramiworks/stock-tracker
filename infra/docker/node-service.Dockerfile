# Reusable multi-stage Dockerfile for Turborepo Node.js services.
# Usage:
#   docker build \
#     --build-arg PACKAGE_NAME=@stock-tracker/api \
#     --build-arg APP_DIR=apps/api \
#     --build-arg ENTRYPOINT_FILE=dist/server.js \
#     -f infra/docker/node-service.Dockerfile .
#
# ENTRYPOINT_FILE defaults to dist/server.js (Express services). NestJS services
# (auth-service, tracker-service) build to dist/main.js and must override it.

ARG NODE_VERSION=20

# --- Stage 1: Prune monorepo to minimal subset ---
FROM node:${NODE_VERSION}-alpine AS pruner
RUN npm install -g turbo@2
WORKDIR /app
COPY . .
ARG PACKAGE_NAME
RUN turbo prune ${PACKAGE_NAME} --docker

# --- Stage 2: Install dependencies (cached layer) ---
FROM node:${NODE_VERSION}-alpine AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci --legacy-peer-deps --ignore-scripts

# --- Stage 3: Build ---
FROM node:${NODE_VERSION}-alpine AS builder
RUN npm install -g turbo@2
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
ARG PACKAGE_NAME
# Prisma generate needs a DATABASE_URL at build time (no connection made)
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN turbo run build --filter=${PACKAGE_NAME}

# --- Stage 4: Production runner ---
FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

ARG APP_DIR
ARG ENTRYPOINT_FILE=dist/server.js
ENV ENTRYPOINT_FILE=${ENTRYPOINT_FILE}

# Copy the full pruned monorepo (preserves workspace package symlinks)
COPY --from=builder /app /app
WORKDIR /app/${APP_DIR}

USER appuser

EXPOSE 4000

# Shell-form CMD so $ENTRYPOINT_FILE expands at runtime. ARG values do not
# expand inside exec-form CMD.
CMD node $ENTRYPOINT_FILE
