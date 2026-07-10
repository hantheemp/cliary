import Database from "better-sqlite3";
import { DB_PATH } from "./constants.js";

let db: Database.Database | null = null;

export function initializeDatabase(): Database.Database {
  if (db) {
    return db;
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL"); // WAL - Write Ahead Logging for simulteaneous reads and writes.
  return db;
}

export function initializeTables(): void {
    
}
