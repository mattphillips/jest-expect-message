declare namespace jest {
  interface Expect {
      <T = any>(actual: T, message?: string): Matchers<T>;
  }
}
