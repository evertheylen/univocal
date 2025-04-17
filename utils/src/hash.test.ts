import { expect, test } from "vitest";
import { hash } from "./hash.js";

test("hash", () => {
  const func = () => 5;
  const sym = Symbol('sdfsdf');

  expect(hash(123)).toEqual(hash(123));
  expect(hash({hello: 'mars'})).toEqual(hash({hello: 'mars'}));

  const x = hash({wow: ['quite', 123n, false], this: {[sym]: [Object.prototype, null, undefined], func}});
  const x2 = hash({wow: ['quite', 123n, false], this: {[sym]: [Object.prototype, null, undefined], func}});
  const y = hash({wow: ['qujte', 123n, false], this: {[sym]: [Object.prototype, null, undefined], func}});
  expect(x).toEqual(x2);
  expect(x).not.toEqual(y);
});

test("hash order", () => {
  const x = hash({a: 1, b: 2, c: 3});
  const y = hash({a: 1, c: 3, b: 2});

  expect(x).toEqual(y);
});

test("hash nulls", () => {
  const nullproto = Object.create(null);
  const nullproto2 = Object.create(null);
  const notReallyNull = {};

  expect(hash(nullproto)).toEqual(hash(nullproto2));
  expect(hash(nullproto)).not.toEqual(hash(notReallyNull));
})
