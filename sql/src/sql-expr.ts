
import type pg from 'pg';
import { enumerate, zip } from '@univocal/utils/iterators.js';

export class LiteralSqlString {
  static validLiteral = /^[a-zA-Z0-9 \_-]*$/;

  constructor(public innerText: string, public quoted: boolean = false) {
    if (!LiteralSqlString.validLiteral.test(innerText)) {
      throw new Error("LiteralSqlString got an unexpected string");
    }
  }

  get text() {
    return this.quoted ? '"' + this.innerText + '"' : this.innerText;
  }
}

export type Mergeable = string | number | SqlExpr | LiteralSqlString

export class SqlExpr {
  public readonly fragments: (string | null)[]

  constructor(
    fragments: (string | null)[],  // null = insert value here
    public readonly values: any[]
  ) {
    this.fragments = fragments.filter(x => x !== '');
    
    let trimStart=0;
    for (; trimStart < this.fragments.length; trimStart++) {
      if (this.fragments[trimStart] === null || this.fragments[trimStart]!.trim() !== '') break;
    }

    let trimEnd=this.fragments.length-1;
    for (; trimEnd >= 0; trimEnd--) {
      if (this.fragments[trimEnd] === null || this.fragments[trimEnd]!.trim() !== '') break;
    }

    this.fragments = this.fragments.slice(trimStart, trimEnd+1);
  }

  // toArrayQuery(): pg.QueryArrayConfig {
  //   return {
  //     text: this.toString().trim(),
  //     values: this.values,
  //     rowMode: 'array'
  //   }
  // }

  // toObjectQuery(): pg.QueryConfig {
  //   return {
  //     text: this.toString(),
  //     values: this.values,
  //   }
  // }

  toString() {
    let i = 0;
    let res = "";
    for (const fragment of this.fragments) {
      if (fragment === null) {
        res += `$${++i}`
      } else {
        res += fragment;
      }
    }
    return res.trim();
  }

  static merge(parts: Mergeable[], start: string, div: string, end: string) {
    // strings will be interpreted as values!
    const fragments: (string | null)[] = [start];
    const values = [];

    for (const part of parts) {
      if (typeof part === 'string' || typeof part === 'number') {
        fragments.push(null);
        values.push(part.toString());
      } else if (part instanceof SqlExpr) {
        fragments.push(...part.fragments);
        values.push(...part.values);
      } else {
        fragments.push(part.text);
      }
      if (div !== "") {
        fragments.push(div);
      }
    }

    // Pop last divider
    if (div !== "" && parts.length > 0) {
      fragments.pop();
    }

    fragments.push(end);
    return new SqlExpr(fragments, values);
  }
}

export function sql(strings: TemplateStringsArray, ...values: any[]) {
  // To use as a tagged template literal
  const allFragments = [];
  const allValues = [];

  for (const [textFragment, value] of zip(strings, values)) {
    allFragments.push(textFragment)
    if (value === sql.nothing) {
      // do nothing
    } else if (value instanceof SqlExpr) {
      allFragments.push(...value.fragments);
      allValues.push(...value.values);
    } else if (value instanceof LiteralSqlString) {
      allFragments.push(value.text);
    } else {
      allFragments.push(null);
      allValues.push(value);
    }
  }

  allFragments.push(strings[strings.length-1]);

  return new SqlExpr(allFragments, allValues);
}

export function dangerouslyStringify(expr: SqlExpr) {
  let text = expr.toString();
  const values = expr.values.map(x => typeof x === 'string' ? ('$x$' + x + '$x$') : (x === null ? 'NULL' : x.toString()));
  for (const [i, value] of enumerate(values, 1)) {
    text = text.replace(new RegExp('\\$' + i), value);
  }
  return text;
}

// Be careful with this!
sql.lit = (s: string) => new LiteralSqlString(s, false);
sql.qlit = (s: string) => new LiteralSqlString(s, true);

sql.val = (x: any) => new SqlExpr([null], [x]);

sql.tuple = (...xs: Mergeable[]) => SqlExpr.merge(xs, "(", ", ", ")")

sql.spaced = (...xs: Mergeable[]) => SqlExpr.merge(xs, "(", " ", ")")

sql.row = (...xs: Mergeable[]) => SqlExpr.merge(xs, "ROW(", ", ", ")")

sql.array = (...xs: Mergeable[]) => SqlExpr.merge(xs, "ARRAY[", ", ", "]")

sql.commaSeparated = (...xs: Mergeable[]) => SqlExpr.merge(xs, "", ", ", "")

sql.merge = SqlExpr.merge;

sql.nothing = Symbol();
