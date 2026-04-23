import { describe, it, expect } from "@jest/globals";
import { appRouter } from "./router.js";

describe("appRouter", () => {
  const procedures = appRouter._def.procedures;

  it("exposes auth procedures", () => {
    expect(procedures).toHaveProperty(["auth.me"]);
    expect(procedures).toHaveProperty(["auth.upsertFromSupabase"]);
  });

  it("does not expose tracker procedures (moved to tracker-service)", () => {
    expect(procedures).not.toHaveProperty(["tracker.dashboard.home.summary"]);
    expect(procedures).not.toHaveProperty(["tracker.accounts.list.all"]);
  });
});
