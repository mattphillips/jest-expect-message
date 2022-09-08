import './';

describe('jest-expect-message', () => {
  test('should fail with custom message', () => {
    expect(() => expect(false, 'Woah this should be false!').toBeTruthy()).toThrowErrorMatchingSnapshot();
  });

  test('should fail with custom message for async test', async () => {
    await expect(
      async () => await expect(Promise.reject(true), 'hello').rejects.toBe(false)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test('should fail without custom message', () => {
    expect(() => expect(false).toBeTruthy()).toThrowErrorMatchingSnapshot();
  });

  test('should pass when given custom message', () => {
    expect(1, 'should have been 1').toBe(1);
  });

  test('should pass when not given custom message', () => {
    expect(1).toBe(1);
  });

  describe('supports custom matchers registered after jest-expect-message', () => {
    expect.extend({
      toBeDivisibleBy(received, argument) {
        const pass = received % argument == 0;
        const message = pass
          ? () => `expected ${received} not to be divisible by ${argument}`
          : () => `expected ${received} to be divisible by ${argument}`;
        return { message, pass };
      }
    });

    it('allows new custom matchers to use custom messages', () => {
      expect(() => expect(100, '100 % 3 === 1').toBeDivisibleBy(3)).toThrowErrorMatchingSnapshot();
      expect(() => expect(101, '101 % 1 === 0').not.toBeDivisibleBy(1)).toThrowErrorMatchingSnapshot();
    });

    it('supports custom asymmetric matchers', () => {
      expect({ apples: 6, bananas: 3 }).toEqual({
        apples: expect.toBeDivisibleBy(1),
        bananas: expect.not.toBeDivisibleBy(2)
      });
    });
  });
});
