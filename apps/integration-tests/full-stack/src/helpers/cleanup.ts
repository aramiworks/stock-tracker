/**
 * Service-role REST cleanup for e2e fixture rows.
 *
 * Tests prefix every account they create with `[e2e-${runId}]` so a single
 * delete-by-prefix at suite teardown removes only this run's data — even if
 * a previous run crashed and left rows behind. Cascades to tracker_purchases
 * via the FK.
 */

import { env } from "./env.js";

const headers = {
  apikey: env.supabaseServiceRoleKey,
  Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
  "Content-Type": "application/json",
};

const rest = (path: string) => `${env.supabaseUrl}/rest/v1${path}`;

export function makeRunId(): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${stamp}-${rand}`;
}

export function prefix(runId: string): string {
  return `[e2e-${runId}]`;
}

/**
 * Look up the public.auth_users.id for the given Supabase auth user UUID.
 * Returns null if the row hasn't been created yet (the app upserts it on
 * first sign-in, but the e2e user should already exist).
 */
export async function getAuthUserId(
  supabaseUserId: string,
): Promise<string | null> {
  const res = await fetch(
    rest(`/auth_users?supabase_id=eq.${supabaseUserId}&select=id`),
    {
      headers,
    },
  );
  if (!res.ok) {
    throw new Error(
      `Failed to look up auth_user (${res.status}): ${await res.text()}`,
    );
  }
  const rows = (await res.json()) as Array<{ id: string }>;
  return rows[0]?.id ?? null;
}

/**
 * Delete all tracker_accounts whose store_name starts with the given prefix.
 * Cascades to tracker_purchases via the FK.
 */
export async function deleteByPrefix(
  authUserId: string,
  runPrefix: string,
): Promise<number> {
  const accountsRes = await fetch(
    rest(
      `/tracker_accounts?auth_user_id=eq.${authUserId}&store_name=like.${encodeURIComponent(runPrefix + "%")}&select=id`,
    ),
    { headers },
  );
  if (!accountsRes.ok) {
    throw new Error(
      `Failed to list accounts (${accountsRes.status}): ${await accountsRes.text()}`,
    );
  }
  const accounts = (await accountsRes.json()) as Array<{ id: string }>;
  if (accounts.length === 0) return 0;

  const ids = accounts.map((a) => a.id);
  const purgeRes = await fetch(
    rest(`/tracker_purchases?tracker_account_id=in.(${ids.join(",")})`),
    { method: "DELETE", headers },
  );
  if (!purgeRes.ok && purgeRes.status !== 404) {
    throw new Error(
      `Failed to delete purchases (${purgeRes.status}): ${await purgeRes.text()}`,
    );
  }

  const delRes = await fetch(
    rest(
      `/tracker_accounts?auth_user_id=eq.${authUserId}&store_name=like.${encodeURIComponent(runPrefix + "%")}`,
    ),
    { method: "DELETE", headers },
  );
  if (!delRes.ok) {
    throw new Error(
      `Failed to delete accounts (${delRes.status}): ${await delRes.text()}`,
    );
  }
  return accounts.length;
}
