// Deploy-time helper for trigger.config.ts's syncEnvVars extension.
//
// Pulls every secret from the Doppler config that the deploy-time DOPPLER_TOKEN
// is scoped to, and returns them in the {name, value}[] shape syncEnvVars wants.
// This makes Doppler the single source of truth for the deployed scraper's env
// (including TRACKER_INGEST_SERVICE_TOKEN + TRACKER_INGEST_URL) — no manual
// Trigger.dev dashboard entry. The token's scope selects the config, so each
// Trigger.dev environment just needs its own DOPPLER_TOKEN.

const DOPPLER_DOWNLOAD_URL =
  "https://api.doppler.com/v3/configs/config/secrets/download?format=json";

// Never forward the deploy-time Doppler token itself into the task runtime.
const EXCLUDED = new Set([
  "DOPPLER_TOKEN",
  "DOPPLER_PROJECT",
  "DOPPLER_CONFIG",
]);

export async function fetchDopplerEnv(
  token: string | undefined,
): Promise<{ name: string; value: string }[]> {
  // No token (e.g. local `trigger dev`, or a deploy without Doppler wired) —
  // sync nothing rather than fail the deploy.
  if (!token) return [];

  const res = await fetch(DOPPLER_DOWNLOAD_URL, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(
      `Doppler env fetch failed: ${res.status} ${res.statusText}`,
    );
  }

  const secrets = (await res.json()) as Record<string, unknown>;
  return Object.entries(secrets)
    .filter(([name]) => !EXCLUDED.has(name))
    .map(([name, value]) => ({ name, value: String(value) }));
}
