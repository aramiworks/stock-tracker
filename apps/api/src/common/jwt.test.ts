import { describe, it, expect } from "@jest/globals";
import { verifySupabaseJwt } from "./jwt.js";

const SUPABASE_URL = "https://test.supabase.co";

describe("verifySupabaseJwt", () => {
  it("returns null for a malformed token", async () => {
    const result = await verifySupabaseJwt("not-a-jwt", SUPABASE_URL);
    expect(result).toBeNull();
  });

  it("returns null for an empty token", async () => {
    const result = await verifySupabaseJwt("", SUPABASE_URL);
    expect(result).toBeNull();
  });

  it("returns null for a token with invalid structure", async () => {
    const result = await verifySupabaseJwt("a.b.c", SUPABASE_URL);
    expect(result).toBeNull();
  });
});
