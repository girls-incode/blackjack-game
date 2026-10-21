import pino from "pino";

export interface Logger {
  info(message: string): void;
  error(message: string, error?: unknown): void;
}

const errorLogger = pino({}, process.stderr);

export const pinoLogger: Logger = {
  info: (message) => {
    process.stdout.write(`${message}\n`);
  },
  error: (message, error) => {
    errorLogger.error({ err: error }, message);
  },
};
