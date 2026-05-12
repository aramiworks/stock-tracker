/**
 * Thin GraphQL fetch wrapper for the deployed Apollo Router.
 *
 * Returns the parsed body verbatim — tests assert on `data` and `errors`
 * directly rather than throwing on GraphQL errors, since several test cases
 * (auth rejection, ownership boundaries) need to inspect the error shape.
 */

import { env } from "./env.js";

export interface GqlResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
    path?: Array<string | number>;
  }>;
}

export interface GqlOptions {
  token?: string;
  headers?: Record<string, string>;
}

export async function gql<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
  options: GqlOptions = {},
): Promise<{ status: number; body: GqlResponse<T> }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(env.graphqlUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const text = await res.text();
  let body: GqlResponse<T>;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Non-JSON response from ${env.graphqlUrl} (${res.status}): ${text}`,
    );
  }
  return { status: res.status, body };
}
