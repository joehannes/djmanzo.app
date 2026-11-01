import { beforeAll, describe, expect, it } from "vitest";
import { closest } from "../src/v4/askmatch";
import { CANNED } from "../src/v4/i18n/assistant";
import { installAll } from "./packs";

beforeAll(installAll);

const best = (text: string, lang: Parameters<typeof closest>[1] = "en") => closest(text, lang)[0]?.id ?? null;

describe("the assistant, without the AI", () => {
  it("finds the question a visitor's own words are closest to, in any language the site speaks", () => {
    const cases: [string, Parameters<typeof closest>[1], string][] = [
      ["I play weddings and latin parties, which edition do I need?", "en", "edition"],
      ["Does it work with my DDJ-400 controller?", "en", "controller"],
      ["will it run on my old windows laptop", "en", "systems"],
      ["can I bring my rekordbox playlists over", "en", "library"],
      ["is it stable enough for a club gig", "en", "gig"],
      ["what's so special about it", "en", "different"],
      ["how much does it cost", "en", "free"],
      ["¿Funciona en Windows?", "es", "systems"],
      ["¿es gratis?", "es", "free"],
      ["Kann ich meine Serato-Bibliothek mitnehmen?", "de", "library"],
      ["Welche Edition brauche ich für Hochzeiten?", "de", "edition"],
      ["est-ce que c'est gratuit", "fr", "free"],
      ["Funziona con il mio controller Pioneer?", "it", "controller"],
      ["Dá para fazer karaokê com os amigos?", "pt", "karaoke"],
      ["カラオケはできますか", "ja", "karaoke"],
      ["这个软件免费吗", "zh", "free"],
      ["האם זה עובד עם הבקר שלי", "he", "controller"],
      ["هل هو مجاني؟", "ar", "free"],
      ["क्या यह मुफ्त है", "hi", "free"],
      ["노래방 모드가 있나요?", "ko", "karaoke"],
      ["Apakah bisa di Linux?", "id", "systems"],
      ["Có miễn phí không?", "vi", "free"],
      ["ใช้กับคอนโทรลเลอร์ได้ไหม", "th", "controller"],
      ["Düğün için hangi sürüm?", "tr", "edition"],
      ["Je, ni bure?", "sw", "free"],
    ];
    for (const [text, lang, id] of cases) expect(best(text, lang), `${lang}: ${text}`).toBe(id);
  });

  it("claims nothing for words that are about none of them", () => {
    for (const text of ["asdf qwerty", "hello", "what is the weather tomorrow", "", "   ", "!!!"]) expect(closest(text, "en"), text).toEqual([]);
  });

  it("knows each of the questions it can answer, and a question asked as written finds itself", () => {
    for (const c of CANNED) expect(best(c.q.en, "en"), c.id).toBe(c.id);
    for (const c of CANNED) expect(best(c.q.es, "es"), `es ${c.id}`).toBe(c.id);
  });
});
