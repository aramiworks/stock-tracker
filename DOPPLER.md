# Doppler Setup

Environment variables are managed via [Doppler](https://doppler.com). Project: `stock-tracker`.

## Configs

| Config    | Purpose                                                      |
| --------- | ------------------------------------------------------------ |
| `master`  | Production (Master Supabase project, Railway prod)           |
| `stage`   | Staging (Railway stage, Apollo `stock-tracker@stage`)        |
| `develop` | Dev deployment (Railway dev, Apollo `stock-tracker@develop`) |
| `local`   | Local development — services on localhost                    |

## First-time setup

```bash
# 1. Install Doppler CLI
brew install dopplerhq/cli/doppler

# 2. Authenticate
doppler login

# 3. Link repo to stock-tracker/local
doppler setup --project stock-tracker --config local
```

## Running locally

```bash
# Terminal dashboard (all services + live logs)
npm run dev:dashboard

# Or individual services
doppler run -- npm run dev:subgraph
doppler run -- npm run dev:router
```

## Required vars (local config)

`local` uses a local Supabase instance (`supabase start`). All vars are pre-populated in Doppler.

| Var                             | Local value                                               |
| ------------------------------- | --------------------------------------------------------- |
| `DATABASE_URL`                  | `postgresql://postgres:postgres@localhost:54322/postgres` |
| `EXPO_PUBLIC_SUPABASE_URL`      | `http://localhost:54321`                                  |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | (local anon key — static, well-known)                     |
| `SUPABASE_URL`                  | `http://localhost:54321`                                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | (local service role key — static, well-known)             |
| `SUPABASE_JWKS_URL`             | `http://localhost:54321/auth/v1/.well-known/jwks.json`    |
| `GOOGLE_OAUTH_CLIENT_ID`        | GCP web client ID (public, for `config.toml` `env()`)     |
| `GOOGLE_OAUTH_CLIENT_SECRET`    | GCP web client secret (from 1Password)                    |
| `TRPC_AUTH_SERVICE_URL`         | `http://localhost:4030/trpc`                              |
| `TRPC_TRACKER_SERVICE_URL`      | `http://localhost:4020/trpc`                              |
| `ALLOWED_ORIGINS`               | `http://localhost:19006,...`                              |
| `NODE_ENV`                      | `development`                                             |

For `dev`/`stg`/`prd` configs, populate via the Doppler dashboard with the respective Railway + Supabase cloud credentials.

## Scraper vars

Residential proxy credentials for the restock scraper (`apps/scraper`). Set after Jace provisions the proxy account.

| Var              | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `PROXY_PROVIDER` | Provider name (e.g., `oxylabs`)                                |
| `PROXY_HOST`     | Proxy endpoint hostname (e.g., `pr.oxylabs.io`)               |
| `PROXY_PORT`     | Proxy endpoint port (e.g., `7777`)                             |
| `PROXY_USERNAME` | Auth username from provider dashboard                          |
| `PROXY_PASSWORD` | Auth password from provider dashboard                          |
| `PROXY_COUNTRY`  | Target country code (e.g., `KR`)                               |

<!-- TODO(INF-1357): set actual values after Jace provisions Oxylabs account -->
