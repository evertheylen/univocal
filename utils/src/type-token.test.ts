import { expect, test } from 'vitest';
import { getRelation, getPrimitiveToken, TypeRelation, isMoreSpecific, isInPrototypeChain } from "./type-token.js";

class Animal {};
class Dog extends Animal {};
class Pit extends Dog {};
class Cat extends Animal {};

test("getJsTypeToken", () => {
  expect(getPrimitiveToken(new Dog())).toEqual(Dog);
  expect(getPrimitiveToken(123)).toEqual("int");
  expect(getPrimitiveToken(123.4)).toEqual("real");
  expect(getPrimitiveToken(12345612345689798654654321654878965465312n)).toEqual("bigint");
  expect(getPrimitiveToken(true)).toEqual("boolean");
  expect(getPrimitiveToken(() => {})).toEqual("function");
  expect(getPrimitiveToken("blablabla")).toEqual("string");
  expect(getPrimitiveToken(undefined)).toEqual("undefined");
});

test("getRelation", () => {
  expect(getRelation("real", "real")).toEqual(TypeRelation.same);
  expect(getRelation("int", "real")).toEqual(TypeRelation.subtype);
  expect(getRelation("real", "int")).toEqual(TypeRelation.supertype);
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
