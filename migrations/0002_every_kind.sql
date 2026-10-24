-- Every kind of pack djmanzo installs (dj_app::packs::Kind), not only the
-- three Outboard checked when it opened: keyboard sets are listed now, and
-- the rest when the website can check them. SQLite cannot change a CHECK in
-- place, so the table is made again with its rows, its indexes and the
-- versions that refer to it.
PRAGMA defer_foreign_keys = true;

CREATE TABLE items_new (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('theme', 'skin', 'visuals', 'keys', 'technique', 'mapping', 'knowledge', 'lessons')),
  name TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  owner TEXT NOT NULL,
  author TEXT NOT NULL,
  licence TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'listed', 'removed')),
  reason TEXT,
  latest TEXT,
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL
);
INSERT INTO items_new (id, kind, name, fingerprint, owner, author, licence, description, status, reason, latest, created, updated)
  SELECT id, kind, name, fingerprint, owner, author, licence, description, status, reason, latest, created, updated FROM items;
DROP TABLE items;
ALTER TABLE items_new RENAME TO items;
CREATE UNIQUE INDEX items_name ON items (lower(name));
CREATE INDEX items_listed ON items (status, kind, updated DESC);

PRAGMA defer_foreign_keys = false;
