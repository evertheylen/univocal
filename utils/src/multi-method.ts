import { assert, assertEq } from "./assert.js";
import { enumerate, max, product, zip } from "./iterators.js";
import { intersection } from "./sets.js";
import { getJsTypeToken, getRelation, isMoreSpecific, JsTypeToken, JsTypeTokenFor, reprJsTypeToken, TypeForToken, TypeRelation, Value } from "./type-token.js";

/* Some code generation utility:

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateArrayMapperType(name: string, baseType: string, mapper: string, max: number): string {
  const lines = [];
  for (let i = 0; i<=max; i++) {
    const inferArray = [];
    for (let j=0; j<i; j++) inferArray.push(baseType === 'any' ? `infer ${chars[j]}` : `infer ${chars[j]} extends ${baseType}`);
    
    const outputTypeArray = [];
    for (let j=0; j<i; j++) outputTypeArray.push(`${mapper}<${chars[j]}>`);

    const inputExtendsArray = Array(i).fill(baseType);

    lines.push({
        infers: `[${inferArray.join(", ")}]`,
        outputType: `[${outputTypeArray.join(", ")}]`,
        inputExtends: `[${inputExtendsArray.join(", ")}]`,
    });
  }

  const body = lines.map(x => `T extends ${x.infers} ? ${x.outputType} :`);
  return `type ${name}<T extends ${lines.map(x => x.inputExtends).join(" | ")}> = (\n  ${body.join('\n  ')}\n  never\n)`;
}
*/

// For more background on multiple dispatch, see [this thesis] (from the cocreator of Julia):
// https://raw.githubusercontent.com/JeffBezanson/phdthesis/master/main.pdf

export type MmJsTypeToken = JsTypeToken | JsTypeToken[] | "*";

export type MmJsTypeTokenFor<T> = JsTypeTokenFor<T> | JsTypeTokenFor<T>[] | "*";

export type MmTypeForToken<T extends MmJsTypeToken | undefined, Fallback> = (
  T extends "*" ? Fallback :
  T extends (infer X extends JsTypeToken)[] ? MmTypeForToken<X, Fallback> :
  T extends JsTypeToken ? TypeForToken<T> :
  never
);

