import path from "path";
import os from "os";

export const STORAGE_DIR = path.join(os.homedir(), ".cliary");
export const DB_PATH = path.join(STORAGE_DIR, "cliary.db");
