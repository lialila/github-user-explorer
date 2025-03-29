import cropText from "./cropText";

describe("The cropText util", () => {
  it("truncates text to the specified length and appends an ellipsis", () => {
    const result = cropText("Very long text title", 9);

    expect(result).toBe("Very long...");
  });

  it("does not do anything if the text is shorter than the specified length", () => {
    const result = cropText("Short text", 10);

    expect(result).toBe("Short text");
  });
});
