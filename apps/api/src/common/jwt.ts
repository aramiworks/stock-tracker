import { createRemoteJWKSet, jwtVerify } from "jose";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS(supabaseUrl: string): ReturnType<typeof createRemoteJWKSet> {
  if (!jwks) {
    const jwksUrl = new URL("/auth/v1/.well-known/jwks.json", supabaseUrl);
    jwks = createRemoteJWKSet(jwksUrl);
  }
  return jwks;
}

interface JWTPayload {
  sub: string;
  email?: string;
  role?: string;
}

/**
 * Verify a Supabase JWT and extract claims.
 * Returns null if verification fails (invalid token, expired, etc.).
 */
export async function verifySupabaseJwt(
  token: string,
  supabaseUrl: string,
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJWKS(supabaseUrl), {
      issuer: `${supabaseUrl}/auth/v1`,
    });

    if (!payload.sub) return null;

    return {
      sub: payload.sub,
      email: payload.email as string | undefined,
      role: payload.role as string | undefined,
    };
  } catch {
    return null;
  }
}
