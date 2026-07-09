import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
const STORAGE_DIR = path.join(os.homedir(), ".cliary");
export function initializeStorage() {
    if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
}
function getDailyFilePath(date) {
    return path.join(STORAGE_DIR, `${date}.json`);
}
export function getDayFile(date) {
    const filePath = getDailyFilePath(date);
    if (!fs.existsSync(filePath)) {
        return { date, entries: [] };
    }
    try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(fileContent);
    }
    catch (error) {
        console.error(`Error reading day file for ${date}:`, error.message);
        return { date, entries: [] };
    }
}
function saveDayFile(dayFile) {
    const filePath = getDailyFilePath(dayFile.date);
    fs.writeFileSync(filePath, JSON.stringify(dayFile, null, 2), "utf-8");
}
export function saveEntry(content, title) {
    const today = getTodayDateString();
    const dayFile = getDayFile(today);
    const newEntry = {
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
export function setTitle(date, title) {
    const dayFile = getDayFile(date);
    dayFile.title = title.trim();
    saveDayFile(dayFile);
}
export function getAllDates() {
    const files = fs.readdirSync(STORAGE_DIR);
    return files
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.replace(".json", ""))
        .sort();
}
export function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
//# sourceMappingURL=storage.js.map