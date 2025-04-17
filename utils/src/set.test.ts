import { describe, it, expect } from "vitest";
import { UvSet } from "./set.js";
import { isEqual } from "./equal.js";

describe("UvSet", () => {
  const obj1 = { a: 1 };
  const obj2 = { a: 1 }; // structurally equal to obj1
  const obj3 = { a: 2 };

  it("handles primitives and treats NaN correctly", () => {
    const set = new UvSet<any>();
    set.add(NaN);
    set.add(undefined);
    set.add(null);
    set.add(0);
    set.add(-0);
    set.add(NaN); // should not be added again

    expect(set.size).toBe(4);
    expect(set.has(NaN)).toBe(true);
    expect(set.has(undefined)).toBe(true);
    expect(set.has(null)).toBe(true);
    expect(set.has(0)).toBe(true);
    expect(set.has(-0)).toBe(true);
  });

  it("handles complex object equality", () => {
    const set = new UvSet<object>();
    set.add(obj1);
    expect(set.has(obj2)).toBe(true); // equal by structure
    expect(set.has(obj3)).toBe(false);
  });

  it("can delete items", () => {
    const set = new UvSet<any>([NaN, undefined, obj1]);
    expect(set.delete(undefined)).toBe(true);
    expect(set.delete(obj2)).toBe(true);
    expect(set.delete({ b: 123 })).toBe(false);
    expect(set.size).toBe(1);
  });

  it("union works with primitives and complex values", () => {
    const a = new UvSet<any>([1, 2, obj1, NaN]);
    const b = new UvSet<any>([2, 3, obj2, undefined]);
    const result = a.union(b);

    expect(Array.from(result)).toEqual(
      expect.arrayContaining([1, 2, 3, obj1, NaN, undefined])
    );
    expect(result.size).toBe(6);
  });

  it("intersection works", () => {
    const a = new UvSet<any>([1, 2, obj1, NaN]);
    const b = new UvSet<any>([2, 3, obj2, NaN]);

    const result = a.intersection(b);
    expect(result.size).toBe(3);
    expect(result.has(2)).toBe(true);
    expect(result.has(NaN)).toBe(true);
    expect(result.has(obj1)).toBe(true); // because obj1 ≈ obj2
  });

  it("difference works", () => {
    const a = new UvSet<any>([1, 2, obj1]);
    const b = new UvSet<any>([2, obj2]);

    const result = a.difference(b);
    expect(result.size).toBe(1);
    expect(result.has(1)).toBe(true);
  });

  it("symmetricDifference works", () => {
    const a = new UvSet<any>([1, 2, obj1]);
    const b = new UvSet<any>([2, 3, obj2]);

    const result = a.symmetricDifference(b);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(3)).toBe(true);
  });

  it("isSubsetOf / isSupersetOf / isDisjointFrom works correctly", () => {
    const a = new UvSet<any>([1, 2, obj1]);
    const b = new UvSet<any>([1, 2, 3, obj2]);
    const c = new UvSet<any>([5, 6]);

    expect(a.isSubsetOf(b)).toBe(true);
    expect(b.isSupersetOf(a)).toBe(true);
    expect(a.isDisjointFrom(c)).toBe(true);
    expect(a.isDisjointFrom(b)).toBe(false);
  });

  it("works with mixed primitives and objects", () => {
    const a = new UvSet<any>([undefined, 1, "str", { foo: "bar" }]);
    const b = new UvSet<any>([1, { foo: "bar" }]);

    const intersection = a.intersection(b);
    expect(intersection.size).toBe(2);
    expect(intersection.has(1)).toBe(true);
    expect(intersection.has({ foo: "bar" })).toBe(true);
  });

  it("forEach iterates properly", () => {
    const values = [1, 2, { x: 10 }];
    const set = new UvSet(values);

    const collected: any[] = [];
    set.forEach((v) => collected.push(v));

    expect(collected.length).toBe(3);
    for (const v of values) {
      expect(collected.some((el) => isEqual(el, v))).toBe(true);
    }
  });

  it("Symbol.iterator works like keys()", () => {
    const values = [1, { a: 1 }, NaN];
    const set = new UvSet(values);
    const collected = [...set];

    expect(collected.length).toBe(3);
    expect(collected).toEqual(expect.arrayContaining(values));
  });
});
