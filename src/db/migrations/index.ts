import * as m0001 from "./0001_initial.js";
import type { MigrationFile } from "../migrate.js";

export const migrations: MigrationFile[] = [{ name: m0001.name, sql: m0001.sql }];