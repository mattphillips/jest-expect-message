import './';

describe('jest-expect-message', () => {
  test('should fail with custom message', () => {
    expect(() => expect(false, 'Woah this should be false!').toBeTruthy()).toThrowErrorMatchingSnapshot();
  });

  test('should fail without custom message', () => {
    expect(() => expect(false).toBeTruthy()).toThrowErrorMatchingSnapshot();
  });
});
