import { describe, expect, it } from "vitest";
import { pick, type File } from "../src/v4/download";

const f = (name: string, os: File["os"], label = name): File => ({ name, os, label, size: 1, href: `/download/${name}` });
const files = [
  f("djmanzo_0.49.0_aarch64.dmg", "mac", "macOS, Apple silicon"),
  f("djmanzo_0.49.0_x64.dmg", "mac", "macOS, Intel"),
  f("djmanzo_0.49.0_amd64.deb", "linux"),
  f("djmanzo_0.49.0_amd64.AppImage", "linux"),
  f("djmanzo-0.49.0-1.x86_64.rpm", "linux"),
  f("djmanzo_0.49.0_x64_en-US.msi", "windows"),
  f("djmanzo_0.49.0_x64-setup.exe", "windows"),
];

describe("the Download button hands each system its one file", () => {
  it("Linux gets the AppImage, which runs anywhere; Windows the installer", () => {
    expect(pick(files, "linux")?.name).toBe("djmanzo_0.49.0_amd64.AppImage");
    expect(pick(files, "windows")?.name).toBe("djmanzo_0.49.0_x64-setup.exe");
    expect(pick(files.filter((x) => !x.name.endsWith(".exe")), "windows")?.name).toBe("djmanzo_0.49.0_x64_en-US.msi");
  });

  it("a Mac gets its processor's file when the browser says which, and chooses when it does not", () => {
    expect(pick(files, "mac", "arm")?.name).toBe("djmanzo_0.49.0_aarch64.dmg");
    expect(pick(files, "mac", "x86")?.name).toBe("djmanzo_0.49.0_x64.dmg");
    expect(pick(files, "mac")).toBeNull();
    expect(pick(files.filter((x) => !x.name.includes("x64.dmg")), "mac")?.name).toBe("djmanzo_0.49.0_aarch64.dmg");
  });

  it("a phone, or a system with no file, chooses on the download screen", () => {
    expect(pick(files, "phone")).toBeNull();
    expect(pick([], "linux")).toBeNull();
  });
});
