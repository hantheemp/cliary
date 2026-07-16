export interface MigrationFile {
  name: string;
  sql: string;
}
interface MinimalSqliteDatabase {
  exec(sql: string): void;
  prepare(sql: string): {
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): unknown;
  };
}

export function runMigrations(
  sqlite: MinimalSqliteDatabase,
  migrations: MigrationFile[],
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

  const sorted = [...migrations].sort((a, b) => a.name.localeCompare(b.name));

  for (const migration of sorted) {
    if (applied.has(migration.name)) continue;

    sqlite.exec(migration.sql);
    sqlite
      .prepare("INSERT INTO _migrations (name, applied_at) VALUES (?, ?)")
      .run(migration.name, new Date().toISOString());

    console.log(`Applied migration: ${migration.name}`);
  }
}
