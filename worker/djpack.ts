/**
 * A djmanzo pack, checked as djmanzo checks one before installing it
 * (`dj_app::packs::check`, ADR-0012): the website lists nothing an
 * application would refuse.
 *
 * A `.djpack` is a zip: `pack.json` (the manifest), `pack.sig` (an Ed25519
 * signature over the manifest's exact bytes, base64) and the files the
 * manifest lists, each with its SHA-256. The key travels in the manifest; a
 * pack's name stays with the key it was first listed under (`market.ts`), as
 * an installed pack's does in djmanzo (`looks.rs` `clash`).
 *
 * Held to djmanzo by `test/fixtures/packs/` (copies of djmanzo's
 * `contracts/packs/`, checked by `test/contracts.test.ts`): packs of every kind and
 * every way of being refused, written by `dj_app::packs`'s own tests with its
 * verdict on each, which these checks must give word for word. The lists it
 * reads (themes djmanzo ships, the look studio's parts, the layers a look
 * draws) are `shared/packrules.json`, exported by the same tests.
 *
 * One rule is stricter than djmanzo's: every tile under `skins/` must only
 * draw, named by a skin or not. djmanzo never draws a tile no skin names, so
 * it never reads one; a website that offers the file for download does.
 */

import RULES from "../shared/packrules.json";
import SUPPORT from "../shared/keyrules.json";
import { setProblem, takesOver, type KeySet } from "./keyset";

export const MANIFEST = "pack.json";
export const SIGNATURE = "pack.sig";
const PRESETS = "milkdrop/";
const SKINS = "skins/";

export type Kind = "visuals" | "theme" | "skin" | "keys";
export const KINDS: Kind[] = ["visuals", "theme", "skin", "keys"];
/** Kinds djmanzo installs and the website cannot check yet: named in the refusal, not called unknown. */
const NOT_YET = ["technique", "mapping", "knowledge", "lessons"];
/** A keys pack's keyboard map: djmanzo reads one; the website does not take one yet. */
const KEYBOARD_MAP = "keyboard.toml";

export interface Layer {
  kind: string;
  signal: string;
  colour: string;
  amount: number;
  blend: string;
  preset?: string | null;
}
export interface Look {
  name: string;
  description: string;
  layers: Layer[];
}
export interface ThemeParts {
  shapes?: string | null;
  art?: string[] | null;
  motion?: string[] | null;
  events?: string | null;
}
export interface PackTheme {
  name: string;
  about: string;
  base: string;
  parts: ThemeParts;
  dark: Record<string, string>;
  light: Record<string, string>;
}
export interface PackSkin {
  name: string;
  about: string;
  suits: string[];
  tile: string;
  size: string;
  opacity: number;
  motion?: string | null;
}
/** Where to thank a pack's maker (§137), signed with the rest. */
export interface Support {
  kind: string;
  url: string;
}
export interface Manifest {
  format: number;
  name: string;
  author: string;
  licence: string;
  version: string;
  description: string;
  key: string;
  files: Record<string, string>;
  kind: Kind;
  looks: Look[];
  theme: PackTheme | null;
  skins: PackSkin[];
  keys: KeySet | null;
  support: Support[];
}

/** A pack that has passed {@link check}. */
export interface Checked {
  manifest: Manifest;
  key: Uint8Array;
  fingerprint: string;
  files: Map<string, Uint8Array>;
}

/** A refusal, in words a maker can act on. */
export class PackError extends Error {}
const no = (why: string): never => {
  throw new PackError(why);
};

/** A string as Rust's `{:?}` writes it, for refusals that name one. */
const q = (s: string) => JSON.stringify(s);

/** An `f32` as Rust writes it: the shortest decimal that reads back as the same `f32`. */
function f32(n: number): string {
  const v = Math.fround(n);
  for (let p = 1; p <= 9; p++) {
    const s = String(Number(v.toPrecision(p)));
    if (Math.fround(Number(s)) === v) return s;
  }
  return String(v);
}

