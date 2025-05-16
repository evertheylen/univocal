import type pgfull from 'pg';
import type * as pglite from '@electric-sql/pglite';
import { SqlExpr } from './sql-expr.js';
import { PgLiteClient } from './pglite.js';
import { PgFullClient, PgFullPool } from './pgreal.js';

export interface PgClient {
  query(expr: SqlExpr, opts?: {log?: boolean}): Promise<any[]>

  transaction<T>(func: (client: PgClient) => Promise<T>): Promise<T>

  isInTransaction(): boolean
}

export function maybeTransaction<T>(client: PgClient, func: (client: PgClient) => Promise<T>): Promise<T> {
  if (client.isInTransaction()) {
    return func(client);
  } else {
    return client.transaction(func)
  }
}


export async function connect(url: string | URL, opts?: {
  lite?: pglite.PGliteOptions,
  pool?: pgfull.PoolConfig | false
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
      return new PgFullClient(new pg.Client(url.toString()));
    } else {
      return new PgFullPool(new pg.Pool({
        ...opts?.pool,
        connectionString: url.toString()
      }));
    }
  }
}
