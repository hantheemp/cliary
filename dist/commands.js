import { Command } from "commander";
import { getAllDates, getDayFile, getTodayDateString, saveEntry, setTitle, } from "./storage.js";
export function registerCommands(program) {
    add(program);
    list(program);
    view(program);
    title(program);
}
function add(program) {
    program
        .command("add")
        .description("Add a new diary entry. If no text is provided, system's default text editor will be opened.")
        .argument("[note]", "The raw, unformatted text of the diary entry.")
        .option("-t, --title <string>", "Set/overwrite today's title at the same time.")
        .action((note, options) => {
        if (!note) {
            console.log("No note provided. Opening the system's default text editor...");
            return;
        }
        saveEntry(note, options.title);
        console.log("Diary entry added successfully.");
    });
}
function title(program) {
    program
        .command("title")
        .description("Set or overwrite the title for a given date (defaults to today).")
        .argument("<title>", "The title to remember this day by.")
        .option("--date <string>", "The date to set the title for (e.g., 2026-07-09). Defaults to today.")
        .action((titleText, options) => {
        const targetDate = options.date ?? getTodayDateString();
        setTitle(targetDate, titleText);
        console.log(`Title saved for ${targetDate}: "${titleText}"`);
    });
}
function list(program) {
    program
        .command("list")
        .description("List all dates that have diary entries.")
        .action(() => {
        const dates = getAllDates();
        if (dates.length === 0) {
            console.log("No diary entries found.");
            return;
        }
        console.log(`${dates.length} dates have diary entries:`);
        dates.forEach((date) => {
            const dayFile = getDayFile(date);
            const suffix = dayFile.title ? ` - ${dayFile.title}` : "";
            console.log(`  ${date}${suffix}`);
        });
    });
}
function view(program) {
    program
        .command("view")
        .description("Lists all diary entries for a specific date. If no date is provided, it will show today's entries.")
        .option("--date <string>", "The date for which to display entries (e.g., 2026-07-09)")
        .action((options) => {
        const targetDate = options.date ?? getTodayDateString();
        const dayFile = getDayFile(targetDate);
        if (dayFile.entries.length === 0) {
            console.log(`${targetDate} - No diary entries found.`);
            return;
        }
        const header = dayFile.title
            ? `${targetDate} - ${dayFile.title} - ${dayFile.entries.length} entries:`
            : `${targetDate} - ${dayFile.entries.length} entries:`;
        console.log(`${header}\n`);
        dayFile.entries.forEach((entry) => {
            console.log(`[${entry.timestamp}]`);
            console.log(entry.content);
            console.log("---");
        });
    });
}
//# sourceMappingURL=commands.js.map