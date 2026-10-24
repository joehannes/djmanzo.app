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

/** The newest release, asked for once a visit; `error` says why there is none. */
export function latest(): Promise<Latest & { error?: string }> {
  asked ??= fetch("/api/download")
    .then(async (r) => (r.ok ? ((await r.json()) as Latest) : { version: null, page: null, files: [], error: ((await r.json().catch(() => ({}))) as { error?: string }).error ?? `HTTP ${r.status}` }))
    .catch(() => ({ version: null, page: null, files: [], error: "offline" }));
  return asked;
}

/** The one file to hand a visitor on `os`, or null when they should choose (a Mac: Apple silicon or Intel). */
export function pick(files: File[], os: Os, arch?: string): File | null {
  const mine = files.filter((f) => f.os === os);
  if (os === "linux") return mine.find((f) => /appimage$/i.test(f.name)) ?? mine[0] ?? null;
  if (os === "windows") return mine.find((f) => /\.exe$/i.test(f.name)) ?? mine.find((f) => /\.msi$/i.test(f.name)) ?? null;
  if (os === "mac") {
    const main = mine.filter((f) => !/karaoke|legacy|10\.13/i.test(f.name + f.label));
    if (main.length === 1) return main[0];
    if (arch === "arm") return main.find((f) => /aarch64|arm64/i.test(f.name)) ?? null;
    if (arch === "x86") return main.find((f) => !/aarch64|arm64/i.test(f.name)) ?? null;
  }
  return null;
}

/** The processor, where the browser says (Chromium does; Safari and Firefox do not). */
async function archOf(): Promise<string | undefined> {
  const ua = (navigator as Navigator & { userAgentData?: { getHighEntropyValues(h: string[]): Promise<{ architecture?: string }> } }).userAgentData;
  return ua ? (await ua.getHighEntropyValues(["architecture"]).catch(() => ({ architecture: undefined }))).architecture : undefined;
}

/**
 * The Download button: the visitor's installer, at once, when there is one
 * obvious file for their system; otherwise `choose` (the download screen,
 * where every file and the reason for none are shown).
 */
export async function download(choose: () => void): Promise<void> {
  const os = osOf(navigator.userAgent);
  const r = await latest();
  const f = r.files.length ? pick(r.files, os, await archOf()) : null;
  if (f) location.assign(f.href);
  else choose();
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
