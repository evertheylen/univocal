import { isEqual } from "./equal.js";
import { hash } from "./hash.js";

export class SetBucket<T> {
  constructor(public keys: T[] = []) {}

  findIndex(value: T) {
    for (let i = 0; i < this.keys.length; i++) {
      if (isEqual(this.keys[i], value)) return i;
    }
    return null;
  }

  has(value: T) {
    return this.findIndex(value) !== null;
  }

  add(value: T) {
    const i = this.findIndex(value);
    if (i === null) {
      this.keys.push(value);
      return true;
    }
    return false;
  }

  delete(value: T) {
    const i = this.findIndex(value);
    if (i !== null) {
      this.keys.splice(i, 1);
      return true;
    }
    return false;
  }

  get length() {
    return this.keys.length;
  }
}


export type NativeHashable = string | number | boolean | bigint | undefined;

export function _maybeHash(value: any): NativeHashable {
  switch (typeof value) {
    case 'function':
    case 'object':
    case 'symbol':
      return hash(value);
    default:
      return value as NativeHashable;
  }
}


/** 
 * Set that can take any value. Based on `isEqual` and `hash`. It is your responsibility
 * to keep values immutable. Does *not* maintain insertion order.
 */
export class UvSet<T> implements Set<T>{
  protected rootMap = new Map<NativeHashable, SetBucket<T>>();
  protected _size: number = 0;

  constructor(iterable?: Iterable<T>) {
    if (iterable) {
      for (const item of iterable) this.add(item);
    }
  }

  add(value: T): this {
    const hkey = _maybeHash(value);
    let bucket = this.rootMap.get(hkey);
    if (!bucket) {
      bucket = new SetBucket<T>();
      this.rootMap.set(hkey, bucket);
    }
    if (bucket.add(value)) this._size++;
    return this;
  }

  has(value: T): boolean {
    const hkey = _maybeHash(value);
    const bucket = this.rootMap.get(hkey);
    return bucket ? bucket.has(value) : false;
  }

  delete(value: T): boolean {
    const hkey = _maybeHash(value);
    const bucket = this.rootMap.get(hkey);
    if (!bucket) return false;
    if (bucket.delete(value)) {
      if (bucket.length === 0) {
        this.rootMap.delete(hkey);
      }
      this._size--;
      return true;
    }
    return false;
  }

  clear(): void {
    this.rootMap.clear();
    this._size = 0;
  }

  get size(): number {
    return this._size;
  }

  forEach(callbackfn: (value: T, value2: T, set: UvSet<T>) => void, thisArg?: any): void {
    if (thisArg !== undefined) callbackfn = callbackfn.bind(thisArg);
    for (const bucket of this.rootMap.values()) {
      for (const val of bucket.keys) {
        callbackfn(val, val, this);
      }
    }
  }

  static fromNativeSet<T>(nativeSet: ReadonlySet<T>): UvSet<T> {
    // semantically, we can only guarantee this works if the set only contains NativeHashable entities.
    const set = new UvSet<T>(nativeSet);
    if (set.size !== nativeSet.size) {
      throw new Error("Given set contained objects that were considered structurally equal, can't convert to UvSet");
    }
    return set;
  }

  union<U>(other: ReadonlySet<U>): UvSet<T | U> {
    const _other = other instanceof UvSet ? other : UvSet.fromNativeSet(other);
    const result = new UvSet<T | U>(this);
    for (const val of _other) {
      result.add(val);
    }
    return result;
  }
  
  intersection<U>(other: ReadonlySet<U>): UvSet<T & U> {
    const _other = other instanceof UvSet ? other : UvSet.fromNativeSet(other);
    const result = new UvSet<T & U>();
    for (const val of this) {
      if (_other.has(val as unknown as U)) {
        result.add(val as unknown as T & U);
      }
    }
    return result;
  }
  
  difference<U>(other: ReadonlySet<U>): UvSet<T> {
    const _other = other instanceof UvSet ? other : UvSet.fromNativeSet(other);
    const result = new UvSet<T>();
    for (const val of this) {
      if (!_other.has(val as unknown as U)) {
        result.add(val);
      }
    }
    return result;
  }
  
  symmetricDifference<U>(other: ReadonlySet<U>): UvSet<T | U> {
    const _other = other instanceof UvSet ? other : UvSet.fromNativeSet(other);
    const result = new UvSet<T | U>();
    for (const val of this) {
      if (!_other.has(val as unknown as U)) {
        result.add(val);
      }
    }
    for (const val of _other) {
      if (!this.has(val as unknown as T)) {
        result.add(val);
      }
    }
    return result;
  }
  
  isSubsetOf(other: ReadonlySet<unknown>): boolean {
    const _other = other instanceof UvSet ? other : UvSet.fromNativeSet(other);
    for (const val of this) {
      if (!_other.has(val)) {
        return false;
      }
    }
    return true;
  }
  
  isSupersetOf(other: ReadonlySet<unknown>): boolean {
    const _other = other instanceof UvSet ? other : UvSet.fromNativeSet(other);
    for (const val of _other) {
      if (!this.has(val)) {
        return false;
      }
    }
    return true;
  }
  
  isDisjointFrom(other: ReadonlySet<unknown>): boolean {
    const _other = other instanceof UvSet ? other : UvSet.fromNativeSet(other);
    for (const val of this) {
      if (_other.has(val)) {
        return false;
      }
    }
    return true;
  }

  *keys(): SetIterator<T> {
    for (const bucket of this.rootMap.values()) {
      yield* bucket.keys;
    }
  }

  *entries(): SetIterator<[T, T]> {
    for (const bucket of this.rootMap.values()) {
      for (const key of bucket.keys) {
        yield [key, key];
      }
    }
  }

  values(): SetIterator<T> {
    return this.keys();
  }

  [Symbol.iterator](): SetIterator<T> {
    return this.keys();
  }

  [Symbol.toStringTag] = "UvSet";
}

