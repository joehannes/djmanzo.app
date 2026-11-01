/**
 * Which of the assistant's own questions (`i18n/assistant.ts`) a visitor's
 * words are closest to, in any of the site's languages: so a question typed
 * while the AI is off, spent or unreachable is still answered from the facts,
 * at once and in the visitor's language, rather than met with a list.
 *
 * Each question has the words people use for it, in every language the site
 * speaks; a word counts where it stands in the visitor's text (as a word in
 * scripts with spaces, anywhere in Chinese, Japanese and Thai, which have
 * none), and the question's own words count too. The best score wins; none
 * that clears the bar, and nothing is claimed.
 */

import { CANNED, questionOf } from "./i18n/assistant";
import type { Lang } from "./i18n/strings";

/** The words for each question: the stronger ones first, weighed 2; the rest 1. */
const WORDS: Record<string, [strong: string[], weak: string[]]> = {
  different: [
    ["different", "difference", "unique", "special", "diferente", "diferencia", "anders", "unterschied", "besonders", "différent", "différence", "diverso", "differenza", "違う", "違い", "不同", "区别", "שונה", "מיוחד", "مختلف", "يميز", "अलग", "खास", "다른", "차이", "berbeda", "beda", "khác", "ต่าง", "farklı", "fark", "tofauti"],
    ["better", "why", "compare", "versus", "vs", "mejor", "melhor", "besser", "meilleur", "migliore", "なぜ", "为什么", "למה", "لماذا", "क्यों", "왜", "kenapa", "tại sao", "ทำไม", "neden", "kwa nini"],
  ],
  free: [
    ["free", "price", "prices", "cost", "costs", "gratis", "gratuit", "gratuito", "grátis", "kostenlos", "umsonst", "precio", "cuesta", "preço", "custa", "preis", "kostet", "prix", "coûte", "prezzo", "costa", "無料", "値段", "料金", "免费", "价格", "多少钱", "חינם", "מחיר", "مجاني", "مجانا", "سعر", "मुफ़्त", "मुफ्त", "कीमत", "무료", "가격", "harga", "miễn phí", "giá", "ฟรี", "ราคา", "ücretsiz", "bedava", "fiyat", "bure", "bila malipo", "bei"],
    ["pay", "trial", "money", "cheap", "pagar", "bezahlen", "payer", "pagare", "bayar", "majaribio"],
  ],
  edition: [
    ["edition", "editions", "edición", "edição", "édition", "edizione", "エディション", "版本", "מהדורה", "إصدار", "एडिशन", "संस्करण", "에디션", "edisi", "phiên bản", "รุ่น", "sürüm", "toleo"],
    ["which", "fits", "need", "plan", "wedding", "weddings", "mobile", "club", "bar", "cuál", "necesito", "boda", "qual", "preciso", "casamento", "welche", "brauche", "hochzeit", "quelle", "besoin", "mariage", "quale", "serve", "matrimonio", "どれ", "結婚式", "哪个", "婚礼", "איזו", "חתונה", "أي", "زفاف", "कौन", "शादी", "어떤", "결혼식", "mana", "pernikahan", "nào", "đám cưới", "ไหน", "งานแต่ง", "hangi", "düğün", "ipi", "harusi"],
  ],
  controller: [
    ["controller", "controllers", "midi", "ddj", "mapping", "controlador", "controladora", "contrôleur", "コントローラー", "コントローラ", "控制器", "בקר", "وحدة تحكم", "कंट्रोलर", "컨트롤러", "kontroler", "bộ điều khiển", "คอนโทรลเลอร์", "kontrolcü", "kidhibiti"],
    ["pioneer", "numark", "hercules", "denon", "rane", "hardware", "jog", "turntable", "plattenspieler", "platine", "ハードウェア", "硬件", "חומרה", "عتاد", "हार्डवेयर", "하드웨어", "perangkat", "phần cứng", "ฮาร์ดแวร์", "donanım", "vifaa"],
  ],
  systems: [
    ["windows", "linux", "macos", "mac", "computer", "laptop", "pc", "ordenador", "computadora", "computador", "rechner", "ordinateur", "パソコン", "电脑", "מחשב", "حاسوب", "كمبيوتر", "कंप्यूटर", "컴퓨터", "komputer", "máy tính", "คอมพิวเตอร์", "bilgisayar", "kompyuta"],
    ["install", "run", "runs", "system", "requirements", "apple", "ubuntu", "instalar", "funciona", "installieren", "läuft", "installer", "tourne", "installare", "funziona", "インストール", "安装", "התקנה", "تثبيت", "इंस्टॉल", "설치", "pasang", "cài", "ติดตั้ง", "kurulum", "çalışır", "sakinisha"],
  ],
  library: [
    ["rekordbox", "serato", "traktor", "virtualdj", "engine dj", "library", "biblioteca", "bibliothek", "mediathek", "bibliothèque", "libreria", "ライブラリ", "曲库", "音乐库", "ספרייה", "مكتبة", "लाइब्रेरी", "라이브러리", "pustaka", "thư viện", "คลังเพลง", "kütüphane", "maktaba"],
    ["crates", "playlists", "playlist", "import", "cues", "collection", "migrate", "importar", "listas", "importieren", "playlisten", "importer", "importare", "インポート", "导入", "ייבוא", "استيراد", "आयात", "가져오기", "impor", "nhập", "นำเข้า", "aktar", "kuhamisha"],
  ],
  karaoke: [
    ["karaoke", "karaokê", "karaoké", "カラオケ", "卡拉ok", "卡拉 ok", "קריוקי", "كاريوكي", "कराओके", "노래방", "가라오케", "คาราโอเกะ"],
    ["sing", "singer", "singers", "lyrics", "microphone", "mic", "cantar", "cantante", "letra", "singen", "sänger", "songtext", "chanter", "chanteur", "paroles", "cantare", "testo", "歌う", "歌詞", "唱", "歌词", "לשיר", "مغني", "غناء", "गाना", "गायक", "노래", "가사", "nyanyi", "lirik", "hát", "lời", "ร้อง", "เนื้อเพลง", "şarkı", "söz", "kuimba", "mwimbaji"],
  ],
  gig: [
    ["gig", "gigs", "stable", "reliable", "crash", "crashes", "ready", "estable", "fiable", "listo", "estável", "pronto", "stabil", "zuverlässig", "auftritt", "stable", "fiable", "prêt", "affidabile", "pronto", "安定", "本番", "稳定", "可靠", "יציב", "מוכן", "مستقر", "جاهز", "स्थिर", "भरोसेमंद", "안정", "준비", "stabil", "siap", "ổn định", "sẵn sàng", "เสถียร", "พร้อม", "kararlı", "hazır", "imara", "tayari"],
    ["live", "beta", "professional", "real", "en vivo", "ao vivo", "profi", "concert", "serata", "ライブ", "演出", "הופעה", "حفلة", "शो", "공연", "manggung", "biểu diễn", "แสดงสด", "sahne", "tamasha"],
  ],
};

