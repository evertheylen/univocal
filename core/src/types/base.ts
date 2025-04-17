import { JsTypeToken } from "@univocal/utils/type-token.js";
import { VerificationContext, VerificationStatus } from "../verification.js";

// Nifty system to allow selecting the correct type in a union, but also (de)serialization, validation, and more
// (maybe in the future, we can use it for multimethods?)

// TODO:
//   - [ ] canonicalize strategy? (at construction time, in union, ...)
//   - [ ] update types to match Type
//   - [ ] make type tree thingy
//   - [ ] make Union!

class Call<Args extends any[], Value, Returns> {
  constructor(
    public func: (...args: [...Args, Value]) => Returns,
    public args: Args,
    public op: '=' | '<' | '<=' | '>' | '>=',
    public compareValue: Returns,
    public message?: string
  ) {}
}

export type AnyCall = Call<any[], any, any>;

class And {
  constructor(public conjuncts: (AnyCall | Or)[]) {}
}

class Or {
  constructor(public disjuncts: (AnyCall | And)[]) {}
}

// Note that by design, any constraint you can craft like this is automatically in
// Negation Normal Form (which makes it highly likely the rest of the type system
// can handle/optimize it).
export type Constraint = And | Or | AnyCall;

export const constrain = {
  call: <Args extends any[], Value, Returns>(
    func: (...args: [...Args, Value]) => Returns,
    args: Args,
    op: '=' | '<' | '<=' | '>' | '>=',
    compareValue: Returns,
    message?: string
  ) => new Call<Args, Value, Returns>(func, args, op, compareValue, message),
  and: (...conjuncts: (AnyCall | Or)[]) => new And(conjuncts),
  or: (...disjuncts: (AnyCall | And)[]) => new Or(disjuncts),
}

// A type is really just the constraint BUT we also want to do discern types themselves
// to use in e.g. multimethods. In other words, the constraint needs to map onto something
// and that is the Type object itself.
export interface Type<T> {
  constraint: Constraint
}

// export function assertVerified<T>(type: Type<T>, value: T) {
//   const ctx = new VerificationContext([]);
//   const status = type.verifyValue(value, ctx);
//   status.assertOk();
// }

// export function checkVerified<T>(type: Type<T>, value: T) {
//   const ctx = new VerificationContext([]);
//   return type.verifyValue(value, ctx);
// }


