import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const days = sqliteTable("days", {
  date: text("date").primaryKey(),
  title: text("title"),
});

export const entries = sqliteTable("entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dayDate: text("day_date").notNull().references(() => days.date),
  uuid: text("uuid").notNull().unique(),
  timestamp: text("timestamp").notNull(),
  content: text("content").notNull(),
});