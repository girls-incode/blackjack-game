import { describe, expect, it } from "vitest";
import { fakeLogger } from "../testing";
import { ConfigError, DeckError, handleError } from ".";

describe("handleError", () => {
  it.each([
    new ConfigError("bad config"),
    new DeckError("bad deck"),
    new TypeError("bug"),
  ])("reports errors with exit code 1 (%s)", (err) => {
    const logger = fakeLogger();

    expect(handleError(err, logger)).toBe(1);
    expect(logger.error).toHaveBeenCalledWith("Command failed", err);
  });
});
