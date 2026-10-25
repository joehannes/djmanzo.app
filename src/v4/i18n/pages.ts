/**
 * The frames of the feature requests, the forum and the marketplace pages,
 * in every language the site speaks. What people post there is theirs and
 * stays in the language they wrote it in. A phrase marked "html" carries its
 * own `<br />` or link; `{forum}`, `{wishes}` are the site's addresses.
 */

import type { Lang } from "./strings";

type Status = "shipped" | "building" | "planned" | "considering" | "idea" | "not-planned";

export interface PagesWords {
  wishes: {
    eyebrow: string;
    /** html */
    title: string;
    /** html */
    lead: string;
    status: Record<Status, { label: string; about: string }>;
    listAria: string;
    search: string;
    orderAria: string;
    top: string;
    newest: string;
    statusAria: string;
    all: string;
    reading: string;
    vote: string;
    crew: string;
    none: string;
    askTitle: string;
    askAbout: string;
    what: string;
    whatPlaceholder: string;
    more: string;
    optional: string;
    morePlaceholder: string;
    name: string;
    post: string;
    posted: string;
    public: string;
  };
  community: {
    eyebrow: string;
    /** html */
    title: string;
    lead: string;
    /** html */
    side: string;
  };
  market: {
    eyebrow: string;
    /** html */
    title: string;
    lead: string;
    kinds: Record<"theme" | "skin" | "visuals" | "keys", { name: string; what: string }>;
  };
}

const en: PagesWords = {
  wishes: {
    eyebrow: "Feature requests",
    title: "Tell us what<br />the next gig needs.",
    lead: "Ask for what djmanzo should do, vote for what others asked, and see what became of each — shipped, being built, planned, or not planned and why. Questions about using djmanzo go to <a href=\"{forum}\">the forum</a>.",
    status: {
      shipped: { label: "Shipped", about: "In djmanzo now." },
      building: { label: "Being built", about: "Somebody is on it." },
      planned: { label: "Planned", about: "On the roadmap." },
      considering: { label: "Considering", about: "Weighed, not decided." },
      idea: { label: "Idea", about: "Asked for; not read yet." },
      "not-planned": { label: "Not planned", about: "Not for now, and why." },
    },
    listAria: "Requests",
    search: "Search the requests",
    orderAria: "Order",
    top: "Most wanted",
    newest: "Newest",
    statusAria: "Status",
    all: "All",
    reading: "Reading the board…",
    vote: "Vote for {title}, {votes} votes",
    crew: "The crew:",
    none: "Nothing matches. Ask for it below.",
    askTitle: "Ask for something",
    askAbout: "One thing per request, in a few words: what it would let you do at your gigs. Look through the list first — a vote on an existing request counts for more than a second copy.",
    what: "What should djmanzo do?",
    whatPlaceholder: "A Traktor Kontrol S4 mapping",
    more: "Tell us more",
    optional: "(optional)",
    morePlaceholder: "What would it let you do?",
    name: "Your name",
    post: "Post the request",
    posted: "Posted, with your vote on it. The crew reads every request and stamps it.",
    public: "Requests are public. Keep them about djmanzo; the crew removes anything else.",
  },
  community: {
    eyebrow: "Community",
    title: "Ask the question<br />everyone at the gig was thinking.",
    lead: "The craft, the music, the gear, the life around the gigs, and djmanzo itself. Good, related subjects only — kind words, real help, nobody's music but your own.",
    side: "Want djmanzo to do something it doesn't? <a href=\"{wishes}\">Feature requests</a> are voted on, and the board says what became of each.",
  },
  market: {
    eyebrow: "Marketplace",
    title: "Made by DJs.<br />Free for everyone.",
    lead: "Themes, skins, visuals and keyboard sets for djmanzo, made and shared by the people who play it. Every pack is signed by its maker and checked before it is listed. No payments, no commission — a maker may link their own tip jar.",
    kinds: {
      theme: { name: "Themes", what: "Fourteen colours for a dark room and a light one, every pair you read held to its contrast, worn on one of djmanzo's themes." },
      skin: { name: "Skins", what: "SVG tiles drawn faintly over a theme: still, drifting or breathing with the bass. A tile can only draw." },
      visuals: { name: "Visuals", what: "Looks for the projector, layered from djmanzo's own effects and MilkDrop presets." },
      keys: { name: "Keyboard sets", what: "Mnemonic keys under Space for one way of working: a karaoke night, a style, a wedding. Worn from the Keys panel, under your own keys, adding to djmanzo's and never taking one of them over." },
    },
  },
};

