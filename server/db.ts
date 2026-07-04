import { eq, lte, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, entries, reminders, tags, settings, InsertEntry, InsertSettings } from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Entry queries
 */
export async function getEntriesByUserId(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(entries)
    .where(eq(entries.userId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy((e) => e.createdAt);
  
  return result;
}

export async function getEntryById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(entries)
    .where(eq(entries.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createEntry(entry: InsertEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(entries).values(entry);
  return entry.id;
}

export async function updateEntry(id: string, updates: Partial<InsertEntry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(entries).set(updates).where(eq(entries.id, id));
}

/**
 * Reminder queries
 */
export async function getRemindersDueNow() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const result = await db
    .select()
    .from(reminders)
    .where((r) => and(lte(r.remindAt, now), eq(r.sent, false)));
  
  return result;
}

export async function markReminderAsSent(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(reminders).set({ sent: true }).where(eq(reminders.id, id));
}

/**
 * Tag queries
 */
export async function getTagsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(tags)
    .where(eq(tags.userId, userId))
    .orderBy((t) => t.name);
  
  return result;
}

/**
 * Settings queries
 */
export async function getSettingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSettings(userId: number, settingsData: Partial<InsertSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSettingsByUserId(userId);
  
  if (existing) {
    await db.update(settings).set(settingsData).where(eq(settings.userId, userId));
  } else {
    await db.insert(settings).values({
      id: nanoid(),
      userId,
      ...settingsData,
    });
  }
}


