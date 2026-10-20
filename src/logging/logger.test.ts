import { afterEach, describe, expect, it, vi } from "vitest";
import { consoleLogger } from "./logger";

describe("consoleLogger", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  it("writes info to stdout and errors to stderr", () => {
    consoleLogger.info("result");
    consoleLogger.error("failed", new Error("ignored by the console"));

    expect(log).toHaveBeenCalledExactlyOnceWith("result");
    expect(error).toHaveBeenCalledExactlyOnceWith("failed");
  });
});
