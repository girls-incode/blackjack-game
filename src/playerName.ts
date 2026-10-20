import { createInterface } from "node:readline/promises";

export const DEFAULT_PLAYER_NAME = "You";

export const sanitizePlayerName = (raw: string): string => {
  const name = raw.replaceAll("|", "").trim();

  if (!name || name.toLowerCase() === "dealer") return DEFAULT_PLAYER_NAME;
  return name;
};

/**
 * Asks for the player's name on `output` (stderr by default, so stdout keeps only
 * the game result). Returns the default name when no line is entered before the input closes.
 */
export const promptPlayerName = async (
  input: NodeJS.ReadableStream = process.stdin,
  output: NodeJS.WritableStream = process.stderr,
): Promise<string> => {
  const rl = createInterface({ input, output, prompt: "Enter your name: " });
  rl.prompt();

  for await (const line of rl) {
    rl.close();
    return sanitizePlayerName(line);
  }
  output.write("\n");
  return DEFAULT_PLAYER_NAME;
};
