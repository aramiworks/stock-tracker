# CLAUDE.md — stock-tracker

Multi-brand luxury restock alert app (Hermès Korea first). Turborepo monorepo with Expo mobile app and tRPC/GraphQL backend.

## Stack

| Layer           | Choice                                   |
| --------------- | ---------------------------------------- |
| Mobile          | Expo SDK 55, Expo Router v4              |
| Design system   | @aramiworks/ui (Tamagui + MD3)           |
| State           | Zustand (per EFCV level)                 |
| Forms           | React Hook Form + Zod                    |
| Backend         | tRPC v11, Node.js TypeScript             |
| API gateway     | Apollo Federation v2 (subgraph + router) |
| Database        | Supabase Postgres + Prisma ORM           |
| Testing         | Jest (unit), Maestro (E2E)               |
| Storybook       | React Native (on-device) + Web (Vercel)  |
| Package manager | npm                                      |

## Directory Map

```
apps/
├── mobile/              # Expo app (iOS/Android/Web)
│   ├── app/             # Expo Router (routing only)
│   │   ├── (auth)/      # Unauthenticated screens
│   │   └── (app)/       # Authenticated screens (tab navigator)
│   ├── src/experiences/  # All logic (EFCV + MCVL)
│   │   ├── auth/        # Auth experience
│   │   └── tracker/     # Tracker experience (alerts, watchlist, history)
│   ├── .ondevice/       # Storybook RN config
│   └── maestro/         # E2E test flows
├── services/
│   ├── auth/            # NestJS auth service (port 4030, /trpc)
│   └── tracker/         # NestJS tracker service (port 4020, /trpc)
├── subgraphs/
│   ├── auth/            # Apollo subgraph (port 4002, dev 4013) → auth-service
│   │   └── src/
│   │       ├── auth/    # GraphQL auth resolvers
│   │       └── clients/ # tRPC client to auth-service
│   └── tracker/         # Apollo subgraph (port 4001, dev 4011) → tracker-service
│       └── src/
│           ├── tracker/ # GraphQL tracker resolvers
│           └── clients/ # tRPC client to tracker-service
├── router/              # Apollo Router config (JWT, CORS, composition)
└── storybook/           # Storybook web build (Vercel)

packages/
├── prisma/              # Shared Prisma client + multi-file schema
├── types/               # Shared TypeScript types
├── validation/          # Shared Zod schemas
├── config/              # Shared configuration
├── eslint-config/       # ESLint configs (base, node, react-internal)
└── typescript-config/   # TypeScript configs (base, node, react-library)
```

## Architecture

**EFCV** (Experience > Flow > Container > View) — 4-layer hierarchy used in both frontend and backend. See `~/conventions/architecture/efcv.md`.

**MCVL** (Models / Controllers / Views / Lifecycles) — file organization at every EFCV level. See `~/conventions/architecture/mcvl.md`.

**Backend MCVL mapping:**

- Models → Prisma queries, types, constants
- Controllers → Business logic orchestration
- Views → tRPC input/output DTOs (Zod schemas)
- Lifecycles → Trigger.dev jobs, events, webhooks

**Data flow:** Mobile → Apollo Router (JWT) → auth + tracker subgraphs (GraphQL) → auth-service / tracker-service (tRPC) → Prisma → Supabase

## Naming

- Files: `{exp}-{flow}-{container}.{suffix}.tsx` — hyphens between levels, camelCase within
- Components: PascalCase matching file prefix + suffix (e.g., `TrackerDashboardHomeContainer`)
- Directories: camelCase for EFCV segments (e.g., `gmailOauth/`, `eligibilityBadge/`)
- Every folder has `index.ts` for re-exports
- Suffixed barrel files mandatory (`.models.tsx`, `.controllers.tsx`, `.views.tsx`, `.lifecycles.ts`)

## Translations (Ditto)

Translations are managed in [Ditto](https://dittowords.com). Project: `stock-tracker`.

- Ditto Developer IDs follow Figma frame naming (e.g., `tracker-dashboard-home-saCard.statusEligible`)
- `scripts/ditto-id-map.json` maps Developer IDs → i18next namespace + key
- `scripts/ditto-split.js` splits the flat Ditto export into namespace files

```bash
npm run ditto:pull -w apps/mobile   # Pull + split translations from Ditto
```

JSON files in `apps/mobile/src/lib/i18n/ko/` are git-tracked. After pulling, review the diff and commit.

When adding a new text item: add it in Ditto with a Figma-named Developer ID, then add the mapping in `scripts/ditto-id-map.json`.

## Development

```bash
npm install                    # Install all dependencies
npm run dev:mobile             # Start Expo dev server
npm run dev:auth-service       # Start NestJS auth service (port 4030)
npm run dev:tracker-service    # Start NestJS tracker service (port 4020)
npm run dev:subgraph           # Start both Apollo subgraphs (auth + tracker)
npm run dev:subgraph:auth      # Start auth subgraph only (port 4013 dev)
npm run dev:subgraph:tracker   # Start tracker subgraph only (port 4011 dev)
npm run dev:router             # Start Apollo Router (rover dev)
npm run dev:backend            # Start all backend services
npm run dev:storybook          # Start Storybook web
npm run db:generate            # Generate Prisma client
npm run db:push                # Push schema to Supabase
npm run db:migrate:dev         # Create migration
npm run db:studio              # Open Prisma Studio
npm run test                   # Run all tests
npm run lint                   # Lint all packages
npm run check-types            # Type check all packages
```

## Design

- Primary: #FF2D55 (Cartier red)
- Secondary: #009E99 (teal)
- Font: Inter
- Language: Korean (ko)
- Design tokens: MD3
- Figma file: MSJ05A0BXBDTO0powtUMg3

## Experiences

| Experience | Flows     | Containers   |
| ---------- | --------- | ------------ |
| auth       | signIn    | gmailOauth   |
| tracker    | alerts    | feed         |
| tracker    | watchlist | list, detail |
| tracker    | history   | browse       |

## Deployment

Single trunk (`main`). No `develop` or `stage` branches — see `conventions/git.md`.

| Environment | Trigger          | Mobile         | Backend (Docker → Railway) | Storybook         |
| ----------- | ---------------- | -------------- | -------------------------- | ----------------- |
| local       | `npm run dev:*`  | `expo start`   | `npm run dev:backend`      | `storybook dev`   |
| develop     | manual (Backend Docker workflow_dispatch) | EAS Preview    | GHCR `:develop` → Railway develop | Vercel Preview    |
| stage       | manual (Backend Docker workflow_dispatch) | EAS Preview    | GHCR `:stage` → Railway stage     | Vercel Preview    |
| master      | manual (Backend Docker workflow_dispatch) | EAS Production | GHCR `:master` → Railway master   | Vercel Production |
