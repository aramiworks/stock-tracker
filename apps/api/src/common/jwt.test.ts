import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock jose to control jwtVerify behavior
jest.unstable_mockModule("jose", () => ({
  createRemoteJWKSet: jest.fn(() => "mock-jwks"),
  jwtVerify: jest.fn(),
}));

const { jwtVerify } = await import("jose");
const { verifySupabaseJwt } = await import("./jwt.js");

const SUPABASE_URL = "https://test.supabase.co";
const mockJwtVerify = jwtVerify as jest.MockedFunction<typeof jwtVerify>;

describe("verifySupabaseJwt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns claims when token is valid", async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { sub: "user-123", email: "test@example.com", role: "authenticated" },
      protectedHeader: { alg: "RS256" },
    } as any);

    const result = await verifySupabaseJwt("valid-token", SUPABASE_URL);

    expect(result).toEqual({
      sub: "user-123",
      email: "test@example.com",
      role: "authenticated",
    });
  });

  it("returns null when payload has no sub", async () => {
    mockJwtVerify.mockResolvedValue({
      payload: { email: "test@example.com" },
      protectedHeader: { alg: "RS256" },
    } as any);

    const result = await verifySupabaseJwt("no-sub-token", SUPABASE_URL);

    expect(result).toBeNull();
  });

  it("returns null when jwtVerify throws", async () => {
    mockJwtVerify.mockRejectedValue(new Error("invalid token"));

    const result = await verifySupabaseJwt("bad-token", SUPABASE_URL);

    expect(result).toBeNull();
  });
});
