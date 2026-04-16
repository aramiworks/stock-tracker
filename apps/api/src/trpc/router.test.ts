import { describe, it, expect } from "@jest/globals";
import { appRouter } from "./router.js";

describe("appRouter", () => {
  const procedures = appRouter._def.procedures;

  it("exposes auth procedures", () => {
    expect(procedures).toHaveProperty(["auth.me"]);
    expect(procedures).toHaveProperty(["auth.upsertFromSupabase"]);
  });

  it("exposes tracker dashboard procedures", () => {
    expect(procedures).toHaveProperty(["tracker.dashboard.home.summary"]);
  });

  it("exposes tracker accounts procedures", () => {
    expect(procedures).toHaveProperty(["tracker.accounts.list.all"]);
    expect(procedures).toHaveProperty(["tracker.accounts.list.create"]);
    expect(procedures).toHaveProperty(["tracker.accounts.detail.byId"]);
    expect(procedures).toHaveProperty(["tracker.accounts.detail.update"]);
    expect(procedures).toHaveProperty(["tracker.accounts.detail.delete"]);
  });

  it("exposes tracker history procedures", () => {
    expect(procedures).toHaveProperty(["tracker.history.browse.list"]);
  });

  it("exposes tracker purchases procedures", () => {
    expect(procedures).toHaveProperty(["tracker.purchases.manage.byId"]);
    expect(procedures).toHaveProperty(["tracker.purchases.manage.create"]);
    expect(procedures).toHaveProperty(["tracker.purchases.manage.update"]);
    expect(procedures).toHaveProperty(["tracker.purchases.manage.delete"]);
  });
});
