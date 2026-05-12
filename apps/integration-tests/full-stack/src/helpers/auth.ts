/**
 * Signs in to the deployed Supabase project using the persistent E2E user
 * (E2E_USER_EMAIL / E2E_USER_PASSWORD) and returns a real JWT that the
 * Apollo Router will validate via JWKS.
 *
 * Mirrors scripts/e2e-inject-session.mjs but returns the access_token
 * instead of injecting into HTML.
 */

import { env } from "./env.js";

export interface SignInResult {
  accessToken: string;
  userId: string;
  email: string;
  expiresIn: number;
}

export async function signIn(
  email: string = env.userEmail,
  password: string = env.userPassword,
): Promise<SignInResult> {
  const res = await fetch(
    `${env.supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: env.supabaseAnonKey,
        Authorization: `Bearer ${env.supabaseAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Supabase sign-in failed for ${email} (${res.status}): ${body}`,
    );
  }

  const session = await res.json();
  return {
    accessToken: session.access_token,
    userId: session.user.id,
    email: session.user.email,
    expiresIn: session.expires_in,
  };
}
