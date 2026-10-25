import { describe, expect, it } from "vitest";
import { CANNED } from "../src/v4/i18n/assistant";
import fr from "../src/v4/i18n/facts/fr";
import { HOME } from "../src/v4/i18n/home";
import { SECTIONS } from "../src/v4/i18n/sections";
import { STRINGS } from "../src/v4/i18n/strings";
import { WELCOME } from "../src/v4/i18n/welcome";
import { ACCOUNT } from "../src/v4/i18n/account";
import { FEATURES_PAGE } from "../src/v4/i18n/featurespage";
import { PAGES } from "../src/v4/i18n/pages";
import { PRICING } from "../src/v4/i18n/pricing";
import { BITS } from "../src/v4/i18n/bits";
import { SCREENS } from "../src/v4/i18n/screens";
import { LOOK_WORDS } from "../src/v4/i18n/looks";
import { TALKBACK } from "../src/v4/i18n/talkback";
import { OUTBOARD } from "../src/v4/i18n/outboard";
import { COMPARE } from "../src/v4/i18n/compare";
import { NIGHTS } from "../src/v4/i18n/nights";
import { PEOPLE } from "../src/v4/i18n/people";

/** Every string in a value. */
const texts = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(texts) : []);

describe("French, set as French is set", () => {
  it("has a narrow no-break space before ? ! : ; and inside « », so a line never starts with one", () => {
    const all = [...texts(ACCOUNT.fr), ...texts(FEATURES_PAGE.fr), ...texts(PAGES.fr), ...texts(PRICING.fr), ...texts(BITS.fr), ...texts(SCREENS.fr), ...texts(LOOK_WORDS.fr), ...texts(TALKBACK.fr), ...texts(OUTBOARD.fr), ...texts(COMPARE.fr), ...texts(NIGHTS.fr), ...texts(PEOPLE.fr), ...texts(fr), ...texts(HOME.fr), ...texts(SECTIONS.fr), ...texts(STRINGS.fr), ...Object.values(WELCOME).flatMap((w) => texts(w.fr)), ...CANNED.flatMap((c) => texts((c as unknown as Record<string, unknown>).fr ?? Object.values(c).map((x) => (x && typeof x === "object" ? (x as Record<string, unknown>).fr : null))))];
    expect(all.length).toBeGreaterThan(300);
    const loose = all.filter((t) => /[ \u00a0][?!:;»]|« /.test(t.replace(/https?:\/\/\S+/g, "")));
    expect(loose).toEqual([]);
  });
});
