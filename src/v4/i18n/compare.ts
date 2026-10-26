/**
 * The comparison page (`pages/Compare.svelte`, the island's arena until
 * 25 October): djmanzo beside the software DJs already use, said fairly,
 * in every language the site speaks. Product names stay as they are. A
 * phrase marked "html" carries its own markup; `{pricing}` and `{wishes}`
 * are the site's addresses.
 */

import { carried, type Lang } from "./strings";

export const RIVALS = ["VirtualDJ", "Serato DJ Pro", "rekordbox", "Traktor Pro 4", "djay Pro", "Mixxx", "KaraFun"] as const;
export type Rival = (typeof RIVALS)[number];
export const ROWS = ["linux", "windows", "karaoke", "streaming", "gigs"] as const;
export type Row = (typeof ROWS)[number];

export interface CompareWords {
  eyebrow: string;
  /** html */
  title: string;
  lead: string;
  rows: Record<Row, string>;
  beta: string;
  notYet: string;
  /** html */
  checked: string;
  vs: string;
  stronger: string;
  different: string;
  /** What each does better, and where djmanzo is different. */
  rivals: Record<Rival, [string, string]>;
  notReady: string;
  /** html, each */
  gaps: string[];
  /** html */
  closing: string;
}

export const COMPARE: Record<Lang, CompareWords> = carried({
  en: {
    eyebrow: "Compared",
    title: "djmanzo beside<br />the others.",
    lead: "The other DJ software is good — most of it has years of real nights behind it. Here is where djmanzo stands, honestly, including what the others do better.",
    rows: { linux: "Runs on Linux", windows: "Runs on Windows", karaoke: "Karaoke rotation built in", streaming: "Plays from streaming services", gigs: "Years of real gigs behind it" },
    beta: "beta",
    notYet: "not yet",
    checked: 'Checked October 2026 from each product\'s public pages. If something here has changed, tell us on <a href="{wishes}">the requests page</a> and we\'ll fix it.',
    vs: "djmanzo vs {name}",
    stronger: "Where {name} is stronger:",
    different: "Where djmanzo is different:",
    rivals: {
      VirtualDJ: [
        "Decades of real gigs, controllers that work out of the box, video mixing, and streaming catalogues.",
        "djmanzo runs on Linux too, treats Caribbean music as first-class, and its assistant speaks only in actions you could have pressed — it can run the mix, and gives way the moment a hand touches a control. VirtualDJ is the closest in scope — karaoke included — and the one djmanzo set out to match.",
      ],
      "Serato DJ Pro": [
        "The standard in hip-hop and open-format booths, with famously solid control-vinyl (DVS) and a big hardware ecosystem.",
        "djmanzo has karaoke built in, runs on Linux, and reads timecode vinyl too (beta). If your club has Serato, Serato is the safe bet tonight.",
      ],
      rekordbox: ["Preparing USB sticks for Pioneer CDJs — the club standard. djmanzo cannot export to CDJs.", "djmanzo is for playing from the laptop: its own library, assistant and karaoke. It imports your rekordbox collection with cues and grids."],
      "Traktor Pro 4": ["Deep effects, remix decks, a long history with Native Instruments hardware, and a one-time price.", "djmanzo's assistant, karaoke and Linux support; it imports Traktor collections."],
      "djay Pro": ["Phones and tablets, a polished interface, and streaming services to play from.", "djmanzo is for the computer only (Windows, macOS and Linux) and plays files you own; in exchange, karaoke, a set-planning assistant and set replay."],
      Mixxx: ["Free, open source, mature on Linux, with a large community library of controller mappings.", "djmanzo is built clean-room with permissive licences — which is why it cannot use Mixxx's (GPL) mappings and has fewer mappings today."],
      KaraFun: [
        "A licensed catalogue of karaoke songs with lyrics, ready to sing. djmanzo comes with no songs.",
        "djmanzo makes karaoke out of records you own: stems take the singer out, speech recognition times the words, and the DJ and karaoke halves share one booth.",
      ],
    },
    notReady: "Where djmanzo is not ready",
    gaps: [
      "It is <b>beta</b>: tested piece by piece, and on Windows by its owner, but never yet through a real gig on real hardware.",
      "<b>No phones or tablets</b>: djmanzo is for a computer.",
      "<b>No streaming services</b> to play from — the slots exist; the partnerships don't.",
      "<b>Pro DJ Link and StagelinQ</b> (joining a booth of club players) are on the roadmap, not in the app.",
      "<b>Fewer controller mappings</b> than the established applications; the mapping editor learns a controller when you press its buttons.",
    ],
    closing: 'If any of those is a deal-breaker tonight, the others are the better choice tonight. If you want an assistant that learns how you play, karaoke in the same booth, Linux, and a price that is half the usual — <a href="{pricing}">see the editions and prices</a>.',
  },
  es: {
    eyebrow: "Comparado",
    title: "djmanzo junto<br />a los demás.",
    lead: "El resto del software de DJ es bueno: casi todo lleva años de noches reales encima. Aquí está dónde se sitúa djmanzo, con honestidad, incluido lo que los demás hacen mejor.",
    rows: { linux: "Funciona en Linux", windows: "Funciona en Windows", karaoke: "Rotación de karaoke incorporada", streaming: "Pincha desde servicios de streaming", gigs: "Años de bolos reales detrás" },
    beta: "beta",
    notYet: "aún no",
    checked: 'Comprobado en octubre de 2026 en las páginas públicas de cada producto. Si algo ha cambiado, dínoslo en <a href="{wishes}">la página de peticiones</a> y lo corregimos.',
    vs: "djmanzo frente a {name}",
    stronger: "Donde {name} es más fuerte:",
    different: "Donde djmanzo es distinto:",
    rivals: {
      VirtualDJ: [
        "Décadas de bolos reales, controladores que funcionan nada más conectarlos, mezcla de vídeo y catálogos de streaming.",
        "djmanzo también funciona en Linux, trata la música caribeña como de primera, y su asistente solo habla en acciones que tú podrías haber pulsado: puede llevar la mezcla y se aparta en cuanto una mano toca un control. VirtualDJ es el más cercano en alcance —karaoke incluido— y el que djmanzo se propuso igualar.",
      ],
      "Serato DJ Pro": [
        "El estándar en las cabinas de hip-hop y open format, con un vinilo de control (DVS) famoso por su solidez y un gran ecosistema de hardware.",
        "djmanzo trae karaoke, funciona en Linux y también lee vinilo de timecode (beta). Si tu club tiene Serato, Serato es la apuesta segura esta noche.",
      ],
      rekordbox: ["Preparar memorias USB para los CDJ de Pioneer, el estándar de los clubs. djmanzo no exporta a CDJ.", "djmanzo es para pinchar desde el portátil: su propia biblioteca, asistente y karaoke. Importa tu colección de rekordbox con cues y grids."],
      "Traktor Pro 4": ["Efectos profundos, remix decks, una larga historia con el hardware de Native Instruments y un precio de pago único.", "El asistente de djmanzo, el karaoke y Linux; importa colecciones de Traktor."],
      "djay Pro": ["Móviles y tabletas, una interfaz pulida y servicios de streaming desde los que pinchar.", "djmanzo es solo para ordenador (Windows, macOS y Linux) y reproduce archivos que son tuyos; a cambio, karaoke, un asistente que planifica el set y la repetición del set."],
      Mixxx: ["Gratuito, de código abierto, maduro en Linux y con una gran biblioteca comunitaria de mapeos de controladores.", "djmanzo está hecho desde cero con licencias permisivas, y por eso no puede usar los mapeos de Mixxx (GPL) y hoy tiene menos."],
      KaraFun: [
        "Un catálogo con licencia de canciones de karaoke con letra, listas para cantar. djmanzo no trae canciones.",
        "djmanzo hace karaoke con los discos que ya tienes: los stems quitan la voz, el reconocimiento de voz sincroniza la letra, y las mitades de DJ y karaoke comparten una cabina.",
      ],
    },
    notReady: "Donde djmanzo aún no está listo",
    gaps: [
      "Está en <b>beta</b>: probado pieza a pieza, y en Windows por su dueño, pero aún no ha pasado por un bolo real con hardware real.",
      "<b>Ni móviles ni tabletas</b>: djmanzo es para un ordenador.",
      "<b>Sin servicios de streaming</b> desde los que pinchar: los huecos existen; los acuerdos, no.",
      "<b>Pro DJ Link y StagelinQ</b> (unirse a una cabina de reproductores de club) están en la hoja de ruta, no en la aplicación.",
      "<b>Menos mapeos de controladores</b> que las aplicaciones consolidadas; el editor de mapeos aprende un controlador cuando pulsas sus botones.",
    ],
    closing: 'Si algo de eso es decisivo esta noche, los demás son mejor opción esta noche. Si quieres un asistente que aprende cómo pinchas, karaoke en la misma cabina, Linux y un precio que es la mitad de lo habitual: <a href="{pricing}">mira las ediciones y los precios</a>.',
  },
  pt: {
    eyebrow: "Comparado",
    title: "djmanzo ao lado<br />dos outros.",
    lead: "Os outros softwares de DJ são bons — quase todos têm anos de noites de verdade nas costas. Aqui está onde o djmanzo fica, com honestidade, incluindo o que os outros fazem melhor.",
    rows: { linux: "Roda no Linux", windows: "Roda no Windows", karaoke: "Rodada de karaokê embutida", streaming: "Toca de serviços de streaming", gigs: "Anos de festas de verdade" },
    beta: "beta",
    notYet: "ainda não",
    checked: 'Conferido em outubro de 2026 nas páginas públicas de cada produto. Se algo mudou, conte na <a href="{wishes}">página de pedidos</a> que a gente corrige.',
    vs: "djmanzo vs {name}",
    stronger: "Onde o {name} é mais forte:",
    different: "Onde o djmanzo é diferente:",
    rivals: {
      VirtualDJ: [
        "Décadas de festas de verdade, controladores que funcionam ao plugar, mixagem de vídeo e catálogos de streaming.",
        "O djmanzo também roda no Linux, trata a música caribenha como de primeira, e seu assistente só fala em ações que você poderia ter apertado — ele pode conduzir a mixagem e sai da frente no instante em que uma mão toca um controle. O VirtualDJ é o mais próximo em escopo — karaokê incluído — e o que o djmanzo se propôs a igualar.",
      ],
      "Serato DJ Pro": [
        "O padrão nas cabines de hip-hop e open format, com um vinil de controle (DVS) famoso pela solidez e um grande ecossistema de hardware.",
        "O djmanzo tem karaokê embutido, roda no Linux e também lê vinil de timecode (beta). Se o seu clube tem Serato, Serato é a aposta segura hoje à noite.",
      ],
      rekordbox: ["Preparar pendrives para os CDJs da Pioneer — o padrão dos clubes. O djmanzo não exporta para CDJs.", "O djmanzo é para tocar do notebook: biblioteca, assistente e karaokê próprios. Ele importa sua coleção do rekordbox com cues e grids."],
      "Traktor Pro 4": ["Efeitos profundos, remix decks, uma longa história com o hardware da Native Instruments e um preço único.", "O assistente do djmanzo, o karaokê e o Linux; ele importa coleções do Traktor."],
      "djay Pro": ["Celulares e tablets, uma interface caprichada e serviços de streaming para tocar.", "O djmanzo é só para computador (Windows, macOS e Linux) e toca arquivos que são seus; em troca, karaokê, um assistente que planeja o set e o replay do set."],
      Mixxx: ["Gratuito, de código aberto, maduro no Linux, com uma grande biblioteca comunitária de mapeamentos de controladores.", "O djmanzo é feito do zero com licenças permissivas — por isso não pode usar os mapeamentos do Mixxx (GPL) e hoje tem menos."],
      KaraFun: [
        "Um catálogo licenciado de músicas de karaokê com letra, prontas para cantar. O djmanzo não vem com músicas.",
        "O djmanzo faz karaokê com os discos que você já tem: os stems tiram o cantor, o reconhecimento de fala sincroniza a letra, e as metades de DJ e karaokê dividem uma cabine.",
      ],
    },
    notReady: "Onde o djmanzo ainda não está pronto",
    gaps: [
      "Está em <b>beta</b>: testado peça por peça, e no Windows pelo dono, mas ainda não passou por uma festa de verdade com hardware de verdade.",
      "<b>Nada de celulares ou tablets</b>: o djmanzo é para um computador.",
      "<b>Sem serviços de streaming</b> para tocar — os espaços existem; as parcerias, não.",
      "<b>Pro DJ Link e StagelinQ</b> (entrar numa cabine de players de clube) estão no roadmap, não no aplicativo.",
      "<b>Menos mapeamentos de controladores</b> que os aplicativos consagrados; o editor de mapeamentos aprende um controlador quando você aperta os botões dele.",
    ],
    closing: 'Se algum desses é decisivo hoje à noite, os outros são a melhor escolha hoje à noite. Se você quer um assistente que aprende como você toca, karaokê na mesma cabine, Linux e um preço que é a metade do normal — <a href="{pricing}">veja as edições e os preços</a>.',
  },
  de: {
    eyebrow: "Im Vergleich",
    title: "djmanzo neben<br />den anderen.",
    lead: "Die andere DJ-Software ist gut — das meiste hat Jahre echter Nächte hinter sich. Hier steht djmanzo, ehrlich gesagt, einschließlich dessen, was die anderen besser können.",
    rows: { linux: "Läuft unter Linux", windows: "Läuft unter Windows", karaoke: "Karaoke-Reihenfolge eingebaut", streaming: "Spielt von Streaming-Diensten", gigs: "Jahre echter Gigs hinter sich" },
    beta: "Beta",
    notYet: "noch nicht",
    checked: 'Im Oktober 2026 auf den öffentlichen Seiten jedes Produkts geprüft. Hat sich etwas geändert, sag es uns auf <a href="{wishes}">der Wunschseite</a>, und wir korrigieren es.',
    vs: "djmanzo und {name}",
    stronger: "Wo {name} stärker ist:",
    different: "Wo djmanzo anders ist:",
    rivals: {
      VirtualDJ: [
        "Jahrzehnte echter Gigs, Controller, die sofort funktionieren, Video-Mixing und Streaming-Kataloge.",
        "djmanzo läuft auch unter Linux, behandelt karibische Musik als erstklassig, und sein Assistent spricht nur in Aktionen, die du selbst hättest drücken können — er kann den Mix fahren und weicht, sobald eine Hand einen Regler berührt. VirtualDJ ist im Umfang am nächsten dran — Karaoke inklusive — und das, woran sich djmanzo messen wollte.",
      ],
      "Serato DJ Pro": [
        "Der Standard in Hip-Hop- und Open-Format-Booths, mit berühmt solidem Control-Vinyl (DVS) und einem großen Hardware-Ökosystem.",
        "djmanzo hat Karaoke eingebaut, läuft unter Linux und liest auch Timecode-Vinyl (Beta). Hat dein Club Serato, ist Serato heute Abend die sichere Wahl.",
      ],
      rekordbox: ["USB-Sticks für Pioneer-CDJs vorbereiten — der Club-Standard. djmanzo kann nicht auf CDJs exportieren.", "djmanzo ist zum Spielen vom Laptop: eigene Bibliothek, Assistent und Karaoke. Es importiert deine rekordbox-Sammlung mit Cues und Grids."],
      "Traktor Pro 4": ["Tiefe Effekte, Remix Decks, eine lange Geschichte mit Hardware von Native Instruments und ein Einmalpreis.", "djmanzos Assistent, Karaoke und Linux; es importiert Traktor-Sammlungen."],
      "djay Pro": ["Handys und Tablets, eine polierte Oberfläche und Streaming-Dienste zum Spielen.", "djmanzo ist nur für den Computer (Windows, macOS und Linux) und spielt Dateien, die dir gehören; dafür Karaoke, ein Assistent, der das Set plant, und Set-Replay."],
      Mixxx: ["Kostenlos, Open Source, ausgereift unter Linux, mit einer großen Community-Bibliothek an Controller-Mappings.", "djmanzo ist clean-room mit freizügigen Lizenzen gebaut — deshalb kann es die (GPL-)Mappings von Mixxx nicht nutzen und hat heute weniger Mappings."],
      KaraFun: [
        "Ein lizenzierter Katalog von Karaoke-Songs mit Text, bereit zum Singen. djmanzo bringt keine Songs mit.",
        "djmanzo macht Karaoke aus Platten, die dir gehören: Stems nehmen den Gesang heraus, Spracherkennung timt den Text, und die DJ- und die Karaoke-Hälfte teilen sich eine Booth.",
      ],
    },
    notReady: "Wo djmanzo noch nicht so weit ist",
    gaps: [
      "Es ist <b>Beta</b>: Stück für Stück getestet, unter Windows vom Inhaber, aber noch durch keinen echten Gig auf echter Hardware gegangen.",
      "<b>Keine Handys oder Tablets</b>: djmanzo ist für einen Computer.",
      "<b>Keine Streaming-Dienste</b> zum Spielen — die Plätze dafür gibt es, die Partnerschaften nicht.",
      "<b>Pro DJ Link und StagelinQ</b> (einer Booth aus Club-Playern beitreten) stehen auf der Roadmap, nicht in der Anwendung.",
      "<b>Weniger Controller-Mappings</b> als die etablierten Anwendungen; der Mapping-Editor lernt einen Controller, wenn du seine Tasten drückst.",
    ],
    closing: 'Ist eines davon heute Abend ein Ausschlussgrund, sind die anderen heute Abend die bessere Wahl. Willst du einen Assistenten, der lernt, wie du spielst, Karaoke in derselben Booth, Linux und einen Preis, der die Hälfte des Üblichen ist — <a href="{pricing}">sieh dir die Editionen und Preise an</a>.',
  },
  fr: {
    eyebrow: "Comparé",
    title: "djmanzo à côté<br />des autres.",
    lead: "Les autres logiciels de DJ sont bons — la plupart ont des années de vraies soirées derrière eux. Voici où se situe djmanzo, honnêtement, y compris ce que les autres font mieux.",
    rows: { linux: "Tourne sous Linux", windows: "Tourne sous Windows", karaoke: "Rotation karaoké intégrée", streaming: "Joue depuis des services de streaming", gigs: "Des années de vraies soirées" },
    beta: "bêta",
    notYet: "pas encore",
    checked: 'Vérifié en octobre 2026 sur les pages publiques de chaque produit. Si quelque chose a changé, dites-le-nous sur <a href="{wishes}">la page des demandes</a> et nous corrigerons.',
    vs: "djmanzo face à {name}",
    stronger: "Là où {name} est plus fort :",
    different: "Là où djmanzo est différent :",
    rivals: {
      VirtualDJ: [
        "Des décennies de vraies soirées, des contrôleurs qui marchent dès qu'on les branche, le mix vidéo et des catalogues de streaming.",
        "djmanzo tourne aussi sous Linux, traite la musique caribéenne comme une musique de premier plan, et son assistant ne parle qu'en actions que vous auriez pu faire vous-même — il peut tenir le mix, et s'efface dès qu'une main touche une commande. VirtualDJ est le plus proche par l'étendue — karaoké compris — et celui que djmanzo a voulu égaler.",
      ],
      "Serato DJ Pro": [
        "La référence des cabines hip-hop et open format, avec un vinyle de contrôle (DVS) réputé solide et un vaste écosystème matériel.",
        "djmanzo intègre le karaoké, tourne sous Linux et lit aussi le vinyle timecode (bêta). Si votre club a Serato, Serato est le choix sûr ce soir.",
      ],
      rekordbox: ["Préparer des clés USB pour les CDJ de Pioneer — la référence des clubs. djmanzo ne peut pas exporter vers les CDJ.", "djmanzo sert à jouer depuis l'ordinateur portable : sa bibliothèque, son assistant et son karaoké. Il importe votre collection rekordbox avec cues et grilles."],
      "Traktor Pro 4": ["Des effets profonds, des remix decks, une longue histoire avec le matériel de Native Instruments, et un prix unique.", "L'assistant de djmanzo, le karaoké et Linux ; il importe les collections Traktor."],
      "djay Pro": ["Les téléphones et tablettes, une interface soignée, et des services de streaming où puiser.", "djmanzo est réservé à l'ordinateur (Windows, macOS et Linux) et joue des fichiers qui vous appartiennent ; en échange, le karaoké, un assistant qui prépare le set et la relecture du set."],
      Mixxx: ["Gratuit, open source, mûr sous Linux, avec une grande bibliothèque communautaire de mappings de contrôleurs.", "djmanzo est construit from scratch sous licences permissives — c'est pourquoi il ne peut pas utiliser les mappings de Mixxx (GPL) et en a moins aujourd'hui."],
      KaraFun: [
        "Un catalogue sous licence de chansons de karaoké avec paroles, prêtes à chanter. djmanzo ne fournit aucune chanson.",
        "djmanzo fait du karaoké avec les disques que vous possédez : les stems retirent la voix, la reconnaissance vocale cale les paroles, et les moitiés DJ et karaoké partagent une cabine.",
      ],
    },
    notReady: "Là où djmanzo n'est pas prêt",
    gaps: [
      "Il est en <b>bêta</b> : testé pièce par pièce, et sous Windows par son propriétaire, mais jamais encore passé par une vraie soirée sur du vrai matériel.",
      "<b>Ni téléphones ni tablettes</b> : djmanzo est fait pour un ordinateur.",
      "<b>Pas de services de streaming</b> où puiser — les emplacements existent, les partenariats non.",
      "<b>Pro DJ Link et StagelinQ</b> (rejoindre une cabine de lecteurs de club) sont sur la feuille de route, pas dans l'application.",
      "<b>Moins de mappings de contrôleurs</b> que les applications établies ; l'éditeur de mappings apprend un contrôleur quand vous appuyez sur ses boutons.",
    ],
    closing: 'Si l\'un de ces points est rédhibitoire ce soir, les autres sont le meilleur choix ce soir. Si vous voulez un assistant qui apprend votre façon de jouer, le karaoké dans la même cabine, Linux et un prix moitié moindre que d\'habitude — <a href="{pricing}">voyez les éditions et les prix</a>.',
  },
  it: {
    eyebrow: "A confronto",
    title: "djmanzo accanto<br />agli altri.",
    lead: "Gli altri software per DJ sono buoni: quasi tutti hanno anni di serate vere alle spalle. Ecco dove si colloca djmanzo, onestamente, compreso ciò che gli altri fanno meglio.",
    rows: { linux: "Funziona su Linux", windows: "Funziona su Windows", karaoke: "Rotazione karaoke integrata", streaming: "Suona da servizi di streaming", gigs: "Anni di serate vere alle spalle" },
    beta: "beta",
    notYet: "non ancora",
    checked: 'Verificato a ottobre 2026 sulle pagine pubbliche di ogni prodotto. Se qualcosa è cambiato, diccelo nella <a href="{wishes}">pagina delle richieste</a> e lo correggiamo.',
    vs: "djmanzo e {name}",
    stronger: "Dove {name} è più forte:",
    different: "Dove djmanzo è diverso:",
    rivals: {
      VirtualDJ: [
        "Decenni di serate vere, controller che funzionano appena collegati, mix video e cataloghi in streaming.",
        "djmanzo gira anche su Linux, tratta la musica caraibica come musica di prima classe, e il suo assistente parla solo in azioni che avresti potuto premere tu: può condurre il mix, e si fa da parte appena una mano tocca un controllo. VirtualDJ è il più vicino per ampiezza — karaoke compreso — ed è quello che djmanzo si è proposto di eguagliare.",
      ],
      "Serato DJ Pro": [
        "Lo standard nelle consolle hip-hop e open format, con un vinile di controllo (DVS) noto per la sua solidità e un grande ecosistema hardware.",
        "djmanzo ha il karaoke integrato, gira su Linux e legge anche il vinile timecode (beta). Se il tuo club ha Serato, stasera Serato è la scelta sicura.",
      ],
      rekordbox: ["Preparare chiavette USB per i CDJ Pioneer, lo standard dei club. djmanzo non esporta sui CDJ.", "djmanzo è per suonare dal portatile: la sua libreria, l'assistente e il karaoke. Importa la tua collezione rekordbox con cue e griglie."],
      "Traktor Pro 4": ["Effetti profondi, remix deck, una lunga storia con l'hardware Native Instruments e un prezzo una tantum.", "L'assistente di djmanzo, il karaoke e Linux; importa le collezioni Traktor."],
      "djay Pro": ["Telefoni e tablet, un'interfaccia curata e servizi di streaming da cui suonare.", "djmanzo è solo per computer (Windows, macOS e Linux) e suona file che possiedi; in cambio, karaoke, un assistente che pianifica il set e il replay del set."],
      Mixxx: ["Gratuito, open source, maturo su Linux, con una grande libreria comunitaria di mappature per controller.", "djmanzo è costruito da zero con licenze permissive: per questo non può usare le mappature di Mixxx (GPL) e oggi ne ha meno."],
      KaraFun: [
        "Un catalogo con licenza di canzoni karaoke con testi, pronte da cantare. djmanzo non include canzoni.",
        "djmanzo fa karaoke con i dischi che possiedi: gli stem tolgono la voce, il riconoscimento vocale sincronizza il testo, e la metà DJ e quella karaoke condividono una consolle.",
      ],
    },
    notReady: "Dove djmanzo non è ancora pronto",
    gaps: [
      "È in <b>beta</b>: testato pezzo per pezzo, e su Windows dal proprietario, ma mai ancora passato per una serata vera su hardware vero.",
      "<b>Niente telefoni o tablet</b>: djmanzo è per un computer.",
      "<b>Niente servizi di streaming</b> da cui suonare: gli spazi esistono, gli accordi no.",
      "<b>Pro DJ Link e StagelinQ</b> (unirsi a una consolle di lettori da club) sono nella roadmap, non nell'applicazione.",
      "<b>Meno mappature di controller</b> rispetto alle applicazioni affermate; l'editor delle mappature impara un controller quando ne premi i tasti.",
    ],
    closing: 'Se una di queste cose è decisiva stasera, stasera gli altri sono la scelta migliore. Se vuoi un assistente che impara come suoni, il karaoke nella stessa consolle, Linux e un prezzo che è la metà del solito — <a href="{pricing}">guarda le edizioni e i prezzi</a>.',
  },
  ja: {
    eyebrow: "比較",
    title: "ほかのソフトと<br />並べた djmanzo。",
    lead: "ほかの DJ ソフトはどれも良いものです。ほとんどが本番の夜を何年も重ねてきました。ここでは djmanzo の立ち位置を、ほかのソフトのほうが優れている点も含めて、正直に書きます。",
    rows: { linux: "Linux で動く", windows: "Windows で動く", karaoke: "カラオケの順番管理を内蔵", streaming: "ストリーミングサービスから再生", gigs: "本番のギグの実績が長い" },
    beta: "ベータ版",
    notYet: "まだ",
    checked: '2026 年 10 月に各製品の公開ページで確認しました。変わっている点があれば<a href="{wishes}">リクエストのページ</a>で教えてください。直します。',
    vs: "djmanzo と {name}",
    stronger: "{name} のほうが強いところ：",
    different: "djmanzo が違うところ：",
    rivals: {
      VirtualDJ: [
        "数十年分の本番のギグ、つなぐだけで動くコントローラー、ビデオミックス、ストリーミングのカタログ。",
        "djmanzo は Linux でも動き、カリブの音楽を一級の音楽として扱います。アシスタントはあなた自身が押せた操作だけで話し、ミックスを任せることもでき、手がコントロールに触れた瞬間に退きます。範囲がいちばん近いのは VirtualDJ で（カラオケも含めて）、djmanzo が肩を並べようとしてきた相手です。",
      ],
      "Serato DJ Pro": [
        "ヒップホップとオープンフォーマットのブースの標準。コントロールヴァイナル（DVS）の安定性で知られ、ハードウェアの層も厚い。",
        "djmanzo はカラオケを内蔵し、Linux で動き、タイムコードヴァイナルも読めます（ベータ版）。クラブに Serato があるなら、今夜は Serato が安全です。",
      ],
      rekordbox: ["Pioneer の CDJ 用に USB メモリーを準備すること（クラブの標準）。djmanzo は CDJ に書き出せません。", "djmanzo はノート PC から DJ をするためのもので、独自のライブラリ、アシスタント、カラオケがあります。rekordbox のコレクションをキューとグリッドごと読み込めます。"],
      "Traktor Pro 4": ["奥深いエフェクト、リミックスデッキ、Native Instruments のハードウェアとの長い歴史、買い切りの価格。", "djmanzo のアシスタント、カラオケ、Linux 対応。Traktor のコレクションを読み込めます。"],
      "djay Pro": ["スマートフォンとタブレット、洗練されたインターフェース、再生できるストリーミングサービス。", "djmanzo はコンピューター専用（Windows、macOS、Linux）で、あなたが持っているファイルを再生します。その代わりに、カラオケ、セットを計画するアシスタント、セットのリプレイがあります。"],
      Mixxx: ["無料のオープンソースで、Linux で成熟しており、コミュニティによるコントローラーマッピングの大きなライブラリがあります。", "djmanzo は寛容なライセンスでクリーンルーム開発されています。そのため Mixxx（GPL）のマッピングは使えず、今はマッピングが少なめです。"],
      KaraFun: [
        "歌詞付きのカラオケ曲を揃えたライセンス済みのカタログ。すぐに歌えます。djmanzo には曲が付いていません。",
        "djmanzo はあなたが持っているレコードからカラオケを作ります。ステムで歌声を抜き、音声認識で歌詞のタイミングを合わせ、DJ とカラオケのふたつがひとつのブースを共有します。",
      ],
    },
    notReady: "djmanzo がまだ追いついていないところ",
    gaps: [
      "<b>ベータ版</b>です。部分ごとにテストし、Windows ではオーナーが動かしていますが、本物の機材での本番のギグはまだ経験していません。",
      "<b>スマートフォンやタブレットには非対応</b>：djmanzo はコンピューター用です。",
      "<b>ストリーミングサービスからの再生は不可</b>：枠はありますが、提携はまだです。",
      "<b>Pro DJ Link と StagelinQ</b>（クラブのプレーヤーが並ぶブースへの参加）はロードマップにあり、アプリにはまだありません。",
      "定番のアプリに比べて<b>コントローラーマッピングが少ない</b>。マッピングエディターは、コントローラーのボタンを押すとそれを覚えます。",
    ],
    closing: 'このどれかが今夜どうしても譲れないなら、今夜はほかのソフトのほうが良い選択です。あなたのプレイを覚えるアシスタント、同じブースでのカラオケ、Linux、そしていつもの半分の価格が欲しいなら — <a href="{pricing}">エディションと価格を見る</a>。',
  },
});
