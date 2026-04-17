import { describe, it, expect } from "@jest/globals";

// env.ts runs envSchema.parse(process.env) at import time.
// Set required vars before the dynamic import so the module loads.
process.env["DATABASE_URL"] = "postgresql://localhost:5432/test";
process.env["SUPABASE_URL"] = "https://test.supabase.co";
process.env["SUPABASE_ANON_KEY"] = "anon-key";
process.env["SUPABASE_SERVICE_ROLE_KEY"] = "service-role-key";

const { envSchema } = await import("./env.js");

const validEnv = {
  PORT: "4000",
  DATABASE_URL: "postgresql://localhost:5432/test",
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  NODE_ENV: "test",
};

describe("envSchema", () => {
  it("parses valid environment variables", () => {
    const result = envSchema.parse(validEnv);

    expect(result.PORT).toBe("4000");
    expect(result.DATABASE_URL).toBe("postgresql://localhost:5432/test");
    expect(result.SUPABASE_URL).toBe("https://test.supabase.co");
    expect(result.SUPABASE_ANON_KEY).toBe("anon-key");
    expect(result.SUPABASE_SERVICE_ROLE_KEY).toBe("service-role-key");
    expect(result.NODE_ENV).toBe("test");
  });

  it("defaults PORT to 4000", () => {
    const { PORT, ...rest } = validEnv;
    const result = envSchema.parse(rest);
    expect(result.PORT).toBe("4000");
  });

  it("defaults NODE_ENV to development", () => {
    const { NODE_ENV, ...rest } = validEnv;
    const result = envSchema.parse(rest);
    expect(result.NODE_ENV).toBe("development");
  });

  it("accepts optional fields when missing", () => {
    const result = envSchema.parse(validEnv);

    expect(result.SUPABASE_JWKS_URL).toBeUndefined();
    expect(result.APOLLO_KEY).toBeUndefined();
    expect(result.TRIGGER_DEV_API_KEY).toBeUndefined();
  });

  it("accepts optional fields when present", () => {
    const result = envSchema.parse({
      ...validEnv,
      SUPABASE_JWKS_URL: "https://jwks.example.com",
      APOLLO_KEY: "apollo-key",
      TRIGGER_DEV_API_KEY: "trigger-key",
    });

    expect(result.SUPABASE_JWKS_URL).toBe("https://jwks.example.com");
    expect(result.APOLLO_KEY).toBe("apollo-key");
    expect(result.TRIGGER_DEV_API_KEY).toBe("trigger-key");
  });

  it("rejects invalid SUPABASE_URL", () => {
    expect(() =>
      envSchema.parse({ ...validEnv, SUPABASE_URL: "not-a-url" }),
    ).toThrow();
  });

  it("rejects missing required DATABASE_URL", () => {
    const { DATABASE_URL, ...rest } = validEnv;
    expect(() => envSchema.parse(rest)).toThrow();
  });

  it("rejects missing required SUPABASE_ANON_KEY", () => {
    const { SUPABASE_ANON_KEY, ...rest } = validEnv;
    expect(() => envSchema.parse(rest)).toThrow();
  });

  it("rejects invalid NODE_ENV", () => {
    expect(() =>
      envSchema.parse({ ...validEnv, NODE_ENV: "invalid" }),
    ).toThrow();
  });

  it("accepts all valid NODE_ENV values", () => {
    for (const nodeEnv of ["development", "staging", "production", "test"]) {
      const result = envSchema.parse({ ...validEnv, NODE_ENV: nodeEnv });
      expect(result.NODE_ENV).toBe(nodeEnv);
    }
  });
});
