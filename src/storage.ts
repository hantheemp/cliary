import { eq } from "drizzle-orm";
import crypto from "crypto";
import { initializeDatabase } from "./db/db.js";
import { days, entries as entriesTable } from "./db/schema.js";

export interface Entry {
  uuid: string;
  timestamp: string;
  content: string;
}

export interface File {
  date: string;
  title?: string;
  entries: Entry[];
}

function db() {
  return initializeDatabase();
}

function ensureDayExists(date: string): void {
  db()
    .insert(days)
    .values({ date })
    .onConflictDoNothing({ target: days.date })
    .run();
}

export function getDayFile(date: string): File {
  const dayRow = db().select().from(days).where(eq(days.date, date)).get();
  const entryRows = db()
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.dayDate, date))
    .all();

  return {
    date,
    ...(dayRow?.title ? { title: dayRow.title } : {}),
    entries: entryRows.map((r) => ({
      uuid: r.uuid,
      timestamp: r.timestamp,
      content: r.content,
    })),
  };
}

export function saveEntry(content: string, title?: string): void {
  const today = getTodayDateString();
  ensureDayExists(today);

  db()
    .insert(entriesTable)
    .values({
      dayDate: today,
      uuid: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      content: content.trim(),
    })
    .run();

  if (title) {
    setTitle(today, title);
  }
}

export function setTitle(date: string, title: string): void {
  ensureDayExists(date);
  db()
    .update(days)
    .set({ title: title.trim() })
    .where(eq(days.date, date))
    .run();
}

export function getAllDates(): string[] {
  const rows = db().select({ date: days.date }).from(days).all();
  return rows.map((r) => r.date).sort();
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
