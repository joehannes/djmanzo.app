import { describe, expect, it } from "vitest";
import { CANNED } from "../src/v4/i18n/assistant";
import fr from "../src/v4/i18n/facts/fr";
import { HOME } from "../src/v4/i18n/home";
import { SECTIONS } from "../src/v4/i18n/sections";
import { STRINGS } from "../src/v4/i18n/strings";
import { WELCOME } from "../src/v4/i18n/welcome";

/** Every string in a value. */
const texts = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(texts) : []);

describe("French, set as French is set", () => {
  it("has a narrow no-break space before ? ! : ; and inside « », so a line never starts with one", () => {
    const all = [...texts(fr), ...texts(HOME.fr), ...texts(SECTIONS.fr), ...texts(STRINGS.fr), ...Object.values(WELCOME).flatMap((w) => texts(w.fr)), ...CANNED.flatMap((c) => texts((c as unknown as Record<string, unknown>).fr ?? Object.values(c).map((x) => (x && typeof x === "object" ? (x as Record<string, unknown>).fr : null))))];
    expect(all.length).toBeGreaterThan(300);
    const loose = all.filter((t) => /[ \u00a0][?!:;»]|« /.test(t.replace(/https?:\/\/\S+/g, "")));
    expect(loose).toEqual([]);
  });
});
