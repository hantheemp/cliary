import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

export interface Entry {
  uuid: string;
  timestamp: string;
  content: string;
}

export interface File {
  date: string;
  title?: string;
  entries: Entry[];
}

const STORAGE_DIR = path.join(os.homedir(), ".cliary");

export function initializeStorage(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function getDailyFilePath(date: string): string {
  return path.join(STORAGE_DIR, `${date}.json`);
}

export function getDayFile(date: string): File {
  const filePath = getDailyFilePath(date);

  if (!fs.existsSync(filePath)) {
    return { date, entries: [] };
  }

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent) as File;
  } catch (error: any) {
    console.error(`Error reading day file for ${date}:`, error.message);
    return { date, entries: [] };
  }
}

function saveDayFile(dayFile: File): void {
  const filePath = getDailyFilePath(dayFile.date);
  fs.writeFileSync(filePath, JSON.stringify(dayFile, null, 2), "utf-8");
}

export function saveEntry(content: string, title?: string): void {
  const today = getTodayDateString();
  const dayFile = getDayFile(today);

  const newEntry: Entry = {
    uuid: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    content: content.trim(),
  };

  dayFile.entries.push(newEntry);
  if (title) {
    dayFile.title = title.trim();
  }

  saveDayFile(dayFile);
}

export function setTitle(date: string, title: string): void {
  const dayFile = getDayFile(date);
  dayFile.title = title.trim();
  saveDayFile(dayFile);
}

export function getAllDates(): string[] {
  const files = fs.readdirSync(STORAGE_DIR);
  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(".json", ""))
    .sort();
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
