import { describe, expect, it } from "vitest";
import { cards } from "../testing";
import { formatResult } from "./format";
import { createStandardBlackjackGame } from "./standardBlackjackGame";

describe("formatResult", () => {
  it("prints the required round output", () => {
    const result = createStandardBlackjackGame().play(
      cards("H10,H7,S10,S6,SK"),
    );

    expect(formatResult(result)).toBe(
      "Winner: You\nDealer | 26 | S10,S6,SK\nYou | 17 | H10,H7",
    );
  });
});
