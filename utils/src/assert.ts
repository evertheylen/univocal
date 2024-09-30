import { intersection } from "./sets.js";

export function assert(cond: boolean, msg?: string): asserts cond {
  if (!cond) {
    throw new Error(msg ?? "Assertion was false");
  }
}

export function assertEq<T>(a: T, b: T) {
  if (a !== b) {
    throw new Error(`Assertion failed: ${a} != ${b}`);
  }
}

export function assertNoIntersection<T>(...iterables: Iterable<T>[]) {
  const _iterables = iterables.map(it => new Set(it));
  const overlap = intersection(..._iterables);
  if (overlap.size > 0) {
    throw new Error(`Intersection should be empty, but it is {${[...overlap].join(", ")}}`);
  }
}

export function notNull<T>(x: T | null): T {
  if (x === null) {
    throw new Error("Got null");
  }
  return x;
}

export async function asyncNotNull<T>(x: Promise<T | null>): Promise<T> {
  return notNull<T>(await x);
}

export function notUndefined<T>(x: T | undefined): T {
  if (x === undefined) {
    throw new Error("Got undefined");
  }
  return x;
}

export async function asyncNotUndefined<T>(x: Promise<T | undefined>): Promise<T> {
  return notUndefined<T>(await x);
}

export function notFalsy(x: any): asserts x {
  if (!x) {
    throw new Error("Got falsy value");
  }
  return x;
}
