import { getPrimitiveToken, JsTypeToken, Value } from "@univocal/utils/type-token.js";
import { VerificationContext, VerificationStatus } from "../verification.js";
import { Type } from "./base.js";

// only those types that can be used as key in a Map
export class LiteralType<const T extends string | number | bigint | boolean | null> implements Type<T> {
  constructor(public val: T) {}

  verifyValue(val: T, ctx: VerificationContext): VerificationStatus {
    // TODO use better equality test?
    return ctx.check(this.val === val, 'value not equal');
  }

  getTokens(): JsTypeToken[] {
    return [getPrimitiveToken(this.val)]
  }
}
