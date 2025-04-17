import { Integer, Real } from "@univocal/utils/types.js";
import { VerificationContext, VerificationProblem, VerificationStatus } from "../verification.js";
import { Type } from "./base.js";

export class NullType implements Type<null> {
  verifyValue(val: null, ctx: VerificationContext): VerificationStatus {
    return ctx.check(val === null, "not null");
  }

  getTokens() { return ['null' as const] }

  static simple = new NullType();
}


export class UndefinedType implements Type<undefined> {
  verifyValue(val: undefined, ctx: VerificationContext): VerificationStatus {
    return ctx.check(val === undefined, "not undefined");
  }

  getTokens() { return ['undefined' as const] }

  static simple = new UndefinedType();
}


export class RealType implements Type<Real> {
  constructor(public min: Real | null = null, public max: Real | null = null) {}

  verifyValue(val: Real, ctx: VerificationContext): VerificationStatus {
    if (typeof val === 'number') {
      return VerificationStatus.OK.andAlso(
        ctx.check(this.min === null || val >= this.min, `lower than ${this.min}`),
        ctx.check(this.max === null || val <= this.max, `higher than ${this.max}`),
      );
    } else {
      return new VerificationStatus([new VerificationProblem(ctx, 'not a number')])
    }
  }

  getTokens() { return ['real' as const] }

  static simple = new RealType();
  //static maybe = makeUnion(NullDefinition.simple, FloatDefinition.simple);
}

export class IntegerType implements Type<Integer> {
  constructor(public min: Integer | null = null, public max: Integer | null = null) {}

  verifyValue(val: Integer, ctx: VerificationContext): VerificationStatus {
    if (typeof val === 'number' || typeof val === 'bigint') {
      return VerificationStatus.OK.andAlso(
        ctx.check(this.min === null || val >= this.min, `lower than ${this.min}`),
        ctx.check(this.max === null || val <= this.max, `higher than ${this.max}`),
      );
    } else {
      return new VerificationStatus([new VerificationProblem(ctx, 'not a number')])
    }
  }

  getTokens() { return ['int' as const] }

  static all = new IntegerType();
  static positive = new IntegerType(0);
  static negative = new IntegerType(null, 0);
  //static maybe = makeUnion(NullDefinition.simple, FloatDefinition.simple);
}

// export class IntegerDefinition extends FloatDefinition {
//   verifyValue(val: number, ctx: VerificationContext, registry: Registry): VerificationStatus {
//     const numOk = super.verifyValue(val, ctx, registry);
//     return numOk.andAlso(ctx.check(Number.isInteger(val), 'not an integer'))
//   }

//   static simple = new IntegerDefinition();
// }

export class StringType implements Type<string> {
  constructor(public minLen: number | null = null, public maxLen: number | null = null) {}

  verifyValue(val: string, ctx: VerificationContext): VerificationStatus {
    if (typeof val === 'string') {
      return VerificationStatus.OK.andAlso(
        ctx.check(this.minLen === null || val.length >= this.minLen, `shorter than ${this.minLen}`),
        ctx.check(this.maxLen === null || val.length <= this.maxLen, `higher than ${this.maxLen}`),
      );
    } else {
      return new VerificationStatus([new VerificationProblem(ctx, 'not a string')])
    }
  }

  getTokens() { return ['string' as const] }

  static simple = new StringType();
  //static maybe = makeUnion(NullDefinition.simple, StringDefinition.simple);
}


export class BooleanType implements Type<boolean> {
  verifyValue(val: boolean, ctx: VerificationContext): VerificationStatus {
    return ctx.check(typeof val === 'boolean', 'not a boolean');
  }

  getTokens() { return ['boolean' as const] }

  static simple = new BooleanType();
  //static maybe = makeUnion(NullDefinition.simple, BooleanDefinition.simple);
}


export class DateType implements Type<Date> {
  verifyValue(value: Date, ctx: VerificationContext) {
    return ctx.check(value instanceof Date, "Expected Date");
  }

  getTokens() { return [Date] }

  static simple = new DateType();
  //static maybe = makeUnion(NullDefinition.simple, DateDefinition.simple);
}


export class VoidType implements Type<void> {
  verifyValue(val: void, ctx: VerificationContext): VerificationStatus {
    return VerificationStatus.OK;
  }

  getTokens() { return ["undefined" as const] }

  static simple = new VoidType();
}
