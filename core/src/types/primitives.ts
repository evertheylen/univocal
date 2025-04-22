import { Integer, Real } from "@univocal/utils/types.js";
import { constrain, Constraint, Type } from "./base.js";
import { LiteralType } from "./literal.js";
import { getTypeof, identity, isInteger, matchesRegex, strLength } from "./constraint-funcs.js";

export const NullType = new LiteralType(null);

export const UndefinedType = new LiteralType(undefined);


export class RealType implements Type<Real> {
  constraint: Constraint;

  constructor(public min?: Real, public includeMin?: boolean, public max?: Real, public includeMax?: boolean) {
    this.constraint = constrain.and(
      constrain.call(getTypeof, [], '=', 'number'),
    );

    if (this.min !== undefined) {
      this.constraint.conjuncts.push(constrain.call(identity, [], this.includeMin ? '>=' : '>', this.min))
    }

    if (this.max !== undefined) {
      this.constraint.conjuncts.push(constrain.call(identity, [], this.includeMax ? '<=' : '<', this.max))
    }
  }

  static all = new RealType();
  static positive = new RealType(0, true);
  static negative = new RealType(undefined, undefined, 0, true);
}

export class IntegerType implements Type<Integer> {
  constraint: Constraint;

  // always inclusive!
  constructor(public min?: Integer, public max?: Integer) {
    this.constraint = constrain.and(
      constrain.call(getTypeof, [], '=', 'number'),
      constrain.call(isInteger, [], '=', true)
    );

    if (this.min !== undefined) {
      this.constraint.conjuncts.push(constrain.call(identity, [], '>=', this.min))
    }

    if (this.max !== undefined) {
      this.constraint.conjuncts.push(constrain.call(identity, [], '<=', this.max))
    }
  }

  static all = new IntegerType();
  static positive = new IntegerType(0, undefined);
  static negative = new IntegerType(undefined, 0);
}


export class StringType implements Type<string> {
  constraint: Constraint;

  // lengths are inclusive!
  constructor(
    public minLen?: number,
    public maxLen?: number,
    public regex?: RegExp
  ) {
    this.constraint = constrain.and(
      constrain.call(getTypeof, [], '=', 'string'),
    )

    if (this.minLen !== undefined) {
      this.constraint.conjuncts.push(constrain.call(strLength, [], '>=', this.minLen));
    }

    if (this.maxLen !== undefined) {
      this.constraint.conjuncts.push(constrain.call(strLength, [], '<=', this.maxLen));
    }

    if (this.regex !== undefined) {
      this.constraint.conjuncts.push(constrain.call(matchesRegex, [this.regex], '=', true));
    }
  }

  static all = new StringType();
  static hundred = new StringType(undefined, 100);
  static thousand = new StringType(undefined, 1000);
  static email = new StringType(4, 512, /^[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}$/u);
}


export const TrueType = new LiteralType(true);
export const FalseType = new LiteralType(false);
// TODO
//export const BooleanType = union(TrueType, FalseType);