const es: PagesWords = {
  wishes: {
    eyebrow: "Peticiones de funciones",
    title: "Dinos qué necesita<br />el próximo bolo.",
    lead: "Pide lo que djmanzo debería hacer, vota lo que otros pidieron y mira qué fue de cada cosa: disponible, en desarrollo, prevista, o no prevista y por qué. Las dudas de uso van al <a href=\"{forum}\">foro</a>.",
    status: {
      shipped: { label: "Disponible", about: "Ya está en djmanzo." },
      building: { label: "En desarrollo", about: "Alguien está en ello." },
      planned: { label: "Prevista", about: "En la hoja de ruta." },
      considering: { label: "En estudio", about: "Valorada, sin decidir." },
      idea: { label: "Idea", about: "Pedida; aún sin leer." },
      "not-planned": { label: "No prevista", about: "Ahora no, y por qué." },
    },
    listAria: "Peticiones",
    search: "Buscar en las peticiones",
    orderAria: "Orden",
    top: "Más pedidas",
    newest: "Más nuevas",
    statusAria: "Estado",
    all: "Todas",
    reading: "Leyendo el tablón…",
    vote: "Votar por {title}, {votes} votos",
    crew: "El equipo:",
    none: "Nada coincide. Pídelo abajo.",
    askTitle: "Pide algo",
    askAbout: "Una cosa por petición, en pocas palabras: qué te permitiría hacer en tus bolos. Mira antes la lista: un voto en una petición que ya existe cuenta más que una copia.",
    what: "¿Qué debería hacer djmanzo?",
    whatPlaceholder: "Un mapping para Traktor Kontrol S4",
    more: "Cuéntanos más",
    optional: "(opcional)",
    morePlaceholder: "¿Qué te permitiría hacer?",
    name: "Tu nombre",
    post: "Publicar la petición",
    posted: "Publicada, con tu voto. El equipo lee cada petición y la sella.",
    public: "Las peticiones son públicas. Que traten de djmanzo; el equipo quita lo demás.",
  },
  community: {
    eyebrow: "Comunidad",
    title: "Haz la pregunta<br />que todos en el bolo se hacían.",
    lead: "El oficio, la música, el equipo, la vida alrededor de los bolos y el propio djmanzo. Solo temas buenos y relacionados: palabras amables, ayuda de verdad y ninguna música que no sea tuya.",
    side: "¿Quieres que djmanzo haga algo que no hace? Las <a href=\"{wishes}\">peticiones de funciones</a> se votan y el tablón dice qué fue de cada una.",
  },
  market: {
    eyebrow: "Mercado",
    title: "Hecho por DJs.<br />Gratis para todos.",
    lead: "Temas, skins, visuales y juegos de teclas para djmanzo, hechos y compartidos por la gente que lo toca. Cada paquete va firmado por quien lo hizo y se revisa antes de publicarse. Sin pagos ni comisión: quien lo hace puede enlazar su propio bote de propinas.",
    kinds: {
      theme: { name: "Temas", what: "Catorce colores para una sala oscura y una clara, cada par que lees con su contraste garantizado, sobre uno de los temas de djmanzo." },
      skin: { name: "Skins", what: "Mosaicos SVG dibujados suavemente sobre un tema: quietos, a la deriva o respirando con el bajo. Un mosaico solo puede dibujar." },
      visuals: { name: "Visuales", what: "Looks para el proyector, en capas con los efectos propios de djmanzo y presets de MilkDrop." },
      keys: { name: "Juegos de teclas", what: "Teclas mnemotécnicas bajo Space para una forma de trabajar: una noche de karaoke, un estilo, una boda. Se ponen desde el panel Keys, bajo tus propias teclas, sumándose a las de djmanzo sin quitarle ninguna." },
    },
  },
};

