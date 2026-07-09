#!/usr/bin/env node
import { Command } from "commander";
import { registerCommands } from "./commands.js";
import { initializeStorage } from "./storage.js";
const program = new Command();
initializeStorage();
program.name("cliary").description("A simple CLI diary application").version("0.0.1");
registerCommands(program);
program.parse(process.argv);
//# sourceMappingURL=index.js.map