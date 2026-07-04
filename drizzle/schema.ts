import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, varchar as varcharType } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Entries table - stores all user entries (tasks, events, knowledge, notes)
 */
export const entries = mysqlTable("entries", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("user_id").notNull(),
  rawText: text("raw_text").notNull(),
  processedJson: json("processed_json"),
  type: mysqlEnum("type", ["task", "event", "knowledge", "note"]).default("note").notNull(),
  title: text("title"),
  datetime: timestamp("datetime"),
  endDatetime: timestamp("end_datetime"),
  recurrence: mysqlEnum("recurrence", ["none", "daily", "weekly", "monthly", "yearly"]).default("none").notNull(),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium").notNull(),
  status: mysqlEnum("status", ["pending", "done", "archived"]).default("pending").notNull(),
  tags: json("tags"),
  people: json("people"),
  notes: text("notes"),
  embedding: text("embedding"), // Vector embedding for semantic search (stored as JSON string)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Entry = typeof entries.$inferSelect;
export type InsertEntry = typeof entries.$inferInsert;

/**
 * Reminders table - stores reminders for entries
 */
export const reminders = mysqlTable("reminders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  entryId: varchar("entry_id", { length: 36 }).notNull(),
  remindAt: timestamp("remind_at").notNull(),
  message: text("message").notNull(),
  sent: boolean("sent").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

/**
 * Tags table - stores user-created tags with optional color
 */
export const tags = mysqlTable("tags", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).default("#3b82f6").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Settings table - stores user preferences
 */
export const settings = mysqlTable("settings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("user_id").notNull().unique(),
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }),
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }),
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  aiTone: mysqlEnum("ai_tone", ["formal", "casual"]).default("casual").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = typeof settings.$inferInsert;

/**
 * Relations
 */
export const entriesRelations = relations(entries, ({ many }) => ({
  reminders: many(reminders),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  entry: one(entries, {
    fields: [reminders.entryId],
    references: [entries.id],
  }),
}));