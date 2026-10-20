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

export const RELEASES = "https://github.com/joehannes/djmanzo/releases/latest";

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
