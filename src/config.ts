import { eq } from "drizzle-orm";
import { initializeDatabase } from "./db/db.js";
import { settings } from "./db/schema.js";

export interface EngineConfig {
  engine: "none" | "ollama";
  ollamaUrl: string | undefined;
  ollamaModel: string | undefined;
}

function db() {
  return initializeDatabase();
}

export function getSetting(key: string): string | undefined {
  const row = db().select().from(settings).where(eq(settings.key, key)).get();
  return row?.value ?? undefined;
}

export function setSetting(key: string, value: string): void {
  db()
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();
}

export function getEngineConfig(): EngineConfig {
  const engine =
    (getSetting("engine") as "none" | "ollama" | undefined) ?? "none";
  return {
    engine,
    ollamaUrl: getSetting("ollama_url"),
    ollamaModel: getSetting("ollama_model"),
  };
}
