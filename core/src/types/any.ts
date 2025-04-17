import { VerificationContext, VerificationStatus } from "../verification.js";
import { Type } from "./base.js";

export class AnyType implements Type<any> {
  verifyValue(val: any, ctx: VerificationContext): VerificationStatus {
    return VerificationStatus.OK;
  }

  getTokens() {
    return ["any" as const] // special case...
  }

  static simple = new AnyType();
}



