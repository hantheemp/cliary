import { initializeDatabase } from "./db/db.js";

export interface EngineConfig {
  engine: "none" | "ollama";
  ollamaUrl: string | undefined;
  ollamaModel: string | undefined;
}

function db() {
  return initializeDatabase();
}

export async function getSetting(key: string): Promise<string | undefined> {
  const row = await db()
    .selectFrom("settings")
    .selectAll()
    .where("key", "=", key)
    .executeTakeFirst();
  return row?.value ?? undefined;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db()
    .insertInto("settings")
    .values({ key, value })
    .onConflict((oc) => oc.column("key").doUpdateSet({ value }))
    .execute();
}

export async function getEngineConfig(): Promise<EngineConfig> {
  const engine =
    ((await getSetting("engine")) as "none" | "ollama" | undefined) ?? "none";
  return {
    engine,
    ollamaUrl: await getSetting("ollama_url"),
    ollamaModel: await getSetting("ollama_model"),
  };
}
