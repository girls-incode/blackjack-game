import { describe, expect, it } from "vitest";
import { fakeLogger } from "../testing";
import {
  AppError,
  ConfigError,
  DeckError,
  EXIT_APP_ERROR,
  EXIT_UNEXPECTED_ERROR,
  handleError,
} from ".";

describe("handleError", () => {
  it.each([new ConfigError("bad config"), new DeckError("bad deck")])(
    "reports expected errors briefly with exit code 1 (%s)",
    (err) => {
      const logger = fakeLogger();

      expect(handleError(err, logger)).toBe(EXIT_APP_ERROR);
      expect(logger.error).toHaveBeenCalledWith(`Error: ${err.message}`, err);
    },
  );
  it("reports unexpected errors with their stack and exit code 2", () => {
    const err = new TypeError("bug");
    const logger = fakeLogger();

    expect(handleError(err, logger)).toBe(EXIT_UNEXPECTED_ERROR);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Unexpected error: TypeError: bug\n    at "),
      err,
    );
  });
  it("names errors after their class", () => {
    expect(new DeckError("x").name).toBe("DeckError");
    expect(new DeckError("x")).toBeInstanceOf(AppError);
  });
});
