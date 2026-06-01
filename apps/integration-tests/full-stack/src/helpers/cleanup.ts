/**
 * Service-role REST cleanup for e2e fixture rows.
 *
 * Tests track every watch they create in `createdWatchIds` and pass the
 * list to deleteWatchesByIds() at suite teardown. This avoids relying on
 * name-prefix matching (the current Hermès `watches` schema has no
 * user-tagged string field — see INF-1450 history).
 */

import { env } from "./env.js";

const headers = {
  apikey: env.supabaseServiceRoleKey,
  Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
  "Content-Type": "application/json",
};

const rest = (path: string) => `${env.supabaseUrl}/rest/v1${path}`;

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
    { headers },
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
 * Delete the given watches by ID, scoped to the authenticated user so a
 * leaked service-role key in a misconfigured CI run can never wipe another
 * user's watchlist. Idempotent — missing rows are silently skipped.
 */
export async function deleteWatchesByIds(
  authUserId: string,
  ids: string[],
): Promise<number> {
  if (ids.length === 0) return 0;
  const inList = ids.join(",");
  const res = await fetch(
    rest(`/watches?auth_user_id=eq.${authUserId}&id=in.(${inList})`),
    { method: "DELETE", headers },
  );
  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Failed to delete watches (${res.status}): ${await res.text()}`,
    );
  }
  return ids.length;
}
