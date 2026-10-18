-- Outboard (the marketplace) and Talkback (the discussion space), §134.
-- Accounts stay in KV (`user:<uid>`); rows here name them by uid and keep
-- the name they showed when they wrote, so a deleted account's words read.
-- Times are milliseconds since the epoch, as everywhere in the Worker.

-- A pack listed, or waiting to be. Its name is held by the key it was first
-- uploaded with, as an installed pack's is in djmanzo (`looks.rs` `clash`).
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('theme', 'skin', 'visuals')),
  name TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  owner TEXT NOT NULL,
  author TEXT NOT NULL,
  licence TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  -- pending until the crew has looked; removed with a statement of reasons.
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'listed', 'removed')),
  reason TEXT,
  latest TEXT,
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL
);
CREATE UNIQUE INDEX items_name ON items (lower(name));
CREATE INDEX items_listed ON items (status, kind, updated DESC);

CREATE TABLE versions (
  item TEXT NOT NULL REFERENCES items (id),
  version TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  size INTEGER NOT NULL,
  manifest TEXT NOT NULL,
  -- What a listing shows without opening the pack: a theme's colours, a
  -- skin's tile (checked to only draw), a visuals pack's look names.
  preview TEXT NOT NULL DEFAULT '{}',
  changelog TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'listed', 'removed')),
  reason TEXT,
  created INTEGER NOT NULL,
  PRIMARY KEY (item, version)
);

-- One rating an account, changed rather than added to.
CREATE TABLE ratings (
  item TEXT NOT NULL,
  uid TEXT NOT NULL,
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  review TEXT NOT NULL DEFAULT '',
  created INTEGER NOT NULL,
  PRIMARY KEY (item, uid)
);

-- Who has downloaded what, for "downloaded" beside a rating.
CREATE TABLE downloads (
  item TEXT NOT NULL,
  uid TEXT NOT NULL,
  at INTEGER NOT NULL,
  PRIMARY KEY (item, uid)
);

-- A maker's page: what they say, and links to their own donation pages
-- (an allow-list of official platforms; djmanzo takes and handles nothing).
CREATE TABLE profiles (
  uid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  about TEXT NOT NULL DEFAULT '',
  links TEXT NOT NULL DEFAULT '[]',
  updated INTEGER NOT NULL
);

-- Talkback: posts in communities (shared/talkback.ts), comments under them.
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  community TEXT NOT NULL,
  uid TEXT NOT NULL,
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  flair TEXT,
  -- An item's own thread.
  item TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  hot REAL NOT NULL DEFAULT 0,
  -- held: waiting for the crew; removed: with a statement of reasons.
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'held', 'removed')),
  reason TEXT,
  -- A proposal the crew carried to the wishlist.
  wish TEXT,
  created INTEGER NOT NULL
);
CREATE INDEX posts_hot ON posts (status, community, hot DESC);
CREATE INDEX posts_new ON posts (status, community, created DESC);
CREATE INDEX posts_by ON posts (uid, created DESC);

CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post TEXT NOT NULL,
  parent TEXT,
  depth INTEGER NOT NULL DEFAULT 0,
  uid TEXT NOT NULL,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'held', 'removed')),
  reason TEXT,
  created INTEGER NOT NULL
);
CREATE INDEX comments_post ON comments (post, created);
CREATE INDEX comments_by ON comments (uid, created DESC);

-- One vote an account a post or comment: up, down, or taken back.
CREATE TABLE votes (
  target TEXT NOT NULL,
  uid TEXT NOT NULL,
  value INTEGER NOT NULL CHECK (value IN (-1, 1)),
  PRIMARY KEY (target, uid)
);

-- Notice and action (DSA Art. 16): a report on anything, once an account.
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('item', 'post', 'comment', 'profile')),
  target TEXT NOT NULL,
  uid TEXT NOT NULL,
  reason TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'done')),
  created INTEGER NOT NULL,
  UNIQUE (kind, target, uid)
);

-- Statements of reasons (DSA Art. 17), each to the person whose work was
-- held or removed; an appeal is their reply.
CREATE TABLE notices (
  id TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  kind TEXT NOT NULL,
  target TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT NOT NULL,
  appeal TEXT,
  appealed INTEGER,
  created INTEGER NOT NULL
);
CREATE INDEX notices_uid ON notices (uid, created DESC);

-- Search over what is live.
CREATE VIRTUAL TABLE posts_fts USING fts5 (title, body, content = 'posts', content_rowid = 'rowid');
CREATE TRIGGER posts_ai AFTER INSERT ON posts BEGIN
  INSERT INTO posts_fts (rowid, title, body) VALUES (new.rowid, new.title, new.body);
END;
CREATE TRIGGER posts_ad AFTER DELETE ON posts BEGIN
  INSERT INTO posts_fts (posts_fts, rowid, title, body) VALUES ('delete', old.rowid, old.title, old.body);
END;
CREATE TRIGGER posts_au AFTER UPDATE OF title, body ON posts BEGIN
  INSERT INTO posts_fts (posts_fts, rowid, title, body) VALUES ('delete', old.rowid, old.title, old.body);
  INSERT INTO posts_fts (rowid, title, body) VALUES (new.rowid, new.title, new.body);
END;