// generateArrayMapperType("TypeListForJsTypeTokenList", "GivenJsTypeToken", "TypeForJsTypeToken", 10)
type JsTypeTokenList = [MmJsTypeToken] | [MmJsTypeToken, MmJsTypeToken] | [MmJsTypeToken, MmJsTypeToken, MmJsTypeToken] | [MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken] | [MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken] | [MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken] | [MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken] | [MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken] | [MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken] | [MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken, MmJsTypeToken];
export type TypeListForJsTypeTokenList<T extends JsTypeTokenList, Input extends any[]> = (
  //T extends [] ? [] :
  T extends [infer A extends MmJsTypeToken] ? [MmTypeForToken<A, Input[0]>] :
  T extends [infer A extends MmJsTypeToken, infer B extends MmJsTypeToken] ? [MmTypeForToken<A, Input[0]>, MmTypeForToken<B, Input[1]>] :
  T extends [infer A extends MmJsTypeToken, infer B extends MmJsTypeToken, infer C extends MmJsTypeToken] ? [MmTypeForToken<A, Input[0]>, MmTypeForToken<B, Input[1]>, MmTypeForToken<C, Input[2]>] :
  T extends [infer A extends MmJsTypeToken, infer B extends MmJsTypeToken, infer C extends MmJsTypeToken, infer D extends MmJsTypeToken] ? [MmTypeForToken<A, Input[0]>, MmTypeForToken<B, Input[1]>, MmTypeForToken<C, Input[2]>, MmTypeForToken<D, Input[3]>] :
  T extends [infer A extends MmJsTypeToken, infer B extends MmJsTypeToken, infer C extends MmJsTypeToken, infer D extends MmJsTypeToken, infer E extends MmJsTypeToken] ? [MmTypeForToken<A, Input[0]>, MmTypeForToken<B, Input[1]>, MmTypeForToken<C, Input[2]>, MmTypeForToken<D, Input[3]>, MmTypeForToken<E, Input[4]>] :
  T extends [infer A extends MmJsTypeToken, infer B extends MmJsTypeToken, infer C extends MmJsTypeToken, infer D extends MmJsTypeToken, infer E extends MmJsTypeToken, infer F extends MmJsTypeToken] ? [MmTypeForToken<A, Input[0]>, MmTypeForToken<B, Input[1]>, MmTypeForToken<C, Input[2]>, MmTypeForToken<D, Input[3]>, MmTypeForToken<E, Input[4]>, MmTypeForToken<F, Input[5]>] :
  T extends [infer A extends MmJsTypeToken, infer B extends MmJsTypeToken, infer C extends MmJsTypeToken, infer D extends MmJsTypeToken, infer E extends MmJsTypeToken, infer F extends MmJsTypeToken, infer G extends MmJsTypeToken] ? [MmTypeForToken<A, Input[0]>, MmTypeForToken<B, Input[1]>, MmTypeForToken<C, Input[2]>, MmTypeForToken<D, Input[3]>, MmTypeForToken<E, Input[4]>, MmTypeForToken<F, Input[5]>, MmTypeForToken<G, Input[6]>] :
  T extends [infer A extends MmJsTypeToken, infer B extends MmJsTypeToken, infer C extends MmJsTypeToken, infer D extends MmJsTypeToken, infer E extends MmJsTypeToken, infer F extends MmJsTypeToken, infer G extends MmJsTypeToken, infer H extends MmJsTypeToken] ? [MmTypeForToken<A, Input[0]>, MmTypeForToken<B, Input[1]>, MmTypeForToken<C, Input[2]>, MmTypeForToken<D, Input[3]>, MmTypeForToken<E, Input[4]>, MmTypeForToken<F, Input[5]>, MmTypeForToken<G, Input[6]>, MmTypeForToken<H, Input[7]>] :
  T extends [infer A extends MmJsTypeToken, infer B extends MmJsTypeToken, infer C extends MmJsTypeToken, infer D extends MmJsTypeToken, infer E extends MmJsTypeToken, infer F extends MmJsTypeToken, infer G extends MmJsTypeToken, infer H extends MmJsTypeToken, infer I extends MmJsTypeToken] ? [MmTypeForToken<A, Input[0]>, MmTypeForToken<B, Input[1]>, MmTypeForToken<C, Input[2]>, MmTypeForToken<D, Input[3]>, MmTypeForToken<E, Input[4]>, MmTypeForToken<F, Input[5]>, MmTypeForToken<G, Input[6]>, MmTypeForToken<H, Input[7]>, MmTypeForToken<I, Input[8]>] :
  T extends [infer A extends MmJsTypeToken, infer B extends MmJsTypeToken, infer C extends MmJsTypeToken, infer D extends MmJsTypeToken, infer E extends MmJsTypeToken, infer F extends MmJsTypeToken, infer G extends MmJsTypeToken, infer H extends MmJsTypeToken, infer I extends MmJsTypeToken, infer J extends MmJsTypeToken] ? [MmTypeForToken<A, Input[0]>, MmTypeForToken<B, Input[1]>, MmTypeForToken<C, Input[2]>, MmTypeForToken<D, Input[3]>, MmTypeForToken<E, Input[4]>, MmTypeForToken<F, Input[5]>, MmTypeForToken<G, Input[6]>, MmTypeForToken<H, Input[7]>, MmTypeForToken<I, Input[8]>, MmTypeForToken<J, Input[9]>] :
  never
)

