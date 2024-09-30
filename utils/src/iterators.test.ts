import { describe, expect, test } from '@jest/globals';
import { zip, product, min, max, sum, iterSlices, map, forEach, filter, enumerate, findFirst, range } from './iterators.js';

describe('zip', () => {
  test('zips two arrays', () => {
    const result = [...zip([1, 2], ['a', 'b'])];
    expect(result).toEqual([[1, 'a'], [2, 'b']]);
  });

  test('zips three arrays', () => {
    const result = [...zip([1, 2], ['a', 'b'], [true, false])];
    expect(result).toEqual([[1, 'a', true], [2, 'b', false]]);
  });

  test('handles unequal lengths with three arrays', () => {
    const result = [...zip([1, 2], ['a', 'b', 'c'], [true])];
    expect(result).toEqual([[1, 'a', true]]);
  });
});

describe('product', () => {
  test('cartesian product of two arrays', () => {
    const result = [...product([1, 2], ['a', 'b'])];
    expect(result).toEqual([[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]);
  });

  test('cartesian product of three arrays', () => {
    const result = [...product([1, 2], ['a', 'b'], [true, false])];
    expect(result).toEqual([
      [1, 'a', true], [1, 'a', false],
      [1, 'b', true], [1, 'b', false],
      [2, 'a', true], [2, 'a', false],
      [2, 'b', true], [2, 'b', false],
    ]);
  });
});

describe('min', () => {
  test('finds min with default comparison', () => {
    const result = min([3, 1, 4, 2]);
    expect(result).toBe(1);
  });

  test('finds min with custom comparison', () => {
    const result = min([{ age: 30 }, { age: 25 }, { age: 40 }], (a, b) => a.age < b.age);
    expect(result).toEqual({ age: 25 });
  });
});

describe('max', () => {
  test('finds max with default comparison', () => {
    const result = max([3, 1, 4, 2]);
    expect(result).toBe(4);
  });

  test('finds max with custom comparison', () => {
    const result = max([{ age: 30 }, { age: 25 }, { age: 40 }], (a, b) => a.age > b.age);
    expect(result).toEqual({ age: 40 });
  });
});


describe('sum', () => {
  test('sums array', () => {
    const result = sum([1, 2, 3]);
    expect(result).toBe(6);
  });
});

describe('iterSlices', () => {
  test('slices array into chunks', () => {
    const result = [...iterSlices([1, 2, 3, 4, 5], 2)];
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe('map', () => {
  test('maps array', () => {
    const result = [...map([1, 2, 3], x => x * 2)];
    expect(result).toEqual([2, 4, 6]);
  });
});

describe('forEach', () => {
  test('applies function to each element', () => {
    const result: number[] = [];
    forEach([1, 2, 3], x => result.push(x * 2));
    expect(result).toEqual([2, 4, 6]);
  });
});

describe('filter', () => {
  test('filters array', () => {
    const result = [...filter([1, 2, 3, 4], x => x % 2 === 0)];
    expect(result).toEqual([2, 4]);
  });
});

describe('enumerate', () => {
  test('enumerates array', () => {
    const result = [...enumerate(['a', 'b'])];
    expect(result).toEqual([[0, 'a'], [1, 'b']]);
  });
});

describe('findFirst', () => {
  test('finds first matching element', () => {
    const result = findFirst([1, 2, 3], x => x > 1);
    expect(result).toBe(2);
  });
});

describe('range', () => {
  test('generates range of numbers', () => {
    const result = [...range(1, 5)];
    expect(result).toEqual([1, 2, 3, 4]);
  });
});
