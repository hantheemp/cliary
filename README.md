# CLIary

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57)
![Ollama](https://img.shields.io/badge/Local%20LLM-Ollama-black)

> Privacy-first terminal journaling powered by local LLMs.

CLIary is a lightweight command-line journal that lets you capture thoughts as they happen throughout the day.

Instead of sitting down to write a complete journal entry every evening, simply record quick notes whenever something happens. When the day is over, CLIary uses your local language model to transform those fragmented notes into a polished, coherent journal entry. Everything runs locally, so your journal stays on your machine.

---

## Why CLIary?

Most journaling apps expect you to sit down and write everything at once.

CLIary takes a different approach.

Capture thoughts naturally throughout the day:

```bash
cliary add "Finished implementing authentication."
cliary add "Had a productive meeting with the backend team."
cliary add "Need to refactor the caching layer tomorrow."
```

When you're done, generate your daily journal:

```bash
cliary correct
```

Your local language model turns scattered notes into a natural journal entry while preserving what you originally wrote.

---

## Features

- Terminal-first journaling
- Local LLM support through Ollama
- Privacy-first. Your journal never leaves your machine.
- SQLite storage with Drizzle ORM
- Interactive shell mode
- Fully customizable prompts
- Original notes are always preserved
- Works with OpenAI-compatible APIs

---

## Requirements

- **Node.js 22 LTS or newer** (CLIary uses native modules that are version-sensitive;
  older or very new/experimental Node releases may not have prebuilt binaries available yet)
- **npm** (comes bundled with Node.js)
- (Optional, for the `correct` command) [Ollama](https://ollama.com) or any other
  OpenAI-compatible local LLM server

---

## Installation

```bash
git clone https://github.com/hantheemp/cliary.git
cd cliary

npm install
npm run build
npm link
```

---

## Quick Start

Add notes throughout your day:

```bash
cliary add "Started working on the payment service."
cliary add "Fixed the race condition."
cliary add "Gym after work."
```

Generate your journal:

```bash
cliary correct
```

View today's journal:

```bash
cliary view
```

---

## Commands

| Command | Description |
| -------- | ----------- |
| `add <text>` | Add a new journal note |
| `view` | View today's journal |
| `view --raw` | View the original notes |
| `correct` | Generate a polished journal entry using your local LLM |
| `title` | Set today's journal title |
| `list` | Browse previous journal entries |
| `config` | Configure your LLM provider |

---

## Local LLM Setup

CLIary is designed to work with local language models through Ollama. It also supports any OpenAI-compatible API.

Example configuration:

```text
Provider: Ollama
Endpoint: http://localhost:11434/v1
Model: llama3
```

Compatible models include:

- Llama
- Qwen
- Gemma
- Mistral
- DeepSeek

---

## Prompt Customization

CLIary stores the correction prompt in a plain text file, making it easy to customize the writing style.

For example, you can ask the model to:

- Write in a more formal tone
- Keep the writing concise
- Improve grammar only
- Preserve bullet points
- Produce more descriptive journal entries

---

## How It Works

```text
Quick Notes
     │
     ▼
SQLite Database
     │
     ▼
Local LLM
     │
     ▼
Daily Journal
```

CLIary keeps both versions of your journal.

- Your original notes
- The generated journal entry

You can switch between them whenever you like.

---

## Troubleshooting

### `Error: ... was compiled against a different Node.js version` or `Could not locate the bindings file`

CLIary uses `better-sqlite3`, which relies on a native module that must match your exact Node.js
version. If you see either of these errors, rebuild the native module against your current Node version:

```bash
npm rebuild better-sqlite3
```

If that doesn't help, do a clean reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
npm link
```

If you recently switched Node.js versions (e.g. via `nvm`), make sure you re-run the steps above
*after* switching — native modules built for one Node version will not load under another.

### `cliary` command not found after `npm link`

Make sure `npm run build` completed successfully and produced a `dist/index.js` file before running
`npm link`. If you change the package `name` in `package.json`, run `npm unlink -g <old-name>` before
linking again under the new name.

---

## Built With

- TypeScript
- Commander.js
- Better SQLite3
- Drizzle ORM
- Native fetch (OpenAI-compatible API)
- Ollama

---

## License

MIT