/** Characters as Rust counts them: code points, not UTF-16 units. */
const chars = (s: string) => [...s].length;

const utf8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
const lossy = new TextDecoder("utf-8", { fatal: false, ignoreBOM: true });

function hex(bytes: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256(bytes: Uint8Array): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", bytes));
}

/** Standard base64 with its padding, as the `base64` crate's STANDARD engine reads it. */
function base64(text: string): Uint8Array | null {
  if (text.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(text)) return null;
  try {
    return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

/** The fingerprint of a key: the first 64 bits of its SHA-256, in four groups (`packs::fingerprint`). */
export async function fingerprint(key: Uint8Array): Promise<string> {
  const h = (await sha256(key)).slice(0, 16);
  return [0, 4, 8, 12].map((i) => h.slice(i, i + 4)).join(" ");
}

// --- The archive ---------------------------------------------------------------------------

/** Whether a name stays inside the pack, as the zip crate's `enclosed_name` holds it. */
function enclosed(name: string): boolean {
  if (name.includes("\0") || name.startsWith("/") || name.includes("\\")) return false;
  let depth = 0;
  for (const part of name.split("/")) {
    if (part === "..") {
      if (--depth < 0) return false;
    } else if (part !== "" && part !== ".") depth++;
  }
  return true;
}

async function inflate(data: Uint8Array, limit: number): Promise<Uint8Array> {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = stream.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    size += value.length;
    // Read no more than the limit, whatever the archive claims.
    if (size > limit) {
      await reader.cancel();
      break;
    }
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** A pack's files out of its archive, within the limits (`packs::read_archive`). */
export async function readArchive(zip: Uint8Array): Promise<Map<string, Uint8Array>> {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const notZip = "it is not a pack: not a zip";
  // The end of the central directory: at most 64 KiB of comment after it.
  let end = -1;
  for (let i = zip.length - 22; i >= 0 && i >= zip.length - 22 - 65535; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) no(notZip);
  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  if (count === 0xffff || at === 0xffffffff) no("it could not be unpacked: a zip64 archive");
  const files = new Map<string, Uint8Array>();
  let total = 0;
  for (let n = 0; n < count; n++) {
    if (at + 46 > zip.length || view.getUint32(at, true) !== 0x02014b50) no(notZip);
    const madeBy = view.getUint16(at + 4, true) >> 8;
    const flags = view.getUint16(at + 8, true);
    const method = view.getUint16(at + 10, true);
    const compressed = view.getUint32(at + 20, true);
    const nameLen = view.getUint16(at + 28, true);
    const extraLen = view.getUint16(at + 30, true);
    const commentLen = view.getUint16(at + 32, true);
    const external = view.getUint32(at + 38, true);
    const local = view.getUint32(at + 42, true);
    const name = lossy.decode(zip.subarray(at + 46, at + 46 + nameLen));
    at += 46 + nameLen + extraLen + commentLen;
    if (name.endsWith("/")) continue;
    // A Unix symlink: its mode in the high half of the external attributes.
    if (madeBy === 3 && ((external >>> 16) & 0o170000) === 0o120000) no(`${name} is a link, which a pack may not hold`);
    if (!enclosed(name)) no(`${q(name)} points outside the pack`);
    if (files.size === RULES.most_files) no(`it holds more than ${RULES.most_files} files`);
    if (flags & 1) no(`it could not be unpacked: ${name} is encrypted`);
    if (local + 30 > zip.length || view.getUint32(local, true) !== 0x04034b50) no(notZip);
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    const data = zip.subarray(start, start + compressed);
    let bytes: Uint8Array;
    if (method === 0) bytes = data.subarray(0, RULES.most_file + 1);
    else if (method === 8) {
      try {
        bytes = await inflate(data, RULES.most_file);
      } catch {
        return no(`${name} could not be read: it is damaged`);
      }
    } else return no(`it could not be unpacked: ${name} is compressed in a way djmanzo does not read`);
    if (bytes.length > RULES.most_file) no(`${name} is larger than ${RULES.most_file / 1024 / 1024} MB`);
    total += bytes.length;
    if (total > RULES.most_bytes) no(`it is larger than ${RULES.most_bytes / 1024 / 1024} MB`);
    if (files.has(name)) no(`${name} is in it twice`);
    files.set(name, bytes);
  }
  return files;
}

// --- The manifest, read as serde reads it ----------------------------------------------------

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
function str(o: Record<string, unknown>, k: string, fallback?: string): string {
  const v = o[k];
  if (v === undefined && fallback !== undefined) return fallback;
  if (typeof v !== "string") throw new TypeError(v === undefined ? `missing field \`${k}\`` : `\`${k}\` is not a string`);
  return v;
}
function opt(o: Record<string, unknown>, k: string): string | null {
  const v = o[k];
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") throw new TypeError(`\`${k}\` is not a string`);
  return v;
}
function strs(v: unknown, k: string): string[] {
  if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) throw new TypeError(`\`${k}\` is not a list of strings`);
  return v;
}
function map(v: unknown, k: string): Record<string, string> {
  if (!isObj(v) || !Object.values(v).every((x) => typeof x === "string")) throw new TypeError(`\`${k}\` is not a map of strings`);
  return v as Record<string, string>;
}
function num(o: Record<string, unknown>, k: string): number {
  const v = o[k];
  if (typeof v !== "number") throw new TypeError(v === undefined ? `missing field \`${k}\`` : `\`${k}\` is not a number`);
  return v;
}

function parseManifest(bytes: Uint8Array): Manifest {
  const raw: unknown = JSON.parse(utf8.decode(bytes));
  if (!isObj(raw)) throw new TypeError("it is not an object");
  const format = num(raw, "format");
  if (!Number.isInteger(format) || format < 0 || format > 0xffffffff) throw new TypeError("`format` is not a whole number");
  const kind = raw.kind === undefined ? "visuals" : raw.kind;
  if (NOT_YET.includes(String(kind))) throw new NotYet(String(kind));
  if (!KINDS.includes(kind as Kind)) throw new TypeError(`unknown kind ${q(String(kind))}`);
  let keys: KeySet | null = null;
  if (raw.keys !== undefined && raw.keys !== null) {
    const k = raw.keys;
    if (!isObj(k) || !Array.isArray(k.keys)) throw new TypeError("`keys` is not a keyboard set");
    keys = {
      name: str(k, "name"),
      about: str(k, "about", ""),
      purpose: str(k, "purpose"),
      edition: str(k, "edition", ""),
      keys: k.keys.map((e) => {
        if (!isObj(e)) throw new TypeError("a key is not an object");
        return { keys: strs(e.keys, "keys"), label: str(e, "label"), run: str(e, "run") };
      }),
    };
  }
  const support = (raw.support === undefined ? [] : raw.support) as unknown;
  if (!Array.isArray(support)) throw new TypeError("`support` is not a list");
  const looks = (raw.looks === undefined ? [] : raw.looks) as unknown;
  if (!Array.isArray(looks)) throw new TypeError("`looks` is not a list");
  const skins = (raw.skins === undefined ? [] : raw.skins) as unknown;
  if (!Array.isArray(skins)) throw new TypeError("`skins` is not a list");
  let theme: PackTheme | null = null;
  if (raw.theme !== undefined && raw.theme !== null) {
    const t = raw.theme;
    if (!isObj(t)) throw new TypeError("`theme` is not an object");
    const p = t.parts === undefined ? {} : t.parts;
    if (!isObj(p)) throw new TypeError("`parts` is not an object");
    theme = {
      name: str(t, "name"),
      about: str(t, "about", ""),
      base: str(t, "base"),
      parts: {
        shapes: opt(p, "shapes"),
        art: p.art === undefined || p.art === null ? null : strs(p.art, "art"),
        motion: p.motion === undefined || p.motion === null ? null : strs(p.motion, "motion"),
        events: opt(p, "events"),
      },
      dark: map(t.dark, "dark"),
      light: map(t.light, "light"),
    };
  }
  return {
    format,
    name: str(raw, "name"),
    author: str(raw, "author"),
    licence: str(raw, "licence"),
    version: str(raw, "version"),
    description: str(raw, "description", ""),
    key: str(raw, "key"),
    files: map(raw.files, "files"),
    kind: kind as Kind,
    looks: looks.map((l): Look => {
      if (!isObj(l) || !Array.isArray(l.layers)) throw new TypeError("a look is not a look");
      return {
        name: str(l, "name"),
        description: str(l, "description"),
        layers: l.layers.map((y): Layer => {
          if (!isObj(y)) throw new TypeError("a layer is not an object");
          return { kind: str(y, "kind"), signal: str(y, "signal"), colour: str(y, "colour"), amount: num(y, "amount"), blend: str(y, "blend"), preset: opt(y, "preset") };
        }),
      };
    }),
    theme,
    skins: skins.map((s): PackSkin => {
      if (!isObj(s)) throw new TypeError("a skin is not an object");
      return {
        name: str(s, "name"),
        about: str(s, "about", ""),
        suits: s.suits === undefined ? [] : strs(s.suits, "suits"),
        tile: str(s, "tile"),
        size: str(s, "size"),
        opacity: num(s, "opacity"),
        motion: opt(s, "motion"),
      };
    }),
    keys,
    support: support.map((x): Support => {
      if (!isObj(x)) throw new TypeError("a support link is not an object");
      return { kind: str(x, "kind"), url: str(x, "url") };
    }),
  };
}

/** A kind djmanzo installs that the website does not check yet. */
export class NotYet extends Error {
  constructor(readonly kind: string) {
    super(kind);
  }
}

/** `dj_app::account::check_support`: why a support link is not one djmanzo puts in a pack, or null. */
export function supportProblem(link: Support): string | null {
  const known = SUPPORT.support.find((k) => k.kind === link.kind);
  if (!known) return `${q(link.kind)} is not a kind of support link djmanzo knows`;
  const url = link.url.trim();
  if (url.length > 300) return "that link is too long";
  const rest = url.startsWith("https://") ? url.slice("https://".length) : null;
  const host = rest === null ? null : (rest.split(/[/?#]/)[0].split("@").pop() ?? "").split(":")[0].toLowerCase();
  if (!host || !host.includes(".") || /\s/.test(host)) return `a ${known.name} link begins https:// and names a site`;
  if (known.hosts.length === 0) return null;
  return known.hosts.some((h) => host === h || host.endsWith(`.${h}`)) ? null : `a ${known.name} link is on ${known.hosts[0]}, and this one is on ${host}`;
}

/** The most support links a pack may carry (`dj_app::account::MOST`). */
const MOST_SUPPORT = 6;

// --- The checks ----------------------------------------------------------------------------

const KIND_NAME: Record<Kind, string> = { visuals: "visuals", theme: "theme", skin: "skin", keys: "keys" };
const sorted = (keys: Iterable<string>) => [...keys].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

function isTilePath(path: string): boolean {
  if (!path.startsWith(SKINS)) return false;
  const file = path.slice(SKINS.length);
  return file !== "" && !file.startsWith(".") && !/[/\\:]/.test(file) && file.toLowerCase().endsWith(".svg");
}
function isPresetPath(path: string): boolean {
  if (!path.startsWith(PRESETS)) return false;
  const file = path.slice(PRESETS.length);
  const lower = file.toLowerCase();
  return file !== "" && !file.startsWith(".") && !/[/\\:]/.test(file) && (lower.endsWith(".milk") || lower.endsWith(".json"));
}
function holds(kind: Kind, path: string): string | null {
  if (kind === "visuals") return isPresetPath(path) ? null : "presets: MilkDrop presets under milkdrop/";
  if (kind === "keys") return path === KEYBOARD_MAP ? null : "its manifest, and a keyboard map in keyboard.toml";
  if (isTilePath(path)) return null;
  return kind === "skin" ? "SVG tiles under skins/" : "its manifest, and its skins' SVG tiles under skins/";
}
const stem = (path: string) => {
  const file = path.startsWith(PRESETS) ? path.slice(PRESETS.length) : path;
  const dot = file.lastIndexOf(".");
  return dot < 0 ? file : file.slice(0, dot);
};

function short(field: string, what: string) {
  if (field.trim() === "") no(`its ${what} is empty`);
  if (chars(field) > RULES.short) no(`its ${what} is longer than ${RULES.short} characters`);
}

/** A MilkDrop preset djmanzo can draw (`milk::read`): a `.milk` with settings, or Butterchurn JSON with MilkDrop's own equations. */
function presetProblem(file: string, text: string): string | null {
  const lower = file.toLowerCase();
  if (lower.endsWith(".milk")) {
    const settings = text.split(/\r?\n/).some((line) => {
      const eq = line.indexOf("=");
      if (eq < 0) return false;
      const key = line.slice(0, eq).trim();
      return key !== "" && !key.startsWith("[");
    });
    return settings ? null : "it has no MilkDrop settings in it";
  }
  let preset: unknown;
  try {
    preset = JSON.parse(text);
  } catch (e) {
    return `it is not a preset (${(e as Error).message})`;
  }
  if (!isObj(preset)) return "it is not a preset";
  if (!Object.hasOwn(preset, "init_eqs_eel")) {
    return Object.hasOwn(preset, "init_eqs_str")
      ? "its equations are only in JavaScript, which djmanzo does not run; a copy with MilkDrop's own equations (`*_eqs_eel`) will work"
      : "it has no MilkDrop equations";
  }
  return null;
}

function checkVisuals(m: Manifest, files: Map<string, Uint8Array>) {
  const stems = new Map<string, string>();
  for (const path of sorted(Object.keys(m.files))) {
    const file = path.startsWith(PRESETS) ? path.slice(PRESETS.length) : path;
    const why = presetProblem(file, lossy.decode(files.get(path)!));
    if (why) no(`${path} cannot be drawn: ${why}`);
    if (stems.has(stem(path))) no(`two presets are called ${q(stem(path))}`);
    stems.set(stem(path), path);
  }
  if (m.looks.length === 0) no("it has no looks");
  const names: string[] = [];
  for (const look of m.looks) {
    short(look.name, "look's name");
    if (names.includes(look.name)) no(`two of its looks are called ${q(look.name)}`);
    names.push(look.name);
    if (chars(look.description) > RULES.long) no(`${look.name}'s description is too long`);
    if (look.layers.length === 0) no(`${look.name} draws nothing`);
    for (const layer of look.layers) {
      if (!RULES.look_kinds.includes(layer.kind)) no(`${look.name} draws a ${q(layer.kind)} layer, which this djmanzo does not draw`);
      if (!RULES.signals.includes(layer.signal) || !RULES.blends.includes(layer.blend)) no(`${look.name} has a layer this djmanzo cannot draw`);
      const drawn = layer.colour === "record" || /^#[0-9a-fA-F]{6}$/.test(layer.colour);
      const amount = Math.fround(layer.amount);
      if (!drawn || !(amount >= 0 && amount <= 1)) no(`${look.name} has a layer out of range`);
      const preset = layer.preset ?? null;
      if (layer.kind === "milkdrop") {
        if (preset === null) no(`${look.name} has a MilkDrop layer naming no preset`);
        else if (!stems.has(preset)) no(`${look.name} draws the preset ${q(preset)}, which is not in the pack`);
      } else if (preset !== null) no(`${look.name} names a preset on a layer that draws none`);
    }
  }
}

/** A colour as a theme writes it, `#rgb`, `#rrggbb` or `#rrggbbaa`, as red, green and blue on 0..1. */
export function rgb(colour: string): [number, number, number] | null {
  const t = colour.trim();
  if (!t.startsWith("#")) return null;
  const h = t.slice(1);
  if (!/^[0-9a-fA-F]*$/.test(h)) return null;
  const ch = (at: number, w: number) => (w === 1 ? parseInt(h[at], 16) * 17 : parseInt(h.slice(at, at + 2), 16)) / 255;
  if (h.length === 3) return [ch(0, 1), ch(1, 1), ch(2, 1)];
  if (h.length === 6 || h.length === 8) return [ch(0, 2), ch(2, 2), ch(4, 2)];
  return null;
}

/** WCAG's contrast ratio between two colours, 1 to 21 (`packs::contrast`). */
export function contrast(a: number[], b: number[]): number {
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = ([r, g, bl]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bl);
  const [la, lb] = [lum(a), lum(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function checkParts(p: ThemeParts) {
  if (p.shapes != null && !RULES.shapes.includes(p.shapes)) no(`its shapes are ${q(p.shapes)}, which no theme draws`);
  for (const [what, list, names] of [
    ["art", RULES.art, p.art],
    ["motion", RULES.motion, p.motion],
  ] as const) {
    for (const name of names ?? []) if (!list.includes(name)) no(`its ${what} names ${q(name)}, which no theme draws`);
    const seen: string[] = [];
    for (const name of names ?? []) {
      if (seen.includes(name)) no(`its ${what} names ${q(name)} twice`);
      seen.push(name);
    }
  }
  if (p.events != null && !RULES.events.includes(p.events)) no(`its events are ${q(p.events)}, which no theme draws`);
}

function checkTheme(theme: PackTheme | null) {
  if (!theme) return no("it is a theme pack with no theme");
  short(theme.name, "theme's name");
  if (chars(theme.about) > RULES.long) no(`${theme.name}'s description is too long`);
  if (!RULES.themes.includes(theme.base)) no(`${theme.name} is worn on ${q(theme.base)}, which is not a theme djmanzo ships`);
  try {
    checkParts(theme.parts);
  } catch (e) {
    if (e instanceof PackError) no(`${theme.name}: ${e.message}`);
    throw e;
  }
  for (const [room, colours] of [
    ["dark", theme.dark],
    ["light", theme.light],
  ] as const) {
    const missing = RULES.tokens.find((t) => !Object.hasOwn(colours, t));
    if (missing) no(`${theme.name}'s ${room} colours leave out ${missing}`);
    const extra = sorted(Object.keys(colours)).find((k) => !RULES.tokens.includes(k));
    if (extra !== undefined) no(`${theme.name}'s ${room} colours name ${q(extra)}, which no theme fills`);
    const read: Record<string, number[]> = {};
    for (const token of sorted(Object.keys(colours))) {
      const value = rgb(colours[token]);
      if (!value) no(`${theme.name}'s ${room} ${token} is ${q(colours[token])}, which is not a colour`);
      read[token] = value!;
    }
    for (const [fore, back, least] of RULES.readable as [string, string, number][]) {
      const ratio = contrast(read[fore], read[back]);
      if (ratio < least) no(`${theme.name}'s ${room} ${fore} on ${back} has a contrast of ${ratio.toFixed(1)}, and needs ${least}`);
    }
  }
}

/** Whether an SVG tile only draws (`packs::svg_draws_only`): no script, handler, link, fetch, image, style or DTD. */
export function svgDrawsOnly(svg: string): boolean {
  const text = svg.replace(/[A-Z]/g, (c) => c.toLowerCase());
  const head = text.trimStart();
  const opens = head.startsWith("<svg") || head.startsWith("<?xml");
  const never = ["<script", "javascript:", "href", "url(", "<image", "<foreignobject", "<use", "<style", "<!doctype", "<!entity", "<iframe", "@import"];
  let handler = false;
  for (const lead of [" on", "\non", "\ton"]) {
    let at = text.indexOf(lead);
    while (at >= 0 && !handler) {
      const rest = text.slice(at + 3);
      const name = /^[a-z]*/.exec(rest)![0];
      if (name !== "" && rest.slice(name.length).trimStart().startsWith("=")) handler = true;
      at = text.indexOf(lead, at + 1);
    }
  }
  return opens && text.includes("<svg") && !handler && !never.some((n) => text.includes(n));
}

const DRAWS_ONLY = "a tile may hold no script, link, image, stylesheet or anything fetched";

function tileOk(bytes: Uint8Array): boolean {
  try {
    return svgDrawsOnly(utf8.decode(bytes));
  } catch {
    return false;
  }
}

function checkSkin(skin: PackSkin, tile: Uint8Array) {
  if (tile.length > RULES.most_tile) no(`${skin.name}'s tile is larger than ${RULES.most_tile / 1024} KB: a tile is a pattern, not a picture`);
  if (!tileOk(tile)) no(`${skin.name}'s tile does more than draw: ${DRAWS_ONLY}`);
  const sized = (part: string) => /^[0-9]{1,4}px$/.test(part);
  const parts = skin.size.split(/\s+/).filter(Boolean);
  if (parts.length === 0 || parts.length > 2 || !parts.every(sized)) no(`${skin.name}'s size is ${q(skin.size)}; a size is \`240px\` or \`240px 80px\``);
  const o = Math.fround(skin.opacity);
  if (!(o >= Math.fround(0.1) && o <= Math.fround(0.18))) no(`${skin.name} is drawn at ${f32(skin.opacity)}; a skin is drawn at 0.10 to 0.18, faint enough to read through`);
  const stranger = skin.suits.find((id) => !RULES.themes.includes(id));
  if (stranger !== undefined) no(`${skin.name} suits ${q(stranger)}, which is not a theme djmanzo ships`);
  if (skin.motion != null && !RULES.skin_motion.includes(skin.motion)) no(`${skin.name} moves as ${q(skin.motion)}, which this djmanzo does not draw`);
}

function checkSkins(m: Manifest, files: Map<string, Uint8Array>) {
  if (m.skins.length === 0) no("it is a skin pack with no skins");
  const names: string[] = [];
  for (const skin of m.skins) {
    short(skin.name, "skin's name");
    if (names.includes(skin.name)) no(`two of its skins are called ${q(skin.name)}`);
    names.push(skin.name);
    if (chars(skin.about) > RULES.long) no(`${skin.name}'s description is too long`);
    const tile = Object.hasOwn(m.files, skin.tile) ? files.get(skin.tile) : undefined;
    if (!tile) return no(`${skin.name}'s tile ${q(skin.tile)} is not in the pack`);
    checkSkin(skin, tile);
  }
}

/** A keys pack's set (`dj_app::packs::check_keys`), and the website's rules over it. */
function checkKeys(m: Manifest) {
  const set = m.keys ?? no("it is a keys pack with no keyboard set");
  const why = setProblem(set);
  if (why) no(why);
  if (Object.hasOwn(m.files, KEYBOARD_MAP)) no("it carries a keyboard map: djmanzo reads one, and Outboard cannot check one yet, so share it as a file for now");
  const over = takesOver(set);
  if (over) no(over);
}

/** Check a pack whole, as `dj_app::packs::check` does, then the website's one stricter rule. */
export async function check(files: Map<string, Uint8Array>): Promise<Checked> {
  const manifestBytes = files.get(MANIFEST) ?? no(`it has no ${MANIFEST}: it is not a djmanzo pack`);
  let m: Manifest;
  try {
    m = parseManifest(manifestBytes);
  } catch (e) {
    if (e instanceof NotYet) return no(`it is a ${e.kind} pack: djmanzo installs those, and Outboard cannot check one yet, so share it as a file for now`);
    return no(`its ${MANIFEST} could not be read: ${(e as Error).message}`);
  }
  if (m.format !== RULES.format) no(`it is in pack format ${m.format}, and this djmanzo reads format ${RULES.format}: a newer djmanzo may read it`);
  short(m.name, "name");
  short(m.author, "author");
  short(m.licence, "licence");
  short(m.version, "version");
  if (m.support.length > MOST_SUPPORT) no(`it carries more than ${MOST_SUPPORT} support links`);
  for (const link of m.support) {
    const why = supportProblem(link);
    if (why) no(`a support link in it: ${why}`);
  }
  if (chars(m.description) > RULES.long) no(`its description is longer than ${RULES.long} characters`);

  // The signature, before anything the manifest says is believed.
  const key = base64(m.key.trim()) ?? no("its key is not base64");
  if (key.length !== 32) no("its key is not an Ed25519 key");
  const sigText = files.get(SIGNATURE) ?? no(`it is not signed: there is no ${SIGNATURE}`);
  const signature = base64(lossy.decode(sigText).trim()) ?? no("its signature is not base64");
  let good = false;
  try {
    const pub = await crypto.subtle.importKey("raw", key, { name: "Ed25519" }, false, ["verify"]);
    good = await crypto.subtle.verify({ name: "Ed25519" }, pub, signature, manifestBytes);
  } catch {
    good = false;
  }
  if (!good) no("its signature does not match: it was changed after it was signed, or signed with another key");

  // Every file listed, with its hash; nothing unlisted.
  for (const path of sorted(Object.keys(m.files))) {
    const what = holds(m.kind, path);
    if (what) no(`it lists ${q(path)}, and a ${KIND_NAME[m.kind]} pack holds only ${what}`);
    const bytes = files.get(path) ?? no(`${path} is listed and not in it`);
    if ((await sha256(bytes)) !== m.files[path].trim().toLowerCase()) no(`${path} is not the file that was signed`);
  }
  const extra = sorted(files.keys()).find((n) => n !== MANIFEST && n !== SIGNATURE && !Object.hasOwn(m.files, n));
  if (extra !== undefined) no(`${extra} is in it and not listed, so not signed`);

  // What it holds is what its kind holds, and nothing another kind does.
  const stray =
    (m.kind === "visuals"
      ? m.theme !== null || m.skins.length > 0
      : m.kind === "theme"
        ? m.looks.length > 0
        : m.kind === "skin"
          ? m.looks.length > 0 || m.theme !== null
          : m.looks.length > 0 || m.theme !== null || m.skins.length > 0) ||
    (m.kind !== "keys" && m.keys !== null);
  if (stray) no(`it is a ${KIND_NAME[m.kind]} pack and carries another kind's contents as well`);
  if (m.kind === "visuals") checkVisuals(m, files);
  else if (m.kind === "theme") {
    checkTheme(m.theme);
    if (m.skins.length > 0) checkSkins(m, files);
  } else if (m.kind === "keys") checkKeys(m);
  else checkSkins(m, files);

  // The website's own rule: every tile it would hand out only draws.
  for (const path of sorted(Object.keys(m.files))) {
    if (!isTilePath(path)) continue;
    const bytes = files.get(path)!;
    if (bytes.length > RULES.most_tile || !tileOk(bytes)) no(`${path} does more than draw: ${DRAWS_ONLY}`);
  }
  return { manifest: m, key, fingerprint: await fingerprint(key), files };
}

/** Read and check a `.djpack`. */
export async function checkArchive(zip: Uint8Array): Promise<Checked> {
  return check(await readArchive(zip));
}
