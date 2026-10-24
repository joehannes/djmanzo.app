// Has the application's documentation changed since the website's facts were
// last read against it? `shared/facts.ts` names the commit it was checked
// against; this prints every change to the documents it draws on since then,
// up to the application's main, and exits non-zero if there is any. The
// application is `app/`, djmanzo checked out as a submodule; its main is
// fetched first. Read the changes, correct `shared/facts.ts`, move the commit
// forward (and `git -C app checkout` it, so the tests read the same), then deploy.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL("..", import.meta.url));
const facts = readFileSync(new URL("../shared/facts.ts", import.meta.url), "utf8");
const commit = facts.match(/CHECKED_AGAINST = "([0-9a-f]{7,40})"/)?.[1];
const sources = [...facts.matchAll(/"((?:README|docs\/)[A-Za-z/._-]+\.md)"/g)].map((m) => m[1]);
if (!commit || !sources.length) {
  console.error("shared/facts.ts names no commit or no sources.");
  process.exit(2);
}
const git = (...args) => execFileSync("git", args, { cwd: `${here}/app`, encoding: "utf8" }).trim();
let drift = false;
try {
  git("fetch", "--quiet", "origin", "main");
} catch {
  console.log("(could not fetch the application's main: comparing with what app/ already has)");
}
const ranges = [["origin/main", `${commit}..origin/main`]];
for (const [target, range] of ranges) {
  let stat;
  try {
    stat = git("diff", "--stat", range, "--", ...sources);
  } catch {
    console.log(`(${target} is not here to compare with)`);
    continue;
  }
  if (stat) {
    drift = true;
    console.log(`Changed since ${commit.slice(0, 9)}, up to ${target}:\n${stat}\n`);
  }
}
if (drift) {
  console.log("Read those changes (git diff), bring shared/facts.ts into line, and set CHECKED_AGAINST to the commit read.");
  process.exit(1);
}
console.log(`The facts are current with ${commit.slice(0, 9)}.`);
