declare namespace jest {
  interface Expect {
    <T = any>(
      actual: T,
      message?: string,
      options?: { showMatcherMessage?: boolean; showPrefix?: boolean }
    ): Matchers<T>;
  }
}
