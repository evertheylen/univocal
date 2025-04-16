import { assert, assertEq } from "./assert.js";
import { zip } from "./iterators.js";
import { AbstractConstructor, AnyPrototype, Constructor, Integer, Real } from "./types.js";

// We're doing something a bit special to work around JS's lack of proper integers:
//  => we split 'number' up into 'int' and 'real', but assume that 'int' is a subtype of 'real'
// Therefore, our primitives will include these extra's

export type PrimitiveToken = (
  "real" | "int" | "bigint" | "string" | "boolean" | "function" | "undefined" | "null"
);

export type Value = object | null | string | number | bigint | boolean | Function | undefined;

// special cases: any, but also "int" and "real"
export type JsTypeToken = PrimitiveToken | Constructor<any> | "any";

export type JsTypeTokenFor<T> = (
  any extends T ? JsTypeToken :
  T extends object ? Constructor<T> :
  T extends null ? "null" :
  T extends string ? "string" :
  T extends number ? "real" :  // cant know it's an int!
  T extends bigint ? "bigint" :
  T extends boolean ? "boolean" :
  T extends Function ? "function" :
  T extends undefined ? "undefined"
  : never
);

export type TypeForToken<T extends JsTypeToken | undefined> = (
  T extends "any" ? any :
  T extends "null" ? null :
  T extends "string" ? string :
  T extends "bigint" ? bigint :
  T extends "int" ? Integer :
  T extends "real" ? Real :
  T extends "boolean" ? boolean :
  T extends "function" ? Function :
  T extends "undefined" ? undefined :
  T extends Constructor<infer X> | AbstractConstructor<infer X> ? X :
  //T extends Prototype<infer X> ? X :
  never
);

export function getPrimitiveToken<T extends Value>(x: T): JsTypeTokenFor<T> {
  const typeofStr = typeof x;
  if (typeofStr === 'object') {
    if (x === null) return 'null';
    return (x as any).constructor;
  } else if (typeofStr === 'number') {
    return Number.isInteger(x) ? 'int' : 'real'
  } else if (typeofStr === 'symbol') {
    throw new Error('Symbols not supported');
  } else {
    return typeofStr as PrimitiveToken;
  }
}

export function reprJsTypeToken(t: JsTypeToken) {
  if (typeof t === "string") {
    return `<${t}>`;
  } else {
    // @ts-ignore
    return `<class ${t.name}>`;
  }
}

export enum TypeRelation {
  same,
  subtype,   // strict!
  supertype, // strict!
  unrelated
}


const nullProto = Object.getPrototypeOf({});

export function isInPrototypeChain(a: AnyPrototype, b: AnyPrototype) {
  while (true) {
    if (a === b) {
      return true;
    } else if (b === nullProto) {
      return false;
    }
    b = Object.getPrototypeOf(b);
  }
}

export function getRelation(a: JsTypeToken, b: JsTypeToken) {
  if (typeof a === "string" || typeof b === "string") {
    // Not a prototype, so something primitive.
    // Note that we don't care for the "object"
    if (a === b) {
      return TypeRelation.same;
    } else if (a === "any" || (a === "real" && b === "int")) {
      return TypeRelation.supertype;
    } else if (b === "any" || (a === "int" && b === "real")) {
      return TypeRelation.subtype;
    } else {
      return TypeRelation.unrelated;
    }
  } else {
    // At this point, we should have two CONSTRUCTORS
    assert(typeof a === 'function' && typeof b === 'function');
    if (a === b) {
      return TypeRelation.same;
    } else if (isInPrototypeChain(a.prototype, b.prototype)) {
      return TypeRelation.supertype;
    } else if (isInPrototypeChain(b.prototype, a.prototype)) {
      return TypeRelation.subtype;
    } else {
      return TypeRelation.unrelated;
    }
  }
}

export function isMoreSpecific(A: JsTypeToken[], B: JsTypeToken[]) {
  assertEq(A.length, B.length);
  // If some element of tuple type A is more specific than its corresponding element in tuple
  // type B, and no element of B is more specific than its corresponding element in A, then
  // A is more specific.
  let someElementOfAIsMoreSpecific = false;
  for (const [a, b] of zip(A, B)) {
    const rel = getRelation(a, b);
    if (rel === TypeRelation.subtype) {
      someElementOfAIsMoreSpecific = true;
    } else if (rel === TypeRelation.supertype) {
      // some element of B *is* more specific than its corresponding element, so A certainly
      // *isn't* more specific than B
      return false;
    }
  }
  return someElementOfAIsMoreSpecific;
}
