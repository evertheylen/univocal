import type pgfull from "pg";
import type { PgClient } from "./client.js";
import { SqlExpr } from "./sql-expr.js";

async function pgFullQuery(pg: Pick<pgfull.ClientBase, 'query'>, expr: SqlExpr, opts?: { log?: boolean; }) {
  const text = expr.toString();

  if (opts?.log) {
    console.log("SQL text", text);
    console.log("SQL values", expr.values);
  }

  let res = await pg.query({
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

export class PgFullPool implements PgClient {
  constructor(
    public connection: pgfull.Pool
  ) {}

  query(expr: SqlExpr, opts?: { log?: boolean; }): Promise<any[]> {
    return pgFullQuery(this.connection, expr, opts)
  }

  isInTransaction(): boolean {
    return false;
  }

  async transaction<T>(func: (client: PgClient) => Promise<T>, opts?: {readonly?: boolean}): Promise<T> {
    const poolClient = await this.connection.connect();
    await poolClient.query('BEGIN;');
    const operator = new PgFullPoolTransactionClient(poolClient);

    try {
      const res = await func(operator);
      // if readonly, force rollback to prevent any potential abuse of the transaction client
      await poolClient.query(opts?.readonly ? "ROLLBACK;": "COMMIT;");
      return res;
    } catch (e) {
      await poolClient.query("ROLLBACK;");
      throw e;
    } finally {
      poolClient.release();
    }
  }
}

export class PgFullPoolTransactionClient implements PgClient {
  constructor(
    public connection: pgfull.PoolClient
  ) {}

  query(expr: SqlExpr, opts?: { log?: boolean; }): Promise<any[]> {
    return pgFullQuery(this.connection, expr, opts);
  }

  async transaction<T>(func: (client: PgClient) => Promise<T>): Promise<T> {
    console.warn("Nested transactions are not supported!");
    return await func(this);
  }

  isInTransaction(): boolean {
    return true;
  }
}

export class PgFullClient implements PgClient {
  constructor(
    public connection: pgfull.Client
  ) {}

  inTransaction: boolean = false;

  query(expr: SqlExpr, opts?: { log?: boolean; }): Promise<any[]> {
    if (this.inTransaction) {
      throw new Error("This client is being used in a transaction!");
    }
    return pgFullQuery(this.connection, expr, opts)
  }

  async transaction<T>(func: (client: PgClient) => Promise<T>, opts?: {readonly?: boolean}): Promise<T> {
    if (this.inTransaction) {
      throw new Error("This client is being used in a transaction!");
    }
    
    this.inTransaction = true;
    await this.connection.query('BEGIN;');

    try {
      const res = await func(new PgFullTransactionClient(this.connection));
      // if readonly, force rollback to prevent any potential abuse of the transaction client
      await this.connection.query(opts?.readonly ? "ROLLBACK;": "COMMIT;");
      return res;
    } catch (e) {
      await this.connection.query("ROLLBACK;");
      throw e;
    } finally {
      this.inTransaction = false;
    }
  }

  isInTransaction(): boolean {
    return false;
  }
}

export class PgFullTransactionClient implements PgClient {
  constructor(
    public connection: pgfull.Client
  ) {}

  query(expr: SqlExpr, opts?: { log?: boolean; }): Promise<any[]> {
    return pgFullQuery(this.connection, expr, opts);
  }

  async transaction<T>(func: (client: PgClient) => Promise<T>): Promise<T> {
    console.warn("Nested transactions are not supported!");
    return await func(this);
  }

  isInTransaction(): boolean {
    return true;
  }
}
