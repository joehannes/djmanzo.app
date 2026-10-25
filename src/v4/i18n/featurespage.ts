/**
 * The Features page's own words — its heading, search, filters and labels —
 * in every language the site speaks. The features themselves are
 * `facts/<lang>.ts`; the status words are the home page's (`home.ts`).
 */

import type { Lang } from "./strings";

export interface FeaturesPageWords {
  eyebrow: string;
  /** html */
  title: string;
  lead: string;
  search: string;
  searchAria: string;
  statusAria: string;
  all: string;
  edAria: string;
  inEdition: string;
  areasAria: string;
  compare: string;
  nothing: string;
  noEdition: string;
  every: string;
  orCustom: string;
}

export const FEATURES_PAGE: Record<Lang, FeaturesPageWords> = {
  en: {
    eyebrow: "Every feature",
    title: "All of it,<br />and how far it is.",
    lead: "{shipped} features ship, {part} are part-built and {planned} are planned — each with what it does, which editions carry it, and what has not yet been proven. djmanzo is in beta: tested in its own repository, against stand-ins where the hardware was missing, and not yet through a real gig.",
    search: "Search: stems, karaoke, MilkDrop, vinyl…",
    searchAria: "Search the features",
    statusAria: "Status",
    all: "All",
    edAria: "In which edition",
    inEdition: "In the edition:",
    areasAria: "Areas",
    compare: "Compare the editions →",
    nothing: "Nothing matches. Try another word, or another edition.",
    noEdition: "In no edition yet.",
    every: "Every edition, the free Hobbyist one included",
    orCustom: "· or Custom",
  },
  es: {
    eyebrow: "Todas las funciones",
    title: "Todo,<br />y cuánto le falta.",
    lead: "{shipped} funciones están disponibles, {part} a medio hacer y {planned} previstas, cada una con lo que hace, qué ediciones la incluyen y qué falta por probar. djmanzo está en beta: probado en su propio repositorio, con sustitutos donde faltaba el hardware, y aún sin pasar por un bolo de verdad.",
    search: "Buscar: stems, karaoke, MilkDrop, vinilo…",
    searchAria: "Buscar en las funciones",
    statusAria: "Estado",
    all: "Todas",
    edAria: "En qué edición",
    inEdition: "En la edición:",
    areasAria: "Áreas",
    compare: "Comparar las ediciones →",
    nothing: "Nada coincide. Prueba otra palabra u otra edición.",
    noEdition: "Aún en ninguna edición.",
    every: "En todas las ediciones, también la Hobbyist gratuita",
    orCustom: "· o Custom",
  },
  pt: {
    eyebrow: "Todos os recursos",
    title: "Tudo,<br />e quanto falta.",
    lead: "{shipped} recursos estão disponíveis, {part} parcialmente prontos e {planned} planejados — cada um com o que faz, quais edições o trazem e o que ainda não foi provado. O djmanzo está em beta: testado no próprio repositório, com substitutos onde faltava o hardware, e ainda sem passar por uma festa de verdade.",
    search: "Buscar: stems, karaokê, MilkDrop, vinil…",
    searchAria: "Buscar nos recursos",
    statusAria: "Status",
    all: "Todos",
    edAria: "Em qual edição",
    inEdition: "Na edição:",
    areasAria: "Áreas",
    compare: "Comparar as edições →",
    nothing: "Nada encontrado. Tente outra palavra ou outra edição.",
    noEdition: "Ainda em nenhuma edição.",
    every: "Em todas as edições, inclusive a Hobbyist gratuita",
    orCustom: "· ou Custom",
  },
  de: {
    eyebrow: "Jede Funktion",
    title: "Alles,<br />und wie weit es ist.",
    lead: "{shipped} Funktionen sind verfügbar, {part} teilweise gebaut und {planned} geplant — jede mit dem, was sie tut, welche Editionen sie haben und was noch nicht bewiesen ist. djmanzo ist in der Beta: im eigenen Repository getestet, gegen Stellvertreter, wo die Hardware fehlte, und noch durch keinen echten Gig gegangen.",
    search: "Suchen: Stems, Karaoke, MilkDrop, Vinyl …",
    searchAria: "Die Funktionen durchsuchen",
    statusAria: "Stand",
    all: "Alle",
    edAria: "In welcher Edition",
    inEdition: "In der Edition:",
    areasAria: "Bereiche",
    compare: "Die Editionen vergleichen →",
    nothing: "Nichts passt. Versuch ein anderes Wort oder eine andere Edition.",
    noEdition: "Noch in keiner Edition.",
    every: "In jeder Edition, auch der kostenlosen Hobbyist",
    orCustom: "· oder Custom",
  },
  fr: {
    eyebrow: "Toutes les fonctions",
    title: "Tout,<br />et où chaque chose en est.",
    lead: "{shipped} fonctions sont disponibles, {part} en partie construites et {planned} prévues — chacune avec ce qu'elle fait, les éditions qui la contiennent et ce qui n'est pas encore prouvé. djmanzo est en bêta : testé dans son propre dépôt, face à des substituts là où le matériel manquait, et pas encore passé par une vraie soirée.",
    search: "Rechercher : stems, karaoké, MilkDrop, vinyle…",
    searchAria: "Rechercher dans les fonctions",
    statusAria: "État",
    all: "Toutes",
    edAria: "Dans quelle édition",
    inEdition: "Dans l'édition :",
    areasAria: "Domaines",
    compare: "Comparer les éditions →",
    nothing: "Rien ne correspond. Essayez un autre mot ou une autre édition.",
    noEdition: "Dans aucune édition pour l'instant.",
    every: "Dans toutes les éditions, la Hobbyist gratuite comprise",
    orCustom: "· ou Custom",
  },
  it: {
    eyebrow: "Ogni funzione",
    title: "Tutto,<br />e a che punto è.",
    lead: "{shipped} funzioni sono disponibili, {part} costruite in parte e {planned} previste — ognuna con ciò che fa, le edizioni che la includono e ciò che non è ancora provato. djmanzo è in beta: testato nel suo repository, con sostituti dove mancava l'hardware, e non ancora passato per una vera serata.",
    search: "Cerca: stem, karaoke, MilkDrop, vinile…",
    searchAria: "Cerca tra le funzioni",
    statusAria: "Stato",
    all: "Tutte",
    edAria: "In quale edizione",
    inEdition: "Nell'edizione:",
    areasAria: "Aree",
    compare: "Confronta le edizioni →",
    nothing: "Nessun risultato. Prova un'altra parola o un'altra edizione.",
    noEdition: "Ancora in nessuna edizione.",
    every: "In ogni edizione, anche la Hobbyist gratuita",
    orCustom: "· o Custom",
  },
  ja: {
    eyebrow: "すべての機能",
    title: "すべてを、<br />どこまでできているかも。",
    lead: "提供中の機能が {shipped}、一部実装が {part}、予定が {planned}。それぞれ、何ができるか、どのエディションに入っているか、まだ実証されていないことを添えています。djmanzo はベータ版です。自身のリポジトリでテスト済み（ハードウェアが無いところは代替で）ですが、まだ本番のギグは経験していません。",
    search: "検索：ステム、カラオケ、MilkDrop、ヴァイナル…",
    searchAria: "機能を検索",
    statusAria: "状態",
    all: "すべて",
    edAria: "エディションで絞り込む",
    inEdition: "エディション：",
    areasAria: "分野",
    compare: "エディションを比較 →",
    nothing: "一致するものがありません。別の言葉か、別のエディションでお試しください。",
    noEdition: "まだどのエディションにもありません。",
    every: "すべてのエディション（無料の Hobbyist を含む）",
    orCustom: "· または Custom",
  },
};
