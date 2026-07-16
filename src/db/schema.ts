import type { Generated } from "kysely";
export interface DaysTable {
  date: string;
  title: string | null;
  correctedNarrative: string | null;
}

export interface EntriesTable {
  id: Generated<number>;
  dayDate: string;
  uuid: string;
  timestamp: string;
  content: string;
}

export interface SettingsTable {
  key: string;
  value: string | null;
}

export interface DB {
  days: DaysTable;
  entries: EntriesTable;
  settings: SettingsTable;
}
