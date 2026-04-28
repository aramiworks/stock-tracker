import { SignJWT, type KeyLike } from "jose";

export interface SignTestJwtOptions {
  privateKey: KeyLike;
  kid: string;
  sub: string;
  role?: string;
  /**
   * Issuer + audience are required by the Apollo Router's JWT plugin defaults
   * but the router does not validate them by default — we still set them so
   * the JWT shape matches Supabase tokens for fidelity.
   */
  issuer?: string;
  audience?: string;
  expiresInSeconds?: number;
}

export async function signTestJwt({
  privateKey,
  kid,
  sub,
  role,
  issuer = "test-issuer",
  audience = "authenticated",
  expiresInSeconds = 3600,
}: SignTestJwtOptions): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: Record<string, unknown> = { sub };
  if (role !== undefined) {
    payload["role"] = role;
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", kid })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .setIssuer(issuer)
    .setAudience(audience)
    .sign(privateKey);
}
