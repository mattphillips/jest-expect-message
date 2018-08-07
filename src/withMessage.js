class JestAssertionError extends Error {
  constructor(result, callsite) {
    super(result.message());
    this.matcherResult = result;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, callsite);
    }
  }
}

export default expect => (actual, customMessage) => {
  const matchers = expect(actual);

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
