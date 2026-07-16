import fs from "fs";
import path from "path";
import type { DatabaseSync } from "node:sqlite";

export function runMigrations(
  sqlite: DatabaseSync,
  migrationsFolder: string,
): void {
  sqlite.exec(
    `CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )`,
  );

  const applied = new Set(
    sqlite
      .prepare("SELECT name FROM _migrations")
      .all()
      .map((row) => (row as { name: string }).name),
  );

  const files = fs
    .readdirSync(migrationsFolder)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsFolder, file), "utf-8");
    sqlite.exec(sql);
    sqlite
      .prepare("INSERT INTO _migrations (name, applied_at) VALUES (?, ?)")
      .run(file, new Date().toISOString());

    console.log(`Applied migration: ${file}`);
  }
}
