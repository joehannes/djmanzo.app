/**
 * What a search engine, a link preview or a reader without script is told
 * about the home page and the features (`worker/seo.ts`), in every language
 * the site speaks: `/?lang=es`, `/features?lang=ja`. The features themselves
 * are the facts' own words (`facts/<lang>.ts`), read whole here, since the
 * Worker renders them all.
 */

import { AREAS, FACTS, STATUS_LINE, type Area, type Fact } from "../../../shared/facts";
import type { FactWords } from "./factwords";
import de from "./facts/de";
import es from "./facts/es";
import fr from "./facts/fr";
import it from "./facts/it";
import ja from "./facts/ja";
import pt from "./facts/pt";
import { LANGS, LANG_INFO, type Lang } from "./strings";

export { LANGS, LANG_INFO, type Lang };

type Link = [string, string];

export interface SeoWords {
  title: string;
  description: string;
  lead: string;
  does: string;
  beside: string;
  links: { pricing: Link; outboard: Link; talkback: Link; blog: Link; features: Link; wishes: Link; account: Link };
  download: string;
  featuresTitle: string;
  featuresDescription: string;
  word: Record<Fact["status"], string>;
  noEdition: string;
  frame: { site: string; imprint: string; terms: string; rules: string; privacy: string };
}

export const SEO: Record<Lang, SeoWords> = {
  en: {
    title: "djmanzo — DJ and karaoke software in different flavours",
    description: "djmanzo, DJ and karaoke software in different flavours for Windows, macOS and Linux, in beta — followed from the groove of a record to the bodies on the floor.",
    lead: "DJ and karaoke software in different flavours, for Windows, macOS and Linux and in beta: live stems, an assistant that explains its suggestions and can take over the mix, a karaoke night built in, and a Hobbyist edition that is free, for ever.",
    does: "What it does",
    beside: "Beside it",
    links: {
      pricing: ["Editions and pricing", "seven editions of one download, priced for where you are."],
      outboard: ["Outboard", "The marketplace: themes, skins and visuals made by DJs, for djmanzo. Everything in it is free."],
      talkback: ["Talkback", "The discussion space: the craft, the music, the gear, the life around the gigs, and djmanzo."],
      blog: ["The blog", "articles about DJing and djmanzo."],
      features: ["Every feature", "what djmanzo does, edition by edition, with what is not yet proven."],
      wishes: ["Feature requests", "ask for what djmanzo should do next, and vote."],
      account: ["Your account", "sign in, your licences, and the line that carries them into djmanzo."],
    },
    download: "Download djmanzo",
    featuresTitle: "Every feature",
    featuresDescription: "Everything djmanzo does, edition by edition: what ships, what is part-built and what is planned, with what has not yet been proven.",
    word: { shipped: "ships", part: "part-built", planned: "planned" },
    noEdition: "in no edition yet",
    frame: { site: "The site", imprint: "Imprint", terms: "Terms", rules: "Community rules", privacy: "Privacy" },
  },
  es: {
    title: "djmanzo — software de DJ y karaoke en distintos sabores",
    description: "djmanzo, software de DJ y karaoke en distintos sabores para Windows, macOS y Linux, en beta, que sigue del groove de un disco a los cuerpos en la pista.",
    lead: "Software de DJ y karaoke en distintos sabores, para Windows, macOS y Linux y en beta: stems en directo, un asistente que explica sus sugerencias y puede encargarse de la mezcla, una noche de karaoke incorporada, y una edición Hobbyist gratuita, para siempre.",
    does: "Lo que hace",
    beside: "Junto a él",
    links: {
      pricing: ["Ediciones y precios", "siete ediciones de una misma descarga, con precios según dónde estés."],
      outboard: ["Outboard", "El mercado: temas, skins y visuales hechos por DJs para djmanzo. Todo es gratis."],
      talkback: ["Talkback", "El espacio de conversación: el oficio, la música, el equipo, la vida alrededor de los bolos, y djmanzo."],
      blog: ["El blog", "artículos sobre pinchar y sobre djmanzo."],
      features: ["Todas las funciones", "lo que hace djmanzo, edición por edición, con lo que aún no está probado."],
      wishes: ["Peticiones de funciones", "pide lo que djmanzo debería hacer después, y vota."],
      account: ["Tu cuenta", "inicia sesión, tus licencias y la línea que las lleva a djmanzo."],
    },
    download: "Descargar djmanzo",
    featuresTitle: "Todas las funciones",
    featuresDescription: "Todo lo que hace djmanzo, edición por edición: lo disponible, lo que está a medio hacer y lo previsto, con lo que aún no está probado.",
    word: { shipped: "disponible", part: "a medio hacer", planned: "previsto" },
    noEdition: "aún en ninguna edición",
    frame: { site: "El sitio", imprint: "Aviso legal", terms: "Condiciones", rules: "Normas de la comunidad", privacy: "Privacidad" },
  },
  pt: {
    title: "djmanzo — software de DJ e karaokê em diferentes sabores",
    description: "djmanzo, software de DJ e karaokê em diferentes sabores para Windows, macOS e Linux, em beta — do groove de um disco aos corpos na pista.",
    lead: "Software de DJ e karaokê em diferentes sabores, para Windows, macOS e Linux e em beta: stems ao vivo, um assistente que explica suas sugestões e pode assumir a mixagem, uma noite de karaokê embutida, e uma edição Hobbyist gratuita, para sempre.",
    does: "O que ele faz",
    beside: "Ao lado",
    links: {
      pricing: ["Edições e preços", "sete edições de um mesmo download, com preços conforme onde você está."],
      outboard: ["Outboard", "O marketplace: temas, skins e visuais feitos por DJs para o djmanzo. Tudo nele é gratuito."],
      talkback: ["Talkback", "O espaço de conversa: o ofício, a música, o equipamento, a vida em volta das festas, e o djmanzo."],
      blog: ["O blog", "artigos sobre discotecagem e sobre o djmanzo."],
      features: ["Todos os recursos", "o que o djmanzo faz, edição por edição, com o que ainda não foi provado."],
      wishes: ["Pedidos de recursos", "peça o que o djmanzo deve fazer a seguir, e vote."],
      account: ["Sua conta", "entre, suas licenças e a linha que as leva para o djmanzo."],
    },
    download: "Baixar o djmanzo",
    featuresTitle: "Todos os recursos",
    featuresDescription: "Tudo o que o djmanzo faz, edição por edição: o que está disponível, o que está parcialmente pronto e o que está planejado, com o que ainda não foi provado.",
    word: { shipped: "disponível", part: "parcialmente pronto", planned: "planejado" },
    noEdition: "ainda em nenhuma edição",
    frame: { site: "O site", imprint: "Expediente", terms: "Termos", rules: "Regras da comunidade", privacy: "Privacidade" },
  },
  de: {
    title: "djmanzo — DJ- und Karaoke-Software in verschiedenen Geschmacksrichtungen",
    description: "djmanzo, DJ- und Karaoke-Software in verschiedenen Geschmacksrichtungen für Windows, macOS und Linux, in der Beta — vom Groove einer Platte bis zu den Körpern auf der Tanzfläche.",
    lead: "DJ- und Karaoke-Software in verschiedenen Geschmacksrichtungen, für Windows, macOS und Linux und in der Beta: Live-Stems, ein Assistent, der seine Vorschläge begründet und den Mix übernehmen kann, ein eingebauter Karaoke-Abend und eine Hobbyist-Edition, die kostenlos ist, für immer.",
    does: "Was es kann",
    beside: "Daneben",
    links: {
      pricing: ["Editionen und Preise", "sieben Editionen eines Downloads, bepreist nach deinem Ort."],
      outboard: ["Outboard", "Der Marktplatz: Themes, Skins und Visuals von DJs für djmanzo. Alles darin ist kostenlos."],
      talkback: ["Talkback", "Der Ort zum Reden: das Handwerk, die Musik, die Technik, das Leben rund um die Gigs, und djmanzo."],
      blog: ["Der Blog", "Artikel über das Auflegen und über djmanzo."],
      features: ["Jede Funktion", "was djmanzo kann, Edition für Edition, mit dem, was noch nicht bewiesen ist."],
      wishes: ["Funktionswünsche", "wünsch dir, was djmanzo als Nächstes können soll, und stimm ab."],
      account: ["Dein Konto", "anmelden, deine Lizenzen und die Zeile, die sie in djmanzo bringt."],
    },
    download: "djmanzo herunterladen",
    featuresTitle: "Jede Funktion",
    featuresDescription: "Alles, was djmanzo kann, Edition für Edition: was verfügbar ist, was teilweise gebaut und was geplant ist, mit dem, was noch nicht bewiesen ist.",
    word: { shipped: "verfügbar", part: "teilweise gebaut", planned: "geplant" },
    noEdition: "noch in keiner Edition",
    frame: { site: "Die Website", imprint: "Impressum", terms: "Nutzungsbedingungen", rules: "Community-Regeln", privacy: "Datenschutz" },
  },
  fr: {
    title: "djmanzo — logiciel de DJ et de karaoké en plusieurs saveurs",
    description: "djmanzo, logiciel de DJ et de karaoké en plusieurs saveurs pour Windows, macOS et Linux, en bêta — du groove d'un disque jusqu'aux corps sur la piste.",
    lead: "Un logiciel de DJ et de karaoké en plusieurs saveurs, pour Windows, macOS et Linux et en bêta : des stems en direct, un assistant qui explique ses suggestions et peut prendre le mix en main, une soirée karaoké intégrée, et une édition Hobbyist gratuite, pour toujours.",
    does: "Ce qu'il fait",
    beside: "À côté",
    links: {
      pricing: ["Éditions et prix", "sept éditions d'un même téléchargement, au prix de là où vous êtes."],
      outboard: ["Outboard", "La marketplace : thèmes, skins et visuels faits par des DJ pour djmanzo. Tout y est gratuit."],
      talkback: ["Talkback", "L'espace de discussion : le métier, la musique, le matériel, la vie autour des soirées, et djmanzo."],
      blog: ["Le blog", "des articles sur le DJing et sur djmanzo."],
      features: ["Toutes les fonctions", "ce que fait djmanzo, édition par édition, avec ce qui n'est pas encore prouvé."],
      wishes: ["Demandes de fonctions", "demandez ce que djmanzo devrait faire ensuite, et votez."],
      account: ["Votre compte", "connectez-vous, vos licences, et la ligne qui les emporte dans djmanzo."],
    },
    download: "Télécharger djmanzo",
    featuresTitle: "Toutes les fonctions",
    featuresDescription: "Tout ce que fait djmanzo, édition par édition : ce qui est disponible, en partie construit ou prévu, avec ce qui n'est pas encore prouvé.",
    word: { shipped: "disponible", part: "en partie construit", planned: "prévu" },
    noEdition: "dans aucune édition pour l'instant",
    frame: { site: "Le site", imprint: "Mentions légales", terms: "Conditions", rules: "Règles de la communauté", privacy: "Confidentialité" },
  },
  it: {
    title: "djmanzo — software per DJ e karaoke in diversi gusti",
    description: "djmanzo, software per DJ e karaoke in diversi gusti per Windows, macOS e Linux, in beta — dal groove di un disco ai corpi sulla pista.",
    lead: "Software per DJ e karaoke in diversi gusti, per Windows, macOS e Linux e in beta: stem dal vivo, un assistente che spiega i suoi suggerimenti e può prendere in mano il mix, una serata karaoke integrata, e un'edizione Hobbyist gratuita, per sempre.",
    does: "Cosa fa",
    beside: "Accanto",
    links: {
      pricing: ["Edizioni e prezzi", "sette edizioni di un unico download, con prezzi secondo dove ti trovi."],
      outboard: ["Outboard", "Il marketplace: temi, skin e visual fatti da DJ per djmanzo. Tutto è gratuito."],
      talkback: ["Talkback", "Lo spazio di discussione: il mestiere, la musica, l'attrezzatura, la vita intorno alle serate, e djmanzo."],
      blog: ["Il blog", "articoli sul fare il DJ e su djmanzo."],
      features: ["Ogni funzione", "cosa fa djmanzo, edizione per edizione, con ciò che non è ancora provato."],
      wishes: ["Richieste di funzioni", "chiedi cosa dovrebbe fare djmanzo dopo, e vota."],
      account: ["Il tuo account", "accedi, le tue licenze e la riga che le porta in djmanzo."],
    },
    download: "Scarica djmanzo",
    featuresTitle: "Ogni funzione",
    featuresDescription: "Tutto ciò che fa djmanzo, edizione per edizione: cosa è disponibile, cosa è costruito in parte e cosa è previsto, con ciò che non è ancora provato.",
    word: { shipped: "disponibile", part: "costruita in parte", planned: "prevista" },
    noEdition: "ancora in nessuna edizione",
    frame: { site: "Il sito", imprint: "Note legali", terms: "Termini", rules: "Regole della community", privacy: "Privacy" },
  },
  ja: {
    title: "djmanzo — いろいろなフレーバーの DJ・カラオケソフト",
    description: "djmanzo、Windows・macOS・Linux 向けの、いろいろなフレーバーの DJ・カラオケソフト（ベータ版）。レコードのグルーヴから、フロアで踊る人まで。",
    lead: "Windows・macOS・Linux 向けの、いろいろなフレーバーの DJ・カラオケソフト（ベータ版）：ライブでのステム分離、提案の理由を説明しミックスを任せられるアシスタント、組み込みのカラオケナイト、そしてずっと無料の Hobbyist エディション。",
    does: "できること",
    beside: "そのほか",
    links: {
      pricing: ["エディションと価格", "ひとつのダウンロードに 7 つのエディション、地域に合わせた価格。"],
      outboard: ["Outboard", "マーケットプレイス：DJ が djmanzo のために作ったテーマ、スキン、ビジュアル。すべて無料です。"],
      talkback: ["Talkback", "語り合う場：技術、音楽、機材、ギグの周りの暮らし、そして djmanzo。"],
      blog: ["ブログ", "DJ と djmanzo についての記事。"],
      features: ["すべての機能", "djmanzo にできることを、エディションごとに。まだ実証されていないことも添えて。"],
      wishes: ["機能リクエスト", "djmanzo に次に欲しいことをリクエストし、投票。"],
      account: ["あなたのアカウント", "サインイン、ライセンス、そしてそれを djmanzo に届ける 1 行。"],
    },
    download: "djmanzo をダウンロード",
    featuresTitle: "すべての機能",
    featuresDescription: "djmanzo にできることすべてを、エディションごとに：提供中、一部実装、予定のもの、そしてまだ実証されていないこと。",
    word: { shipped: "提供中", part: "一部実装", planned: "予定" },
    noEdition: "まだどのエディションにもありません",
    frame: { site: "サイト", imprint: "運営者情報", terms: "利用規約", rules: "コミュニティのルール", privacy: "プライバシー" },
  },
};

const FACT_WORDS: Record<Exclude<Lang, "en">, FactWords> = { es, pt, de, fr, it, ja };

export const isLang = (s: string | null | undefined): s is Lang => !!s && (LANGS as readonly string[]).includes(s);

/** The features, their areas and the status line in `lang`; English where a language lacks a word. */
export function factsIn(lang: Lang): { status: string; areas: typeof AREAS; facts: Fact[] } {
  if (lang === "en") return { status: STATUS_LINE, areas: AREAS, facts: FACTS };
  const w = FACT_WORDS[lang];
  const area = (id: Area) => w.areas[id];
  return {
    status: w.status,
    areas: AREAS.map((a) => ({ ...a, ...(area(a.id) ?? {}) })),
    facts: FACTS.map((f) => {
      const t = w.facts[f.id];
      return t ? { ...f, name: t.name, about: t.about, ...(f.caveat && t.caveat ? { caveat: t.caveat } : {}) } : f;
    }),
  };
}
