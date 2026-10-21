-- Talkback, as the forums DJs already use work: a few threads pinned to the
-- top of their community (the welcome, the rules, the questions everyone
-- asks), and a question whose asker has said which reply answered it, shown
-- first under the question and marked. The crew's own threads arrive pinned
-- and answered (worker/seed.ts).
ALTER TABLE posts ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN answer TEXT;
CREATE INDEX posts_pinned ON posts (status, community, pinned DESC, hot DESC);
