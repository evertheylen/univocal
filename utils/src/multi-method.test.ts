import { expect, test } from 'vitest';
import { createMultiMethod, TypeNode } from './multi-method.js';
import { getJsTypeToken } from './type-token.js';


test("MultiMethod typing", () => {
  type Foo = {id: string};
  type Duplicator = <X extends Foo>(x: X, howmany: (x: X) => number) => X[];
  const f = createMultiMethod<Duplicator>();

  f.define(["*", "*"], (x, h) => [x]);

  // simple class so it can be used as a type token
  class Bar {
    constructor(public id: string, public name: string) {}
  }

  f.define([Bar, "*"], (b, howmany) => {
    b satisfies Bar;

    // HKT NEEDED: @ts-expect-error
    howmany satisfies (x: Foo) => number;

    howmany satisfies (x: Bar) => number;
    return [b];
  });

  f({id: 'foo' as const, hello: 2}, (x) => 2) satisfies {id: 'foo', hello: number}[];

  type Id = <X>(x: X) => X;
  const id = createMultiMethod<Id>();

  // should not work, obviously
  // HKT NEEDED: @ts-expect-error
  id.define(["string"], (x) => 123);

  // should not work, as you may give it a subtype of Bar and it won't return that exact subtype
  // HKT NEEDED: @ts-expect-error
  id.define([Bar], (b) => new Bar('sdf', 'sdf'));
})


test("MultiMethod", () => {

  class A {};

  class B extends A {
    isB() { return true }
  };
  class C extends A {
    isC() { return true }
  };

  class D extends B {
    isD() { return true }
  };
  class E extends B {
    isE() { return true }
  };

  class F extends C {
    isF() { return true }
  };
  class G extends C {
    isG() { return true }
  };

  const mm = createMultiMethod<(a1: A, a2: A) => string>();

  mm.define([A, A], (a, a2) => {
    a satisfies A;
    a2 satisfies A;
    return "it's A"
  });
  
  mm.define([G, C], (g, c) => {
    g satisfies G;
    c satisfies C;
    return "GC"
  });
  mm.define([C, G], (c, g) => {
    g satisfies G;
    c satisfies C;
    
    // @ts-expect-error
    g satisfies B;
    // @ts-expect-error
    c satisfies G;

    return "CG"
  });

  mm.define([B, B], x => "it's B");
  mm.define([A, B], x => "has B");
  mm.define([B, A], x => "also has B");
  mm.define([F, F], x => "very specific");

  // @ts-expect-error
  expect(() => mm.define([A, B, C], x => "uhm").toThrow());

  // run it thrice to test cache
  for (let i = 0; i<3; i++) {
    expect(mm(new A(), new B())).toEqual("has B");
    expect(mm(new B(), new A())).toEqual("also has B");
    expect(() => mm(new G(), new G())).toThrow(/.*ambiguous implementations.*/g);
    expect(mm(new F(), new F())).toEqual("very specific");
  }
});

test("MultiMethod with some stars", () => {
  class Foo {
    isFoo() { return true }
  }

  class Bar extends Foo {
    isBar() { return true }
  }

  const mm = createMultiMethod<(f: Foo) => string>();

  mm.define(["*"], (b) => {
    b satisfies Foo;

    // @ts-expect-error
    b satisfies Bar;

    return 'fallback'
  });
  mm.define([Bar], () => 'bar');

  expect(mm(new Foo())).toBe('fallback');
  expect(mm(new Bar())).toBe('bar');
})

test("Multimethod with array of types", () => {
  const mm = createMultiMethod<(x: any, y: any) => string>();

  class Foo { isFoo() {} };
  class Bar { isBar() {} };

  mm.define([[Foo, "number"], Bar], (x, y) => {
    x satisfies Foo | number;
    y satisfies Bar;
    
    return 'first'
});
  mm.define([[Bar, "string"], [Foo, Bar, "boolean"]], (x, y) => 'second');
  mm.define(["boolean", [Foo, Bar]], (x, y) => 'third');

  expect(mm(new Foo(), new Bar())).toEqual('first');
  expect(mm('test', true)).toEqual('second');
  expect(mm(true, new Bar())).toEqual('third');
  expect(mm(123, new Bar())).toEqual('first');
});

test("TypeNode", () => {
  class Foo {}
  class FooChild extends Foo {}
  class Bar {}

  const tree = new TypeNode<string>("ROOT" as any);
  tree.insert(Object, 'is object');
  tree.insert(Bar, 'is bar');
  tree.insert(FooChild, 'is FooChild');
  tree.insert('null', 'is null');
  tree.insert('string', 'is string');

  expect(tree.findMostSpecificSubTree(getJsTypeToken({}))?.impls[0]).toEqual('is object');
  expect(tree.findMostSpecificSubTree(getJsTypeToken(new Foo()))?.impls[0]).toEqual('is object');
  expect(tree.findMostSpecificSubTree(getJsTypeToken(new FooChild()))?.impls[0]).toEqual('is FooChild');
  expect(tree.findMostSpecificSubTree(getJsTypeToken(new Bar()))?.impls[0]).toEqual('is bar');
  expect(tree.findMostSpecificSubTree(getJsTypeToken(null))?.impls[0]).toEqual('is null');
});
