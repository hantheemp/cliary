#!/usr/bin/env node

import { Command } from "commander";
import readline from "readline";
import { registerCommands } from "./commands.js";
import { initializeDatabase } from "./db/db.js";
import { colors } from "./ui.js";
import { ensurePromptFile } from "./llm.js";

initializeDatabase();
ensurePromptFile();

function buildProgram(): Command {
  const program = new Command();
  program
    .name("cliary")
    .description("An interactive CLI journal application")
    .version("1.0.0");
  registerCommands(program);

 program.exitOverride();
  program.commands.forEach((cmd) => cmd.exitOverride());
  return program;
}

async function runOnce(args: string[]): Promise<void> {
  const program = buildProgram();
  try {
    await program.parseAsync(["node", "cliary", ...args]);
  } catch (err: any) {
    if (
      err.code !== "commander.helpDisplayed" &&
      err.code !== "commander.help"
    ) {
    }
  }
}

async function startInteractiveShell(): Promise<void> {
  console.clear();
  console.log(
    `${colors.bgCyan}${colors.bold} CLIARY INTERACTIVE SHELL v1.0.0 ${colors.reset}\n`,
  );
  console.log(
    `${colors.gray}Type commands directly (e.g. add "my note", view, list, correct)`,
  );
  console.log(
    `Type ${colors.yellow}'exit'${colors.gray} or ${colors.yellow}'quit'${colors.gray} to leave.${colors.reset}\n`,
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${colors.bold}${colors.green}cliary>${colors.reset} `,
  });

  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();

    if (input === "exit" || input === "quit") {
      rl.close();
      return;
    }

    if (input) {
      const args: string[] = [];
      const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
      let match;
      while ((match = regex.exec(input)) !== null) {
        args.push(match[1] || match[2] || match[0]);
      }
      await runOnce(args);
    }

    console.log();
    rl.prompt();
  });

  rl.on("close", () => {
    console.log(
      `\n${colors.italic}${colors.magenta}Journal closed. Goodbye!${colors.reset}`,
    );
    process.exit(0);
  });
}

if (process.argv.length <= 2) {
  await startInteractiveShell();
} else {
  await runOnce(process.argv.slice(2));
}
