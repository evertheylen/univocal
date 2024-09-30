import { describe, expect, test } from '@jest/globals';
import { defineMultiMethod, TypeNode } from './multi-method.js';
import { getJsTypeToken } from './type-token.js';


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


  const mm = defineMultiMethod<[A, A], string>();

  mm.add([A, A], (a, a2) => {
    a satisfies A;
    a2 satisfies A;
    return "it's A"
  });
  
  mm.add([G, C], (g, c) => {
    g satisfies G;
    c satisfies C;
    return "GC"
  });
  mm.add([C, G], (c, g) => {
    g satisfies G;
    c satisfies C;
    
    // @ts-expect-error
    g satisfies B;
    // @ts-expect-error
    c satisfies G;

    return "CG"
  });

  mm.add([B, B], x => "it's B");
  mm.add([A, B], x => "has B");
  mm.add([B, A], x => "also has B");
  mm.add([F, F], x => "very specific");

  // @ts-expect-error
  expect(() => mm.add([A, B, C], x => "uhm").toThrow());

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

  const mm = defineMultiMethod<[Foo], string>();

  mm.add(["*"], (b) => {
    b satisfies Foo;

    // @ts-expect-error
    b satisfies Bar;

    return 'fallback'
  });
  mm.add([Bar], () => 'bar');

  expect(mm(new Foo())).toBe('fallback');
  expect(mm(new Bar())).toBe('bar');
})

test("Multimethod with array of types", () => {
  const mm = defineMultiMethod<[any, any], string>();

  class Foo { isFoo() {} };
  class Bar { isBar() {} };

  mm.add([[Foo, "number"], Bar], (x, y) => {
    x satisfies Foo | number;
    y satisfies Bar;
    
    return 'first'
});
  mm.add([[Bar, "string"], [Foo, Bar, "boolean"]], (x, y) => 'second');
  mm.add(["boolean", [Foo, Bar]], (x, y) => 'third');

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
