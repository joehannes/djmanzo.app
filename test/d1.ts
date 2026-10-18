/**
 * Enough of D1 for the Worker's own code, over Node's built-in SQLite, with
 * the site's migrations applied: as `memoryKv` stands in for KV. D1 is SQLite,
 * so the SQL the tests run is the SQL production runs.
 */
import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";

const migrations = new URL("../migrations/", import.meta.url);

class Statement {
  constructor(
    private db: DatabaseSync,
    private sql: string,
    private params: SQLInputValue[] = [],
  ) {}
  bind(...params: unknown[]) {
    return new Statement(this.db, this.sql, params.map((p) => (p === undefined ? null : typeof p === "boolean" ? Number(p) : (p as SQLInputValue))));
  }
  async first<T>(column?: string): Promise<T | null> {
    const row = this.db.prepare(this.sql).get(...this.params) as Record<string, unknown> | undefined;
    if (!row) return null;
    return (column ? row[column] : { ...row }) as T;
  }
  async all<T>() {
    const results = this.db.prepare(this.sql).all(...this.params).map((r) => ({ ...r })) as T[];
    return { results, success: true, meta: {} };
  }
  async run() {
    const r = this.db.prepare(this.sql).run(...this.params);
    return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
  }
  async raw<T>() {
    return this.db.prepare(this.sql).all(...this.params).map((r) => Object.values(r)) as T[];
  }
}

export function memoryD1() {
  const db = new DatabaseSync(":memory:");
  for (const file of readdirSync(migrations).filter((f) => f.endsWith(".sql")).sort()) db.exec(readFileSync(new URL(file, migrations), "utf8"));
  const d1 = {
    sqlite: db,
    prepare: (sql: string) => new Statement(db, sql),
    async batch(statements: Statement[]) {
      db.exec("BEGIN");
      try {
        const out = [];
        for (const s of statements) out.push(await s.run());
        db.exec("COMMIT");
        return out;
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
    async exec(sql: string) {
      db.exec(sql);
      return { count: 0, duration: 0 };
    },
  };
  return d1 as unknown as D1Database & { sqlite: DatabaseSync };
}

/** Enough of R2: what was put is got, with its type. */
export function memoryR2() {
  const data = new Map<string, { bytes: Uint8Array; type?: string }>();
  const r2 = {
    data,
    async put(key: string, value: ArrayBuffer | Uint8Array, opts?: { httpMetadata?: { contentType?: string } }) {
      data.set(key, { bytes: new Uint8Array(value instanceof Uint8Array ? value : new Uint8Array(value)), type: opts?.httpMetadata?.contentType });
      return { key };
    },
    async get(key: string) {
      const o = data.get(key);
      if (!o) return null;
      return {
        key,
        size: o.bytes.length,
        httpMetadata: { contentType: o.type },
        body: new Blob([o.bytes]).stream(),
        arrayBuffer: async () => o.bytes.slice().buffer,
        writeHttpMetadata(h: Headers) {
          if (o.type) h.set("content-type", o.type);
        },
      };
    },
    async head(key: string) {
      return data.has(key) ? { key, size: data.get(key)!.bytes.length } : null;
    },
    async delete(key: string) {
      data.delete(key);
    },
  };
  return r2 as unknown as R2Bucket & { data: typeof data };
}
