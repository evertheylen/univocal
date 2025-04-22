import { Call, Type } from "./base.js";
import { identity } from "./constraint-funcs.js";


export class LiteralType<const T> implements Type<T> {
  constraint: Call<[], T, T>;

  constructor(public value: T) {
    this.constraint = new Call(identity, [], '=', value);
  }
}
