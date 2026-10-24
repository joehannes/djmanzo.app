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
  label: string;
  href: string;
}

export interface Latest {
  version: string | null;
  published?: string | null;
  page: string | null;
  files: File[];
}

let asked: Promise<Latest> | null = null;

/** The newest release, asked for once a visit. */
export function latest(): Promise<Latest> {
  asked ??= fetch("/api/download")
    .then((r) => (r.ok ? (r.json() as Promise<Latest>) : { version: null, page: null, files: [] }))
    .catch(() => ({ version: null, page: null, files: [] }));
  return asked;
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
      return { label: "Download for Windows", note: "Built and packaged with every release, but not yet run by a person on Windows." };
    case "phone":
      return { label: "Get it on your computer", note: "djmanzo runs on macOS and Linux." };
    default:
      return { label: "Download free", note: "For macOS and Linux." };
  }
}
