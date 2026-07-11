#!/usr/bin/env node

import { Command } from "commander";
import { registerCommands } from "./commands.js";
import { initializeDatabase } from "./db/db.js";
const program = new Command();

initializeDatabase();

program.name("cliary").description("A simple CLI diary application").version("0.0.1");

registerCommands(program);

program.parse(process.argv);