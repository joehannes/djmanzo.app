import { describe, expect, it } from "vitest";
import { filesFor, pick, type File } from "../src/v4/download";

const f = (name: string, os: File["os"], key: string, label = name): File => ({ name, os, key, label, size: 1, href: `/download/latest/${key}` });
const files = [
  f("djmanzo.Karaoke_0.49.0_x64.dmg", "mac", "mac-karaoke"),
  f("djmanzo_0.49.0_x64.dmg", "mac", "mac-intel"),
  f("djmanzo_0.49.0_aarch64.dmg", "mac", "mac-arm"),
  f("djmanzo-0.49.0-1.x86_64.rpm", "linux", "linux-rpm"),
  f("djmanzo_0.49.0_amd64.AppImage", "linux", "linux-appimage"),
  f("djmanzo_0.49.0_amd64.deb", "linux", "linux-deb"),
  f("djmanzo_0.49.0_x64_en-US.msi", "windows", "windows-msi"),
  f("djmanzo_0.49.0_x64-setup.exe", "windows", "windows-exe"),
];

describe("the Download button hands each system its default, and offers the rest", () => {
  it("one press: Linux gets the .deb, Windows the installer, a Mac the Apple-silicon build", () => {
    expect(pick(files, "linux")?.key).toBe("linux-deb");
    expect(pick(files, "windows")?.key).toBe("windows-exe");
    expect(pick(files, "mac")?.key).toBe("mac-arm");
  });

  it("the menu lists every file of a system, its default first", () => {
    expect(filesFor(files, "linux").map((x) => x.key)).toEqual(["linux-deb", "linux-rpm", "linux-appimage"]);
    expect(filesFor(files, "mac").map((x) => x.key)).toEqual(["mac-arm", "mac-intel", "mac-karaoke"]);
    expect(filesFor(files, "windows").map((x) => x.key)).toEqual(["windows-exe", "windows-msi"]);
  });

  it("without its default, a system gets its first file; a phone, or no file, gets none", () => {
    expect(pick(files.filter((x) => x.key !== "linux-deb"), "linux")?.key).toBe("linux-rpm");
    expect(pick(files, "phone")).toBeNull();
    expect(pick([], "linux")).toBeNull();
  });

  it("the links name the kind of file, so a page left open still downloads the newest release", () => {
    for (const x of files) expect(x.href).toBe(`/download/latest/${x.key}`);
  });
});
