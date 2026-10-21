/**
 * djmanzo's mnemonic keys, for the site's sketch of the guide that opens on
 * Space: a part of the default tree (`dj_app::leader::tree`) and the four
 * keyboard sets djmanzo ships (`dj_app::keysets::builtin`), copied as they
 * are on main. A set is laid over the tree on letters it leaves free, so it
 * adds keys and never hides one of djmanzo's — which is what the sketch
 * shows when one is worn. Panels, themes, workspaces and presets are lists
 * on the machine; the sketch names a few.
 */

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

/** The sets djmanzo ships, as `keysets::builtin` has them. */
export const BUILTIN_SETS: KeySet[] = [
  {
    id: "karaoke-host",
    name: "Karaoke host",
    purpose: "karaoke",
    from: "djmanzo",
    about: "The rotation, the microphone and the singer's key on Space k: k 1 or k 2 puts the next singer on a deck, k b brings them in, k s says they have sung.",
    keys: [
      { keys: ["k", "1"], label: "Next singer on deck 1" },
      { keys: ["k", "2"], label: "Next singer on deck 2" },
      { keys: ["k", "b"], label: "Bring them in" },
      { keys: ["k", "s"], label: "They have sung" },
      { keys: ["k", "o"], label: "Microphone open" },
      { keys: ["k", "c"], label: "Microphone closed" },
      { keys: ["k", "u"], label: "Deck 1 a semitone up" },
      { keys: ["k", "d"], label: "Deck 1 a semitone down" },
      { keys: ["k", "h"], label: "Deck 1 home, in its own key" },
      { keys: ["k", "v"], label: "Deck 1's vocal out or back" },
      { keys: ["k", "p"], label: "The singers' panel" },
    ],
  },
  {
    id: "scratch",
    name: "Scratch",
    purpose: "scratch",
    from: "djmanzo",
    about: "The crossfader's curve and the decks' sides on Space c: c s for a sharp cut, c b back to a blend, c 1 and c 2 to put the decks on their sides.",
    keys: [
      { keys: ["c", "s"], label: "Sharp crossfader" },
      { keys: ["c", "l"], label: "Linear crossfader" },
      { keys: ["c", "b"], label: "Blend crossfader (smooth)" },
      { keys: ["c", "1"], label: "Deck 1 on side A" },
      { keys: ["c", "2"], label: "Deck 2 on side B" },
      { keys: ["c", "r"], label: "Deck 1 backwards on or off" },
      { keys: ["c", "c"], label: "Crossfader to the centre" },
    ],
  },
  {
    id: "open-format",
    name: "Open format",
    purpose: "open-format",
    from: "djmanzo",
    about: "For nights that jump between tempos and styles, on Space f: a wide pitch range for records far apart, a double of the record playing, sync and the automix.",
    keys: [
      { keys: ["f", "w"], label: "Deck 1 wide pitch range (±25 %)" },
      { keys: ["f", "n"], label: "Deck 1 narrow pitch range (±8 %)" },
      { keys: ["f", "c"], label: "Double deck 1 on deck 2" },
      { keys: ["f", "s"], label: "Deck 2 sync on or off" },
      { keys: ["f", "a"], label: "Automix on" },
      { keys: ["f", "o"], label: "Automix off" },
      { keys: ["f", "m"], label: "Mix to the next record now" },
    ],
  },
  {
    id: "one-hand",
    name: "One hand",
    purpose: "one-hand",
    from: "djmanzo",
    about: "Everything a night needs from one hand on Space h, for a DJ holding a microphone or working a laptop on its own: play, the crossfader, sync, the next mix.",
    keys: [
      { keys: ["h", "1"], label: "Deck 1 play or pause" },
      { keys: ["h", "2"], label: "Deck 2 play or pause" },
      { keys: ["h", "a"], label: "Crossfader to deck 1's side" },
      { keys: ["h", "b"], label: "Crossfader to deck 2's side" },
      { keys: ["h", "c"], label: "Crossfader to the centre" },
      { keys: ["h", "s"], label: "Deck 2 sync on or off" },
      { keys: ["h", "n"], label: "Mix to the next record now" },
      { keys: ["h", "l"], label: "The library" },
    ],
  },
];

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
