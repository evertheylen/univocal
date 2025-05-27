import type * as pglite from '@electric-sql/pglite';

import type { Endable, PgClient } from './client.js';
import { SqlExpr } from './sql-expr.js';

async function pgLiteQuery(client: Pick<pglite.PGliteInterface, 'query'>, expr: SqlExpr, opts?: { log?: boolean }) {
  const text = expr.toString();

  if (opts?.log) {
    console.log("SQL text", text);
    console.log("SQL values", expr.values);
  }

  let res = await client.query(text, expr.values, {
    rowMode: 'object'
  });

  if (opts?.log) {
    console.log(`Affected ${res.affectedRows} rows`);
  }
  
  return res.rows;
}

export class PgLiteClient implements PgClient, Endable {
  constructor(public pgLite: pglite.PGlite) {}

  query(expr: SqlExpr, opts?: { log?: boolean; }): Promise<any[]> {
    return pgLiteQuery(this.pgLite, expr, opts);
  }

  async transaction<T>(func: (client: PgClient) => Promise<T>): Promise<T> {
    return this.pgLite.transaction((tx) => func(new PgLiteTransactionClient(tx)));
  }

  isInTransaction(): boolean {
    return this.pgLite.isInTransaction();
  }

  end(): Promise<void> {
    return this.pgLite.close();
  }
}

export class PgLiteTransactionClient implements PgClient {
  constructor(public pgLiteTransaction: pglite.Transaction) {}

  query(expr: SqlExpr, opts?: { log?: boolean; }): Promise<any[]> {
    return pgLiteQuery(this.pgLiteTransaction, expr, opts);
  }

  async transaction<T>(func: (client: PgClient) => Promise<T>): Promise<T> {
    console.warn("Nested transactions are not supported!");
    return await func(this);
  }

  isInTransaction(): boolean {
    return true;
  }
}
