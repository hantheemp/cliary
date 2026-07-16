import { DatabaseSync } from "node:sqlite";
import { Kysely, SqliteDialect, CamelCasePlugin } from "kysely";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { DB_PATH, STORAGE_DIR } from "../constants.js";
import { runMigrations } from "./migrate.js";
import type { DB } from "./schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: Kysely<DB> | null = null;

function toSqliteDialectDatabase(sqlite: DatabaseSync) {
  return {
    prepare: (sql: string) => {
      const stmt = sqlite.prepare(sql);
      return {
        all: (params: readonly unknown[]) =>
          stmt.all(...((params ?? []) as any[])),
        get: (params: readonly unknown[]) =>
          stmt.get(...((params ?? []) as any[])),
        run: (params: readonly unknown[]) => {
          const info = stmt.run(...((params ?? []) as any[]));
          return {
            changes: info.changes,
            lastInsertRowid: info.lastInsertRowid,
          };
        },
        iterate: (params: readonly unknown[]) =>
          stmt.iterate(...((params ?? []) as any[])),
        reader: sql.trim().toLowerCase().startsWith("select"),
      };
    },
    close: () => sqlite.close(),
  };
}

export function initializeDatabase(): Kysely<DB> {
  if (db) {
    return db;
  }

  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }

  const sqlite = new DatabaseSync(DB_PATH);
  sqlite.exec("PRAGMA journal_mode = WAL");
  sqlite.exec("PRAGMA foreign_keys = ON");

  runMigrations(sqlite, path.join(__dirname, "migrations"));

  db = new Kysely<DB>({
    dialect: new SqliteDialect({
      database: toSqliteDialectDatabase(sqlite),
    }),
    plugins: [new CamelCasePlugin()],
  });

  return db;
}
