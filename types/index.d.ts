declare namespace jest {
  interface Expect {
    <T = any>(
      actual: T,
      message?: string | (() => string),
      options?: { showMatcherMessage?: boolean; showPrefix?: boolean; showStack?: boolean }
    ): JestMatchers<T>;
  }
}
