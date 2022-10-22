export type ExcludeMethods<T> = Pick<
  T,
  { [K in keyof T]: T[K] extends () => unknown ? never : K }[keyof T]
>;
