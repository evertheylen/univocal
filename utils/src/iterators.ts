export function zip<T1>(l1: readonly T1[]): Iterable<[T1]>;
export function zip<T1, T2>(l1: readonly T1[], l2: readonly T2[]): Iterable<[T1, T2]>;
export function zip<T1, T2, T3>(l1: readonly T1[], l2: readonly T2[], l3: readonly T3[]): Iterable<[T1, T2, T3]>;
export function zip<T1, T2, T3, T4>(l1: readonly T1[], l2: readonly T2[], l3: readonly T3[], l4: readonly T4[]): Iterable<[T1, T2, T3, T4]>;
export function zip<T1, T2, T3, T4, T5>(l1: readonly T1[], l2: readonly T2[], l3: readonly T3[], l4: readonly T4[], l5: readonly T5[]): Iterable<[T1, T2, T3, T4, T5]>;
export function zip<T>(...lists: (readonly T[])[]): Iterable<T[]>;
export function* zip<T>(...lists: (readonly T[])[]): Iterable<T[]> {
  const minLength = Math.min(...lists.map(l => l.length));
  for (let i = 0; i < minLength; i+=1) {
    yield [...lists.map(l => l[i])];
  }
}


export function product<T1>(a1: Iterable<T1>): Iterable<[T1]>;
export function product<T1, T2>(a1: Iterable<T1>, a2: Iterable<T2>): Iterable<[T1, T2]>;
export function product<T1, T2, T3>(a1: Iterable<T1>, a2: Iterable<T2>, a3: Iterable<T3>): Iterable<[T1, T2, T3]>;
export function product<T1, T2, T3, T4>(a1: Iterable<T1>, a2: Iterable<T2>, a3: Iterable<T3>, a4: Iterable<T4>): Iterable<[T1, T2, T3, T4]>;
export function product<T1, T2, T3, T4, T5>(a1: Iterable<T1>, a2: Iterable<T2>, a3: Iterable<T3>, a4: Iterable<T4>, a5: Iterable<T5>): Iterable<[T1, T2, T3, T4, T5]>;
export function product<T>(...arrays: Iterable<T>[]): Iterable<T[]>;
export function* product<T>(...arrays: Iterable<T>[]): Iterable<T[]> {
  function* recurse(current: T[], arrays: Iterable<T>[], index: number): Iterable<T[]> {
    if (index === arrays.length) {
      yield current.slice();
    } else {
      for (const x of arrays[index]) {
        current.push(x);
        yield* recurse(current, arrays, index + 1);
        current.pop();
      }
    }
  }
  
  yield* recurse([], arrays, 0);
}


export function min<T>(iter: Iterable<T>, isSmaller: (a: T, b: T) => boolean = ((a, b) => a < b)) {
  let smallest = undefined;
  for (const x of iter) {
    if (smallest === undefined || isSmaller(x, smallest)) {
      smallest = x;
    }
  }
  return smallest;
}

export function sum(iter: Iterable<number>) {
  let res = 0;
  for (const i of iter) {
    res += i;
  }
  return res;
}

export function max<T>(iter: Iterable<T>, isBigger: (a: T, b: T) => boolean = ((a, b) => a > b)) {
  return min(iter, isBigger);
}

export function* iterSlices<T>(array: T[], maxLength: number) {
  let i = 0;
  while (i < array.length) {
    yield array.slice(i, i+maxLength);
    i += maxLength;
  }
}

export function* map<U, V>(iter: Iterable<U>, mapper: (i: U) => V): Iterable<V> {
  for (const i of iter) {
    yield mapper(i)
  }
}

export function forEach<U>(iter: Iterable<U>, mapper: (i: U) => any) {
  for (const i of iter) {
    mapper(i)
  }
}

export function* filter<U>(iter: Iterable<U>, should_pass: (i: U) => boolean): Iterable<U> {
  for (const i of iter) {
    if (should_pass(i)) {
      yield i;
    }
  }
}

export function* enumerate<U>(iter: Iterable<U>, start = 0): Iterable<[number, U]> {
  let index = start;
  for (const i of iter) {
    yield [index, i];
    index++;
  }
}

export function findFirst<U>(iter: Iterable<U>, find: (i: U) => boolean): U | undefined {
  for (const i of iter) {
    if (find(i)) return i;
  }
}

export function* range(start: number, end: number = Infinity, step: number = 1) {
  let i = start;
  while (step < 0 ? i > end : i < end) {
    yield i;
    i += step;
  }
}
