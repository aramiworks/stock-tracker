# `stocktracker` team

7-agent specialized team for **aramiworks/stock-tracker** — a Hermès restock alert app for Korea.

> Pivoting from "Cartier purchase tracker" → "Hermès restock alert app". Cartier eligibility logic is parked for a future "Eligibility" backlog project; existing code lives under `_archived_eligibility/` paths and Cartier Figma pages live under `📦 Archive — Cartier eligibility (parked)`.

## Roster

| Agent      | Subagent type           | Owns                                                                                                                                  |
| ---------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `pm`       | `stocktracker-pm`       | Linear bookkeeping, blocker wiring, sprint coordination, status digests                                                               |
| `design`   | `stocktracker-design`   | Figma file (`MSJ05A0BXBDTO0powtUMg3`), branching, frames, @aramiworks/ui audits, Code Connect, Ditto Korean copy                      |
| `frontend` | `stocktracker-frontend` | apps/mobile, apps/storybook, EAS, mobile i18n consumption                                                                             |
| `backend`  | `stocktracker-backend`  | apps/services/{auth,tracker}, apps/subgraphs/tracker, apps/router, packages/{prisma,types,validation}, ESP, drop-event business logic |
| `scraper`  | `stocktracker-scraper`  | scrapers, parsers, Trigger.dev polling, proxy/fingerprinting, SKU→WatchableUnit classification                                        |
| `infra`    | `stocktracker-infra`    | CI/CD, Doppler, Railway, GHCR, secrets, anti-bot proxy provider integration                                                           |
| `qa`       | `stocktracker-qa`       | local e2e, Maestro, lint/typecheck gates, draft-PR verification                                                                       |

The **team lead** is the main Claude Code session that spawned the team — orchestrates, talks to Jace, resolves cross-agent conflicts.

## Spawning the team

```ts
TeamCreate({
  team_name: "stocktracker",
  agent_type: "team-lead",
  description: "...",
});

// Then spawn each agent:
Agent({
  subagent_type: "stocktracker-pm",
  team_name: "stocktracker",
  name: "pm",
  run_in_background: true,
  prompt: "<task>",
});
Agent({
  subagent_type: "stocktracker-design",
  team_name: "stocktracker",
  name: "design",
  run_in_background: true,
  prompt: "<task>",
});
Agent({
  subagent_type: "stocktracker-frontend",
  team_name: "stocktracker",
  name: "frontend",
  run_in_background: true,
  prompt: "<task>",
});
Agent({
  subagent_type: "stocktracker-backend",
  team_name: "stocktracker",
  name: "backend",
  run_in_background: true,
  prompt: "<task>",
});
Agent({
  subagent_type: "stocktracker-scraper",
  team_name: "stocktracker",
  name: "scraper",
  run_in_background: true,
  prompt: "<task>",
});
Agent({
  subagent_type: "stocktracker-infra",
  team_name: "stocktracker",
  name: "infra",
  run_in_background: true,
  prompt: "<task>",
});
Agent({
  subagent_type: "stocktracker-qa",
  team_name: "stocktracker",
  name: "qa",
  run_in_background: true,
  prompt: "<task>",
});
```

Each spawn auto-loads the agent's charter from `.claude/agents/stocktracker-<role>.md` (this directory's sibling).

## Lifecycle

- **Alive for the whole MVP** (~16 issues + future Eligibility revival). Persistent specialists accumulate context across issues — that's the explicit win over short-lived agent teams.
- Standby agents (e.g., `qa`, `infra` initially) acknowledge their charter and go idle until first task. Idle is normal — do not interpret as failure.

## Workflow rules

### Issue → PR pipeline

