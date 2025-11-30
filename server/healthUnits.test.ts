import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("healthUnits procedures", () => {
  describe("list", () => {
    it("should return all health units", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.healthUnits.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("listByType", () => {
    it("should filter units by type", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.healthUnits.listByType({ type: "ubs" });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((unit) => {
        expect(unit.type).toBe("ubs");
      });
    });
  });

  describe("create", () => {
    it("should reject creation when user is not admin", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.healthUnits.create({
          name: "Test UBS",
          type: "ubs",
          address: "Test Address",
          latitude: "-23.550520",
          longitude: "-46.633308",
          occupancyLevel: "baixo",
          averageWaitTime: 30,
          waitingCount: 0,
        })
      ).rejects.toThrow("Apenas administradores podem criar unidades");
    });

    it("should allow creation when user is admin", async () => {
      const ctx = createMockContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.healthUnits.create({
        name: "Test UBS Admin",
        type: "ubs",
        address: "Test Address",
        latitude: "-23.550520",
        longitude: "-46.633308",
        phone: "(11) 1111-1111",
        occupancyLevel: "baixo",
        averageWaitTime: 30,
        waitingCount: 0,
      });

      expect(result).toBeDefined();
      expect(result.name).toBe("Test UBS Admin");
      expect(result.type).toBe("ubs");

      // Limpar após o teste
      if (result.id) {
        await db.deleteHealthUnit(result.id);
      }
    });
  });

  describe("update", () => {
    it("should reject update when user is not admin", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.healthUnits.update({
          id: 1,
          name: "Updated Name",
        })
      ).rejects.toThrow("Apenas administradores podem atualizar unidades");
    });
  });

  describe("delete", () => {
    it("should reject deletion when user is not admin", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.healthUnits.delete({ id: 1 })
      ).rejects.toThrow("Apenas administradores podem deletar unidades");
    });
  });

  describe("seed", () => {
    it("should reject seeding when user is not admin", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.healthUnits.seed()).rejects.toThrow(
        "Apenas administradores podem popular o banco"
      );
    });

    it("should allow seeding when user is admin", async () => {
      const ctx = createMockContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.healthUnits.seed();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(typeof result.count).toBe("number");
    });
  });
});
