
export type Constructor<T> = (new (...args: any[]) => T);
export type AbstractConstructor<T> = (abstract new (...args: any) => any);

export type AnyPrototype = {constructor: Function};

export type Prototype<T> = {constructor: Constructor<T>};

export type WithoutIntersection<A, B> = keyof A & keyof B extends never ? A & B : never;

// 10 ought to be enough? univocal query.ts goes to 20 though
export type ListToDisjunction<T extends any[]> = (
  T extends [] ? never :
  T extends [infer A] ? A :
  T extends [infer A, infer B] ? A | B :
  T extends [infer A, infer B, infer C] ? A | B | C :
  T extends [infer A, infer B, infer C, infer D] ? A | B | C | D :
  T extends [infer A, infer B, infer C, infer D, infer E] ? A | B | C | D | E :
  T extends [
    infer A, infer B, infer C, infer D, infer E, infer F
  ] ? A | B | C | D | E | F :
  T extends [
    infer A, infer B, infer C, infer D, infer E, infer F, infer G
  ] ? A | B | C | D | E | F | G :
  T extends [
    infer A, infer B, infer C, infer D, infer E, infer F, infer G, infer H
  ] ? A | B | C | D | E | F | G | H :
  T extends [
    infer A, infer B, infer C, infer D, infer E, infer F, infer G, infer H, infer I
  ] ? A | B | C | D | E | F | G | H | I :
  T extends [
    infer A, infer B, infer C, infer D, infer E, infer F, infer G, infer H, infer I, infer J
  ] ? A | B | C | D | E | F | G | H | I | J :
  T extends (infer X)[] ? X :
  never
)

// Thanks https://stackoverflow.com/a/50375286/2678118
export type UnionToIntersection<U> = (
  (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never
)

// More readable constructors when combined with Object.assign
export type Data<T, E extends string = never> = {[K in (Exclude<keyof T & string, E>) as T[K] extends Function ? never : K]: T[K]}
