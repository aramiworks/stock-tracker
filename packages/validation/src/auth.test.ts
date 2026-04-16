import { describe, it, expect } from "@jest/globals";
import { userOutputSchema, userUpsertInputSchema } from "./auth.js";

describe("userOutputSchema", () => {
  it("accepts a valid user output", () => {
    const result = userOutputSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      supabaseId: "550e8400-e29b-41d4-a716-446655440001",
      email: "test@example.com",
      displayName: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.email).toBe("test@example.com");
  });

  it("accepts null displayName", () => {
    const result = userOutputSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      supabaseId: "550e8400-e29b-41d4-a716-446655440001",
      email: "test@example.com",
      displayName: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.displayName).toBeNull();
  });

  it("rejects invalid email", () => {
    expect(() =>
      userOutputSchema.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        supabaseId: "550e8400-e29b-41d4-a716-446655440001",
        email: "not-an-email",
        displayName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow();
  });

  it("rejects non-UUID id fields", () => {
    expect(() =>
      userOutputSchema.parse({
        id: "not-a-uuid",
        supabaseId: "550e8400-e29b-41d4-a716-446655440001",
        email: "test@example.com",
        displayName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow();
  });
});

describe("userUpsertInputSchema", () => {
  it("accepts a valid email", () => {
    const result = userUpsertInputSchema.parse({ email: "test@example.com" });
    expect(result.email).toBe("test@example.com");
  });

  it("rejects missing email", () => {
    expect(() => userUpsertInputSchema.parse({})).toThrow();
  });

  it("accepts optional displayName", () => {
    const result = userUpsertInputSchema.parse({
      email: "test@example.com",
      displayName: "Test User",
    });
    expect(result.displayName).toBe("Test User");
  });

  it("accepts nullable displayName", () => {
    const result = userUpsertInputSchema.parse({
      email: "test@example.com",
      displayName: null,
    });
    expect(result.displayName).toBeNull();
  });

  it("rejects invalid email", () => {
    expect(() =>
      userUpsertInputSchema.parse({ email: "not-an-email" }),
    ).toThrow();
  });
});
