-- Insights: what visitors look at and look for, kept without knowing who they
-- are (worker/insights.ts). No cookie and nothing stored in the browser; a
-- visit is a hash of the day's secret salt, the address and the browser,
-- which cannot be traced back to either and changes every day, when the
-- salt is thrown away. Kept 90 days.
CREATE TABLE hits (
  day TEXT NOT NULL,       -- YYYY-MM-DD, UTC
  at INTEGER NOT NULL,     -- when it arrived, ms
  visit TEXT NOT NULL,     -- the day's hash (above)
  seq INTEGER NOT NULL,    -- its order within what one page sent
  kind TEXT NOT NULL,      -- view | leave | section | search | ask | click
  path TEXT NOT NULL,      -- the page's address, without its query
  detail TEXT,             -- a search's words, a question, a click's name, a section's id
  n INTEGER,               -- a search's results; the milliseconds on a page (leave)
  lang TEXT,
  look TEXT,
  country TEXT,
  device TEXT,             -- phone | tablet | computer
  referrer TEXT            -- the host a visit came from, on its first page only
);
CREATE INDEX hits_day ON hits (day, kind);
CREATE INDEX hits_visit ON hits (visit, at, seq);
