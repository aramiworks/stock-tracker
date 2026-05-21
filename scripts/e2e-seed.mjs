/**
 * Seeds E2E test data for the e2e user via the Supabase REST API.
 * Uses the service role key to bypass RLS — no direct Postgres connection needed.
 *
 * Currently only ensures the public.auth_users row exists for the e2e Supabase
 * user. The app's auth subgraph would normally upsert this on the first
 * authenticated request (via authRouter.upsertFromSupabase), but seeding it
 * up-front makes the authenticated Maestro sweep deterministic.
 *
 * Catalog/watches seeding for the Maestro authenticated flows is tracked
 * separately — those flows reference UUIDs that don't match the current
 * Hermès schema (see packages/prisma/prisma/seed-dev.ts) and need flow/seed
 * alignment that depends on INF-1390 unblocking backend reachability.
 */

const SUPABASE_URL = process.env.E2E_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = process.env.E2E_USER_EMAIL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !USER_EMAIL) {
  console.error(
    "Missing required env vars: E2E_SUPABASE_URL, E2E_SUPABASE_SERVICE_ROLE_KEY, E2E_USER_EMAIL",
  );
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const rest = (path) => `${SUPABASE_URL}/rest/v1${path}`;

async function restFetch(path, options = {}) {
  const res = await fetch(rest(path), { headers, ...options });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `REST ${options.method ?? "GET"} ${path} failed (${res.status}): ${text}`,
    );
  }
  return text ? JSON.parse(text) : null;
}

console.log(`Looking up Supabase user ID for ${USER_EMAIL}...`);
const authRes = await fetch(
  `${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`,
  {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  },
);
if (!authRes.ok) {
  const body = await authRes.text();
  console.error(`Supabase admin users API failed (${authRes.status}): ${body}`);
  process.exit(1);
}
const { users } = await authRes.json();
const authUser = users.find((u) => u.email === USER_EMAIL);
if (!authUser) {
  console.error(`User ${USER_EMAIL} not found in Supabase`);
  process.exit(1);
}
console.log(`Found auth user: ${authUser.id}`);

const now = new Date().toISOString();
const [user] = await restFetch("/auth_users?on_conflict=supabase_id", {
  method: "POST",
  body: JSON.stringify({
    id: authUser.id,
    supabase_id: authUser.id,
    email: USER_EMAIL,
    display_name: "E2E Test User",
    updated_at: now,
  }),
  headers: {
    ...headers,
    Prefer: "resolution=merge-duplicates,return=representation",
  },
});
console.log(`Upserted auth_users row: ${user.id}`);
console.log("Done.");
