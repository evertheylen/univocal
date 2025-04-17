import { beforeEach, describe, expect, it, vi } from "vitest";
import { UvMap } from "./map.js";

describe('UvMap behaves like Map', () => {
  let map: UvMap<any, string>;

  beforeEach(() => {
    map = new UvMap();
  });

  it('sets and gets primitive keys correctly', () => {
    map.set('a', 'alpha');
    map.set(1, 'one');
    map.set(true, 'bool');

    expect(map.get('a')).toBe('alpha');
    expect(map.get(1)).toBe('one');
    expect(map.get(true)).toBe('bool');
  });

  it('handles NaN as a key correctly', () => {
    map.set(NaN, 'not-a-number');
    expect(map.get(NaN)).toBe('not-a-number');
  });

  it('supports object and array keys', () => {
    const obj = { a: 1 };
    const arr = [1, 2, 3];
    map.set(obj, 'object');
    map.set(arr, 'array');

    expect(map.get(obj)).toBe('object');
    expect(map.get(arr)).toBe('array');
  });

  it('allows nested structure as key', () => {
    const key = { a: [1, { b: 2 }] };
    map.set(key, 'complex');
    expect(map.get(key)).toBe('complex');
  });

  it('returns undefined for missing keys', () => {
    expect(map.get('missing')).toBe(undefined);
  });

  it('can delete keys', () => {
    const key = { x: 1 };
    map.set(key, 'to delete');
    expect(map.delete(key)).toBe(true);
    expect(map.get(key)).toBe(undefined);
  });

  it('has correct size', () => {
    map.set('a', '1');
    map.set('b', '2');
    expect(map.size).toBe(2);
    map.delete('a');
    expect(map.size).toBe(1);
  });

  it('supports has()', () => {
    const obj = { a: 1 };
    expect(map.has(obj)).toBe(false);
    map.set(obj, 'yes');
    expect(map.has(obj)).toBe(true);
  });

  it('supports clear()', () => {
    map.set('a', '1');
    map.set('b', '2');
    map.clear();
    expect(map.size).toBe(0);
    expect(map.get('a')).toBe(undefined);
  });

  it('overwrites existing keys', () => {
    const key = { x: 1 };
    map.set(key, 'first');
    map.set(key, 'second');
    expect(map.get(key)).toBe('second');
    expect(map.size).toBe(1);
  });

  it('supports forEach()', () => {
    const spy = vi.fn();
    map.set('a', 'foo');
    map.set('b', 'bar');
    map.forEach(spy);
    expect(spy).toHaveBeenCalledTimes(2);
  });  
});

describe('UvMap handles complex objects', () => {
  let map: UvMap<any, any>;

  beforeEach(() => {
    map = new UvMap();
  });
  
  it('can store undefined and null values', () => {
    const key = { k: 1 };
    map.set(key, undefined);
    expect(map.has(key)).toBe(true);
    expect(map.get(key)).toBe(undefined);
  
    map.set('x', null);
    expect(map.get('x')).toBe(null);
  });
  
  it('works with frozen object keys', () => {
    const frozen = Object.freeze({ foo: 'bar' });
    map.set(frozen, 'ice');
    expect(map.get(frozen)).toBe('ice');
  });
  
  it('supports symbol keys', () => {
    const sym = Symbol('sym');
    map.set(sym, 'symbolic');
    expect(map.get(sym)).toBe('symbolic');
  });
  
  it('treats different functions as different keys', () => {
    const f1 = () => {};
    const f2 = () => {};
    map.set(f1, 'one');
    expect(map.get(f2)).toBe(undefined);
  });

  it('treats structurally equal objects as the same key', () => {
    const obj1 = { a: 1, b: [2, 3] };
    const obj2 = { b: [2, 3], a: 1 }; // different order, but equal content

    map.set(obj1, 'value');
    expect(map.get(obj2)).toBe('value');
    expect(map.size).toBe(1);
  });

  it('treats structurally equal arrays as the same key', () => {
    const a = [1, 2, { x: 3 }];
    const b = [1, 2, { x: 3 }];

    map.set(a, 'array');
    expect(map.get(b)).toBe('array');
    expect(map.size).toBe(1);
  });

  it('treats different key instances with same deep structure as equal, even for nested', () => {
    const key1 = { a: { b: { c: [1, 2] } } };
    const key2 = { a: { b: { c: [1, 2] } } };
  
    map.set(key1, 'nested');
    expect(map.has(key2)).toBe(true);
    expect(map.get(key2)).toBe('nested');
    expect(map.size).toBe(1);
  });
  
  it('ignores object key order if deeply equal', () => {
    const k1 = { a: 1, b: 2 };
    const k2 = { b: 2, a: 1 };
  
    map.set(k1, 'order-agnostic');
    expect(map.get(k2)).toBe('order-agnostic');
    expect(map.size).toBe(1);
  });
  
  it('does not insert duplicate structurally equal keys', () => {
    const keys = [
      { x: [1, 2], y: 3 },
      { y: 3, x: [1, 2] }, // same structure
      { x: [1, 2], y: 3 }  // again, same
    ];
  
    keys.forEach((k, i) => map.set(k, `v${i}`));
  
    expect(map.size).toBe(1);
    expect(map.get({ y: 3, x: [1, 2] })).toBe('v2');
  });
  
  it('treats different Dates with same time as equal', () => {
    const d1 = new Date('2020-01-01T00:00:00Z');
    const d2 = new Date('2020-01-01T00:00:00Z');
  
    map.set(d1, 'newyear');
    expect(map.get(d2)).toBe('newyear');
  });
  
  it('treats regex literals with same pattern as equal', () => {
    map.set(/abc/i, 'pattern');
    expect(map.get(new RegExp('abc', 'i'))).toBe('pattern');
  });
  
  it('treats NaN and NaN as equal', () => {
    map.set(NaN, 'nan!');
    expect(map.get(NaN)).toBe('nan!');
  });
  
  it('differentiates structurally different values correctly', () => {
    map.set({ a: 1 }, 'one');
    map.set({ a: 1, b: 2 }, 'two');
  
    expect(map.size).toBe(2);
    expect(map.get({ a: 1 })).toBe('one');
    expect(map.get({ a: 1, b: 2 })).toBe('two');
  });
  
  describe('UvMap supports all key variants with deep equality', () => {
    const keys = [
      () => 42,
      () => 'string',
      () => null,
      () => undefined,
      () => NaN,
      () => true,
      () => false,
      () => [1, 2, 3],
      () => [[1, 2], { a: 3 }],
      () => ({ x: 10, y: { z: [1, 2, 3] } }),
      () => Object.create(null),
      () => new Date(),
      () => new Set([1, 2]),
      () => new Map([[1, 'a']]),
      () => new Uint8Array([1, 2, 3]),
      () => /regex/g,
    ];
  
    keys.forEach((keyFactory, index) => {
      it(`correctly stores and retrieves value for key variant #${index} = ${keyFactory}`, () => {
        const map = new UvMap<any, string>();
        const key1 = keyFactory();
        const key2 = keyFactory();
  
        // Store value using original key
        map.set(key1, `value-${index}`);
  
        // Expect deep-equal clone to retrieve the same value
        expect(map.get(key2)).toBe(`value-${index}`);
        expect(map.size).toBe(1);
      });
    });
  });
  
});