const pt: PagesWords = {
  wishes: {
    eyebrow: "Pedidos de recursos",
    title: "Diga o que<br />o próximo show precisa.",
    lead: "Peça o que o djmanzo deve fazer, vote no que outros pediram e veja o que virou cada pedido — disponível, em construção, planejado, ou não planejado e por quê. Dúvidas sobre o uso vão para o <a href=\"{forum}\">fórum</a>.",
    status: {
      shipped: { label: "Disponível", about: "Já está no djmanzo." },
      building: { label: "Em construção", about: "Alguém está trabalhando nisso." },
      planned: { label: "Planejado", about: "No roteiro." },
      considering: { label: "Em análise", about: "Avaliado, sem decisão." },
      idea: { label: "Ideia", about: "Pedido; ainda não lido." },
      "not-planned": { label: "Não planejado", about: "Não por agora, e por quê." },
    },
    listAria: "Pedidos",
    search: "Buscar nos pedidos",
    orderAria: "Ordem",
    top: "Mais pedidos",
    newest: "Mais novos",
    statusAria: "Status",
    all: "Todos",
    reading: "Lendo o quadro…",
    vote: "Votar em {title}, {votes} votos",
    crew: "A equipe:",
    none: "Nada encontrado. Peça logo abaixo.",
    askTitle: "Peça algo",
    askAbout: "Uma coisa por pedido, em poucas palavras: o que isso deixaria você fazer nos seus shows. Veja a lista antes — um voto num pedido que já existe vale mais que uma cópia.",
    what: "O que o djmanzo deveria fazer?",
    whatPlaceholder: "Um mapeamento para o Traktor Kontrol S4",
    more: "Conte mais",
    optional: "(opcional)",
    morePlaceholder: "O que isso deixaria você fazer?",
    name: "Seu nome",
    post: "Publicar o pedido",
    posted: "Publicado, com o seu voto. A equipe lê cada pedido e o carimba.",
    public: "Os pedidos são públicos. Mantenha-os sobre o djmanzo; a equipe remove o resto.",
  },
  community: {
    eyebrow: "Comunidade",
    title: "Faça a pergunta<br />que todo mundo no show estava pensando.",
    lead: "O ofício, a música, o equipamento, a vida em volta dos shows e o próprio djmanzo. Só assuntos bons e relacionados — palavras gentis, ajuda de verdade e nenhuma música que não seja sua.",
    side: "Quer que o djmanzo faça algo que ele não faz? Os <a href=\"{wishes}\">pedidos de recursos</a> são votados, e o quadro diz o que virou cada um.",
  },
  market: {
    eyebrow: "Marketplace",
    title: "Feito por DJs.<br />Grátis para todos.",
    lead: "Temas, skins, visuais e conjuntos de teclas para o djmanzo, feitos e compartilhados por quem toca com ele. Cada pacote é assinado por quem fez e revisado antes de entrar na lista. Sem pagamentos, sem comissão — quem faz pode colocar o link do próprio cofrinho de gorjetas.",
    kinds: {
      theme: { name: "Temas", what: "Catorze cores para uma sala escura e uma clara, cada par que você lê com contraste garantido, usadas sobre um dos temas do djmanzo." },
      skin: { name: "Skins", what: "Blocos SVG desenhados de leve sobre um tema: parados, flutuando ou respirando com o grave. Um bloco só pode desenhar." },
      visuals: { name: "Visuais", what: "Looks para o projetor, em camadas com os efeitos do próprio djmanzo e presets do MilkDrop." },
      keys: { name: "Conjuntos de teclas", what: "Teclas mnemônicas sob o Space para um jeito de trabalhar: uma noite de karaokê, um estilo, um casamento. Usados pelo painel Keys, abaixo das suas próprias teclas, somando às do djmanzo sem tirar nenhuma." },
    },
  },
};

