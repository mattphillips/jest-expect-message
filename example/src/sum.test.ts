import sum from "./sum";

describe("Test math", () => {
  it("should be equal 3", () => {
    expect(sum(1, 4), "it's not three").toBe(3);
  });
});
