import { assert } from "@univocal/utils/assert.js";
import { Type } from "./base.js";
import { AnyType } from "./any.js";
import { TypeNode } from "@univocal/utils/multi-method.js";
import { enumerate } from "@univocal/utils/iterators.js";

export class UnionType<T> implements Type<T> {
  readonly subTypes: Type<T>[]

  constructor(subTypes: Type<T>[]) {
    this.subTypes = subTypes.flatMap(type => type instanceof UnionType ? type.subTypes : type);
    assert(this.subTypes.every(d => !(d instanceof AnyType)), "can't have AnyType as subtype of UnionType");
  }

  _tree?: TypeNode<number>;
  get tree() {
    if (this._tree !== undefined) return this._tree;
    this._tree = new TypeNode("ROOT" as any);
    for (const [i, def] of enumerate(this.subTypes)) {
      for (const token of def.getTokens()) {
        if (token === "any") {
          throw new Error("Can't have a Union or Any in a Union");
        }
        this._tree.insert(token, i);
      }
    }
    // do a check
    this._tree.runOnImpls((defNums) => {
      if (defNums.length > 1) {
        throw Error(`Definitions ${defNums} (${defNums.map(i => this.subTypes[i])}) can not be discerned in Union`);
      }
    });
    return this._tree;
  }

  getRelevantSubDefinition(val: T) {
    const token = getTypeToken(val as any);
    const subtree = this.tree.findMostSpecificSubTree(token);
    if (subtree === undefined) return undefined;

    assert(subtree.impls.length === 1, `found multiple relevant Union definitions for ${token}`);
    const def = this.subTypes[subtree.impls[0]];
    if (def instanceof ModelDefinition) {
      // specialize if needed
      return getDefinition(token as Constructor<any>);
    }
    return def;
  }

  verifyValue(val: T, ctx: VerificationContext, registry: Registry): VerificationStatus {
    const subDef = this.getRelevantSubDefinition(val);
    if (subDef === undefined) return ctx.check(false, 'No valid subdefinition found in Union');
    return subDef.verifyValue(val, ctx, registry);
  }

  getToken() {
    return "any" as const;  // but like, this is a special case
  }
}

export function makeUnion<A>(a: Definition<A>): UnionDefinition<A>;
export function makeUnion<A, B>(a: Definition<A>, b: Definition<B>): UnionDefinition<A | B>;
export function makeUnion<A, B, C>(a: Definition<A>, b: Definition<B>, c: Definition<C>): UnionDefinition<A | B | C>;
export function makeUnion<A, B, C, D>(a: Definition<A>, b: Definition<B>, c: Definition<C>, d: Definition<D>): UnionDefinition<A | B | C | D>;
export function makeUnion<A, B, C, D, E>(a: Definition<A>, b: Definition<B>, c: Definition<C>, d: Definition<D>, e: Definition<E>): UnionDefinition<A | B | C | D | E>;
export function makeUnion<T>(...subDefs: Definition<T>[]): UnionDefinition<T> {
  return new UnionDefinition(subDefs);
}
