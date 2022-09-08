import sum from '../src/sum';

describe('Test math', () => {
  it('should be equal 3', () => {
    expect(sum(1, 4), "it's not three").toBe(3);
  });

  it('should be equal 3 without prefix', () => {
    expect(sum(1, 4), "it's not three", { showPrefix: false }).toBe(3);
  });

  it('should be equal 3 without matcher message', () => {
    expect(sum(1, 4), "it's not three", { showMatcherMessage: false }).toBe(3);
  });

  it('should be equal 3 without stack', () => {
    expect(sum(1, 4), "it's not three", { showStack: false }).toBe(3);
  });

  it('should be equal 3 with custom message only', () => {
    expect(sum(1, 4), "it's not three", { showStack: false, showPrefix: false, showMatcherMessage: false }).toBe(3);
  });
});
