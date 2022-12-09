import withMessage from './withMessage';

describe('withMessage()', () => {
  const ACTUAL = 'ACTUAL';

  test('does not remove additional methods from expect', () => {
    expect.assertions(3);
    const toBeMock = jest.fn();
    const expectMock = jest.fn(() => ({ toBe: toBeMock }));
    expectMock.any = 'any';
    const newExpect = withMessage(expectMock);
    newExpect(ACTUAL, 'should fail').toBe(ACTUAL);
    expect(newExpect.any).toBe('any');
    expect(expectMock).toHaveBeenCalledWith(ACTUAL);
    expect(toBeMock).toHaveBeenCalledWith(ACTUAL);
  });

  test('does not throw when matcher passes', () => {
    expect.assertions(2);
    const toBeMock = jest.fn();
    const expectMock = jest.fn(() => ({ toBe: toBeMock }));

    withMessage(expectMock)(ACTUAL, 'should fail').toBe(ACTUAL);
    expect(expectMock).toHaveBeenCalledWith(ACTUAL);
    expect(toBeMock).toHaveBeenCalledWith(ACTUAL);
  });

  test('does not throw when matcher passes when using not', () => {
    expect.assertions(2);
    const toBeMock = jest.fn();
    const expectMock = jest.fn(() => ({ not: { toBe: toBeMock } }));

    withMessage(expectMock)(ACTUAL, 'should fail').not.toBe(1);
    expect(expectMock).toHaveBeenCalledWith(ACTUAL);
    expect(toBeMock).toHaveBeenCalledWith(1);
  });

  test.each([undefined, ''])('throws original error when given message: %s', (message) => {
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

  test('calls custom message function when matcher fails', () => {
    expect.assertions(5);
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

    const customMessageFn = jest.fn(() => 'custom message from function');
    try {
      withMessage(expectMock)(ACTUAL, customMessageFn).toBe(1);
    } catch (e) {
      expect(e.matcherResult).toMatchObject({
        actual: ACTUAL,
        expected: 1,
        pass: false
      });
      expect(e.message).toMatchSnapshot();
      expect(customMessageFn).toHaveBeenCalled();
      expect(expectMock).toHaveBeenCalledWith(ACTUAL);
      expect(toBeMock).toHaveBeenCalledWith(1);
    }
  });

  test('throws error with custom message when not matcher fails', () => {
    expect.assertions(4);
    const originalError = new Error('Boo');
    originalError.matcherResult = {
      actual: ACTUAL,
      expected: 1,
      message: () => 'expected ACTUAL to not be ACTUAL',
      pass: false
    };

    const toBeMock = jest.fn(() => {
      throw originalError;
    });
    const expectMock = jest.fn(() => ({ not: { toBe: toBeMock } }));

    try {
      withMessage(expectMock)(ACTUAL, 'should fail').not.toBe(ACTUAL);
    } catch (e) {
      expect(e.matcherResult).toMatchObject({
        actual: ACTUAL,
        expected: 1,
        pass: false
      });
      expect(e.message).toMatchSnapshot();
      expect(expectMock).toHaveBeenCalledWith(ACTUAL);
      expect(toBeMock).toHaveBeenCalledWith(ACTUAL);
    }
  });

  it('calls original expect.extend when custom matcher is registered', () => {
    const extendMock = jest.fn();
    const expectMock = jest.fn();
    expectMock.extend = extendMock;
    const newMatcher = { newMatcher: 'woo' };

    withMessage(expectMock).extend(newMatcher);

    expect(extendMock).toHaveBeenCalledTimes(1);
    expect(extendMock).toHaveBeenCalledWith(newMatcher);
  });

  it('sets new asymmetric matchers when custom matcher is registered with expect.extend', () => {
    const expectMock = () => {};
    const extendMock = jest.fn((o) => Object.assign(expectMock, o));
    expectMock.a = 'a';
    expectMock.extend = extendMock;
    const newMatcher = { newMatcher: 'woo' };

    const actual = withMessage(expectMock);

    expect(actual).toContainAllKeys(['a', 'extend']);

    actual.extend(newMatcher);

    expect(extendMock).toHaveBeenCalledTimes(1);
    expect(extendMock).toHaveBeenCalledWith(newMatcher);
    expect(actual).toContainAllKeys(['a', 'extend', 'newMatcher']);
  });

  test('does not throw error with matcher message when `config.showMatcherMessage` is false', () => {
    expect.assertions(3);
    const originalError = new Error('Boo');
    const matcherMessage = 'expected ACTUAL to not be ACTUAL';
    originalError.matcherResult = {
      actual: ACTUAL,
      expected: 1,
      message: matcherMessage,
      pass: false
    };
    const toBeMock = jest.fn(() => {
      throw originalError;
    });
    const expectMock = jest.fn(() => ({ toBe: toBeMock }));

    const customMessage = 'should fail';
    try {
      withMessage(expectMock)(ACTUAL, customMessage, { showMatcherMessage: false }).toBe(1);
    } catch (e) {
      expect(e.stack).not.toBe(null);
      expect(e.message).toInclude(customMessage);
      expect(e.message).not.toInclude(matcherMessage);
    }
  });

  test('does not throw error with custom message prefix when `config.showPrefix` is false', () => {
    expect.assertions(4);
    const originalError = new Error('Boo');
    const matcherMessage = 'expected ACTUAL to not be ACTUAL';
    originalError.matcherResult = {
      actual: ACTUAL,
      expected: 1,
      message: matcherMessage,
      pass: false
    };
    const toBeMock = jest.fn(() => {
      throw originalError;
    });
    const expectMock = jest.fn(() => ({ toBe: toBeMock }));

    const customMessage = 'should fail';
    try {
      withMessage(expectMock)(ACTUAL, customMessage, { showPrefix: false }).toBe(1);
    } catch (e) {
      expect(e.stack).not.toBe(null);
      expect(e.message).not.toInclude('Custom message:\n');
      expect(e.message).toInclude(customMessage);
      expect(e.message).toInclude(matcherMessage);
    }
  });

  test('throws error containing only custom message prefix when `config.showPrefix` and `config.showMatcherMessage` are false', () => {
    expect.assertions(4);
    const originalError = new Error('Boo');
    const matcherMessage = 'expected ACTUAL to not be ACTUAL';
    originalError.matcherResult = {
      actual: ACTUAL,
      expected: 1,
      message: matcherMessage,
      pass: false
    };
    const toBeMock = jest.fn(() => {
      throw originalError;
    });
    const expectMock = jest.fn(() => ({ toBe: toBeMock }));

    const customMessage = 'should fail';
    try {
      withMessage(expectMock)(ACTUAL, customMessage, { showPrefix: false, showMatcherMessage: false }).toBe(1);
    } catch (e) {
      expect(e.stack).not.toBe(null);
      expect(e.message).not.toInclude('Custom message:\n');
      expect(e.message).not.toInclude(matcherMessage);
      expect(e.message).toInclude(customMessage);
    }
  });

  test('throws error with empty stack when `config.showStack` is false', () => {
    expect.assertions(4);
    const originalError = new Error('Boo');
    const matcherMessage = 'expected ACTUAL to not be ACTUAL';
    originalError.matcherResult = {
      actual: ACTUAL,
      expected: 1,
      message: matcherMessage,
      pass: false
    };
    const toBeMock = jest.fn(() => {
      throw originalError;
    });
    const expectMock = jest.fn(() => ({ toBe: toBeMock }));

    const customMessage = 'should fail';
    try {
      withMessage(expectMock)(ACTUAL, customMessage, { showStack: false }).toBe(1);
    } catch (e) {
      expect(e.stack).toBe(null);
      expect(e.message).toInclude('Custom message:\n');
      expect(e.message).toInclude(matcherMessage);
      expect(e.message).toInclude(customMessage);
    }
  });
});
