import { describe } from "node:test";
import formatDate from "./formatDate";

describe("The formatDate util", () => {
  it("returns the formatted date", () => {
    expect(formatDate(new Date("2021-10-01T00:00:00Z"))).toBe("Oct 1 2021");
  });
});