const de: PagesWords = {
  wishes: {
    eyebrow: "Funktionswünsche",
    title: "Sag uns, was<br />der nächste Gig braucht.",
    lead: "Wünsch dir, was djmanzo können soll, stimm für die Wünsche anderer und sieh, was aus jedem wurde — verfügbar, in Arbeit, geplant oder nicht geplant und warum. Fragen zur Benutzung gehören ins <a href=\"{forum}\">Forum</a>.",
    status: {
      shipped: { label: "Verfügbar", about: "Jetzt in djmanzo." },
      building: { label: "In Arbeit", about: "Jemand ist dran." },
      planned: { label: "Geplant", about: "Auf der Roadmap." },
      considering: { label: "In Prüfung", about: "Abgewogen, nicht entschieden." },
      idea: { label: "Idee", about: "Gewünscht; noch nicht gelesen." },
      "not-planned": { label: "Nicht geplant", about: "Vorerst nicht, und warum." },
    },
    listAria: "Wünsche",
    search: "Die Wünsche durchsuchen",
    orderAria: "Reihenfolge",
    top: "Meistgewünscht",
    newest: "Neueste",
    statusAria: "Stand",
    all: "Alle",
    reading: "Das Board wird gelesen …",
    vote: "Für {title} stimmen, {votes} Stimmen",
    crew: "Die Crew:",
    none: "Nichts passt. Wünsch es dir unten.",
    askTitle: "Wünsch dir etwas",
    askAbout: "Eine Sache pro Wunsch, in wenigen Worten: was sie dir bei deinen Gigs ermöglichen würde. Schau erst die Liste durch — eine Stimme für einen bestehenden Wunsch zählt mehr als eine zweite Kopie.",
    what: "Was soll djmanzo können?",
    whatPlaceholder: "Ein Mapping für das Traktor Kontrol S4",
    more: "Erzähl mehr",
    optional: "(optional)",
    morePlaceholder: "Was würde es dir ermöglichen?",
    name: "Dein Name",
    post: "Wunsch abschicken",
    posted: "Abgeschickt, mit deiner Stimme dabei. Die Crew liest jeden Wunsch und versieht ihn mit einem Stempel.",
    public: "Wünsche sind öffentlich. Bleib bei djmanzo; alles andere entfernt die Crew.",
  },
  community: {
    eyebrow: "Community",
    title: "Stell die Frage,<br />die sich beim Gig alle gestellt haben.",
    lead: "Das Handwerk, die Musik, das Equipment, das Leben rund um die Gigs und djmanzo selbst. Nur gute, passende Themen — freundliche Worte, echte Hilfe, keine Musik außer deiner eigenen.",
    side: "Soll djmanzo etwas können, das es nicht kann? Über <a href=\"{wishes}\">Funktionswünsche</a> wird abgestimmt, und das Board zeigt, was aus jedem wurde.",
  },
  market: {
    eyebrow: "Marktplatz",
    title: "Von DJs gemacht.<br />Kostenlos für alle.",
    lead: "Themes, Skins, Visuals und Tastatur-Sets für djmanzo, gemacht und geteilt von den Leuten, die damit spielen. Jedes Pack ist von seinem Macher signiert und wird vor dem Listen geprüft. Keine Zahlungen, keine Provision — wer etwas macht, darf die eigene Trinkgeldkasse verlinken.",
    kinds: {
      theme: { name: "Themes", what: "Vierzehn Farben für einen dunklen und einen hellen Raum, jedes Paar, das du liest, auf seinem Kontrast gehalten, getragen auf einem von djmanzos Themes." },
      skin: { name: "Skins", what: "SVG-Kacheln, zart über ein Theme gezeichnet: still, treibend oder mit dem Bass atmend. Eine Kachel kann nur zeichnen." },
      visuals: { name: "Visuals", what: "Looks für den Beamer, geschichtet aus djmanzos eigenen Effekten und MilkDrop-Presets." },
      keys: { name: "Tastatur-Sets", what: "Merktasten unter Space für eine Arbeitsweise: ein Karaoke-Abend, ein Stil, eine Hochzeit. Getragen über das Keys-Panel, unter deinen eigenen Tasten, als Ergänzung zu djmanzos, ohne je eine davon zu übernehmen." },
    },
  },
};

