import { Command } from "commander";
import {
  getAllDates,
  getDayFile,
  getTodayDateString,
  saveEntry,
  setTitle,
  setCorrectedNarrative,
  getUncorrectedDates,
} from "./storage.js";
import { setSetting, getEngineConfig } from "./config.js";
import { pingLLM, correctNote } from "./llm.js";
import { ui, colors } from "./ui.js";

export function registerCommands(program: Command) {
  add(program);
  list(program);
  view(program);
  title(program);
  config(program);
  correct(program);
}

function add(program: Command): void {
  program
    .command("add")
    .description("Add a new journal entry.")
    .argument("[note]", "Entry content")
    .option("-t, --title <string>", "Also set today's title at the same time.")
    .action(async (note: string | undefined, options: { title?: string }) => {
      if (!note) {
        ui.warn("Entry content cannot be empty.");
        return;
      }
      await saveEntry(note, options.title);
      ui.success("Entry saved.");
    });
}

function title(program: Command): void {
  program
    .command("title")
    .description("Set the title for a given date (defaults to today).")
    .argument("<title>", "Title text")
    .option("--date <string>", "Target date (YYYY-MM-DD). Defaults to today.")
    .action(async (titleText: string, options: { date?: string }) => {
      const targetDate = options.date ?? getTodayDateString();
      await setTitle(targetDate, titleText);
      ui.success(`Title saved for ${targetDate}: "${titleText}"`);
    });
}

function list(program: Command): void {
  program
    .command("list")
    .description("List every date that has journal entries.")
    .action(async () => {
      const dates = await getAllDates();
      if (dates.length === 0) {
        ui.warn("No journal entries found.");
        return;
      }
      ui.heading(`${dates.length} day(s) recorded:`);
      for (const date of dates) {
        const dayFile = await getDayFile(date);
        const suffix = dayFile.title
          ? ` - ${colors.magenta}${dayFile.title}${colors.reset}`
          : "";
        console.log(`  ${colors.green}*${colors.reset} ${date}${suffix}`);
      }
    });
}

function view(program: Command): void {
  program
    .command("view")
    .description("Show the entries for a given date (defaults to today).")
    .option("--date <string>", "Target date (YYYY-MM-DD)")
    .option(
      "--raw",
      "Show the original, unmerged entries instead of the corrected narrative.",
    )
    .action(async (options: { date?: string; raw?: boolean }) => {
      const targetDate = options.date ?? getTodayDateString();
      const dayFile = await getDayFile(targetDate);

      if (dayFile.entries.length === 0) {
        ui.warn(`No entries found for ${targetDate}.`);
        return;
      }

      const titlePart = dayFile.title ? ` - "${dayFile.title}"` : "";
      ui.heading(
        `${targetDate}${titlePart} (${dayFile.entries.length} entries)`,
      );
      ui.divider();

      if (!options.raw && dayFile.correctedNarrative) {
        console.log(dayFile.correctedNarrative);
        ui.divider();
        return;
      }

      if (!options.raw) {
        console.log(
          `${colors.dim}${colors.gray}(This day has not been corrected yet. Run 'cliary correct' to merge it.)${colors.reset}`,
        );
        ui.divider();
      }

      dayFile.entries.forEach((entry) => {
        console.log(`${colors.gray}[${entry.timestamp}]${colors.reset}`);
        console.log(
          options.raw
            ? `${colors.yellow}${entry.content}${colors.reset}`
            : entry.content,
        );
        ui.divider();
      });
    });
}

function config(program: Command): void {
  program
    .command("config")
    .description("Update the LLM engine configuration.")
    .requiredOption("--engine <engine>", "'none' or 'ollama'")
    .option(
      "--url <string>",
      "OpenAI-compatible base URL, e.g. http://localhost:11434/v1",
    )
    .option("--model <string>", "Model name, e.g. llama3")
    .action(
      async (options: { engine: string; url?: string; model?: string }) => {
        if (options.engine !== "none" && options.engine !== "ollama") {
          ui.error("Invalid engine. Use 'none' or 'ollama'.");
          return;
        }
        await setSetting("engine", options.engine);
        if (options.url) await setSetting("ollama_url", options.url);
        if (options.model) await setSetting("ollama_model", options.model);
        ui.success(`Configuration updated. Active engine: ${options.engine}`);
      },
    );
}

function correct(program: Command): void {
  program
    .command("correct")
    .description(
      "Merge a day's entries into one corrected narrative using a local LLM.",
    )
    .option(
      "--date <string>",
      "Target a specific date (YYYY-MM-DD). Defaults to today.",
    )
    .option("--all", "Process every day that has not been corrected yet.")
    .option(
      "--force",
      "Re-run correction even if the day already has a narrative.",
    )
    .option(
      "--model <string>",
      "Override the configured model for this run only.",
    )
    .option(
      "--url <string>",
      "Override the configured server URL for this run only.",
    )
    .action(
      async (options: {
        date?: string;
        all?: boolean;
        force?: boolean;
        model?: string;
        url?: string;
      }) => {
        if (options.date && options.all) {
          ui.error("--date and --all cannot be used together.");
          return;
        }

        const stored = await getEngineConfig();
        const url = options.url ?? stored.ollamaUrl;
        const model = options.model ?? stored.ollamaModel;

        if (stored.engine !== "ollama" || !url || !model) {
          ui.error("No local model configured. Run 'cliary config' first.");
          return;
        }

        if (!(await pingLLM(url))) {
          ui.error(`Could not reach the LLM server: ${url}`);
          return;
        }

        let targetDates: string[];

        if (options.all) {
          targetDates = await getUncorrectedDates();
          if (targetDates.length === 0) {
            ui.warn("No uncorrected days found.");
            return;
          }
        } else {
          const date = options.date ?? getTodayDateString();
          const dayFile = await getDayFile(date);

          if (dayFile.entries.length === 0) {
            ui.warn(`No entries found for ${date}.`);
            return;
          }
          if (dayFile.correctedNarrative && !options.force) {
            ui.warn(
              `${date} already has a corrected narrative. Use --force to redo it.`,
            );
            return;
          }
          targetDates = [date];
        }

        ui.info(`Processing ${targetDates.length} day(s)...`);
        for (const date of targetDates) {
          await correctDay(date, model, url);
        }
        ui.success("Correction completed.");
      },
    );
}

async function correctDay(
  date: string,
  model: string,
  url: string,
): Promise<void> {
  const dayFile = await getDayFile(date);
  if (dayFile.entries.length === 0) return;

  const combinedText = dayFile.entries
    .map((e) => `[${formatTime(e.timestamp)}] ${e.content}`)
    .join("\n");

  try {
    const narrative = await correctNote(combinedText, model, url);
    const heading = dayFile.title
      ? `# ${date} - ${dayFile.title}`
      : `# ${date}`;
    await setCorrectedNarrative(date, `${heading}\n\n${narrative}`);
  } catch (e) {
    ui.error(`Failed to correct ${date}: ${(e as Error).message}`);
  }
}

function formatTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