/**
 * Beyond the Latin alphabets a word counts wherever it stands: Chinese,
 * Japanese and Thai have no spaces, and Korean, Arabic and Hebrew fasten
 * particles and articles onto it.
 */
const BEYOND_LATIN = /[^\u0000-\u024f\s]/;

/** Lower case, Latin accents and punctuation gone; every other script's letters and marks kept whole. */
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, " ")
    .trim();

/** Whether `word` stands in `text` (both folded): as a word or a long word's start, or anywhere beyond the Latin alphabets. */
function has(text: string, word: string): boolean {
  const w = fold(word);
  if (!w) return false;
  if (BEYOND_LATIN.test(w)) return text.includes(w);
  return ` ${text} `.includes(` ${w} `) || (w.length >= 6 && text.split(" ").some((t) => t.startsWith(w)));
}

/** How close `text` is to each question, best first; only those that score. */
export function closest(text: string, lang: Lang): { id: string; score: number }[] {
  const folded = fold(text);
  if (!folded) return [];
  const words = new Set(folded.split(" ").filter((w) => w.length > 3));
  const scored = CANNED.map((c) => {
    const [strong, weak] = WORDS[c.id] ?? [[], []];
    let score = 0;
    for (const w of strong) if (has(folded, w)) score += 2;
    for (const w of weak) if (has(folded, w)) score += 1;
    // The question itself, as the visitor's language and English put it.
    for (const q of new Set([questionOf(c, lang), c.q.en])) for (const w of fold(q).split(" ")) if (w.length > 3 && words.has(w)) score += 1;
    return { id: c.id, score };
  });
  return scored.filter((s) => s.score >= 2).sort((a, b) => b.score - a.score);
}