const fr: PagesWords = {
  wishes: {
    eyebrow: "Demandes de fonctionnalités",
    title: "Dites-nous ce dont<br />la prochaine soirée a besoin.",
    lead: "Demandez ce que djmanzo devrait faire, votez pour ce que d'autres ont demandé, et voyez ce qu'il est advenu de chaque demande — disponible, en construction, prévue, ou non prévue et pourquoi. Les questions d'utilisation vont sur le <a href=\"{forum}\">forum</a>.",
    status: {
      shipped: { label: "Disponible", about: "Dans djmanzo maintenant." },
      building: { label: "En construction", about: "Quelqu'un s'en occupe." },
      planned: { label: "Prévue", about: "Sur la feuille de route." },
      considering: { label: "À l'étude", about: "Pesée, pas tranchée." },
      idea: { label: "Idée", about: "Demandée ; pas encore lue." },
      "not-planned": { label: "Non prévue", about: "Pas pour l'instant, et pourquoi." },
    },
    listAria: "Demandes",
    search: "Rechercher dans les demandes",
    orderAria: "Ordre",
    top: "Les plus voulues",
    newest: "Les plus récentes",
    statusAria: "État",
    all: "Toutes",
    reading: "Lecture du tableau…",
    vote: "Voter pour {title}, {votes} votes",
    crew: "L'équipe :",
    none: "Rien ne correspond. Demandez-le ci-dessous.",
    askTitle: "Demander quelque chose",
    askAbout: "Une chose par demande, en quelques mots : ce qu'elle vous permettrait de faire en soirée. Parcourez la liste d'abord — un vote sur une demande existante compte plus qu'une deuxième copie.",
    what: "Que devrait faire djmanzo ?",
    whatPlaceholder: "Un mapping pour la Traktor Kontrol S4",
    more: "Dites-nous en plus",
    optional: "(facultatif)",
    morePlaceholder: "Qu'est-ce que cela vous permettrait de faire ?",
    name: "Votre nom",
    post: "Publier la demande",
    posted: "Publiée, avec votre vote. L'équipe lit chaque demande et la tamponne.",
    public: "Les demandes sont publiques. Restez sur djmanzo ; l'équipe retire le reste.",
  },
  community: {
    eyebrow: "Communauté",
    title: "Posez la question<br />que toute la soirée se posait.",
    lead: "Le métier, la musique, le matériel, la vie autour des soirées et djmanzo lui-même. Seulement des sujets justes et liés — des mots aimables, une vraie aide, aucune musique que la vôtre.",
    side: "Vous voulez que djmanzo fasse quelque chose qu'il ne fait pas ? Les <a href=\"{wishes}\">demandes de fonctionnalités</a> sont votées, et le tableau dit ce qu'il est advenu de chacune.",
  },
  market: {
    eyebrow: "Place de marché",
    title: "Fait par des DJ.<br />Gratuit pour tous.",
    lead: "Thèmes, skins, visuels et jeux de touches pour djmanzo, faits et partagés par ceux qui jouent avec. Chaque pack est signé par son auteur et vérifié avant d'être listé. Ni paiement ni commission — un auteur peut mettre un lien vers sa propre cagnotte.",
    kinds: {
      theme: { name: "Thèmes", what: "Quatorze couleurs pour une salle sombre et une claire, chaque paire que vous lisez tenue à son contraste, portées sur l'un des thèmes de djmanzo." },
      skin: { name: "Skins", what: "Des tuiles SVG dessinées légèrement sur un thème : immobiles, dérivantes ou respirant avec la basse. Une tuile ne peut que dessiner." },
      visuals: { name: "Visuels", what: "Des looks pour le projecteur, en couches à partir des effets de djmanzo et de presets MilkDrop." },
      keys: { name: "Jeux de touches", what: "Des touches mnémotechniques sous Space pour une façon de travailler : une soirée karaoké, un style, un mariage. Portés depuis le panneau Keys, sous vos propres touches, en complément de celles de djmanzo sans jamais en prendre une." },
    },
  },
};

