import http from "node:http";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { randomUUID } from "node:crypto";
import { appRouter } from "../trpc/router.js";
import { createContext } from "../trpc/trpc.js";

let server: ReturnType<typeof createHTTPServer>;
const TEST_PORT = 4099;

/** superjson wraps tRPC error responses as { json, meta } */
function errorData(body: any): any {
  return body.error?.json?.data ?? body.error?.data;
}

function request(
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
  } = {},
): Promise<{
  status: number;
  headers: http.IncomingHttpHeaders;
  body: unknown;
}> {
  return new Promise((resolve, reject) => {
    const bodyStr = options.body ? JSON.stringify(options.body) : undefined;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: TEST_PORT,
        path,
        method: options.method ?? "GET",
        headers: {
          "content-type": "application/json",
          ...options.headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let body: unknown;
          try {
            body = JSON.parse(data);
          } catch {
            body = data;
          }
          resolve({ status: res.statusCode!, headers: res.headers, body });
        });
      },
    );
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

beforeAll(async () => {
  server = createHTTPServer({
    router: appRouter,
    createContext,
    middleware: (req, res, next) => {
      if (!req.headers["x-request-id"]) {
        req.headers["x-request-id"] = randomUUID();
      }
      res.setHeader("x-request-id", req.headers["x-request-id"]);
      next();
    },
  });
  server.listen(TEST_PORT);
});

afterAll(() => {
  server.close();
});

describe("requestId in error responses", () => {
  it("includes requestId in UNAUTHORIZED error body", async () => {
    const res = await request("/auth.me", {
      method: "GET",
    });

    expect(res.status).toBe(401);
    const body = res.body as any;
    expect(body.error).toBeDefined();
    const data = errorData(body);
    expect(data.requestId).toBeDefined();
    expect(typeof data.requestId).toBe("string");
  });

  it("returns x-request-id response header", async () => {
    const res = await request("/auth.me", {
      method: "GET",
    });

    expect(res.headers["x-request-id"]).toBeDefined();
    expect(typeof res.headers["x-request-id"]).toBe("string");
  });

  it("echoes back client-provided x-request-id", async () => {
    const customId = "custom-request-id-12345";
    const res = await request("/auth.me", {
      method: "GET",
      headers: { "x-request-id": customId },
    });

    expect(res.headers["x-request-id"]).toBe(customId);
    const body = res.body as any;
    expect(errorData(body).requestId).toBe(customId);
  });

  it("generates a UUID requestId when none provided", async () => {
    const res = await request("/auth.me", {
      method: "GET",
    });

    const body = res.body as any;
    const requestId = errorData(body).requestId;
    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
