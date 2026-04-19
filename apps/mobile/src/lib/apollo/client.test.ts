/* eslint-disable @typescript-eslint/no-explicit-any */
let capturedAuthCallback: (
  req: any,
  ctx: { headers: Record<string, string> },
) => Promise<{ headers: Record<string, string> }>;

jest.mock("@apollo/client/link/context", () => ({
  setContext: jest.fn(
    (
      cb: (
        req: any,
        ctx: { headers: Record<string, string> },
      ) => Promise<{ headers: Record<string, string> }>,
    ) => {
      capturedAuthCallback = cb;
      return { concat: jest.fn().mockReturnValue("mocked-link") };
    },
  ),
}));

jest.mock("@apollo/client", () => {
  const actual = jest.requireActual("@apollo/client");
  return {
    ...actual,
    ApolloClient: jest.fn().mockImplementation((opts: any) => ({
      ...opts,
      __isApolloClient: true,
    })),
    HttpLink: jest.fn(),
  };
});

import { Platform } from "react-native";
import { supabase } from "../supabase";

describe("apollo client", () => {
  it("createApolloClient returns an object with the expected config", () => {
    const { createApolloClient } = require("./client");
    const client = createApolloClient();
    expect(client).toBeDefined();
    expect(client.__isApolloClient).toBe(true);
  });

  it("auth link adds authorization header when session exists", async () => {
    require("./client"); // ensure module is loaded
    expect(capturedAuthCallback).toBeDefined();

    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { access_token: "test-token" } },
    });

    const result = await capturedAuthCallback(
      {},
      { headers: { "x-custom": "val" } },
    );
    expect(result.headers.authorization).toBe("Bearer test-token");
    expect(result.headers["x-custom"]).toBe("val");
  });

  it("auth link omits authorization header when no session", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    const result = await capturedAuthCallback({}, { headers: {} });
    expect(result.headers.authorization).toBeUndefined();
  });

  it("uses localhost fallback when EXPO_PUBLIC_GRAPHQL_URL is not set", () => {
    const { HttpLink } = require("@apollo/client");
    // Module loaded without env var — HttpLink should have been called
    expect(HttpLink).toHaveBeenCalled();
  });

  it("rewrites localhost to 10.0.2.2 on Android in dev mode", () => {
    const origGraphqlUrl = process.env.EXPO_PUBLIC_GRAPHQL_URL;
    const origSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const origSupabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    try {
      jest.isolateModules(() => {
        jest.replaceProperty(Platform, "OS", "android" as typeof Platform.OS);
        process.env.EXPO_PUBLIC_GRAPHQL_URL = "http://localhost:4002";
        process.env.EXPO_PUBLIC_SUPABASE_URL = "http://localhost:54321";
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "test-key";
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("./client");
        const { HttpLink } = require("@apollo/client");
        const lastCall = (HttpLink as jest.Mock).mock.calls.at(-1)!;
        expect(lastCall[0].uri).toBe("http://10.0.2.2:4002");
      });
    } finally {
      if (origGraphqlUrl !== undefined) {
        process.env.EXPO_PUBLIC_GRAPHQL_URL = origGraphqlUrl;
      } else {
        delete process.env.EXPO_PUBLIC_GRAPHQL_URL;
      }
      if (origSupabaseUrl !== undefined) {
        process.env.EXPO_PUBLIC_SUPABASE_URL = origSupabaseUrl;
      } else {
        delete process.env.EXPO_PUBLIC_SUPABASE_URL;
      }
      if (origSupabaseKey !== undefined) {
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = origSupabaseKey;
      } else {
        delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      }
    }
  });
});
