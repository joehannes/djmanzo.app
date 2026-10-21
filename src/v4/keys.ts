/**
 * djmanzo's mnemonic keys, for the site's sketch of the guide that opens on
 * Space: a part of the default tree (`dj_app::leader::tree`), the nine
 * keyboard sets djmanzo ships (`dj_app::keysets::builtin`, from
 * `shared/keyrules.json`) and the crew's sets in Outboard (`packs/keys/`). A set is laid over the tree on letters it leaves free, so it
 * adds keys and never hides one of djmanzo's — which is what the sketch
 * shows when one is worn. Panels, themes, workspaces and presets are lists
 * on the machine; the sketch names a few.
 */

import RULES from "../../shared/keyrules.json";

export interface KeyNode {
  key: string;
  label: string;
  children?: KeyNode[];
  /** Laid by a keyboard set. */
  set?: string;
}

const leaf = (key: string, label: string): KeyNode => ({ key, label });
const group = (key: string, label: string, children: KeyNode[]): KeyNode => ({ key, label, children });

const deck = (n: number) =>
  group(String(n), `Deck ${n}`, [
    leaf("p", "Play / pause"),
    leaf("c", "Cue"),
    leaf("s", "Sync on / off"),
    leaf("k", "Keylock on / off"),
    leaf("h", "Headphones on / off"),
    leaf("l", "Loop four beats"),
    leaf("o", "Loop off"),
    leaf("b", "Back four beats"),
    leaf("f", "Forward four beats"),
    leaf("g", "Grid: a beat here"),
    leaf("e", "Eject"),
  ]);
const stems = (n: number) =>
  group(String(n), `Deck ${n}`, [leaf("v", "Mute / unmute the vocals"), leaf("d", "Mute / unmute the drums"), leaf("b", "Mute / unmute the bass"), leaf("o", "Mute / unmute the other")]);

/** The part of the tree under Space the sketch shows. */
export const TREE: KeyNode[] = [
  leaf("space", "Find anything (the palette)"),
  leaf("?", "Every key"),
  leaf("/", "Search the library"),
  leaf("0", "Launcher (everything, on one screen)"),
  group("d", "Deck", [deck(1), deck(2)]),
  group("s", "Stems", [stems(1), stems(2)]),
  group("m", "Mixer", [leaf("c", "Crossfader to the centre"), leaf("a", "Crossfader to side A"), leaf("b", "Crossfader to side B"), leaf("x", "Stop every sample")]),
  group("r", "Record", [leaf("r", "Record the set on / off"), leaf("m", "Mark this moment")]),
  group("o", "Open a panel", [leaf("i", "Singers"), leaf("d", "Presets"), leaf("…", "and every other panel, by its letter")]),
  group("O", "Open a panel large, over the decks", [leaf("…", "the same letters as o")]),
  group("b", "Dashboard", [leaf("…", "each board, and the decks")]),
  group("t", "Theme", [leaf("…", "every theme")]),
  group("w", "Workspace", [leaf("…", "every workspace")]),
  group("p", "Preset", [leaf("…", "every preset, for the whole mixer or a deck")]),
];

export interface KeySet {
  id: string;
  name: string;
  purpose: string;
  about: string;
  keys: { keys: string[]; label: string }[];
  /** Where it comes from: djmanzo itself, or the marketplace. */
  from: "djmanzo" | "marketplace";
}

/** The sets djmanzo ships, as `keysets::builtin` has them: from `shared/keyrules.json`, written from `app/`. */
export const BUILTIN_SETS: KeySet[] = Object.entries(RULES.builtin as Record<string, { name: string; purpose: string; about: string; keys: { keys: string[]; label: string }[] }>).map(
  ([id, set]) => ({ id: id.replace(/^builtin:/, ""), name: set.name, purpose: set.purpose, about: set.about, keys: set.keys, from: "djmanzo" as const }),
);

/** The crew's sets in Outboard, from their sources (`packs/keys/`), as the packs carry them. */
const crewSources = import.meta.glob<{ name: string; set: { name: string; purpose: string; about: string; keys: { keys: string[]; label: string }[] } }>("../../packs/keys/*.json", {
  eager: true,
  import: "default",
});
export const MARKET_SETS: KeySet[] = Object.entries(crewSources)
  .map(([path, src]) => ({ id: path.replace(/^.*\/|\.json$/g, ""), name: src.set.name, purpose: src.set.purpose, about: src.set.about, keys: src.set.keys, from: "marketplace" as const }))
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * The tree with a set laid over it, as `leader::with_set` lays one: a key
 * inside one of djmanzo's groups is added beside its keys; a key on a free
 * letter opens a group of the set's own. A key that would land on one of
 * djmanzo's keys is left out — wearing a set never takes a key away.
 */
export function wear(tree: KeyNode[], set: KeySet | null): KeyNode[] {
  if (!set) return tree;
  const root: KeyNode = { key: "space", label: "Space", children: structuredClone(tree) };
  for (const k of set.keys) {
    let at = root;
    let ok = true;
    k.keys.forEach((key, i) => {
      if (!ok) return;
      const last = i === k.keys.length - 1;
      at.children ??= [];
      let next = at.children.find((c) => c.key === key);
      if (last) {
        if (next) ok = false;
        else at.children.push({ key, label: k.label, set: set.name });
        return;
      }
      if (!next) {
        next = { key, label: set.name, children: [], set: set.name };
        at.children.push(next);
      } else if (!next.children) ok = false;
      at = next;
    });
  }
  return root.children!;
}
