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
      return matcher(...args);
    } catch (error) {
      if (!error.matcherResult) {
        throw error;
      }
      const { matcherResult } = error;

      if (typeof customMessage !== 'string' || customMessage.length < 1) {
        throw new JestAssertionError(matcherResult, newMatcher);
      }

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
      acc[name] = wrapMatcher(matcher, customMessage);
    } else {
      acc[name] = wrapMatchers(matcher, customMessage); // recurse on .not/.resolves/.rejects
    }

    return acc;
  }, {});
};

export default expect => {
  // proxy the expect function
  let expectProxy = Object.assign(
    (actual, customMessage) => wrapMatchers(expect(actual), customMessage), // partially apply expect to get all matchers and chain them
    expect // clone additional properties on expect
  );

  expectProxy.extend = o => {
    expect.extend(o); // add new matchers to expect
    expectProxy = Object.assign(expectProxy, expect); // clone new asymmetric matchers
  };

  return expectProxy;
};
