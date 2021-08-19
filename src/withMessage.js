class JestAssertionError extends Error {
  constructor(result, callsite) {
    super(result.message());
    this.matcherResult = result;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, callsite);
    }
  }
}

const wrapMatcher = (matcher, customMessage, messageWrapper) => {
  const newMatcher = (...args) => {
    try {
      return matcher(...args);
    } catch (error) {
      if (!error.matcherResult) {
        throw error;
      }
      const { matcherResult } = error;

      if (typeof customMessage !== 'string' || customMessage.length < 1) {
        throw new JestAssertionError(matcherResult, newMatcher);
      }

      const customMessageResult = messageWrapper(customMessage);

      const message = () => `${customMessageResult}\n\n${matcherResult.message()}`;

      throw new JestAssertionError({ ...matcherResult, message }, newMatcher);
    }
  };
  return newMatcher;
};

const defaultMessageWrapper = message => `Custom message:\n  ${message}`;

const wrapMatchers = (matchers, customMessage, messageWrapper = defaultMessageWrapper) => {
  return Object.keys(matchers).reduce((acc, name) => {
    const matcher = matchers[name];

    if (typeof matcher === 'function') {
      return {
        ...acc,
        [name]: wrapMatcher(matcher, customMessage, messageWrapper)
      };
    }

    return {
      ...acc,
      [name]: wrapMatchers(matcher, customMessage, messageWrapper) // recurse on .not/.resolves/.rejects
    };
  }, {});
};

export default expect => {
  // proxy the expect function
  let expectProxy = Object.assign(
    (actual, customMessage, messageWrapper) => wrapMatchers(expect(actual), customMessage, messageWrapper), // partially apply expect to get all matchers and chain them
    expect // clone additional properties on expect
  );

  expectProxy.extend = o => {
    expect.extend(o); // add new matchers to expect
    expectProxy = Object.assign(expectProxy, expect); // clone new asymmetric matchers
  };

  return expectProxy;
};
