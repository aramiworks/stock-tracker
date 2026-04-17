import { jest, describe, it, expect } from "@jest/globals";
import { authModels } from "./auth.models.js";

const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  supabase_id: "660e8400-e29b-41d4-a716-446655440000",
  email: "test@example.com",
  display_name: "Test User",
  created_at: new Date("2025-01-01T00:00:00Z"),
  updated_at: new Date("2025-01-01T00:00:00Z"),
};

function makePrisma() {
  return {
    auth_users: {
      findUnique: (jest.fn() as any).mockResolvedValue(mockUser),
      upsert: (jest.fn() as any).mockResolvedValue(mockUser),
    },
  } as any;
}

describe("authModels", () => {
  describe("findById", () => {
    it("calls prisma.auth_users.findUnique with id", async () => {
      const prisma = makePrisma();
      const models = authModels(prisma);

      const result = await models.findById("user-id");

      expect(prisma.auth_users.findUnique).toHaveBeenCalledWith({
        where: { id: "user-id" },
      });
      expect(result).toEqual(mockUser);
    });

    it("returns null when not found", async () => {
      const prisma = makePrisma();
      prisma.auth_users.findUnique.mockResolvedValue(null);

      const result = await authModels(prisma).findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findBySupabaseId", () => {
    it("calls prisma.auth_users.findUnique with supabase_id", async () => {
      const prisma = makePrisma();
      const models = authModels(prisma);

      const result = await models.findBySupabaseId("supabase-id");

      expect(prisma.auth_users.findUnique).toHaveBeenCalledWith({
        where: { supabase_id: "supabase-id" },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("upsert", () => {
    it("calls prisma.auth_users.upsert with correct shape", async () => {
      const prisma = makePrisma();
      const models = authModels(prisma);

      await models.upsert({
        supabaseId: "sub-123",
        email: "new@test.com",
        displayName: "New User",
      });

      expect(prisma.auth_users.upsert).toHaveBeenCalledWith({
        where: { supabase_id: "sub-123" },
        create: {
          supabase_id: "sub-123",
          email: "new@test.com",
          display_name: "New User",
        },
        update: {
          email: "new@test.com",
          display_name: "New User",
        },
      });
    });

    it("uses null for undefined displayName", async () => {
      const prisma = makePrisma();
      const models = authModels(prisma);

      await models.upsert({
        supabaseId: "sub-123",
        email: "new@test.com",
      });

      expect(prisma.auth_users.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ display_name: null }),
          update: expect.objectContaining({ display_name: null }),
        }),
      );
    });

    it("passes explicit null displayName through", async () => {
      const prisma = makePrisma();
      const models = authModels(prisma);

      await models.upsert({
        supabaseId: "sub-123",
        email: "new@test.com",
        displayName: null,
      });

      expect(prisma.auth_users.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ display_name: null }),
        }),
      );
    });
  });
});
