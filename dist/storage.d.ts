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
export declare function initializeStorage(): void;
export declare function getDayFile(date: string): File;
export declare function saveEntry(content: string, title?: string): void;
export declare function setTitle(date: string, title: string): void;
export declare function getAllDates(): string[];
export declare function getTodayDateString(): string;
//# sourceMappingURL=storage.d.ts.map