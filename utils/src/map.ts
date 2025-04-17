import { isEqual } from "./equal.js";
import { hash } from "./hash.js";


class Bucket<K, V> {
  constructor(
    public keys: K[] = [],
    public values: V[] = []
  ) {}

  findIndex(key: K) {
    for (let i=0; i<this.keys.length; i++) {
      if (isEqual(this.keys[i], key)) {
        return i;
      }
    }
    return null;
  }

  get(key: K): V | undefined {
    const i = this.findIndex(key);
    return i === null ? undefined : this.values[i];
  }

  delete(key: K) {
    const i = this.findIndex(key);
    if (i !== null) {
      this.keys.splice(i, 1);
      this.values.splice(i, 1);
      return true;
    } else {
      return false;
    }
  }

  get length() {
    return this.keys.length;
  }

  has(key: K) {
    return this.findIndex(key) !== null;
  }

  set(key: K, val: V) {
    // returns where a new element was added
    const i = this.findIndex(key);
    if (i !== null) {
      this.keys[i] = key;  // we shouldn't really have to replace it?
      this.values[i] = val;
      return false;
    } else {
      this.keys.push(key);
      this.values.push(val);
      return true;
    }
  }

  *entries(): MapIterator<[K, V]> {
    for (let i=0; i<this.keys.length; i++) {
      yield [this.keys[i], this.values[i]]
    }
  }
}

type NativeMapCanHash = string | number | boolean | bigint | undefined;

/** 
 * Map that can take any key. Based on `isEqual` and `hash`. It is your responsibility
 * to keep keys immutable. Does *not* maintain insertion order.
 */
export class UvMap<K, V> implements Map<K, V> {
  // can't store values directly as we need Bucket to keep track of the original key
  protected rootMap = new Map<NativeMapCanHash, Bucket<K,V>>();
  protected _size: number = 0;

  constructor() {}

  protected _makeKey(key: K): NativeMapCanHash  {
    switch (typeof key) {
      case 'function':
      case 'object':
      case 'symbol':
        return hash(key);
      default:
        return key as NativeMapCanHash;
    }
  }

  clear(): void {
    this.rootMap.clear();
    this._size = 0;
  }

  delete(key: K): boolean {
    const hkey = this._makeKey(key);
    const bucket = this.rootMap.get(hkey);
    if (bucket === undefined) return false;

    if (bucket.delete(key)) {
      if (bucket.length === 0) {
        this.rootMap.delete(hkey);
      }
      this._size--;
      return true;
    } else {
      return false;
    }
  }

  forEach(callbackfn: (value: V, key: K, map: UvMap<K, V>) => void, thisArg?: any): void {
    if (thisArg !== undefined) {
      callbackfn = callbackfn.bind(thisArg);
    }

    for (const bucket of this.rootMap.values()) {
      for (const [k, v] of bucket.entries()) {
        callbackfn(v, k, this);
      }
    }
  }

  get(key: K): V | undefined {
    const hkey = this._makeKey(key);
    const bucket = this.rootMap.get(hkey);
    if (bucket === undefined) return undefined;
    return bucket.get(key);
  }

  has(key: K): boolean {
    const hkey = this._makeKey(key);
    const bucket = this.rootMap.get(hkey);
    if (bucket === undefined) return false;
    return bucket.has(key);
  }

  set(key: K, value: V): this {
    const hkey = this._makeKey(key);
    const bucket = this.rootMap.get(hkey);
    if (bucket === undefined) {
      this.rootMap.set(hkey, new Bucket([key], [value]));
      this._size++;
    } else {
      if (bucket.set(key, value)) this._size++;
    }
    
    return this;
  }

  get size(): number {
    return this._size;
  }

  *entries(): MapIterator<[K, V]> {
    for (const bucket of this.rootMap.values()) {
      yield* bucket.entries();
    }
  }

  *keys(): MapIterator<K> {
    for (const bucket of this.rootMap.values()) {
      yield* bucket.keys;
    }
  }

  *values(): MapIterator<V> {
    for (const bucket of this.rootMap.values()) {
      yield* bucket.values;
    }
  }

  [Symbol.iterator](): MapIterator<[K, V]> {
    return this.entries();
  }

  [Symbol.toStringTag] = "UvMap";
}
