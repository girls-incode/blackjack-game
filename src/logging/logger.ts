export interface Logger {
  info(message: string): void;
  error(message: string, error?: unknown): void;
}

/** Writes the result to stdout and failures to stderr. */
export const consoleLogger: Logger = {
  info: (message) => console.log(message),
  error: (message) => console.error(message),
};
