import { describe, expect, test } from '@jest/globals';
import { connect } from "./client.js";
import { sql } from './sql-expr.js';

test('simple pglite test', async () => {
  const db = await connect("memory://foobar");
  const res = await db.query(sql`SELECT 5+5 as res`);
  expect(res).toEqual([{res: 10}]);
});