- 1 Linear issue = 1 worktree = 1 branch = 1 commit = 1 PR (per `~/.claude/rules/workflow/...` and `~/Documents/aramiworks/.claude/rules/workflow/git-workflow.md`)
- Worktree pattern: `.worktrees/INF-XXXX/` on branch `{type}/INF-XXXX-title`
- Always open as **draft** first; specialist hands off to `qa` for verification before converting to ready
- All PRs need a changeset (`@stock-tracker/<workspace-package>`, `patch`/`minor`/`major`) per `~/Documents/aramiworks/.claude/rules/infra/always-add-changeset.md`
- Conventional commits with Linear issue ID: `type(scope): [INF-XXXX] imperative description`
- Squash merge only

### Pairing protocol (full-stack issues)

When an issue spans both backend and mobile (e.g., **INF-1253** — Prisma schema + tRPC routes + mobile consumption), `pm` pairs `frontend` + `backend` on the same issue with a shared spec, rather than sequentially handing off. This eliminates handoff loss.

Example pairing checklist (PM dispatches both at issue start):

1. `backend` and `frontend` agree on Zod input/output DTO shapes (in the validation package)
2. `backend` lands schema + tRPC route in their PR
3. `frontend` consumes the route in their PR
4. Both PRs merge in the same window

### Standby agents

Some agents stand by until their first task fires. Order of activation expected:

- **Day 1:** `pm`, `design`, `frontend`, `backend` active
- **Day 2-3:** `scraper` activates on INF-1248 (spike)
- **Day 5+:** `infra` activates on INF-1259 (anti-bot proxy)
- **As PRs land:** `qa` activates on first draft PR for verification

### Communication

- Agents refer to each other by **name** (`pm`, `design`, ...) — not subagent type
- All progress reports go to **team lead** via SendMessage
- All Linear status updates flow through `pm`
- Idle agents are normal — they wake when messaged

### Shutdown

Per `~/.claude/rules/agents/agent-shutdown-protocol.md`, every agent has the shutdown stanza in its prompt. Workflow when the MVP wraps:

1. Send `shutdown_request` to all agents
2. Wait for `teammate_terminated` confirmation
3. `TeamDelete` once all members terminated
4. **Mandatory:** `bash /Users/jaemincheun/.claude/scripts/cleanup-tmux-panes.sh` — never leave panes behind

## Mem0 conventions for this team

- `agent_id: "claude-code"` for project decisions
- Topic naming: `stocktracker-team`, `stocktracker-design`, `INF-12XX`, etc.
- The verbose 2026-05-04 team-architecture entry can be replaced with a short pointer to this README once it's merged.

## Future expansions (deferred to post-MVP)

| Considered                 | Why deferred                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `security`                 | Real concern for Gmail OAuth + Korean PIPA, but `infra` + `backend` cover MVP scope. Add when real user data lands |
| `release`                  | EAS / App Store / changelog coordination — `infra` + `frontend` cover MVP. Add at first store submission           |
| `content` / `localization` | Frontend handles Ditto pulls for MVP. Add when copy volume grows or English ships                                  |
| `growth`                   | No users yet                                                                                                       |
| `support` / `community`    | No users yet                                                                                                       |

## Related Linear projects

- **Restock Alert MVP** (active) — id `acf57acd-a323-41ca-83f9-c0bb57c20509`
- **Eligibility** (parked backlog) — id `3ddc4d42-6cfc-45ec-b37b-0eb685b81c2d`
- **Brand expansion** (parked backlog) — id `5fb1ec5c-d4a2-4a9a-ab02-869819bd0d08`
- **Geo expansion** (parked backlog) — id `939c61ec-ed98-4a3c-926a-8286e93a64b6`
- **Monetization** (parked backlog) — id `400529a4-cec7-4e0e-8a8b-6ce8a6d3e8fe`
- **Channels** (parked backlog) — id `909ea36b-4eb2-45c3-828d-85dd15b4d765`
- **Community** (parked backlog) — id `d5893c98-a8bb-491d-bdf0-ae40c218af7e`
- **Power features** (parked backlog) — id `c4c089e7-fcb7-4645-9dbc-27e20dfe91e9`
