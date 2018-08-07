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
  return Object.keys(matchers).reduce((acc, key) => {
    const matcher = matchers[key];
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
    return Object.assign({}, acc, { [key]: newMatcher });
  }, {});
};

export default expect => {
  const expectProxy = (actual, customMessage) => wrapMatchers(expect(actual), customMessage); // partially apply expect to get all matchers and wrap them
  return Object.assign(expectProxy, expect); // clone additional properties on expect
};
