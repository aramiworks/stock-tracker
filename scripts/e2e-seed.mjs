/**
 * Seeds E2E test data for e2e@arami.so via the Supabase REST API.
 * Uses the service role key to bypass RLS — no direct Postgres connection needed.
 * Safe to run multiple times (deletes existing accounts for the user first).
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

// 1. Look up the Supabase auth user UUID
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

// 2. Upsert the auth_users row in the public schema
const now = new Date().toISOString();
const [user] = await restFetch("/auth_users?on_conflict=supabase_id", {
  method: "POST",
  body: JSON.stringify({
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

// 3. Clean existing accounts (idempotency)
const existingAccounts = await restFetch(
  `/tracker_accounts?auth_user_id=eq.${user.supabase_id}&select=id`,
);
if (existingAccounts.length > 0) {
  const ids = existingAccounts.map((a) => a.id);
  await restFetch(
    `/tracker_purchases?tracker_account_id=in.(${ids.join(",")})`,
    {
      method: "DELETE",
    },
  );
  await restFetch(`/tracker_accounts?auth_user_id=eq.${user.supabase_id}`, {
    method: "DELETE",
  });
  console.log(`Cleaned ${existingAccounts.length} existing account(s)`);
}

// 4. Create 2 SA accounts
const accounts = await restFetch("/tracker_accounts", {
  method: "POST",
  body: JSON.stringify([
    {
      auth_user_id: user.supabase_id,
      store_name: "까르띠에 청담",
      sa_name: "김SA",
      notes: "E2E 테스트 계좌 1",
      updated_at: now,
    },
    {
      auth_user_id: user.supabase_id,
      store_name: "까르띠에 롯데",
      sa_name: "이SA",
      notes: "E2E 테스트 계좌 2",
      updated_at: now,
    },
  ]),
});
const [sa1, sa2] = accounts;
console.log(`Created 2 accounts: ${sa1.id}, ${sa2.id}`);

// 5. Create purchases
await restFetch("/tracker_purchases", {
  method: "POST",
  body: JSON.stringify([
    {
      tracker_account_id: sa1.id,
      item_name: "러브 브레이슬릿",
      item_category: "브레이슬릿",
      amount: 5800000,
      currency: "KRW",
      purchase_date: "2025-06-15",
      store_location: "청담",
      updated_at: now,
    },
    {
      tracker_account_id: sa1.id,
      item_name: "나노 링 목걸이",
      item_category: "목걸이",
      amount: 3200000,
      currency: "KRW",
      purchase_date: "2025-09-20",
      store_location: "청담",
      updated_at: now,
    },
    {
      tracker_account_id: sa2.id,
      item_name: "탱크 워치",
      item_category: "시계",
      amount: 12000000,
      currency: "KRW",
      purchase_date: "2025-11-01",
      store_location: "롯데",
      updated_at: now,
    },
  ]),
});
console.log("Created 3 purchases");
console.log(`Done. User ${user.id} — 2 accounts, 3 purchases.`);
