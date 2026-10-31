/**
 * Words that live in the site's data rather than in its pages: the notes beside
 * the other DJ applications' prices (`shared/catalog.ts`) and the hardware
 * list's descriptive names (`src/v4/hardware.ts`). Product, maker and model
 * names stay as their makers write them; what describes them follows the
 * visitor's language. Keyed by the English, so the data keeps one source.
 * Hebrew and Arabic phrases that open with a Latin word carry a right-to-left
 * mark, as the packs' phrases do.
 */

import type { Lang } from "./strings";

type Table = Record<string, Record<Exclude<Lang, "en">, string>>;

/** The other applications' notes, beside their prices on /pricing. */
export const RIVAL_NOTES: Table = {
  "lifetime; carries karaoke and video": {
    es: "de por vida; incluye karaoke y vídeo",
    pt: "vitalício; inclui karaokê e vídeo",
    de: "lebenslang; mit Karaoke und Video",
    fr: "à vie ; inclut karaoké et vidéo",
    it: "a vita; include karaoke e video",
    ja: "永久ライセンス。カラオケと映像を含む",
    zh: "终身授权；含卡拉OK和视频",
    he: "לכל החיים; כולל קריוקי ווידאו",
    ar: "مدى الحياة؛ يشمل الكاريوكي والفيديو",
    hi: "आजीवन; कराओके और वीडियो शामिल",
    ko: "영구 라이선스, 노래방과 영상 포함",
    id: "seumur hidup; termasuk karaoke dan video",
    vi: "trọn đời; có karaoke và video",
    th: "ตลอดชีพ มีคาราโอเกะและวิดีโอ",
    tr: "ömür boyu; karaoke ve video dahil",
    sw: "maisha yote; ina karaoke na video",
  },
  "one-time only": {
    es: "solo pago único",
    pt: "só pagamento único",
    de: "nur Einmalkauf",
    fr: "achat unique uniquement",
    it: "solo acquisto unico",
    ja: "買い切りのみ",
    zh: "仅一次性购买",
    he: "תשלום חד־פעמי בלבד",
    ar: "شراء لمرة واحدة فقط",
    hi: "सिर्फ़ एक बार की ख़रीद",
    ko: "일회성 구매만",
    id: "hanya sekali beli",
    vi: "chỉ mua một lần",
    th: "ซื้อขาดครั้งเดียวเท่านั้น",
    tr: "yalnızca tek seferlik satın alma",
    sw: "malipo ya mara moja tu",
  },
  "Core about $10, Professional about $30; subscription only": {
    es: "Core unos 10 $, Professional unos 30 $; solo suscripción",
    pt: "Core cerca de US$ 10, Professional cerca de US$ 30; só assinatura",
    de: "Core etwa 10 $, Professional etwa 30 $; nur im Abo",
    fr: "Core environ 10 $, Professional environ 30 $ ; abonnement uniquement",
    it: "Core circa 10 $, Professional circa 30 $; solo abbonamento",
    ja: "Core は約10ドル、Professional は約30ドル。サブスクリプションのみ",
    zh: "Core 约 10 美元，Professional 约 30 美元；仅订阅",
    he: "‏Core בערך 10$, Professional בערך 30$; במנוי בלבד",
    ar: "‏Core نحو 10 دولارات، وProfessional نحو 30 دولارًا؛ اشتراك فقط",
    hi: "Core लगभग $10, Professional लगभग $30; सिर्फ़ सब्सक्रिप्शन",
    ko: "Core 약 10달러, Professional 약 30달러, 구독만",
    id: "Core sekitar $10, Professional sekitar $30; hanya langganan",
    vi: "Core khoảng 10 USD, Professional khoảng 30 USD; chỉ theo thuê bao",
    th: "Core ประมาณ 10 ดอลลาร์ Professional ประมาณ 30 ดอลลาร์ แบบสมัครสมาชิกเท่านั้น",
    tr: "Core yaklaşık 10 $, Professional yaklaşık 30 $; yalnızca abonelik",
    sw: "Core takriban $10, Professional takriban $30; usajili tu",
  },
  "carries its AI automix": {
    es: "incluye su automix con IA",
    pt: "inclui seu automix com IA",
    de: "mit eigenem KI-Automix",
    fr: "inclut son automix par IA",
    it: "include il suo automix con IA",
    ja: "独自のAIオートミックスを搭載",
    zh: "自带 AI 自动混音",
    he: "כולל אוטומיקס AI משלו",
    ar: "يأتي بمزجه الآلي بالذكاء الاصطناعي",
    hi: "अपना AI ऑटोमिक्स साथ",
    ko: "자체 AI 오토믹스 탑재",
    id: "dengan automix AI-nya sendiri",
    vi: "có automix AI riêng",
    th: "มีออโต้มิกซ์ AI ของตัวเอง",
    tr: "kendi yapay zeka automix'iyle",
    sw: "ina automix yake ya AI",
  },
  "a karaoke host": {
    es: "para anfitriones de karaoke",
    pt: "para hosts de karaokê",
    de: "für Karaoke-Hosts",
    fr: "pour animateurs karaoké",
    it: "per chi conduce il karaoke",
    ja: "カラオケ司会者向け",
    zh: "面向卡拉OK主持人",
    he: "למנחי קריוקי",
    ar: "لمقدّمي الكاريوكي",
    hi: "कराओके होस्ट के लिए",
    ko: "노래방 진행자용",
    id: "untuk host karaoke",
    vi: "dành cho người dẫn karaoke",
    th: "สำหรับพิธีกรคาราโอเกะ",
    tr: "karaoke sunucuları için",
    sw: "kwa waendeshaji wa karaoke",
  },
  "public venues; carries a song catalogue": {
    es: "locales públicos; incluye un catálogo de canciones",
    pt: "locais públicos; inclui um catálogo de músicas",
    de: "für öffentliche Lokale; mit Songkatalog",
    fr: "lieux publics ; inclut un catalogue de chansons",
    it: "locali pubblici; include un catalogo di canzoni",
    ja: "店舗・公共の場向け。楽曲カタログ付き",
    zh: "面向公共场所；附带歌曲曲库",
    he: "למקומות ציבוריים; כולל קטלוג שירים",
    ar: "للأماكن العامة؛ يشمل كتالوج أغانٍ",
    hi: "सार्वजनिक जगहों के लिए; गानों का कैटलॉग साथ",
    ko: "업소·공공장소용, 곡 카탈로그 포함",
    id: "tempat umum; termasuk katalog lagu",
    vi: "địa điểm công cộng; có kho bài hát",
    th: "สำหรับสถานที่สาธารณะ มีแคตตาล็อกเพลง",
    tr: "halka açık mekanlar; şarkı kataloğu dahil",
    sw: "kumbi za umma; ina katalogi ya nyimbo",
  },
};