const it: PagesWords = {
  wishes: {
    eyebrow: "Richieste di funzioni",
    title: "Dicci di cosa<br />ha bisogno la prossima serata.",
    lead: "Chiedi cosa dovrebbe fare djmanzo, vota ciò che hanno chiesto gli altri e guarda che fine ha fatto ogni richiesta — disponibile, in costruzione, prevista, o non prevista e perché. Le domande sull'uso vanno nel <a href=\"{forum}\">forum</a>.",
    status: {
      shipped: { label: "Disponibile", about: "Già in djmanzo." },
      building: { label: "In costruzione", about: "Qualcuno ci sta lavorando." },
      planned: { label: "Prevista", about: "Nella roadmap." },
      considering: { label: "In valutazione", about: "Soppesata, non decisa." },
      idea: { label: "Idea", about: "Richiesta; non ancora letta." },
      "not-planned": { label: "Non prevista", about: "Non per ora, e perché." },
    },
    listAria: "Richieste",
    search: "Cerca tra le richieste",
    orderAria: "Ordine",
    top: "Più volute",
    newest: "Più recenti",
    statusAria: "Stato",
    all: "Tutte",
    reading: "Lettura della bacheca…",
    vote: "Vota {title}, {votes} voti",
    crew: "La crew:",
    none: "Nessun risultato. Chiedilo qui sotto.",
    askTitle: "Chiedi qualcosa",
    askAbout: "Una cosa per richiesta, in poche parole: cosa ti permetterebbe di fare alle tue serate. Guarda prima la lista — un voto a una richiesta esistente conta più di una seconda copia.",
    what: "Cosa dovrebbe fare djmanzo?",
    whatPlaceholder: "Una mappatura per il Traktor Kontrol S4",
    more: "Raccontaci di più",
    optional: "(facoltativo)",
    morePlaceholder: "Cosa ti permetterebbe di fare?",
    name: "Il tuo nome",
    post: "Pubblica la richiesta",
    posted: "Pubblicata, con il tuo voto. La crew legge ogni richiesta e la timbra.",
    public: "Le richieste sono pubbliche. Che riguardino djmanzo; la crew rimuove il resto.",
  },
  community: {
    eyebrow: "Community",
    title: "Fai la domanda<br />che tutti alla serata si stavano facendo.",
    lead: "Il mestiere, la musica, l'attrezzatura, la vita intorno alle serate e djmanzo stesso. Solo argomenti buoni e pertinenti — parole gentili, aiuto vero, nessuna musica se non la tua.",
    side: "Vuoi che djmanzo faccia qualcosa che non fa? Le <a href=\"{wishes}\">richieste di funzioni</a> si votano, e la bacheca dice che fine ha fatto ognuna.",
  },
  market: {
    eyebrow: "Marketplace",
    title: "Fatto da DJ.<br />Gratis per tutti.",
    lead: "Temi, skin, visual e set di tasti per djmanzo, creati e condivisi da chi ci suona. Ogni pack è firmato da chi l'ha fatto e controllato prima di essere elencato. Niente pagamenti, niente commissioni — chi crea può mettere il link al proprio salvadanaio per le mance.",
    kinds: {
      theme: { name: "Temi", what: "Quattordici colori per una sala buia e una luminosa, ogni coppia che leggi tenuta al suo contrasto, indossati su uno dei temi di djmanzo." },
      skin: { name: "Skin", what: "Tessere SVG disegnate leggere sopra un tema: ferme, alla deriva o che respirano con il basso. Una tessera può solo disegnare." },
      visuals: { name: "Visual", what: "Look per il proiettore, a livelli con gli effetti di djmanzo e i preset MilkDrop." },
      keys: { name: "Set di tasti", what: "Tasti mnemonici sotto Space per un modo di lavorare: una serata karaoke, uno stile, un matrimonio. Si indossano dal pannello Keys, sotto i tuoi tasti, in aggiunta a quelli di djmanzo senza mai prenderne uno." },
    },
  },
};

