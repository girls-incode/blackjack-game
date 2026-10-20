import { PassThrough } from "node:stream";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLAYER_NAME,
  promptPlayerName,
  sanitizePlayerName,
} from "./playerName";

const silentOutput = () => new PassThrough().resume();

/** Types `typed` (or closes the input when omitted) and returns the name. */
const ask = (typed?: string) => {
  const input = new PassThrough();
  const result = promptPlayerName(input, silentOutput());
  input.end(typed);
  return result;
};

describe("sanitizePlayerName", () => {
  it.each([
    ["Ivar", "Ivar"],
    ["  Ivar  ", "Ivar"],
    ["Iv|ar", "Ivar"],
    ["", DEFAULT_PLAYER_NAME],
    ["   ", DEFAULT_PLAYER_NAME],
    ["|", DEFAULT_PLAYER_NAME],
    ["Dealer", DEFAULT_PLAYER_NAME],
    [" dealer ", DEFAULT_PLAYER_NAME],
    ["DEALER", DEFAULT_PLAYER_NAME],
  ])("turns %j into %j", (raw, expected) => {
    expect(sanitizePlayerName(raw)).toBe(expected);
  });
});

describe("promptPlayerName", () => {
  it("returns the typed name", async () => {
    expect(await ask("Ivar\n")).toBe("Ivar");
  });

  it("falls back to the default on an empty line", async () => {
    expect(await ask("\n")).toBe(DEFAULT_PLAYER_NAME);
  });

  it("falls back to the default when the input closes without a line", async () => {
    expect(await ask()).toBe(DEFAULT_PLAYER_NAME);
  });

  it("releases the input once a name is read, so the process can exit", async () => {
    const input = new PassThrough();
    const result = promptPlayerName(input, silentOutput());
    input.write("Ivar\n");
    await result;

    expect(input.listenerCount("data")).toBe(0);
    expect(input.isPaused()).toBe(true);
    input.destroy();
  });
});