// generateArrayMapperType("JsTypeTokenListForTypeList", "any", "JsTypeTokenForType", 10)
type TypeList = [any] | [any, any] | [any, any, any] | [any, any, any, any] | [any, any, any, any, any] | [any, any, any, any, any, any] | [any, any, any, any, any, any, any] | [any, any, any, any, any, any, any, any] | [any, any, any, any, any, any, any, any, any] | [any, any, any, any, any, any, any, any, any, any];
export type JsTypeTokenListForTypeList<T extends TypeList> = (
  //T extends [] ? [] :
  T extends [infer A] ? [MmJsTypeTokenFor<A>] :
  T extends [infer A, infer B] ? [MmJsTypeTokenFor<A>, MmJsTypeTokenFor<B>] :
  T extends [infer A, infer B, infer C] ? [MmJsTypeTokenFor<A>, MmJsTypeTokenFor<B>, MmJsTypeTokenFor<C>] :
  T extends [infer A, infer B, infer C, infer D] ? [MmJsTypeTokenFor<A>, MmJsTypeTokenFor<B>, MmJsTypeTokenFor<C>, MmJsTypeTokenFor<D>] :
  T extends [infer A, infer B, infer C, infer D, infer E] ? [MmJsTypeTokenFor<A>, MmJsTypeTokenFor<B>, MmJsTypeTokenFor<C>, MmJsTypeTokenFor<D>, MmJsTypeTokenFor<E>] :
  T extends [infer A, infer B, infer C, infer D, infer E, infer F] ? [MmJsTypeTokenFor<A>, MmJsTypeTokenFor<B>, MmJsTypeTokenFor<C>, MmJsTypeTokenFor<D>, MmJsTypeTokenFor<E>, MmJsTypeTokenFor<F>] :
  T extends [infer A, infer B, infer C, infer D, infer E, infer F, infer G] ? [MmJsTypeTokenFor<A>, MmJsTypeTokenFor<B>, MmJsTypeTokenFor<C>, MmJsTypeTokenFor<D>, MmJsTypeTokenFor<E>, MmJsTypeTokenFor<F>, MmJsTypeTokenFor<G>] :
  T extends [infer A, infer B, infer C, infer D, infer E, infer F, infer G, infer H] ? [MmJsTypeTokenFor<A>, MmJsTypeTokenFor<B>, MmJsTypeTokenFor<C>, MmJsTypeTokenFor<D>, MmJsTypeTokenFor<E>, MmJsTypeTokenFor<F>, MmJsTypeTokenFor<G>, MmJsTypeTokenFor<H>] :
  T extends [infer A, infer B, infer C, infer D, infer E, infer F, infer G, infer H, infer I] ? [MmJsTypeTokenFor<A>, MmJsTypeTokenFor<B>, MmJsTypeTokenFor<C>, MmJsTypeTokenFor<D>, MmJsTypeTokenFor<E>, MmJsTypeTokenFor<F>, MmJsTypeTokenFor<G>, MmJsTypeTokenFor<H>, MmJsTypeTokenFor<I>] :
  T extends [infer A, infer B, infer C, infer D, infer E, infer F, infer G, infer H, infer I, infer J] ? [MmJsTypeTokenFor<A>, MmJsTypeTokenFor<B>, MmJsTypeTokenFor<C>, MmJsTypeTokenFor<D>, MmJsTypeTokenFor<E>, MmJsTypeTokenFor<F>, MmJsTypeTokenFor<G>, MmJsTypeTokenFor<H>, MmJsTypeTokenFor<I>, MmJsTypeTokenFor<J>] :
  never
)

class MultiMethodImpl {
  constructor(
    public JsTypeTokens: JsTypeToken[],
    public func: Function
  ) {}
}


export class TypeNode<Payload = MultiMethodImpl> {
  constructor(
    public JsTypeToken: JsTypeToken,
    public impls: Payload[] = [],
    public subTrees: TypeNode<Payload>[] = [],
  ) {}

