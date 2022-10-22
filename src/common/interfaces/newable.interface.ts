export interface Newable<T> {
  new (...values: unknown[]): T;
}
