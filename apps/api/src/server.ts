import { randomUUID } from "node:crypto";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./trpc/router.js";
import { createContext, setLogger, setJwtVerifier } from "./trpc/trpc.js";
import { logger } from "./common/logger.js";
import { verifySupabaseJwt } from "./common/jwt.js";

setLogger(logger);

const supabaseUrl = process.env["SUPABASE_URL"];
if (supabaseUrl) {
  setJwtVerifier((token) => verifySupabaseJwt(token, supabaseUrl));
}

const PORT = Number(process.env["PORT"] ?? 4000);

const server = createHTTPServer({
  router: appRouter,
  createContext,
  middleware: (req, res, next) => {
    if (req.url === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (!req.headers["x-request-id"]) {
      req.headers["x-request-id"] = randomUUID();
    }
    res.setHeader("x-request-id", req.headers["x-request-id"]);

    const start = performance.now();

    res.on("finish", () => {
      const duration = Math.round(performance.now() - start);
      logger.info(
        {
          requestId: req.headers["x-request-id"],
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration,
        },
        "http request",
      );
    });

    next();
  },
});

server.listen(PORT);
logger.info({ port: PORT }, "tRPC server listening");
