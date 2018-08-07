import withMessage from './withMessage';

describe('withMessage()', () => {
  const ACTUAL = 'ACTUAL';

  test('does not remove additional methods from expect', () => {
    expect.assertions(3);
    const toBeMock = jest.fn();
    const expectMock = jest.fn(() => ({ toBe: toBeMock }));
    expectMock.extend = 'extend';

    const newExpect = withMessage(expectMock);
    newExpect(ACTUAL, 'should fail').toBe(1);
    expect(newExpect.extend).toBe('extend');
    expect(expectMock).toHaveBeenCalledWith(ACTUAL);
    expect(toBeMock).toHaveBeenCalledWith(1);
  });

  test('does not throw when matcher passes', () => {
    expect.assertions(2);
    const toBeMock = jest.fn();
    const expectMock = jest.fn(() => ({ toBe: toBeMock }));

    withMessage(expectMock)(ACTUAL, 'should fail').toBe(1);
    expect(expectMock).toHaveBeenCalledWith(ACTUAL);
    expect(toBeMock).toHaveBeenCalledWith(1);
  });

  test.each([undefined, ''])('throws original error when given message: %s', message => {
    expect.assertions(3);
    const originalError = new Error('Boo');
    const toBeMock = jest.fn(() => {
      throw originalError;
    });
    const expectMock = jest.fn(() => ({ toBe: toBeMock }));

    try {
      withMessage(expectMock)(ACTUAL, message).toBe(1);
    } catch (e) {
      expect(e).toBe(originalError);
      expect(expectMock).toHaveBeenCalledWith(ACTUAL);
      expect(toBeMock).toHaveBeenCalledWith(1);
    }
  });

  test('throws original error when matcher error does not contain matcherResult', () => {
    expect.assertions(3);
    const originalError = new Error('Boo');
    const toBeMock = jest.fn(() => {
      throw originalError;
    });
    const expectMock = jest.fn(() => ({ toBe: toBeMock }));

    try {
      withMessage(expectMock)(ACTUAL, 'should fail').toBe(1);
    } catch (e) {
      expect(e).toBe(originalError);
      expect(expectMock).toHaveBeenCalledWith(ACTUAL);
      expect(toBeMock).toHaveBeenCalledWith(1);
    }
  });

  test('throws error with custom message when matcher fails', () => {
    expect.assertions(4);
    const originalError = new Error('Boo');
    originalError.matcherResult = {
      actual: ACTUAL,
      expected: 1,
      message: () => 'expected ACTUAL to be 1',
      pass: false
    };

    const toBeMock = jest.fn(() => {
      throw originalError;
    });
    const expectMock = jest.fn(() => ({ toBe: toBeMock }));

    try {
      withMessage(expectMock)(ACTUAL, 'should fail').toBe(1);
    } catch (e) {
      expect(e.matcherResult).toMatchObject({
        actual: ACTUAL,
        expected: 1,
        pass: false
      });
      expect(e.message).toMatchSnapshot();
      expect(expectMock).toHaveBeenCalledWith(ACTUAL);
      expect(toBeMock).toHaveBeenCalledWith(1);
    }
  });
});