  insert(argJsTypeToken: JsTypeToken, impl: Payload) {
    // Subtrees that are actually subtypes of our given argJsTypeToken will need to be restructured
    // under our new tree
    const toBeRestructured: TypeNode<Payload>[] = [];
    const toBeDeleted: number[] = [];

    for (const [i, subTree] of enumerate(this.subTrees)) {
      const rel = getRelation(argJsTypeToken, subTree.JsTypeToken);
      if (rel === TypeRelation.subtype) {
        subTree.insert(argJsTypeToken, impl);
        assert(toBeRestructured.length === 0)
        return;
      } else if (rel === TypeRelation.same) {
        subTree.impls.push(impl);
        assert(toBeRestructured.length === 0)
        return;
      } else if (rel === TypeRelation.supertype) {
        toBeRestructured.push(subTree);
        toBeDeleted.push(i);
      }
      // else: it's unrelated, we don't bother
    }

    // if we reach this point, we have to restructure
    this.subTrees = this.subTrees.filter((_, i) => !toBeDeleted.includes(i));
    const newTree = new TypeNode(argJsTypeToken, [impl], toBeRestructured);
    this.subTrees.push(newTree);
  }

  findSubTree(JsTypeToken: JsTypeToken) {
    for (const subTree of this.subTrees) {
      const rel = getRelation(JsTypeToken, subTree.JsTypeToken);
      if (rel === TypeRelation.same || rel === TypeRelation.subtype) {
        return subTree;
      }
    }
    return undefined;
  }

  findMostSpecificSubTree(JsTypeToken: JsTypeToken): TypeNode<Payload> | undefined {
    for (const subTree of this.subTrees) {
      const rel = getRelation(JsTypeToken, subTree.JsTypeToken);
      if (rel === TypeRelation.same || rel === TypeRelation.subtype) {
        return subTree.findMostSpecificSubTree(JsTypeToken) ?? subTree;
      }
    }
    return undefined;
  }

  runOnImpls(f: (p: Payload[]) => void) {
    f(this.impls);
    for (const subtree of this.subTrees) {
      subtree.runOnImpls(f)
    }
  }

  repr(indent = 0) {
    if (indent > 10) {
      return " ".repeat(indent*2) + 'STOP\n';
    }

    let s = " ".repeat(indent*2) + `- JsTypeToken ${reprJsTypeToken(this.JsTypeToken)} with ${this.impls.length} impls\n`;
    for (const subTree of this.subTrees) {
      s += subTree.repr(indent+1);
    }
    return s;
  }
}

export class _MultiMethod<
  Input extends TypeList,
  Return
