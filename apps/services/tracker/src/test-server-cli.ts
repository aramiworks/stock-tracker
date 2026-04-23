/**
 * CLI wrapper for startTrackerTestServer.
 * Spawned as a child process by subgraph e2e tests to avoid
 * transforming @nestjs/* through ts-jest (which is too slow for CI).
 *
 * Protocol: prints "TRACKER_URL=<url>" to stdout when ready.
 * The process stays alive until killed (SIGTERM).
 */
import { startTrackerTestServer } from "./test-server.js";

const { url, close } = await startTrackerTestServer();
console.log(`TRACKER_URL=${url}`);

process.on("SIGTERM", async () => {
  await close();
  process.exit(0);
});
