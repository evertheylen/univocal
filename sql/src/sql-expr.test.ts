import { describe, expect, test } from '@jest/globals';
import { sql, SqlExpr } from './sql-expr.js'

const planet = sql`[The ${3}th planet from the ${'Sun'}]`;
const helloPlanet = sql`Hello ${planet}`;
const math = sql`${12} + ${34} = ${12+34}`;
const expr = sql`${helloPlanet}, did you know ${math} is ${true}?`;

const expr2 = new SqlExpr(
  ['', 'Hello ', '[The ', null, 'th planet from the ', null, ']', '', ', did you know ', '', null, ' + ', null, ' = ', null, '', ' is ', null, '?'],
  [3, 'Sun', 12, 34, 12+34, true]
);

test('sql tagged template literal', () => {
  expect(sql`foo`).toEqual(new SqlExpr(["foo"], []));
  expect(sql`foo ${123} bar`).toEqual(new SqlExpr(["foo ", null, " bar"], [123]));
  expect(expr).toEqual(expr2);
});

test('SqlExpr.toQueryConfig', () => {
  expect(expr.toString()).toEqual('Hello [The $1th planet from the $2], did you know $3 + $4 = $5 is $6?');
  expect(expr.values).toEqual([3, 'Sun', 12, 34, 12+34, true]);
});
