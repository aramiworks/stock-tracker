# Maestro Test Fixtures

## Test User

E2E tests require a pre-seeded Supabase test user. This user is created once
and reused across all test runs.

| Field    | Value                           |
| -------- | ------------------------------- |
| Email    | `e2e-test@arami.so`             |
| Provider | Google (via Supabase Admin API) |
| UID      | Set in `MAESTRO_TEST_USER_ID`   |

## Environment Variables

Required env vars for Maestro runs:

| Variable               | Description                              |
| ---------------------- | ---------------------------------------- |
| `MAESTRO_TEST_TOKEN`   | Supabase session JWT for the test user   |
| `MAESTRO_TEST_USER_ID` | Supabase user ID for teardown operations |

## Setup / Teardown

**Setup** (before test suite):

1. Generate a fresh JWT for the test user via Supabase Admin API
2. Export as `MAESTRO_TEST_TOKEN`

**Teardown** (after test suite):

1. Delete any watchlist items created during tests
2. Clear alert read-states

No user deletion — the test user is persistent.

## Gmail OAuth Limitation

Google blocks automated sign-in from non-browser contexts (Maestro runs in a
simulator/emulator). The sign-in flow test (`auth-signIn.yaml`) verifies the
**unauthenticated UI only** — it asserts the sign-in screen renders correctly
but does NOT complete the OAuth flow.

Authenticated flows use the session injection pattern via `helpers/launch-authenticated.yaml`.
