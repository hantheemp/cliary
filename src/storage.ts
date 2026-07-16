import crypto from "crypto";
import { initializeDatabase } from "./db/db.js";

export interface Entry {
  uuid: string;
  timestamp: string;
  content: string;
}

export interface File {
  date: string;
  title?: string;
  correctedNarrative?: string;
  entries: Entry[];
}

function db() {
  return initializeDatabase();
}

async function ensureDayExists(date: string): Promise<void> {
  await db()
    .insertInto("days")
    .values({ date, title: null, correctedNarrative: null })
    .onConflict((oc) => oc.column("date").doNothing())
    .execute();
}

export async function getDayFile(date: string): Promise<File> {
  const dayRow = await db()
    .selectFrom("days")
    .selectAll()
    .where("date", "=", date)
    .executeTakeFirst();
  const entryRows = await db()
    .selectFrom("entries")
    .selectAll()
    .where("dayDate", "=", date)
    .execute();

  return {
    date,
    ...(dayRow?.title ? { title: dayRow.title } : {}),
    ...(dayRow?.correctedNarrative
      ? { correctedNarrative: dayRow.correctedNarrative }
      : {}),
    entries: entryRows.map((r) => ({
      uuid: r.uuid,
      timestamp: r.timestamp,
      content: r.content,
    })),
  };
}

export async function saveEntry(
  content: string,
  title?: string,
): Promise<void> {
  const today = getTodayDateString();
  await ensureDayExists(today);

  await db()
    .insertInto("entries")
    .values({
      dayDate: today,
      uuid: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      content: content.trim(),
    })
    .execute();

  if (title) {
    await setTitle(today, title);
  }
}

export async function setTitle(date: string, title: string): Promise<void> {
  await ensureDayExists(date);
  await db()
    .updateTable("days")
    .set({ title: title.trim() })
    .where("date", "=", date)
    .execute();
}

export async function setCorrectedNarrative(
  date: string,
  narrative: string,
): Promise<void> {
  await db()
    .updateTable("days")
    .set({ correctedNarrative: narrative })
    .where("date", "=", date)
    .execute();
}

export async function getAllDates(): Promise<string[]> {
  const rows = await db().selectFrom("days").select("date").execute();
  return rows.map((r) => r.date).sort();
}

export async function getUncorrectedDates(): Promise<string[]> {
  const rows = await db()
    .selectFrom("days")
    .select("date")
    .where("correctedNarrative", "is", null)
    .execute();
  return rows.map((r) => r.date);
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
