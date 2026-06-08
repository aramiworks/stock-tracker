import { defineConfig } from "@trigger.dev/sdk";
import { syncEnvVars } from "@trigger.dev/build/extensions/core";
import { fetchDopplerEnv } from "./src/build/dopplerEnv.js";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID!,
  dirs: ["./src"],
  runtime: "node",
  machine: "small-1x",
  // Required by the Trigger.dev CLI. Generous ceiling for catalog polls.
  maxDuration: 300,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1_000,
      maxTimeoutInMs: 10_000,
      factor: 2,
      randomize: true,
    },
  },
  build: {
    // Single source of truth: at deploy time, sync the deployed scraper's env
    // from the Doppler config the deploy's DOPPLER_TOKEN is scoped to. Includes
    // TRACKER_INGEST_SERVICE_TOKEN + TRACKER_INGEST_URL for the ingest hop.
    extensions: [
      syncEnvVars(async () => fetchDopplerEnv(process.env.DOPPLER_TOKEN)),
    ],
  },
});
