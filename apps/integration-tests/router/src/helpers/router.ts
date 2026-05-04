import { spawn, type ChildProcess } from "node:child_process";
import { connect } from "node:net";

export interface SpawnRouterOptions {
  /** Absolute path to a composed supergraph SDL file. */
  supergraphPath: string;
  /** Absolute path to a router.yaml config file. */
  configPath: string;
  /** Env vars to pass to the router process (interpolated into router.yaml). */
  env: Record<string, string>;
  /** Optional: explicit path to apollo-router binary (defaults to PATH lookup). */
  binPath?: string;
  /**
   * Working directory for the router process. router.yaml references the Rhai
   * script via a relative path (`./rhai`), so the cwd must be the dir
   * containing the script tree (i.e., apps/router/).
   */
  cwd?: string;
}

export interface RouterHandle {
  /** Base URL the router is listening on (e.g., http://127.0.0.1:4012). */
  url: string;
  child: ChildProcess;
  close: () => Promise<void>;
}

/**
 * Spawns the apollo-router binary and waits for it to become healthy.
 * Reads the bound port from ROUTER_PORT env (set by stack.ts to a free port).
 *
 * Readiness signal: Apollo Router's /health endpoint listens on a separate
 * port (default 8088), not the supergraph port. Rather than wiring health
 * onto the supergraph port (which would mean a test-only router config), we
 * poll a TCP connection to the supergraph port — a successful connect means
 * the listener is up and ready to accept GraphQL requests.
 */
export async function spawnRouter({
  supergraphPath,
  configPath,
  env,
  binPath = "apollo-router",
  cwd,
}: SpawnRouterOptions): Promise<RouterHandle> {
  const child = spawn(
    binPath,
    [
      "--supergraph",
      supergraphPath,
      "--config",
      configPath,
      "--log",
      process.env["APOLLO_ROUTER_LOG"] ?? "error",
    ],
    {
      env: { ...process.env, ...env, APOLLO_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      ...(cwd ? { cwd } : {}),
    },
  );

  let stdout = "";
  let stderr = "";
  const echoLogs = process.env["APOLLO_ROUTER_LOG"] !== undefined;
  child.stdout?.on("data", (chunk: Buffer) => {
    stdout += chunk.toString();
    if (echoLogs) process.stderr.write(chunk);
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    stderr += chunk.toString();
    if (echoLogs) process.stderr.write(chunk);
  });

  const port = env["ROUTER_PORT"] ?? env["PORT"];
  if (!port) {
    throw new Error("spawnRouter requires env.ROUTER_PORT to be set");
  }
  const url = `http://127.0.0.1:${port}`;

  // Poll a TCP connect to the supergraph port for readiness.
  const portNum = Number(port);
  const deadline = Date.now() + 30_000;
  let lastError: unknown = null;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `apollo-router exited before ready (code=${child.exitCode}). stdout=${stdout} stderr=${stderr}`,
      );
    }
    try {
      await tcpConnect("127.0.0.1", portNum);
      return {
        url,
        child,
        close: () => stopRouter(child),
      };
    } catch (err) {
      lastError = err;
    }
    await sleep(200);
  }

  await stopRouter(child);
  throw new Error(
    `apollo-router did not become healthy within 30s. lastError=${String(
      lastError,
    )}. stdout=${stdout} stderr=${stderr}`,
  );
}

function tcpConnect(host: string, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = connect({ host, port });
    socket.once("connect", () => {
      socket.end();
      resolve();
    });
    socket.once("error", reject);
  });
}

function stopRouter(child: ChildProcess): Promise<void> {
  return new Promise<void>((resolve) => {
    if (child.exitCode !== null) {
      resolve();
      return;
    }
    child.once("exit", () => resolve());
    child.kill("SIGTERM");
    // Hard kill after 5s if SIGTERM doesn't take.
    setTimeout(() => {
      if (child.exitCode === null) child.kill("SIGKILL");
    }, 5_000);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
