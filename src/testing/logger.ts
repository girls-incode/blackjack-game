import { vi } from "vitest";
import type { Logger } from "../logging";

export const fakeLogger = () => ({
  info: vi.fn<Logger["info"]>(),
  error: vi.fn<Logger["error"]>(),
});
