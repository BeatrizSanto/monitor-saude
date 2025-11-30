import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  healthUnits: router({
    list: publicProcedure.query(async () => {
      return await db.getAllHealthUnits();
    }),

    listByType: publicProcedure
      .input(z.object({ type: z.enum(["ubs", "posto", "hospital"]) }))
      .query(async ({ input }) => {
        return await db.getHealthUnitsByType(input.type);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getHealthUnitById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          type: z.enum(["ubs", "posto", "hospital"]),
          address: z.string(),
          latitude: z.string(),
          longitude: z.string(),
          phone: z.string().optional(),
          occupancyLevel: z.enum(["baixo", "medio", "alto", "critico"]).default("medio"),
          averageWaitTime: z.number().default(30),
          waitingCount: z.number().default(0),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem criar unidades" });
        }
        return await db.createHealthUnit(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          type: z.enum(["ubs", "posto", "hospital"]).optional(),
          address: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          phone: z.string().optional(),
          occupancyLevel: z.enum(["baixo", "medio", "alto", "critico"]).optional(),
          averageWaitTime: z.number().optional(),
          waitingCount: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem atualizar unidades" });
        }
        const { id, ...data } = input;
        return await db.updateHealthUnit(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem deletar unidades" });
        }
        await db.deleteHealthUnit(input.id);
        return { success: true };
      }),

    seed: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem popular o banco" });
      }

      const sampleUnits = [
        {
          name: "UBS Central",
          type: "ubs" as const,
          address: "Rua Principal, 100 - Centro",
          latitude: "-23.550520",
          longitude: "-46.633308",
          phone: "(11) 3333-1111",
          occupancyLevel: "baixo" as const,
          averageWaitTime: 15,
          waitingCount: 3,
        },
        {
          name: "Posto de Saúde Jardim das Flores",
          type: "posto" as const,
          address: "Av. das Flores, 500 - Jardim das Flores",
          latitude: "-23.560520",
          longitude: "-46.643308",
          phone: "(11) 3333-2222",
          occupancyLevel: "medio" as const,
          averageWaitTime: 45,
          waitingCount: 12,
        },
        {
          name: "Hospital Municipal",
          type: "hospital" as const,
          address: "Rua da Saúde, 1000 - Vila Médica",
          latitude: "-23.540520",
          longitude: "-46.623308",
          phone: "(11) 3333-3333",
          occupancyLevel: "alto" as const,
          averageWaitTime: 90,
          waitingCount: 35,
        },
        {
          name: "UBS Vila Nova",
          type: "ubs" as const,
          address: "Rua Nova, 250 - Vila Nova",
          latitude: "-23.570520",
          longitude: "-46.653308",
          phone: "(11) 3333-4444",
          occupancyLevel: "critico" as const,
          averageWaitTime: 120,
          waitingCount: 50,
        },
        {
          name: "Posto de Saúde Parque Verde",
          type: "posto" as const,
          address: "Av. Verde, 800 - Parque Verde",
          latitude: "-23.530520",
          longitude: "-46.613308",
          phone: "(11) 3333-5555",
          occupancyLevel: "baixo" as const,
          averageWaitTime: 20,
          waitingCount: 5,
        },
      ];

      const created = [];
      for (const unit of sampleUnits) {
        try {
          const result = await db.createHealthUnit(unit);
          created.push(result);
        } catch (error) {
          // Ignora erros de duplicação
          console.log("Unit already exists, skipping:", unit.name);
        }
      }

      return { success: true, count: created.length };
    }),
  }),
});

export type AppRouter = typeof appRouter;
