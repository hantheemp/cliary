import fs from "fs";
import { PROMPT_PATH } from "./constants.js";
import { DEFAULT_PROMPT } from "./DEFAULT_PROMPT.js";

export function ensurePromptFile(): void {
  if (!fs.existsSync(PROMPT_PATH)) {
    fs.writeFileSync(PROMPT_PATH, DEFAULT_PROMPT, "utf-8");
    console.log(`Default prompt file created at ${PROMPT_PATH}`);
  }
}

export function promptFile(): string {
  return fs.readFileSync(PROMPT_PATH, "utf-8");
}

export async function pingLLM(baseUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/models`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function correctNote(
  rawContent: string,
  model: string,
  baseUrl: string,
): Promise<string> {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: promptFile() },
        { role: "user", content: rawContent },
      ],
      stream: false,
      temperature: 0,
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM server error: ${res.status}`);
  }

  const data = (await res.json()) as any;
  const corrected = data.choices?.[0]?.message?.content?.trim();

  if (!corrected) {
    throw new Error("The model returned an empty response.");
  }
  return corrected;
}
