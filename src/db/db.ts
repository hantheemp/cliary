import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DB_PATH, STORAGE_DIR } from "../constants.js";
import * as schema from "./schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: BetterSQLite3Database<typeof schema> | null = null;

export function initializeDatabase(): BetterSQLite3Database<typeof schema> {
  if (db) {
    return db;
  }

  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }

  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  db = drizzle(sqlite, { schema });

  migrate(db, { migrationsFolder: path.join(__dirname, "migrations") });

  return db;
}
