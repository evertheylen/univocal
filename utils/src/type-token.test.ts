import { describe, expect, test } from '@jest/globals';
import { getRelation, getJsTypeToken, TypeRelation, isMoreSpecific, isInPrototypeChain } from "./type-token.js";

class Animal {};
class Dog extends Animal {};
class Pit extends Dog {};
class Cat extends Animal {};

test("getJsTypeToken", () => {
  expect(getJsTypeToken(new Dog())).toEqual(Dog);
  expect(getJsTypeToken(123)).toEqual("number");
  expect(getJsTypeToken(12345612345689798654654321654878965465312n)).toEqual("bigint");
  expect(getJsTypeToken(true)).toEqual("boolean");
  expect(getJsTypeToken(() => {})).toEqual("function");
  expect(getJsTypeToken("blablabla")).toEqual("string");
  expect(getJsTypeToken(undefined)).toEqual("undefined");
});

test("getRelation", () => {
  expect(getRelation("number", "number")).toEqual(TypeRelation.same);
  expect(getRelation("boolean", "string")).toEqual(TypeRelation.unrelated);
  expect(getRelation(Animal, Pit)).toEqual(TypeRelation.supertype);
  expect(getRelation(Dog, Pit)).toEqual(TypeRelation.supertype);
  expect(getRelation(Dog, Cat)).toEqual(TypeRelation.unrelated);
  expect(getRelation(Cat, Animal)).toEqual(TypeRelation.subtype);
});

test("isMoreSpecific", () => {
  expect(isMoreSpecific(["any"], ["any"])).toBe(false);
  class Foo {}
  expect(isMoreSpecific([Foo], ["any"])).toBe(true);
  expect(isMoreSpecific(["any"], [Foo])).toBe(false);
});
