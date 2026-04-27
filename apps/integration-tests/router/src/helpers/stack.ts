import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";
import { startJwksServer, type JwksHandle } from "./jwks.js";
import { startMockSubgraph, type MockSubgraphHandle } from "./mock-subgraph.js";
import { spawnRouter, type RouterHandle } from "./router.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROUTER_DIR = pathResolve(__dirname, "../../../../router");
const ROUTER_CONFIG = pathResolve(ROUTER_DIR, "router.yaml");

export interface StackHandle {
  routerUrl: string;
  jwks: JwksHandle;
  subgraph: MockSubgraphHandle;
  router: RouterHandle;
  stop: () => Promise<void>;
}

/**
 * Boots the full router test stack:
 *   1. JWKS HTTP server (RS256 keypair)
 *   2. Mock federated subgraph on a free port (records inbound headers)
 *   3. rover supergraph compose against the running mock subgraph,
 *      using a temp supergraph.yaml that points at the mock's port
 *   4. apollo-router child process with the prod router.yaml,
 *      SUPABASE_JWKS_URL pointed at our test JWKS server
 *
 * Reuses apps/router/router.yaml verbatim — tests run against the exact
 * production router config, not a test fork. supergraph.yaml is generated
 * per-test with a dynamic port so the suite is robust to port :4011 being
 * busy (e.g. local `npm run dev:subgraph`) and supports parallel test runs.
 */
export async function startStack(): Promise<StackHandle> {
  const jwks = await startJwksServer();

  let subgraph: MockSubgraphHandle | undefined;
  let router: RouterHandle | undefined;

  try {
    // The production router.yaml uses authentication.router.jwt — a
    // GraphOS-licensed plugin. The router refuses to start without a
    // valid APOLLO_KEY + APOLLO_GRAPH_REF (same credentials production
    // uses; see infra/railway/src/config.ts). Fail fast with a helpful
    // message rather than letting the router exit cryptically.
    const apolloKey = process.env["APOLLO_KEY"];
    const apolloGraphRef = process.env["APOLLO_GRAPH_REF"];
    if (!apolloKey || !apolloGraphRef) {
      throw new Error(
        "Router integration tests require APOLLO_KEY and APOLLO_GRAPH_REF " +
          "to be set (the JWT authentication plugin in apps/router/router.yaml " +
          "is GraphOS-licensed). Run with `op run -- npm run test:e2e -w " +
          "apps/integration-tests/router` or export them manually.",
      );
    }

    const subgraphPort = await findFreePort();
    subgraph = await startMockSubgraph(subgraphPort);

    const supergraphConfigPath = await writeTempSupergraphConfig(subgraphPort);
    const supergraphSdl = await composeSupergraph(supergraphConfigPath);
    const supergraphPath = await writeTempSupergraph(supergraphSdl);

    const routerPort = await findFreePort();

    router = await spawnRouter({
      supergraphPath,
      configPath: ROUTER_CONFIG,
      // router.yaml references `./rhai` relative to its own directory, so
      // run the router with cwd=apps/router so the script path resolves.
      cwd: ROUTER_DIR,
      env: {
        SUPABASE_JWKS_URL: jwks.url,
        // router.yaml binds the supergraph listener to ${env.PORT} (Railway
        // convention). Tests pick a free port and pass it through here.
        PORT: String(routerPort),
        ALLOWED_ORIGINS: "http://localhost:0",
        APOLLO_KEY: apolloKey,
        APOLLO_GRAPH_REF: apolloGraphRef,
      },
    });

    return {
      routerUrl: router.url,
      jwks,
      subgraph,
      router,
      stop: async () => {
        await router?.close().catch(() => {});
        await subgraph?.close().catch(() => {});
        await jwks.close().catch(() => {});
      },
    };
  } catch (err) {
    await router?.close().catch(() => {});
    await subgraph?.close().catch(() => {});
    await jwks.close().catch(() => {});
    throw err;
  }
}

async function composeSupergraph(configPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "rover",
      [
        "supergraph",
        "compose",
        "--config",
        configPath,
        "--elv2-license=accept",
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, APOLLO_TELEMETRY_DISABLED: "1" },
      },
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(
          new Error(
            `rover supergraph compose failed (code=${code}): ${stderr}`,
          ),
        );
      }
    });
  });
}

async function writeTempSupergraph(sdl: string): Promise<string> {
  const dir = await mkdtemp(`${tmpdir()}/router-e2e-`);
  const path = `${dir}/supergraph.graphql`;
  await writeFile(path, sdl, "utf8");
  return path;
}

/**
 * Generates a rover-compatible supergraph.yaml that points at the
 * dynamically-allocated mock subgraph port. Mirrors the structure of
 * apps/router/supergraph.yaml so any rover-side compatibility regression
 * surfaces here too.
 */
async function writeTempSupergraphConfig(
  subgraphPort: number,
): Promise<string> {
  const dir = await mkdtemp(`${tmpdir()}/router-e2e-cfg-`);
  const path = `${dir}/supergraph.yaml`;
  const url = `http://localhost:${subgraphPort}`;
  const yaml = [
    "federation_version: 2",
    "subgraphs:",
    "  tracker:",
    `    routing_url: ${url}`,
    "    schema:",
    `      subgraph_url: ${url}`,
    "",
  ].join("\n");
  await writeFile(path, yaml, "utf8");
  return path;
}

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (typeof address !== "object" || address === null) {
        reject(new Error("failed to bind"));
        return;
      }
      const port = address.port;
      server.close(() => resolve(port));
    });
  });
}
