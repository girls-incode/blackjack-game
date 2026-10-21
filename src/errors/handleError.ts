import type { Logger } from "../logging";

export const handleError = (err: unknown, logger: Logger): number => {
  logger.error("Command failed", err);
  return 1;
};
