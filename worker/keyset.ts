/**
 * A keys pack's keyboard set, checked as djmanzo checks one before wearing it
 * (`dj_app::keysets::check` and `dj_app::leader::runnable`), from the lists
 * djmanzo itself exports (`shared/keyrules.json`, written by
 * `tools/packsmith rules` from `app/`).
 *
 * Two parts are stricter than djmanzo, because the website cannot run its
 * parsers: an `action` key is held to the vocabulary djmanzo's parser
 * accepts — its verb, and the shape of its argument where the vocabulary
 * says one — and djmanzo parses the whole sentence again when it installs
 * the set; and a key of the `uiop` kind, or a pack carrying a keyboard map,
 * is not taken here at all. Neither lets through anything djmanzo would
 * refuse on those grounds; each may refuse something djmanzo would wear.
 *
 * And one rule is the website's own: a set from Outboard adds to djmanzo's
 * keys and never takes one of them over ({@link takesOver}).
 */

import RULES from "../shared/keyrules.json";

export interface KeyEntry {
  keys: string[];
  label: string;
  run: string;
}
export interface KeySet {
  name: string;
  about: string;
  purpose: string;
  edition: string;
  keys: KeyEntry[];
}

/** The deck djmanzo is on when the key is pressed (`leader::CURRENT`). */
const CURRENT = "@";
const q = (s: string) => JSON.stringify(s);
const chars = (s: string) => [...s].length;

type Verb = (typeof RULES.vocabulary)[number];
const DECK_VERBS = new Map<string, Verb>(RULES.vocabulary.filter((v) => v.target === "deck").map((v) => [v.verb, v]));
const MIXER_HEADS = new Set<string>(RULES.action_heads);

/** Whether a word is a number as Rust's `f32` parse reads one. */
const isNumber = (w: string) => /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(w);

/** An action, held to the vocabulary: why not, or null. */
export function actionProblem(action: string): string | null {
  const words = action.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "it is empty";
  if (words[0] === "deck") {
    const n = words[1];
    if (n === undefined || !/^[1-9]$/.test(n)) return `${q(n ?? "")} is not a deck`;
    const verb = words[2];
    if (verb === undefined) return "it names a deck and no verb";
    const spec = DECK_VERBS.get(verb);
    if (!spec) return `unknown verb \`${verb}\``;
    const rest = words.slice(3);
    if (spec.argument === "none") return rest.length ? `${verb} takes nothing after it` : null;
    if (rest.length === 0) return `${verb} needs ${spec.argument === "words" ? "words" : "a number"} after it`;
    if (spec.argument === "number" || spec.argument === "frames") {
      if (rest.length !== 1 || !isNumber(rest[0])) return `${verb} takes one number`;
      if (spec.argument === "frames" && !/^\d+$/.test(rest[0])) return `${verb} takes a whole number of frames`;
    }
    return null;
  }
  return MIXER_HEADS.has(words[0]) ? null : `unknown target \`${words[0]}\``;
}

/** What a key runs, as `leader::runnable` with no switches on offer: why not, or null. */
export function runProblem(run: string): string | null {
  if (run.startsWith("switch ")) {
    const rest = run.slice("switch ".length);
    const space = rest.indexOf(" ");
    const [kind, name] = space < 0 ? [rest, ""] : [rest.slice(0, space), rest.slice(space + 1)];
    if (!RULES.switch_kinds.includes(kind)) return `${q(kind)} is not something to switch: one of ${RULES.switch_kinds.join(", ")}`;
    if (name.trim() === "") return `it switches to a ${kind} with no name`;
    return null;
  }
  const space = run.indexOf(" ");
  const [kind, rest] = space < 0 ? [run, ""] : [run.slice(0, space), run.slice(space + 1)];
  switch (kind) {
    case "action": {
      const why = actionProblem(rest.replace(`deck ${CURRENT} `, "deck 1 "));
      return why ? `${q(rest)} is not an action djmanzo knows: ${why}` : null;
    }
    case "surface":
    case "lift":
      return RULES.panels.includes(rest) ? null : `there is no panel called ${q(rest)}`;
    case "switch":
      return `there is nothing to switch to called ${q(rest)}`;
    case "board":
      return RULES.boards.includes(rest) ? null : `there is no board called ${q(rest)}`;
    case "ui":
      return RULES.ui.includes(rest) ? null : `${q(rest)} is not something the interface does`;
    case "guide":
      return RULES.guides.includes(rest) ? null : `there is no guide called ${q(rest)}`;
    case "uiop":
      return "Outboard cannot check a uiop key yet: djmanzo can, so share this set as a file";
    default:
      if (kind === "welcome" && rest === "") return null;
      return `${q(kind)} is not a kind of key`;
  }
}