const ja: PagesWords = {
  wishes: {
    eyebrow: "機能リクエスト",
    title: "次のギグに<br />何が必要か教えてください。",
    lead: "djmanzo にしてほしいことを頼み、ほかの人のリクエストに投票し、それぞれがどうなったか（提供済み、開発中、予定、または予定なしとその理由）を確かめられます。使い方の質問は<a href=\"{forum}\">フォーラム</a>へ。",
    status: {
      shipped: { label: "提供済み", about: "djmanzo に入っています。" },
      building: { label: "開発中", about: "誰かが取り組んでいます。" },
      planned: { label: "予定", about: "ロードマップに載っています。" },
      considering: { label: "検討中", about: "検討済み、未決定。" },
      idea: { label: "アイデア", about: "リクエスト済み、未読。" },
      "not-planned": { label: "予定なし", about: "今はやりません。その理由も。" },
    },
    listAria: "リクエスト",
    search: "リクエストを検索",
    orderAria: "並び順",
    top: "人気順",
    newest: "新着順",
    statusAria: "状態",
    all: "すべて",
    reading: "ボードを読み込み中…",
    vote: "{title} に投票（{votes} 票）",
    crew: "クルーより：",
    none: "一致するものがありません。下から頼んでください。",
    askTitle: "リクエストする",
    askAbout: "1 件につき 1 つ、短い言葉で。それがあればギグで何ができるようになるかを書いてください。先に一覧を見てください。既存のリクエストへの 1 票は、重複した投稿より重みがあります。",
    what: "djmanzo に何をしてほしいですか？",
    whatPlaceholder: "Traktor Kontrol S4 のマッピング",
    more: "詳しく教えてください",
    optional: "（任意）",
    morePlaceholder: "それで何ができるようになりますか？",
    name: "お名前",
    post: "リクエストを投稿",
    posted: "投稿しました。あなたの 1 票付きです。クルーはすべてのリクエストを読み、スタンプを押します。",
    public: "リクエストは公開されます。djmanzo に関することだけにしてください。それ以外はクルーが削除します。",
  },
  community: {
    eyebrow: "コミュニティ",
    title: "ギグで誰もが思っていた<br />その質問を。",
    lead: "技術、音楽、機材、ギグのまわりの暮らし、そして djmanzo そのもの。良い、関係のある話題だけ。親切な言葉、本当の助け、そして自分以外の誰の音楽も載せないこと。",
    side: "djmanzo にできないことをしてほしい？ <a href=\"{wishes}\">機能リクエスト</a>は投票で決まり、それぞれがどうなったかはボードでわかります。",
  },
  market: {
    eyebrow: "マーケットプレイス",
    title: "DJ がつくる。<br />誰でも無料。",
    lead: "djmanzo のテーマ、スキン、ビジュアル、キーボードセットを、それを使ってプレイする人たちが作って共有しています。どのパックも作者が署名し、掲載前に確認しています。支払いも手数料もなし。作者は自分のチップ用ページにリンクできます。",
    kinds: {
      theme: { name: "テーマ", what: "暗い部屋用と明るい部屋用の 14 色。読む組み合わせはすべてコントラストを確保し、djmanzo のテーマの上に着せます。" },
      skin: { name: "スキン", what: "テーマの上に淡く描く SVG タイル。静止、漂う、ベースに合わせて呼吸する。タイルは描画しかできません。" },
      visuals: { name: "ビジュアル", what: "プロジェクター用のルック。djmanzo 自身のエフェクトと MilkDrop プリセットを重ねて作ります。" },
      keys: { name: "キーボードセット", what: "作業スタイルに合わせた Space の下の覚えやすいキー。カラオケナイト、ひとつのスタイル、結婚式など。Keys パネルから、自分のキーの下に着け、djmanzo のキーに足すだけで奪うことはありません。" },
    },
  },
};

export const PAGES: Record<Lang, PagesWords> = { en, es, pt, de, fr, it, ja };
