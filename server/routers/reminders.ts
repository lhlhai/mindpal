import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { reminders, entries } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const remindersRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        entryId: z.string(),
        remindAt: z.date(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify entry belongs to user
      const entry = await db
        .select()
        .from(entries)
        .where(and(eq(entries.id, input.entryId), eq(entries.userId, ctx.user.id)))
        .limit(1);

      if (!entry.length) {
        throw new Error("Entry not found");
      }

      const result = await db.insert(reminders).values({
        id: Math.random().toString(36).substring(2, 15),
        entryId: input.entryId,
        remindAt: input.remindAt,
        message: input.message || "",
        sent: false,
      });

      return { success: true };
    }),

  list: protectedProcedure
    .input(
      z.object({
        entryId: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db
        .select()
        .from(reminders)
        .innerJoin(entries, eq(reminders.entryId, entries.id))
        .where(
          input.entryId
            ? and(eq(entries.userId, ctx.user.id), eq(reminders.entryId, input.entryId))
            : eq(entries.userId, ctx.user.id)
        )
        .limit(input.limit)
        .offset(input.offset);

      return result.map((r: any) => r.reminders);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        remindAt: z.date().optional(),
        message: z.string().optional(),
        sent: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify reminder belongs to user
      const reminder = await db
        .select()
        .from(reminders)
        .innerJoin(entries, eq(reminders.entryId, entries.id))
        .where(
          and(
            eq(reminders.id, input.id),
            eq(entries.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!reminder.length) {
        throw new Error("Reminder not found");
      }

      const updateData: Record<string, any> = {};
      if (input.remindAt) updateData.remindAt = input.remindAt;
      if (input.message !== undefined) updateData.message = input.message;
      if (input.sent !== undefined) updateData.sent = input.sent;

      if (Object.keys(updateData).length > 0) {
        await db.update(reminders).set(updateData).where(eq(reminders.id, input.id));
      }

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify reminder belongs to user
      const reminder = await db
        .select()
        .from(reminders)
        .innerJoin(entries, eq(reminders.entryId, entries.id))
        .where(
          and(
            eq(reminders.id, input.id),
            eq(entries.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!reminder.length) {
        throw new Error("Reminder not found");
      }

      await db.delete(reminders).where(eq(reminders.id, input.id));

      return { success: true };
    }),

  getPending: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const now = new Date();
      const result = await db
        .select()
        .from(reminders)
        .innerJoin(entries, eq(reminders.entryId, entries.id))
        .where(
          and(
            eq(entries.userId, ctx.user.id),
            eq(reminders.sent, false),
            // Remind if remindAt is in the past or within 5 minutes
            // (simplified check - full implementation would use SQL date functions)
          )
        )
        .limit(input.limit);

      return result
        .map((r: any) => r.reminders)
        .filter((r: any) => {
          const remindTime = new Date(r.remindAt);
          return remindTime <= now;
        });
    }),
});
