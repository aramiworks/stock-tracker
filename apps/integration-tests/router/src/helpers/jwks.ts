import { createServer, type Server } from "node:http";
import { exportJWK, generateKeyPair, type KeyLike } from "jose";

export interface JwksHandle {
  url: string;
  privateKey: KeyLike;
  publicKey: KeyLike;
  kid: string;
  close: () => Promise<void>;
}

/**
 * Starts a tiny HTTP server that exposes a single RS256 keypair as a JWKS at
 * /jwks.json. Tests sign JWTs with the returned privateKey; the Apollo Router
 * fetches the JWKS at startup (and on rotation) and uses the matching kid to
 * validate incoming Authorization headers.
 *
 * The server listens on an ephemeral port; pass `url` into the router config
 * via the SUPABASE_JWKS_URL env var.
 */
export async function startJwksServer(): Promise<JwksHandle> {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const kid = "test-key-1";

  const jwk = await exportJWK(publicKey);
  const jwks = {
    keys: [{ ...jwk, kid, alg: "RS256", use: "sig" }],
  };
  const body = JSON.stringify(jwks);

  const server: Server = createServer((req, res) => {
    if (req.url === "/jwks.json") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(body);
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (typeof address !== "object" || address === null) {
    throw new Error("JWKS server failed to bind");
  }
  const url = `http://127.0.0.1:${address.port}/jwks.json`;

  return {
    url,
    privateKey,
    publicKey,
    kid,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