> {
  // For each argument, we keep a tree of types
  public trees: TypeNode[] = [];

  public frozen = false;
  // This map will contain ','-separated string representations of JsTypeTokens (to get around 
  // Maps being very limited in their key types).
  public cache = new Map<string, MultiMethodImpl>();
  
  public JsTypeTokenIdCounter = 0;
  public JsTypeTokenToId = new Map<any, string>();

  protected JsTypeTokenToString(t: JsTypeToken) {
    if (typeof t === 'string') {
      return t.slice(0, 2).toUpperCase()
    } else {
      let s = this.JsTypeTokenToId.get(t);
      if (s !== undefined) return s;
      s = this.JsTypeTokenIdCounter.toString(36);
      this.JsTypeTokenIdCounter++;
      this.JsTypeTokenToId.set(t, s);
      return s;
    }
  }

  add<SubJsTypeTokens extends JsTypeTokenListForTypeList<Input>>(
    argTypes: SubJsTypeTokens,
    func: (...args: TypeListForJsTypeTokenList<SubJsTypeTokens, Input>) => Return
  ) {
    if (this.frozen) {
      // TODO: We can support this usecase by a smarter way to invalidate cache etc
      throw new Error("MultiMethod already frozen after use, can't add new methods");
    }

    // make sure we have enough trees or fail if it doesn't match
    if (this.trees.length === 0) {
      this.trees = argTypes.map(_ => new TypeNode("ROOT" as any));
    } else {
      assertEq(this.trees.length, argTypes.length);
    }
    // also replace "*"
    const argTypesInProperArrays = argTypes.map(x => x === "*" ? ["any"] : Array.isArray(x) ? x : [x]) as JsTypeToken[][];
    const productOfArgTypes = product(...argTypesInProperArrays);
    for (const actualArgTypes of productOfArgTypes) {
      const impl = new MultiMethodImpl(actualArgTypes, func);

      for (const [argJsTypeToken, tree] of zip(actualArgTypes, this.trees)) {
        tree.insert(argJsTypeToken, impl);
      }
    }
  }

  call(...args: Input): Return {
    if (this.trees.length === 0) {
      throw new Error(`No implementation given for the multimethod yet. Did you import the necessary implementations?`);
    }
    
    if (args.length !== this.trees.length) {
      throw new Error(`The multimethod requires ${this.trees.length} arguments but was only given ${args.length}`);
    }
    this.frozen = true;

    // try {
      const argJsTypeTokens = args.map(getJsTypeToken) as JsTypeToken[];

      // First try to get a cache hit
      const key = argJsTypeTokens.map(t => this.JsTypeTokenToString(t)).join(",");
      let impl = this.cache.get(key);
      if (impl !== undefined) {
        return impl.func(...(args as any));
      }

      // If not, traverse the trees
      impl = this.findMostSpecific(argJsTypeTokens);
      this.cache.set(key, impl);
      return impl.func(...(args as any));
    // } catch (e) {
    //   console.error("Error while trying to call multimethod with arguments", args);
    //   throw e;
    // }
  }

  findMostSpecific(argJsTypeTokens: JsTypeToken[]): MultiMethodImpl {
    // Figure out all the "most-specific" implementations. An implementation is most-specific iff
    // there is no other implementation that more specific in at least one argument and at least
    // equally specific in all other arguments.

    // First we go down the tree for each argument, and build a list of impls in order
    // of specificity. Then we remove all impls that are not present in each list of
    // each argument.

    const descendTree = (tree: TypeNode, argJsTypeToken: JsTypeToken): MultiMethodImpl[] => {
      const subtree = tree.findSubTree(argJsTypeToken);
      return [...tree.impls, ...(subtree !== undefined ? descendTree(subtree, argJsTypeToken) : [])]
    }
    const implsPerArgument = [...zip(this.trees, argJsTypeTokens)].map(
      ([tree, argJsTypeToken]) => descendTree(tree, argJsTypeToken)
    );
    const setsPerArgument = implsPerArgument.map(l => new Set(l));
    const validForAllArguments = [...intersection(...setsPerArgument)];
    if (validForAllArguments.length === 0) {
      throw new Error(`No valid implementation found for JsTypeTokens [${argJsTypeTokens.map(reprJsTypeToken).join(", ")}]`);
    }
    
    // First find _some_ most specific implementation
    const mostSpecific = max(validForAllArguments, (a, b) => isMoreSpecific(a.JsTypeTokens, b.JsTypeTokens))!;

    // Then make sure it's more specific than _all_ others
    for (const impl of validForAllArguments) {
      if (impl === mostSpecific) continue;
      if (!isMoreSpecific(mostSpecific.JsTypeTokens, impl.JsTypeTokens)) {
        throw new Error(`Found (at least) two ambiguous implementations, with types ${mostSpecific.JsTypeTokens} and ${impl.JsTypeTokens}`);
      }
    }

    return mostSpecific;
  }
}

export function defineMultiMethod<Input extends TypeList, Return>() {
  const mm = new _MultiMethod<Input, Return>();
  const f = (...args: Input) => mm.call(...args);
  f.add = mm.add.bind(mm);
  f._underlying = mm;
  return f;
}

// Example:
// const f = defineMultiMethod<[X, Y], Z>();
// f.add([SubX, "*"], (x, y) => { return new Z(); })
