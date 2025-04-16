import { describe, it, expect } from "vitest";
import { isEqual } from "./equal.js";

describe("isEqual", () => {
  it("compares primitives", () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual("abc", "abc")).toBe(true);
    expect(isEqual("abc", "abcd")).toBe(false);
    expect(isEqual(true, true)).toBe(true);
    expect(isEqual(null, null)).toBe(true);
    expect(isEqual(undefined, undefined)).toBe(true);
    expect(isEqual(undefined, null)).toBe(false);
    expect(isEqual(NaN, NaN)).toBe(true); // should deep equality treat NaN === NaN?
    expect(isEqual(0, -0)).toBe(true);
  });

  it("compares arrays", () => {
    expect(isEqual([1, 2], [1, 2])).toBe(true);
    expect(isEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(isEqual([1, 2], [2, 1])).toBe(false);
  });

  it("compares plain objects", () => {
    expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(isEqual({ a: { b: 2 } }, { a: { b: 2 } })).toBe(true);
    expect(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it("compares Maps", () => {
    expect(isEqual(
      new Map([["a", 1], ["b", 2]]),
      new Map([["a", 1], ["b", 2]])
    )).toBe(true);

    expect(isEqual(
      new Map([["a", { nested: [1, 2] }]]),
      new Map([["a", { nested: [1, 2] }]])
    )).toBe(true);

    expect(isEqual(
      new Map([["a", 1]]),
      new Map([["b", 1]])
    )).toBe(false);
  });

  it("compares Sets", () => {
    expect(isEqual(
      new Set([1, 2, 3]),
      new Set([3, 2, 1])
    )).toBe(true);

    expect(isEqual(
      new Set([{ a: 1 }]),
      new Set([{ a: 1 }])
    )).toBe(true);

    expect(isEqual(
      new Set([1, 2]),
      new Set([1, 2, 3])
    )).toBe(false);
  });

  it("compares Dates", () => {
    expect(isEqual(
      new Date("2023-01-01T00:00:00Z"),
      new Date("2023-01-01T01:00:00+01:00")
    )).toBe(true);

    expect(isEqual(
      new Date("2023-01-01T00:00:00Z"),
      new Date("2023-01-02T00:00:00Z")
    )).toBe(false);
  });

  it("compares RegExps", () => {
    expect(isEqual(/abc/gi, /abc/gi)).toBe(true);
    expect(isEqual(/abc/g, /abc/i)).toBe(false);
  });

  it("compares ArrayBuffers", () => {
    const a = new ArrayBuffer(4);
    const b = new ArrayBuffer(4);
    new Uint8Array(a).set([1, 2, 3, 4]);
    new Uint8Array(b).set([1, 2, 3, 4]);
    expect(isEqual(a, b)).toBe(true);
  });

  it("compares TypedArrays", () => {
    const a = new Int16Array([1, 2, 3]);
    const b = new Int16Array([1, 2, 3]);
    const c = new Int16Array([3, 2, 1]);
    expect(isEqual(a, b)).toBe(true);
    expect(isEqual(a, c)).toBe(false);
  });

  it("handles nested structures", () => {
    const a = {
      arr: [1, { map: new Map([[1, new Set(["a", "b"])]]) }],
      date: new Date("2020-01-01T00:00:00Z"),
    };
    const b = {
      arr: [1, { map: new Map([[1, new Set(["b", "a"])]]) }],
      date: new Date("2020-01-01T00:00:00Z"),
    };
    expect(isEqual(a, b)).toBe(true);
  });

  it("compares custom classes", () => {
    class Point {
      constructor(public x: number, public y: number) {}
    }

    const a = new Point(1, 2);
    const b = new Point(1, 2);
    const c = new Point(2, 3);

    expect(isEqual(a, b)).toBe(true);
    expect(isEqual(a, c)).toBe(false);
  });

  it("compares subclasses", () => {
    class Animal {
      constructor(public name: string) {}
    }
    class Dog extends Animal {
      constructor(name: string, public breed: string) {
        super(name);
      }
    }

    const a = new Dog("Rex", "Labrador");
    const b = new Dog("Rex", "Labrador");
    const c = new Dog("Rex", "Poodle");

    expect(isEqual(a, b)).toBe(true);
    expect(isEqual(a, c)).toBe(false);
  });

  it("differentiates prototype types", () => {
    class A {
      constructor(public x: number) {}
    }
    class B {
      constructor(public x: number) {}
    }

    const a = new A(5);
    const b = new B(5);

    expect(isEqual(a, b)).toBe(false); // same shape, different classes
  });

  it("compares deeply nested mixed structures", () => {
    const a = {
      map: new Map([
        ["key", { set: new Set([1, 2, 3]) }],
      ]),
      arr: [new Int8Array([1, 2]), { date: new Date("2023-01-01") }],
    };

    const b = {
      map: new Map([
        ["key", { set: new Set([3, 2, 1]) }],
      ]),
      arr: [new Int8Array([1, 2]), { date: new Date("2023-01-01") }],
    };

    expect(isEqual(a, b)).toBe(true);

    // @ts-ignore
    b.arr[1].extra = 'attribute';

    expect(isEqual(a, b)).toBe(false);
  });

  it("compares BigInt values", () => {
    expect(isEqual(10n, 10n)).toBe(true);
    expect(isEqual(10n, 11n)).toBe(false);
  });

  it("compares Symbols by identity", () => {
    const sym1 = Symbol("foo");
    const sym2 = Symbol("foo");
    const sym3 = sym1;

    expect(isEqual(sym1, sym1)).toBe(true);
    expect(isEqual(sym1, sym2 as any)).toBe(false); // symbols are unique even with same description
    expect(isEqual(sym1, sym3)).toBe(true);
  });

  it("compares functions by identity", () => {
    const fn1 = () => {};
    const fn2 = () => {};
    const fn3 = fn1;

    expect(isEqual(fn1, fn1)).toBe(true);
    expect(isEqual(fn1, fn2)).toBe(false); // structurally equal, but different identity
    expect(isEqual(fn1, fn3)).toBe(true);
  });

  it("compares objects with functions as values", () => {
    const fn = () => {};
    expect(isEqual({ fn }, { fn })).toBe(true);
    expect(isEqual({ fn: () => {} }, { fn: () => {} })).toBe(false);
  });

  it("compares objects with symbol keys", () => {
    const sym1 = Symbol("a");
    const obj1 = { [sym1]: 1 };
    const obj2 = { [sym1]: 1 };

    expect(isEqual(obj1, obj2)).toBe(true);

    const sym2 = Symbol("a");
    const obj3 = { [sym2]: 1 };
    expect(isEqual(obj1, obj3 as any)).toBe(false);
  });

  it("compares object properties with BigInt", () => {
    expect(isEqual({ value: 123n }, { value: 123n })).toBe(true);
    expect(isEqual({ value: 123n }, { value: 124n })).toBe(false);
  });

  it("distinguishes between number and BigInt", () => {
    expect(isEqual(1, 1n as any)).toBe(false);
    expect(isEqual({ n: 1 }, { n: 1n })).toBe(false);
  });

});

