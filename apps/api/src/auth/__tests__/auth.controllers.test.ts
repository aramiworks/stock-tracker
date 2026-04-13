import { jest, describe, it, expect } from "@jest/globals";
import { authControllers } from "../controllers/auth.controllers.js";

const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  supabase_id: "660e8400-e29b-41d4-a716-446655440000",
  email: "test@example.com",
  display_name: "Test User",
  created_at: new Date("2025-01-01T00:00:00Z"),
  updated_at: new Date("2025-01-01T00:00:00Z"),
};

const makePrisma = (findUniqueReturn: typeof mockUser | null = mockUser) =>
  ({
    auth_users: {
      findUnique: (jest.fn() as any).mockResolvedValue(findUniqueReturn),
      upsert: (jest.fn() as any).mockImplementation(
        ({ create }: { create: any }) =>
          Promise.resolve({
            id: "new-user-id",
            supabase_id: create.supabase_id,
            email: create.email,
            display_name: create.display_name,
            created_at: mockUser.created_at,
            updated_at: mockUser.updated_at,
          }),
      ),
    },
  }) as any;

describe("authControllers", () => {
  describe("me()", () => {
    it("returns formatted user when userId is valid", async () => {
      const prisma = makePrisma(mockUser);
      const ctrl = authControllers(prisma);

      const result = await ctrl.me(mockUser.supabase_id);

      expect(prisma.auth_users.findUnique).toHaveBeenCalledWith({
        where: { supabase_id: mockUser.supabase_id },
      });
      expect(result).toEqual({
        id: mockUser.id,
        supabaseId: mockUser.supabase_id,
        email: mockUser.email,
        displayName: mockUser.display_name,
        createdAt: mockUser.created_at,
        updatedAt: mockUser.updated_at,
      });
    });

    it("returns null when userId is undefined", async () => {
      const prisma = makePrisma();
      const ctrl = authControllers(prisma);

      const result = await ctrl.me(undefined);

      expect(result).toBeNull();
      expect(prisma.auth_users.findUnique).not.toHaveBeenCalled();
    });

    it("returns null when user is not found", async () => {
      const prisma = makePrisma(null);
      const ctrl = authControllers(prisma);

      const result = await ctrl.me("nonexistent-supabase-id");

      expect(result).toBeNull();
      expect(prisma.auth_users.findUnique).toHaveBeenCalledWith({
        where: { supabase_id: "nonexistent-supabase-id" },
      });
    });
  });

  describe("upsertFromSupabase()", () => {
    it("creates a new user", async () => {
      const prisma = makePrisma();
      const ctrl = authControllers(prisma);

      const result = await ctrl.upsertFromSupabase({
        supabaseId: "new-supabase-id",
        email: "new@example.com",
        displayName: "New User",
      });

      expect(prisma.auth_users.upsert).toHaveBeenCalledWith({
        where: { supabase_id: "new-supabase-id" },
        create: {
          supabase_id: "new-supabase-id",
          email: "new@example.com",
          display_name: "New User",
        },
        update: {
          email: "new@example.com",
          display_name: "New User",
        },
      });
      expect(result.email).toBe("new@example.com");
      expect(result.displayName).toBe("New User");
    });

    it("updates an existing user", async () => {
      const prisma = makePrisma();
      const ctrl = authControllers(prisma);

      const result = await ctrl.upsertFromSupabase({
        supabaseId: mockUser.supabase_id,
        email: "updated@example.com",
        displayName: "Updated Name",
      });

      expect(prisma.auth_users.upsert).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("handles null displayName", async () => {
      const prisma = makePrisma();
      const ctrl = authControllers(prisma);

      const result = await ctrl.upsertFromSupabase({
        supabaseId: "new-supabase-id",
        email: "new@example.com",
        displayName: null,
      });

      expect(prisma.auth_users.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ display_name: null }),
          update: expect.objectContaining({ display_name: null }),
        }),
      );
      expect(result.displayName).toBeNull();
    });
  });
});
