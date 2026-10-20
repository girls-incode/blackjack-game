import { inspect } from "node:util";
import type { Logger } from "../logging";
import { AppError } from "./appErrors";

export const EXIT_APP_ERROR = 1;
export const EXIT_UNEXPECTED_ERROR = 2;

/** Reports any error through `logger` in one consistent format and returns the process exit code. */
export const handleError = (err: unknown, logger: Logger): number => {
  if (err instanceof AppError) {
    logger.error(`Error: ${err.message}`, err);
    return EXIT_APP_ERROR;
  }
  logger.error(`Unexpected error: ${inspect(err)}`, err);
  return EXIT_UNEXPECTED_ERROR;
};
