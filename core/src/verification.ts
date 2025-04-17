
export class VerificationContext {
  constructor(
    public readonly keys: string[] = []
  ) { }

  atKey(key: any) {
    return new VerificationContext([...this.keys, key.toString()]);
  }

  up() {
    return new VerificationContext(this.keys.slice(0, -1));
  }

  check(ok: boolean, msg?: string) {
    if (ok) {
      return VerificationStatus.OK;
    } else {
      return new VerificationStatus([new VerificationProblem(this, msg)]);
    }
  }
}

export class VerificationProblem {
  constructor(
    public context: VerificationContext,
    public msg?: string
  ) { }

  toString() {
    const ctx = this.context.keys.join('.');
    if (this.msg === undefined) {
      return `problem at ${ctx}`;
    } else {
      return `${ctx}: ${this.msg}`;
    }
  }
}

export class VerificationError extends Error {
  constructor(
    public problems: VerificationProblem[]
  ) {
    super(`Data could not pass verification: ${problems.map(p => p.toString()).join(', ')}`);
  }
}

export class VerificationStatus {
  constructor(
    public problems: VerificationProblem[]
  ) { }

  addProblem(ctx: VerificationContext, msg?: string) {
    this.problems.push(new VerificationProblem(ctx, msg));
  }

  assertOk() {
    if (this.problems.length > 0) {
      throw new VerificationError(this.problems);
    }
  }

  isOk() {
    return this.problems.length === 0;
  }

  andAlso(...others: VerificationStatus[]) {
    return new VerificationStatus(this.problems.concat(...others.map(vs => vs.problems)));
  }

  static OK = new VerificationStatus([]);
}

// export const VerifyModel: unique symbol = Symbol("VerifyModel");

// export interface VerifiedModel {
//   [VerifyModel](ctx: VerificationContext, registry: Registry): VerificationStatus
// }

// export function verifyModel(m: VerifiedModel, registry: Registry) {
//   const def = getDefinition(m);
//   return def.verifyValue(m, new VerificationContext(), registry);
// }
