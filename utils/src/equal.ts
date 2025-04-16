
const equalityCheckFunctions = new Map<any, (a: any, b: any) => boolean>();

// Array
equalityCheckFunctions.set(Array.prototype, (a: any[], b: any[]) => {
  return a.length === b.length && a.every((aValue, i) => isEqual(aValue, b[i]));
});

// Map
equalityCheckFunctions.set(Map.prototype, (a: Map<any, any>, b: Map<any, any>) => {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) {
    if (!b.has(key) || !isEqual(value, b.get(key))) return false;
  }
  return true;
});

// Set
equalityCheckFunctions.set(Set.prototype, (a: Set<any>, b: Set<any>) => {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (![...b].some(bItem => isEqual(item, bItem))) return false;
  }
  return true;
});

// Date
equalityCheckFunctions.set(Date.prototype, (a: Date, b: Date) => {
  return a.getTime() === b.getTime();
});

// RegExp
equalityCheckFunctions.set(RegExp.prototype, (a: RegExp, b: RegExp) => {
  return a.source === b.source && a.flags === b.flags;
});

// ArrayBuffer
equalityCheckFunctions.set(ArrayBuffer.prototype, (a: ArrayBuffer, b: ArrayBuffer) => {
  if (a.byteLength !== b.byteLength) return false;
  const viewA = new Uint8Array(a);
  const viewB = new Uint8Array(b);
  return viewA.every((val, i) => val === viewB[i]);
});

// TypedArrays
const typedArrayConstructors = [
  Int8Array, Uint8Array, Uint8ClampedArray,
  Int16Array, Uint16Array,
  Int32Array, Uint32Array,
  Float32Array, Float64Array,
  BigInt64Array, BigUint64Array
];

for (const ctor of typedArrayConstructors) {
  equalityCheckFunctions.set(ctor.prototype, (a: any, b: any) => {
    if (a.length !== b.length) return false;
    return a.every((val: any, i: number) => val === b[i]);
  });
}


export function isEqual<T>(a: T, b: T): boolean {
  if (a === b || Number.isNaN(a) && Number.isNaN(b)) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a === 'object') {
    let proto = Object.getPrototypeOf(a);
    if (proto !== Object.getPrototypeOf(b)) {
      return false;
    }

    while (proto !== Object.prototype) {
      const res = equalityCheckFunctions.get(proto)?.(a, b);
      if (res !== undefined) return res;
      proto = Object.getPrototypeOf(proto);
    }

    // POJO
    const keysA = Reflect.ownKeys(a as object);
    const keysB = Reflect.ownKeys(b as object);
    if (keysA.length !== keysB.length) return false;
    // @ts-ignore
    return keysA.every(key => b.hasOwnProperty(key) && isEqual(a[key], b[key]));
  } else {
    return false;
  }
}


