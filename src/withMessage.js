class JestAssertionError extends Error {
  constructor(result, callsite) {
    super(result.message());
    this.matcherResult = result;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, callsite);
    }
  }
}

const wrapMatchers = (matchers, customMessage) => {
  return Object.keys(matchers).reduce((acc, name) => {
    const matcher = matchers[name];

    if (typeof matcher === 'function') {
      const newMatcher = (...args) => {
        try {
          matcher(...args);
        } catch (error) {
          if (typeof customMessage !== 'string' || customMessage.length < 1 || !error.matcherResult) {
            throw error;
          }

          const { matcherResult } = error;
          const message = () => 'Custom message:\n  ' + customMessage + '\n\n' + matcherResult.message();

          throw new JestAssertionError(Object.assign({}, matcherResult, { message }), newMatcher);
        }
      };
      return { ...acc, [name]: newMatcher };
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
