import { describe, expect, it } from "@jest/globals";
import { userOutputSchema, userUpsertInputSchema } from "./auth.js";

const validUser = {
  id: "11111111-1111-4111-8111-111111111111",
  supabaseId: "22222222-2222-4222-8222-222222222222",
  email: "user@example.com",
  displayName: "Jace",
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-02T00:00:00Z"),
};

describe("userOutputSchema", () => {
  it("accepts a fully populated user", () => {
    expect(userOutputSchema.parse(validUser)).toEqual(validUser);
  });

  it("accepts a null displayName", () => {
    expect(
      userOutputSchema.parse({ ...validUser, displayName: null }).displayName,
    ).toBeNull();
  });

  it("rejects an invalid email", () => {
    expect(
      userOutputSchema.safeParse({ ...validUser, email: "not-an-email" })
        .success,
    ).toBe(false);
  });

  it("rejects an invalid uuid", () => {
    expect(userOutputSchema.safeParse({ ...validUser, id: "nope" }).success).toBe(
      false,
    );
  });

  it("rejects a non-Date createdAt", () => {
    expect(
      userOutputSchema.safeParse({ ...validUser, createdAt: "2025-01-01" })
        .success,
    ).toBe(false);
  });
});

describe("userUpsertInputSchema", () => {
  it("accepts the minimum payload (email only)", () => {
    expect(userUpsertInputSchema.parse({ email: "user@example.com" })).toEqual({
      email: "user@example.com",
    });
  });

  it("accepts a string displayName", () => {
    expect(
      userUpsertInputSchema.parse({
        email: "user@example.com",
        displayName: "Jace",
      }),
    ).toEqual({ email: "user@example.com", displayName: "Jace" });
  });

  it("accepts a null displayName", () => {
    expect(
      userUpsertInputSchema.parse({
        email: "user@example.com",
        displayName: null,
      }).displayName,
    ).toBeNull();
  });

  it("rejects when email is missing", () => {
    expect(userUpsertInputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(
      userUpsertInputSchema.safeParse({ email: "not-an-email" }).success,
    ).toBe(false);
  });
});
