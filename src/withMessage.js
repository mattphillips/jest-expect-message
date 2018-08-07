class JestAssertionError extends Error {
  constructor(result, callsite) {
    super(result.message());
    this.matcherResult = result;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, callsite);
    }
  }
}

const wrapMatcher = (matcher, customMessage) => {
  const newMatcher = (...args) => {
    try {
      matcher(...args);
    } catch (error) {
      if (typeof customMessage !== 'string' || customMessage.length < 1 || !error.matcherResult) {
        throw error;
      }

      const { matcherResult } = error;
      const message = () => 'Custom message:\n  ' + customMessage + '\n\n' + matcherResult.message();

      throw new JestAssertionError({ ...matcherResult, message }, newMatcher);
    }
  };
  return newMatcher;
};

const wrapMatchers = (matchers, customMessage) => {
  return Object.keys(matchers).reduce((acc, name) => {
    const matcher = matchers[name];

    if (typeof matcher === 'function') {
      return {
        ...acc,
        [name]: wrapMatcher(matcher, customMessage)
      };
    }

    return {
      ...acc,
      [name]: wrapMatchers(matcher, customMessage) // recurse on .not/.resolves/.rejects
    };
  }, {});
};

export default expect => {
  const expectProxy = (actual, customMessage) => wrapMatchers(expect(actual), customMessage); // partially apply expect to get all matchers and wrap them
  return Object.assign(expectProxy, expect); // clone additional properties on expect
};