/** `dj_app::keysets::check`, word for word where djmanzo's words are its own: why not, or null. */
export function setProblem(set: KeySet): string | null {
  const { set: limits, longest } = RULES;
  if (set.edition !== "" && !limits.editions.includes(set.edition)) return `${q(set.edition)} is not an edition djmanzo has`;
  const name = set.name.trim();
  if (name === "" || chars(name) > limits.name) return `a keyboard set's name is one to ${limits.name} characters`;
  if (chars(set.about) > limits.about) return `its description is longer than ${limits.about} characters`;
  if (!limits.purposes.includes(set.purpose)) return `it is for ${q(set.purpose)}: one of ${limits.purposes.join(", ")}`;
  if (set.keys.length === 0 || set.keys.length > limits.most) return `a keyboard set holds one to ${limits.most} keys`;
  const seen = new Set<string>();
  for (const key of set.keys) {
    const chain = key.keys.join(" ");
    if (key.keys.length === 0 || key.keys.length > longest) return `Space ${chain}: a key is one to ${longest} keys long`;
    const bad = key.keys.find((k) => k !== "space" && chars(k) !== 1);
    if (bad !== undefined) return `Space ${chain}: ${q(bad)} is not a key`;
    const label = key.label.trim();
    if (label === "" || chars(label) > limits.name) return `Space ${chain}: give it a name of one to ${limits.name} characters`;
    if (seen.has(chain)) return `Space ${chain} is in it twice`;
    seen.add(chain);
    const why = runProblem(key.run);
    if (why) return `Space ${chain} would do nothing: ${why}`;
  }
  return null;
}

type TreeKey = (typeof RULES.tree)[number];
const TREE = new Map<string, TreeKey>(RULES.tree.map((t) => [t.keys.join(" "), t]));

/**
 * The website's own rule: a key that lands on one of djmanzo's keys (it
 * would win there, in djmanzo) or makes a key of one of djmanzo's groups
 * (djmanzo leaves it out). Null when every key adds to djmanzo's.
 */
export function takesOver(set: KeySet): string | null {
  for (const key of set.keys) {
    const chain = key.keys.join(" ");
    for (let depth = 1; depth < key.keys.length; depth++) {
      const above = TREE.get(key.keys.slice(0, depth).join(" "));
      if (above && !above.group) return `Space ${chain}: Space ${above.keys.join(" ")} is djmanzo's ${q(above.label)}, so nothing can come after it`;
    }
    const own = TREE.get(chain);
    if (own?.group) return `Space ${chain} already opens djmanzo's ${q(own.label)}; choose keys below it or elsewhere`;
    if (own) return `Space ${chain} is djmanzo's own (${own.label}): a set in Outboard adds keys, it does not take one over`;
  }
  return null;
}

/** Where a set's keys go: a group of its own, or inside one of djmanzo's (named). */
export function placesOf(set: KeySet): { chain: string; label: string; inside: string | null }[] {
  return set.keys.map((key) => {
    let inside: string | null = null;
    for (let depth = key.keys.length - 1; depth >= 1 && inside === null; depth--) {
      const group = TREE.get(key.keys.slice(0, depth).join(" "));
      // "Stems (letters: the current deck)" is "Stems" on a card.
      if (group?.group) inside = group.label.replace(/ \(.*\)$/, "");
    }
    return { chain: key.keys.join(" "), label: key.label, inside };
  });
}

/** The keyboard sets djmanzo ships, for the page that explains what a pack adds to. */
export const BUILTIN: Record<string, KeySet> = Object.fromEntries(
  Object.entries(RULES.builtin as Record<string, Omit<KeySet, "edition"> & { edition?: string }>).map(([id, set]) => [id, { ...set, edition: set.edition ?? "" }]),
);
/** Where a maker may be thanked: djmanzo's kinds and their sites. */
export const SUPPORT_KINDS = RULES.support;
/** The commit of djmanzo these rules were written from. */
export const RULES_FROM = RULES.app;