/** The hardware list's names that describe rather than name a device. */
export const HARDWARE_NAMES: Table = {
  Any: { es: "Cualquiera", pt: "Qualquer", de: "Beliebig", fr: "Tous", it: "Qualsiasi", ja: "すべて", zh: "任意", he: "כל יצרן", ar: "أي صانع", hi: "कोई भी", ko: "모든 제조사", id: "Apa saja", vi: "Bất kỳ", th: "ทุกยี่ห้อ", tr: "Herhangi", sw: "Yoyote" },
  "generic two-deck mapping": {
    es: "mapeo genérico de dos decks",
    pt: "mapeamento genérico de dois decks",
    de: "allgemeines Zwei-Deck-Mapping",
    fr: "mapping générique deux decks",
    it: "mappatura generica a due deck",
    ja: "汎用2デッキマッピング",
    zh: "通用双碟机映射",
    he: "מיפוי כללי לשני דקים",
    ar: "تعيين عام لمشغّلين",
    hi: "सामान्य दो-डेक मैपिंग",
    ko: "범용 2덱 매핑",
    id: "mapping umum dua deck",
    vi: "mapping chung cho hai deck",
    th: "แมปปิงสองเด็คแบบทั่วไป",
    tr: "genel iki deck eşlemesi",
    sw: "ramani ya jumla ya deck mbili",
  },
  "larger DDJs": { es: "DDJ más grandes", pt: "DDJs maiores", de: "größere DDJs", fr: "DDJ plus grands", it: "DDJ più grandi", ja: "大型のDDJ", zh: "更大的 DDJ 型号", he: "דגמי DDJ גדולים יותר", ar: "أجهزة DDJ الأكبر", hi: "बड़े DDJ", ko: "더 큰 DDJ 모델", id: "DDJ yang lebih besar", vi: "các dòng DDJ lớn hơn", th: "DDJ รุ่นใหญ่", tr: "daha büyük DDJ'ler", sw: "DDJ kubwa zaidi" },
  "Denon and Rane": { es: "Denon y Rane", pt: "Denon e Rane", de: "Denon und Rane", fr: "Denon et Rane", it: "Denon e Rane", ja: "Denon と Rane", zh: "Denon 和 Rane", he: "‏Denon ו־Rane", ar: "‏Denon وRane", hi: "Denon और Rane", ko: "Denon과 Rane", id: "Denon dan Rane", vi: "Denon và Rane", th: "Denon และ Rane", tr: "Denon ve Rane", sw: "Denon na Rane" },
  "Denon DJ and Rane": { es: "Denon DJ y Rane", pt: "Denon DJ e Rane", de: "Denon DJ und Rane", fr: "Denon DJ et Rane", it: "Denon DJ e Rane", ja: "Denon DJ と Rane", zh: "Denon DJ 和 Rane", he: "‏Denon DJ ו־Rane", ar: "‏Denon DJ وRane", hi: "Denon DJ और Rane", ko: "Denon DJ와 Rane", id: "Denon DJ dan Rane", vi: "Denon DJ và Rane", th: "Denon DJ และ Rane", tr: "Denon DJ ve Rane", sw: "Denon DJ na Rane" },
};

/** A data word in the visitor's language: the table's words when it has them, else the data's own. */
export function dataWord(table: Table, en: string | undefined, lang: Lang): string {
  if (!en) return "";
  return lang === "en" ? en : (table[en]?.[lang] ?? en);
}
