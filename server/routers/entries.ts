import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { processEntryText } from "../lib/ai-client";
import {
  createEntry,
  getEntriesByUserId,
  getEntryById,
  updateEntry,
  getTagsByUserId,
  getSettingsByUserId,
} from "../db";
import { nanoid } from "nanoid";

export const entriesRouter = router({
  /**
   * Process raw text and create an entry
   */
  processEntry: protectedProcedure
    .input(z.object({ rawText: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Process the text with AI
        const processed = await processEntryText(input.rawText);

        // Create the entry in the database
        const entryId = nanoid();
        await createEntry({
          id: entryId,
          userId: ctx.user.id,
          rawText: input.rawText,
          processedJson: processed,
          type: processed.type,
          title: processed.title,
          datetime: processed.datetime ? new Date(processed.datetime) : null,
          endDatetime: processed.end_datetime ? new Date(processed.end_datetime) : null,
          recurrence: processed.recurrence,
          priority: processed.priority,
          status: "pending",
          tags: processed.tags,
          people: processed.people,
          notes: null,
          embedding: null,
        });

        return {
          success: true,
          entryId,
          processed,
        };
      } catch (error) {
        console.error("[Entries] Error processing entry:", error);
        throw error;
      }
    }),

  /**
   * Get all entries for the current user
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        type: z.enum(["task", "event", "knowledge", "note"]).optional(),
        status: z.enum(["pending", "done", "archived"]).optional(),
        tag: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let entries = await getEntriesByUserId(ctx.user.id, input.limit, input.offset);

        // Filter by type if provided
        if (input.type) {
          entries = entries.filter((e) => e.type === input.type);
        }

        // Filter by status if provided
        if (input.status) {
          entries = entries.filter((e) => e.status === input.status);
        }

        // Filter by tag if provided
        if (input.tag) {
          const tagToFind = input.tag;
          entries = entries.filter((e) => {
            const tags = e.tags as string[] | null;
            return tags?.includes(tagToFind) ?? false;
          });
        }

        return entries;
      } catch (error) {
        console.error("[Entries] Error listing entries:", error);
        throw error;
      }
    }),

  /**
   * Get a single entry by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const entry = await getEntryById(input.id);

        if (!entry) {
          throw new Error("Entry not found");
        }

        if (entry.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        return entry;
      } catch (error) {
        console.error("[Entries] Error getting entry:", error);
        throw error;
      }
    }),

  /**
   * Update an entry
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        type: z.enum(["task", "event", "knowledge", "note"]).optional(),
        status: z.enum(["pending", "done", "archived"]).optional(),
        priority: z.enum(["high", "medium", "low"]).optional(),
        datetime: z.string().optional(),
        endDatetime: z.string().optional(),
        tags: z.array(z.string()).optional(),
        people: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const entry = await getEntryById(input.id);

        if (!entry) {
          throw new Error("Entry not found");
        }

        if (entry.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        const updates: Record<string, any> = {};

        if (input.title !== undefined) updates.title = input.title;
        if (input.type !== undefined) updates.type = input.type;
        if (input.status !== undefined) updates.status = input.status;
        if (input.priority !== undefined) updates.priority = input.priority;
        if (input.datetime !== undefined) {
          updates.datetime = input.datetime ? new Date(input.datetime) : null;
        }
        if (input.endDatetime !== undefined) {
          updates.endDatetime = input.endDatetime ? new Date(input.endDatetime) : null;
        }
        if (input.tags !== undefined) updates.tags = input.tags;
        if (input.people !== undefined) updates.people = input.people;
        if (input.notes !== undefined) updates.notes = input.notes;

        await updateEntry(input.id, updates);

        return { success: true };
      } catch (error) {
        console.error("[Entries] Error updating entry:", error);
        throw error;
      }
    }),

  /**
   * Get entries for today
   */
  getToday: protectedProcedure.query(async ({ ctx }) => {
    try {
      const entries = await getEntriesByUserId(ctx.user.id, 100, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return entries.filter((e) => {
        if (!e.datetime) return false;
        return e.datetime >= today && e.datetime < tomorrow;
      });
    } catch (error) {
      console.error("[Entries] Error getting today entries:", error);
      throw error;
    }
  }),

  /**
   * Get entries for next 7 days
   */
  getUpcoming: protectedProcedure.query(async ({ ctx }) => {
    try {
      const entries = await getEntriesByUserId(ctx.user.id, 100, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      return entries.filter((e) => {
        if (!e.datetime) return false;
        return e.datetime >= today && e.datetime < nextWeek && e.status !== "done";
      });
    } catch (error) {
      console.error("[Entries] Error getting upcoming entries:", error);
      throw error;
    }
  }),

  /**
   * Get recently added entries
   */
  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      try {
        const allEntries = await getEntriesByUserId(ctx.user.id, 1000, 0);
        return allEntries
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, input.limit);
      } catch (error) {
        console.error("[Entries] Error getting recent entries:", error);
        throw error;
      }
    }),

  /**
   * Get all tags for the user
   */
  getTags: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getTagsByUserId(ctx.user.id);
    } catch (error) {
      console.error("[Entries] Error getting tags:", error);
      throw error;
    }
  }),

  /**
   * Get user settings
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getSettingsByUserId(ctx.user.id);
    } catch (error) {
      console.error("[Entries] Error getting settings:", error);
      throw error;
    }
  }),
});
