/**
 * The Download button says what it downloads for: the visitor's own system
 * where djmanzo runs on it, and the truth where it does not yet (Windows is
 * built and packaged but nobody has run it; phones are not a platform).
 */

export type Os = "mac" | "linux" | "windows" | "phone" | "other";

export function osOf(ua: string): Os {
  if (/iPhone|iPad|Android/i.test(ua)) return "phone";
  if (/Mac OS X|Macintosh/i.test(ua)) return "mac";
  if (/Windows/i.test(ua)) return "windows";
  if (/Linux|X11|CrOS/i.test(ua)) return "linux";
  return "other";
}

/** Where every download is: the home page's last screen, which lists the newest release's installers. */
export const RELEASES = "/#download";

/** One installer of the newest release, at this site's address for it (`worker/update.ts`). */
export interface File {
  name: string;
  size: number;
  os: "mac" | "linux" | "windows";
  /** The kind of file, the same from release to release (`linux-deb`, `mac-arm`…). */
  key: string;
  label: string;
  /** `/download/latest/<key>`: the newest release's file of this kind, whenever it is pressed. */
  href: string;
}

/** The systems a download is for, in the order the menus list them. */
export const SYSTEMS = ["mac", "windows", "linux"] as const;
export type System = (typeof SYSTEMS)[number];
export const SYSTEM_NAME: Record<System, string> = { mac: "macOS", windows: "Windows", linux: "Linux" };

/** The file each system gets with one press (the owner's choice, 25 October). */
export const DEFAULT_KIND: Record<System, string> = { linux: "linux-deb", windows: "windows-exe", mac: "mac-arm" };

/** The order a system's files are offered in: its default first. */
const ORDER = ["mac-arm", "mac-intel", "mac-karaoke", "windows-exe", "windows-msi", "linux-deb", "linux-rpm", "linux-appimage"];

/** A system's files, its default first. */
export function filesFor(files: File[], os: System): File[] {
  const rank = (f: File) => (ORDER.includes(f.key) ? ORDER.indexOf(f.key) : ORDER.length);
  return files.filter((f) => f.os === os).sort((a, b) => rank(a) - rank(b));
}

/** The system a visitor is on, or macOS for a phone or anything unknown. */
export function systemOf(os: Os): System {
  return os === "linux" || os === "windows" || os === "mac" ? os : "mac";
}

export interface Latest {
  version: string | null;
  published?: string | null;
  page: string | null;
  files: File[];
}

let asked: Promise<Latest> | null = null;

/** The newest release, asked for once a visit; `error` says why there is none. */
export function latest(): Promise<Latest & { error?: string }> {
  asked ??= fetch("/api/download")
    .then(async (r) => (r.ok ? ((await r.json()) as Latest) : { version: null, page: null, files: [], error: ((await r.json().catch(() => ({}))) as { error?: string }).error ?? `HTTP ${r.status}` }))
    .catch(() => ({ version: null, page: null, files: [], error: "offline" }));
  return asked;
}

/** The one file a system gets with one press: its default kind, else its first file. */
export function pick(files: File[], os: Os): File | null {
  if (os !== "linux" && os !== "windows" && os !== "mac") return null;
  const mine = filesFor(files, os);
  return mine.find((f) => f.key === DEFAULT_KIND[os]) ?? mine[0] ?? null;
}

/** A file's size as a person reads it. */
export function sizeOf(bytes: number): string {
  return bytes >= 1e9 ? `${(bytes / 1e9).toFixed(1)} GB` : `${Math.max(1, Math.round(bytes / 1e6))} MB`;
}

export function downloadLabel(os: Os): { label: string; note: string } {
  switch (os) {
    case "mac":
      return { label: "Download for macOS", note: "Apple silicon and Intel. A karaoke build reaches back to macOS 10.13 on Intel Macs." };
    case "linux":
      return { label: "Download for Linux", note: "Native, on PipeWire or ALSA." };
    case "windows":
      return { label: "Download for Windows", note: "Built with every release and run on Windows by its owner; in beta, like all of djmanzo." };
    case "phone":
      return { label: "Get it on your computer", note: "djmanzo runs on Windows, macOS and Linux." };
    default:
      return { label: "Download free", note: "For Windows, macOS and Linux." };
  }
}
