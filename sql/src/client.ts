import type pg from 'pg';
import type { PGlite, PGliteOptions } from '@electric-sql/pglite';
import { SqlExpr } from './sql-expr.js';



export interface PgClient {
  query(expr: SqlExpr, opts?: {log?: boolean}): Promise<any[]>
}


export class PgLiteClient implements PgClient {
  constructor(
    public pgLite: PGlite
  ) {}

  async query(expr: SqlExpr, opts?: { log?: boolean }) {
    const text = expr.toString();

    if (opts?.log) {
      console.log("SQL text", text);
      console.log("SQL values", expr.values);
    }

    let res = await this.pgLite.query(text, expr.values, {
      rowMode: 'object'
    });

    if (opts?.log) {
      console.log(`Affected ${res.affectedRows} rows`);
    }
    
    return res.rows;
  }
}


export class PgConnectionClient implements PgClient {
  constructor(
    public connection: pg.Client | pg.Pool | pg.PoolClient
  ) {}

  async query(expr: SqlExpr, opts?: { log?: boolean; }) {
    const text = expr.toString();

    if (opts?.log) {
      console.log("SQL text", text);
      console.log("SQL values", expr.values);
    }

    let res = await this.connection.query({
      //rowMode: 'object',  -> default
      text,
      values: expr.values
    });

    // Multiple commands, only return last
    // Note that if you're running multiple commands, you can't use any inline parameters (like $1)!
    if (Array.isArray(res)) {
      res = res[res.length - 1];
    }

    if (opts?.log) {
      console.log(`Affected ${res.rowCount} rows`);
    }

    return res.rows;
  }
}


export async function connect(url: string | URL, opts?: {
  lite?: PGliteOptions,
  pool?: pg.PoolConfig | false
}) {
  if (!(url instanceof URL)) {
    url = new URL(url);
  }

  if (url.protocol === 'file:' || url.protocol === 'memory:' || url.protocol === 'idb:') {
    const pglite = await import("@electric-sql/pglite");
    return new PgLiteClient(await pglite.PGlite.create(url.toString()));
  } else {
    const pg = await import("pg");
    if (opts?.pool === false) {
      return new PgConnectionClient(new pg.Client(url.toString()));
    } else {
      return new PgConnectionClient(new pg.Pool({
        ...opts?.pool,
        connectionString: url.toString()
      }));
    }
  }
}
