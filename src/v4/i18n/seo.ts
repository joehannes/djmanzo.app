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
import { LANGS, LANG_INFO, type BuiltInLang, type Lang, type PackLang } from "./strings";

export { LANG_INFO, type Lang };

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

/** A packed language is rendered by the server once its words are here; until then, in English. */
export const SEO: Record<BuiltInLang, SeoWords> & Partial<Record<PackLang, SeoWords>> = {
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
  zh: {
    title: "djmanzo——多种风味的 DJ 与卡拉OK 软件",
    description: "djmanzo，多种风味的 DJ 与卡拉OK 软件，支持 Windows、macOS 和 Linux，测试版——从唱片的纹路一路跟到舞池里的人。",
    lead: "多种风味的 DJ 与卡拉OK 软件，支持 Windows、macOS 和 Linux，测试版：实时分轨、会解释推荐理由并能接管混音的助手、内置一整晚的卡拉OK，以及永久免费的 Hobbyist 版。",
    does: "它能做什么",
    beside: "此外",
    links: {
      pricing: ["版本与价格", "同一个下载的七个版本，按你所在的地区定价。"],
      outboard: ["Outboard", "市场：DJ 们为 djmanzo 做的主题、皮肤和视觉效果。里面的一切都免费。"],
      talkback: ["Talkback", "讨论区：技艺、音乐、器材、演出之外的生活，还有 djmanzo。"],
      blog: ["博客", "关于 DJ 和 djmanzo 的文章。"],
      features: ["全部功能", "djmanzo 能做什么，按版本列出，并注明尚未验证的部分。"],
      wishes: ["功能请求", "提出 djmanzo 下一步该做什么，并投票。"],
      account: ["你的账户", "登录、你的许可证，以及把它们带进 djmanzo 的那一行代码。"],
    },
    download: "下载 djmanzo",
    featuresTitle: "全部功能",
    featuresDescription: "djmanzo 能做的一切，按版本列出：已提供的、部分完成的和已计划的，并注明尚未验证的部分。",
    word: { shipped: "已提供", part: "部分完成", planned: "已计划" },
    noEdition: "尚未包含在任何版本中",
    frame: { site: "网站", imprint: "网站信息", terms: "条款", rules: "社区规则", privacy: "隐私" },
  },
  he: {
    title: "djmanzo — תוכנת דיג'יי וקריוקי בכמה טעמים",
    description: "djmanzo, תוכנת דיג'יי וקריוקי בכמה טעמים ל־Windows,‏ macOS ו־Linux, בבטא — מהחריץ של התקליט ועד האנשים על הרחבה.",
    lead: "תוכנת דיג'יי וקריוקי בכמה טעמים, ל־Windows,‏ macOS ו־Linux ובבטא: סטמים חיים, עוזרת שמסבירה את ההצעות שלה ויכולה לקחת את המיקס, ערב קריוקי מובנה, ומהדורת Hobbyist חינמית, לתמיד.",
    does: "מה היא עושה",
    beside: "ולצידה",
    links: {
      pricing: ["מהדורות ומחירים", "שבע מהדורות של הורדה אחת, בתמחור לפי המקום שבו אתם נמצאים."],
      outboard: ["Outboard", "המרקטפלייס: ערכות נושא, סקינים וויז'ואלס שדיג'ייז יצרו ל־djmanzo. הכול בו בחינם."],
      talkback: ["Talkback", "מקום הדיון: המלאכה, המוזיקה, הציוד, החיים סביב ההופעות, ו־djmanzo."],
      blog: ["הבלוג", "כתבות על תקלוט ועל djmanzo."],
      features: ["כל התכונות", "מה djmanzo עושה, מהדורה אחרי מהדורה, עם מה שעוד לא הוכח."],
      wishes: ["בקשות לתכונות", "בקשו מה djmanzo צריכה לעשות בהמשך, והצביעו."],
      account: ["החשבון שלך", "כניסה, הרישיונות שלך, והשורה שמביאה אותם אל djmanzo."],
    },
    download: "הורדת djmanzo",
    featuresTitle: "כל התכונות",
    featuresDescription: "כל מה ש־djmanzo עושה, מהדורה אחרי מהדורה: מה זמין, מה בנוי בחלקו ומה מתוכנן, עם מה שעוד לא הוכח.",
    word: { shipped: "זמין", part: "בנוי בחלקו", planned: "מתוכנן" },
    noEdition: "עוד לא בשום מהדורה",
    frame: { site: "האתר", imprint: "פרטי האתר", terms: "תנאים", rules: "כללי הקהילה", privacy: "פרטיות" },
  },
  ar: {
    title: "djmanzo — برنامج دي جي وكاريوكي بنكهات متعددة",
    description: "djmanzo، برنامج دي جي وكاريوكي بنكهات متعددة لـ Windows وmacOS وLinux، تجريبي — من أخدود الأسطوانة إلى الأجساد على الحلبة.",
    lead: "برنامج دي جي وكاريوكي بنكهات متعددة، لـ Windows وmacOS وLinux وتجريبي: مسارات منفصلة حية، ومساعد يشرح اقتراحاته ويستطيع تولي المزج، وليلة كاريوكي مدمجة، ونسخة Hobbyist مجانية إلى الأبد.",
    does: "ماذا يفعل",
    beside: "وإلى جانبه",
    links: {
      pricing: ["النسخ والأسعار", "سبع نسخ من تنزيل واحد، بأسعار تناسب مكانكم."],
      outboard: ["Outboard", "السوق: سمات وأغلفة ومرئيات يصنعها الدي جي لـ djmanzo. كل ما فيه مجاني."],
      talkback: ["Talkback", "مساحة النقاش: الحرفة، الموسيقى، المعدات، الحياة حول الحفلات، وdjmanzo."],
      blog: ["المدونة", "مقالات عن الدي جي وdjmanzo."],
      features: ["كل الميزات", "ما يفعله djmanzo، نسخة بنسخة، مع ما لم يُثبت بعد."],
      wishes: ["طلبات الميزات", "اطلبوا ما يجب أن يفعله djmanzo تاليًا، وصوّتوا."],
      account: ["حسابكم", "تسجيل الدخول، وتراخيصكم، والسطر الذي يحملها إلى djmanzo."],
    },
    download: "نزّلوا djmanzo",
    featuresTitle: "كل الميزات",
    featuresDescription: "كل ما يفعله djmanzo، نسخة بنسخة: ما هو متوفر، وما هو مبني جزئيًا، وما هو مخطط له، مع ما لم يُثبت بعد.",
    word: { shipped: "متوفر", part: "مبني جزئيًا", planned: "مخطط له" },
    noEdition: "ليس في أي نسخة بعد",
    frame: { site: "الموقع", imprint: "بيانات الموقع", terms: "الشروط", rules: "قواعد المجتمع", privacy: "الخصوصية" },
  },
  hi: {
    title: "djmanzo — अलग-अलग फ़्लेवर में डीजे और कराओके सॉफ़्टवेयर",
    description: "djmanzo, Windows, macOS और Linux के लिए अलग-अलग फ़्लेवर में डीजे और कराओके सॉफ़्टवेयर, बीटा में — रिकॉर्ड की नाली से फ़्लोर पर थिरकते लोगों तक।",
    lead: "अलग-अलग फ़्लेवर में डीजे और कराओके सॉफ़्टवेयर, Windows, macOS और Linux के लिए, बीटा में: लाइव स्टेम्स, एक असिस्टेंट जो अपने सुझावों की वजह बताता है और मिक्स संभाल सकता है, अंदर बनी कराओके रात, और हमेशा के लिए मुफ़्त Hobbyist एडिशन।",
    does: "यह क्या करता है",
    beside: "इसके साथ",
    links: {
      pricing: ["एडिशन और क़ीमतें", "एक ही डाउनलोड के सात एडिशन, आप जहाँ हैं उसके हिसाब से क़ीमत।"],
      outboard: ["Outboard", "मार्केटप्लेस: djmanzo के लिए डीजे की बनाई थीम, स्किन और विज़ुअल्स। इसमें सब कुछ मुफ़्त है।"],
      talkback: ["Talkback", "चर्चा की जगह: हुनर, संगीत, गियर, गिग के आसपास की ज़िंदगी, और djmanzo।"],
      blog: ["ब्लॉग", "डीजेइंग और djmanzo पर लेख।"],
      features: ["सारे फ़ीचर", "djmanzo क्या करता है, एडिशन दर एडिशन, और जो अभी साबित नहीं हुआ।"],
      wishes: ["फ़ीचर की माँग", "बताएँ कि djmanzo आगे क्या करे, और वोट करें।"],
      account: ["आपका अकाउंट", "साइन इन, आपके लाइसेंस, और वह लाइन जो उन्हें djmanzo तक ले जाती है।"],
    },
    download: "djmanzo डाउनलोड करें",
    featuresTitle: "सारे फ़ीचर",
    featuresDescription: "djmanzo जो कुछ करता है, एडिशन दर एडिशन: क्या उपलब्ध है, क्या आंशिक रूप से बना है और क्या योजना में है, और जो अभी साबित नहीं हुआ।",
    word: { shipped: "उपलब्ध", part: "आंशिक रूप से बना", planned: "योजना में" },
    noEdition: "अभी किसी एडिशन में नहीं",
    frame: { site: "साइट", imprint: "साइट की जानकारी", terms: "शर्तें", rules: "कम्युनिटी के नियम", privacy: "प्राइवेसी" },
  },
};

const FACT_WORDS: Partial<Record<Exclude<Lang, "en">, FactWords>> = { es, pt, de, fr, it, ja };

/** The languages the server renders its pages in: those with words here. */
export const SEO_LANGS: Lang[] = LANGS.filter((l) => SEO[l]);

export const isLang = (s: string | null | undefined): s is Lang => !!s && (SEO_LANGS as string[]).includes(s);

/** The words for `lang`, English where it has none yet. */
export const seoOf = (lang: Lang): SeoWords => SEO[lang] ?? SEO.en;

/** The features, their areas and the status line in `lang`; English where a language lacks a word. */
export function factsIn(lang: Lang): { status: string; areas: typeof AREAS; facts: Fact[] } {
  const w = lang === "en" ? undefined : FACT_WORDS[lang];
  if (!w) return { status: STATUS_LINE, areas: AREAS, facts: FACTS };
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
