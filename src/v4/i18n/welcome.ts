/**
 * The welcome: the first screen's two lines and the paragraph under them,
 * for every look (`skins.ts`) in every language the site speaks. The look
 * is where the visitor plays and the language is how they read, so each
 * pair is written for that DJ, not translated word for word: the club look
 * in German ends at Sunday noon and in Japanese at the first train; the
 * tropical look in Spanish starts at the colmado and in French at a zouk.
 *
 * Every paragraph says the same three things, in the scene's own words:
 * what a DJ expects (decks, sync, cues, loops, their crates carried over),
 * what is new and useful in that scene (stems, karaoke, requests by QR
 * code, the assistant that asks first), and an invitation with a smile.
 * Only what ships is promised (`shared/facts.ts`).
 */

import type { SkinId } from "../skins";
import type { BuiltInLang, Lang } from "./strings";

export interface Welcome {
  /** The first line of the heading. */
  l1: string;
  /** The second, in the look's accent. */
  l2: string;
  lead: string;
}

/** Every look's welcome; a packed language's arrives with its pack (`packs.ts`). */
export const WELCOME = ({
  club: {
    en: {
      l1: "Made for the long blend.",
      l2: "And the sunrise set.",
      lead: "Welcome to the booth. Sync, cues, loops and a beat-synced effects rack sit where your hands expect them, and your rekordbox, Serato or Traktor crates arrive with their cues and grids. Then the new tricks: pull the vocal out of any record while it plays, watch the next phrase coming on the waveform, and ask the assistant for a record in key — it tells you why, and waits for your yes. Try it free tonight. The after-party is your problem.",
    },
    es: {
      l1: "Hecho para mezclas largas.",
      l2: "Y para el after.",
      lead: "Bienvenido a la cabina. Sync, cues, loops y efectos a tempo están donde tus manos los buscan, y tus crates de rekordbox, Serato o Traktor llegan con sus cues y sus grids. Y luego lo nuevo: quítale la voz a cualquier tema mientras suena, mira venir la próxima frase en la forma de onda y pídele al asistente un tema en tono: te dice por qué y espera tu sí. Pruébalo gratis esta noche. El after ya corre de tu cuenta.",
    },
    pt: {
      l1: "Feito para a mixagem longa.",
      l2: "E para o after.",
      lead: "Bem-vindo à cabine. Sync, cues, loops e efeitos no tempo estão onde suas mãos procuram, e suas crates do rekordbox, Serato ou Traktor chegam com cues e grids. Agora as novidades: tire a voz de qualquer faixa enquanto ela toca, veja a próxima frase chegando na forma de onda e peça ao assistente uma faixa no tom certo — ele explica o porquê e espera o seu sim. Teste de graça hoje à noite. O after é por sua conta.",
    },
    de: {
      l1: "Gebaut für lange Blends.",
      l2: "Und für Sonntagmittag.",
      lead: "Willkommen in der Kanzel. Sync, Cues, Loops und ein taktgenaues Effekt-Rack liegen da, wo deine Hände sie suchen, und deine Crates aus rekordbox, Serato oder Traktor kommen samt Cues und Beatgrids mit. Dann das Neue: die Stimme aus jedem Track lösen, während er läuft; die nächste Phrase auf der Wellenform kommen sehen; und den Assistenten nach einem Track in passender Tonart fragen – er sagt dir, warum, und wartet auf dein Ja. Heute Nacht kostenlos ausprobieren. Die Tür bleibt trotzdem streng.",
    },
    fr: {
      l1: "Taillé pour les longues transitions.",
      l2: "Et pour l'after.",
      lead: "Bienvenue en cabine. Sync, cues, boucles et effets calés sur le tempo sont là où vos mains les cherchent, et vos crates rekordbox, Serato ou Traktor arrivent avec leurs cues et leurs grilles. Puis les nouveautés : retirez la voix de n'importe quel morceau pendant qu'il joue, voyez venir la prochaine phrase sur la forme d'onde, et demandez à l'assistant un morceau dans la bonne tonalité — il vous dit pourquoi, et attend votre feu vert. À essayer gratuitement ce soir. Pour la queue au vestiaire, on ne peut rien faire.",
    },
    it: {
      l1: "Fatto per i mix lunghi.",
      l2: "E per l'alba in riviera.",
      lead: "Benvenuto in consolle. Sync, cue, loop ed effetti a tempo sono dove le tue mani li cercano, e le tue crate di rekordbox, Serato o Traktor arrivano con cue e griglie. Poi le novità: togli la voce da qualsiasi brano mentre suona, guarda arrivare la prossima frase sulla forma d'onda e chiedi all'assistente un brano nella tonalità giusta: ti dice perché e aspetta il tuo sì. Provalo gratis stasera. Al cornetto delle cinque pensi tu.",
    },
    ja: {
      l1: "ロングミックスのために。",
      l2: "始発まで付き合います。",
      lead: "ブースへようこそ。シンク、キュー、ループ、テンポに合ったエフェクトは手が覚えている場所に。rekordbox・Serato・Traktorのクレートも、キューとビートグリッドごと持ち込めます。そして新しいこと：再生中の曲からボーカルだけを抜く。次のフレーズが波形の上で近づいてくるのが見える。アシスタントにキーの合う次の一曲を聞けば、理由を添えて提案し、あなたのOKを待ちます。今夜、無料で試してください。始発の時間はご自分で。",
    },
  },

  tropical: {
    en: {
      l1: "The colmado, the wedding, the club.",
      l2: "One booth. Zero dead air.",
      lead: "¡Klk! Welcome to the booth. Your decks, sync, cues and loops are where your hands look for them, and your Serato or rekordbox crates come along with their cues. Then the new things: take the vocal out of any record for a live edit, read the key and tempo of every song from merengue to dembow, and let the room send requests from a QR code — no app to install. Try it free tonight. The tía who wants one more merengue still gets one; now it's on the list.",
    },
    es: {
      l1: "Del colmado a la boda.",
      l2: "Sin un segundo de silencio.",
      lead: "¡Klk! Bienvenido a la cabina. Tus platos, el sync, los cues y los loops están donde tus manos los buscan, y tus crates de Serato o rekordbox llegan con sus cues. Y lo nuevo: quítale la voz a cualquier tema para un edit en vivo, lee el tono y el BPM de cada canción, del merengue al dembow, y recibe las peticiones del público con un código QR, sin instalar nada. Pruébalo gratis esta noche. Y sí: a la tía que pide «un merenguito más», se lo pones, que ya está en la lista.",
    },
    pt: {
      l1: "Do baile ao casamento.",
      l2: "Sem deixar a pista esfriar.",
      lead: "E aí, DJ! Bem-vindo à cabine. Seus decks, sync, cues e loops estão onde suas mãos procuram, e suas crates do Serato ou rekordbox chegam com os cues. E as novidades: tire a voz de qualquer faixa para um edit ao vivo, veja o tom e o BPM de cada música, do forró ao reggaeton, e receba pedidos da pista por QR code, sem app nenhum. Teste de graça hoje à noite. Quando o tio pedir \"aquela\" pela quinta vez, ela já está na lista.",
    },
    de: {
      l1: "Salsa, Bachata, Reggaeton.",
      l2: "Und keine Sekunde Stille.",
      lead: "¡Hola! Willkommen in der Kanzel. Decks, Sync, Cues und Loops sind da, wo deine Hände sie suchen, und deine Crates aus Serato oder rekordbox kommen samt Cues mit. Dann das Neue: die Stimme aus jedem Track lösen, für einen Live-Edit; Tonart und BPM jedes Songs, von Merengue bis Dembow; und Musikwünsche vom Publikum per QR-Code, ganz ohne App. Heute Nacht kostenlos ausprobieren. Nur den Hüftschwung bringt die Tanzfläche selbst mit.",
    },
    fr: {
      l1: "Du zouk au reggaeton.",
      l2: "Sans un seul blanc.",
      lead: "Bonsoir ! Bienvenue en cabine. Platines, sync, cues et boucles sont là où vos mains les cherchent, et vos crates Serato ou rekordbox arrivent avec leurs cues. Puis les nouveautés : retirez la voix de n'importe quel morceau pour un edit en direct, lisez la tonalité et le BPM de chaque titre, du kompa à la bachata, et recevez les demandes du public par QR code, sans application. À essayer gratuitement ce soir. Quand tonton réclame « encore un zouk », c'est déjà dans la liste.",
    },
    it: {
      l1: "Dalla serata latina al matrimonio.",
      l2: "Senza un attimo di silenzio.",
      lead: "¡Hola! Benvenuto in consolle. Deck, sync, cue e loop sono dove le tue mani li cercano, e le tue crate di Serato o rekordbox arrivano con i loro cue. Poi le novità: togli la voce da qualsiasi brano per un edit dal vivo, leggi tonalità e BPM di ogni canzone, dal merengue al dembow, e ricevi le richieste della pista con un QR code, senza installare niente. Provalo gratis stasera. E quando la scuola di ballo chiede «una bachata sensual», ce l'hai già in coda.",
    },
    ja: {
      l1: "サルサもバチャータも。",
      l2: "フロアを一秒も止めずに。",
      lead: "¡Hola! ブースへようこそ。デッキ、シンク、キュー、ループは手が覚えている場所に。SeratoやrekordboxのクレートもキューごとOK。そして新しいこと：どの曲からもボーカルを抜いて、その場でエディット。メレンゲからデンボウまで、曲ごとのキーとBPMを表示。フロアからのリクエストはQRコードで、アプリ不要。今夜、無料で試してください。ステップの練習は、ダンス教室で。",
    },
  },

  urban: {
    en: {
      l1: "Pull the acapella.",
      l2: "Drop the beat back in.",
      lead: "Welcome to the booth. Your decks, cues, loops, slip and backspin are where your hands expect them, and your Serato crates come over with their hot cues and loops. Then the new stuff: split any record into vocal, drums and bass while it plays, so the acapella and the instrumental are always one tap away; a Scratch layout; and requests from the floor by QR code, most-wanted first. Try it free tonight. Asked for \"that one that goes like…\"? Type the half-remembered line and djmanzo finds it.",
    },
    es: {
      l1: "Saca el acapella.",
      l2: "Y suelta el beat otra vez.",
      lead: "Bienvenido a la cabina. Tus platos, cues, loops, slip y backspin están donde tus manos los esperan, y tus crates de Serato llegan con sus hot cues y loops. Y lo nuevo: separa cualquier tema en voz, batería y bajo mientras suena, con el acapella y el instrumental siempre a un toque; un layout de scratch; y peticiones de la pista por código QR, la más pedida primero. Pruébalo gratis esta noche. ¿Te piden «esa que dice…»? Escribe el pedazo de letra que recuerdan y djmanzo la encuentra.",
    },
    pt: {
      l1: "Tira o acapella.",
      l2: "E solta a batida de novo.",
      lead: "Bem-vindo à cabine. Seus decks, cues, loops, slip e backspin estão onde suas mãos esperam, e suas crates do Serato chegam com hot cues e loops. E as novidades: separe qualquer faixa em voz, bateria e baixo enquanto toca, com o acapella e o instrumental sempre a um toque; um layout de scratch; e pedidos da pista por QR code, o mais pedido primeiro. Teste de graça hoje à noite. Pediram \"aquela que faz assim…\"? Digite o pedaço da letra que lembraram e o djmanzo encontra.",
    },
    de: {
      l1: "Acapella raus.",
      l2: "Beat wieder rein.",
      lead: "Willkommen in der Kanzel. Decks, Cues, Loops, Slip und Backspin liegen da, wo deine Hände sie erwarten, und deine Serato-Crates kommen mit Hot Cues und Loops rüber. Dann das Neue: jeden Track, während er läuft, in Stimme, Drums und Bass zerlegen – Acapella und Instrumental immer nur einen Tap entfernt; ein Scratch-Layout; und Wünsche von der Tanzfläche per QR-Code, der meistgewünschte zuerst. Heute Nacht kostenlos ausprobieren. „Spiel mal das, das so geht …“? Tipp die halbe Zeile ein, djmanzo findet den Track.",
    },
    fr: {
      l1: "Sortez l'a cappella.",
      l2: "Et relancez le beat.",
      lead: "Bienvenue en cabine. Platines, cues, boucles, slip et backspin sont là où vos mains les attendent, et vos crates Serato arrivent avec leurs hot cues et leurs boucles. Puis les nouveautés : séparez n'importe quel morceau en voix, batterie et basse pendant qu'il joue, l'a cappella et l'instru toujours à une touche ; un layout scratch ; et les demandes du public par QR code, la plus demandée en premier. À essayer gratuitement ce soir. « Mets celle qui fait… » ? Tapez le bout de phrase dont ils se souviennent, djmanzo trouve le morceau.",
    },
    it: {
      l1: "Tira fuori l'acappella.",
      l2: "E rimetti dentro il beat.",
      lead: "Benvenuto in consolle. Deck, cue, loop, slip e backspin sono dove le tue mani se li aspettano, e le tue crate di Serato arrivano con hot cue e loop. Poi le novità: separa qualsiasi brano in voce, batteria e basso mentre suona, con l'acappella e la strumentale sempre a un tocco; un layout per lo scratch; e le richieste dalla pista con un QR code, la più richiesta per prima. Provalo gratis stasera. «Metti quella che fa…»? Scrivi il pezzo di testo che ricordano e djmanzo la trova.",
    },
    ja: {
      l1: "アカペラを抜いて。",
      l2: "ビートをもう一度落とす。",
      lead: "ブースへようこそ。デッキ、キュー、ループ、スリップ、バックスピンは手が覚えている場所に。SeratoのクレートもホットキューとループごとOK。そして新しいこと：再生中の曲をボーカル・ドラム・ベースに分離して、アカペラもインストもワンタップ。スクラッチ用のレイアウト。フロアからのリクエストはQRコードで、多い順に並びます。今夜、無料で試してください。「あの、こういう感じの曲…」には、覚えている歌詞の一部を入力すれば、djmanzoが探します。",
    },
  },

  afro: {
    en: {
      l1: "Log drums, front and centre.",
      l2: "Lagos to Joburg, one booth.",
      lead: "Welcome to the booth. Your decks, sync, cues and loops are where your hands expect them, and your rekordbox or Serato crates come over with their cues. Then the new things: pull the drums, the bass or the vocal out of any record while it plays, so the log drum gets the drop to itself; the key and tempo of every record; and an assistant that suggests what comes next, says why, and waits for your yes. Try it free tonight. When an auntie sings you half a line of \"her song\", type it in: djmanzo finds it.",
    },
    es: {
      l1: "Amapiano, afrobeats, afro house.",
      l2: "Y la pista no se sienta.",
      lead: "Bienvenido a la cabina. Tus platos, el sync, los cues y los loops están donde tus manos los buscan, y tus crates de rekordbox o Serato llegan con sus cues. Y lo nuevo: separa la batería, el bajo o la voz de cualquier tema mientras suena, para que el log drum tenga el drop para él solo; el tono y el BPM de cada canción; y un asistente que te sugiere el siguiente, te dice por qué y espera tu sí. Pruébalo gratis esta noche. Si alguien te canta media línea de «esa canción», escríbela: djmanzo la encuentra.",
    },
    pt: {
      l1: "Kizomba, kuduro, amapiano.",
      l2: "E a pista não para.",
      lead: "Bem-vindo à cabine. Decks, sync, cues e loops estão onde suas mãos esperam, e suas crates do rekordbox ou Serato chegam com os cues. E as novidades: separe a bateria, o baixo ou a voz de qualquer faixa enquanto toca, para um drop só com o groove; o tom e o BPM de cada música; e um assistente que sugere a próxima, explica o porquê e espera o seu sim. Experimente de graça esta noite. E quando a tia pedir \"aquela kizomba\", basta um verso para encontrá-la.",
    },
    de: {
      l1: "Amapiano, Afrobeats, Afro House.",
      l2: "Und keiner setzt sich hin.",
      lead: "Willkommen in der Kanzel. Decks, Sync, Cues und Loops liegen da, wo deine Hände sie erwarten, und deine Crates aus rekordbox oder Serato kommen samt Cues mit. Dann das Neue: Drums, Bass oder Stimme aus jedem Track lösen, während er läuft – damit die Log Drum den Drop für sich hat; Tonart und BPM jedes Songs; und ein Assistent, der den nächsten Track vorschlägt, sagt warum und auf dein Ja wartet. Heute Nacht kostenlos ausprobieren. Singt dir jemand eine halbe Zeile vor, tipp sie ein: djmanzo findet den Song.",
    },
    fr: {
      l1: "Du coupé-décalé à l'afrobeats.",
      l2: "Une seule cabine.",
      lead: "Bienvenue en cabine. Platines, sync, cues et boucles sont là où vos mains les attendent, et vos crates rekordbox ou Serato arrivent avec leurs cues. Puis les nouveautés : séparez la batterie, la basse ou la voix de n'importe quel morceau pendant qu'il joue, pour un drop rien qu'avec le groove ; la tonalité et le tempo de chaque titre ; et un assistant qui propose la suite, dit pourquoi, et attend votre accord. À essayer gratuitement ce soir. Et quand le cousin réclame « son son », un bout de refrain suffit pour le retrouver.",
    },
    it: {
      l1: "Amapiano, afrobeats, afro house.",
      l2: "E nessuno si siede.",
      lead: "Benvenuto in consolle. Deck, sync, cue e loop sono dove le tue mani se li aspettano, e le tue crate di rekordbox o Serato arrivano con i loro cue. Poi le novità: separa batteria, basso o voce da qualsiasi brano mentre suona, così il log drum ha il drop tutto per sé; tonalità e BPM di ogni canzone; e un assistente che ti suggerisce il prossimo brano, ti dice perché e aspetta il tuo sì. Provalo gratis stasera. Se qualcuno ti canticchia mezzo verso di «quella canzone», scrivilo: djmanzo la trova.",
    },
    ja: {
      l1: "アマピアノも、アフロビーツも。",
      l2: "フロアは座らせない。",
      lead: "ブースへようこそ。デッキ、シンク、キュー、ループは手が覚えている場所に。rekordboxやSeratoのクレートもキューごとOK。そして新しいこと：再生中の曲からドラム、ベース、ボーカルを分離。ドロップをログドラムだけに任せることも。曲ごとのキーとBPM。次の一曲を理由つきで提案し、あなたのOKを待つアシスタント。今夜、無料で試してください。うろ覚えの歌詞ひとことでも、djmanzoが曲を探します。",
    },
  },

  neon: {
    en: {
      l1: "Small club, big sound.",
      l2: "Karaoke room included.",
      lead: "Welcome to the booth. Your decks, sync, cues and loops are where your hands expect them, and your rekordbox crates come over with their cues. Then the new things: any record split into voice and music while it plays — your whole collection becomes karaoke, with the words on screen, scored singing and a quiz made from your own records; and an assistant that suggests the next track in key and says why. Try it free tonight. Microphone manners not included.",
    },
    es: {
      l1: "Club pequeño, sonido enorme.",
      l2: "Sala de karaoke incluida.",
      lead: "Bienvenido a la cabina. Tus platos, el sync, los cues y los loops están donde tus manos los esperan, y tus crates de rekordbox llegan con sus cues. Y lo nuevo: cualquier tema separado en voz y música mientras suena — toda tu colección se vuelve karaoke, con la letra en pantalla, puntuación al cantar y un quiz hecho con tus propios temas; y un asistente que te sugiere el siguiente en tono y te dice por qué. Pruébalo gratis esta noche. Los modales con el micro no vienen incluidos.",
    },
    pt: {
      l1: "Clube pequeno, som gigante.",
      l2: "Com sala de karaokê.",
      lead: "Bem-vindo à cabine. Seus decks, sync, cues e loops estão onde suas mãos esperam, e suas crates do rekordbox chegam com os cues. E as novidades: qualquer faixa separada em voz e música enquanto toca — sua coleção inteira vira karaokê, com a letra na tela, pontuação no canto e um quiz feito com as suas próprias músicas; e um assistente que sugere a próxima no tom certo e diz por quê. Teste de graça hoje à noite. A etiqueta do microfone não vem inclusa.",
    },
    de: {
      l1: "Kleiner Club, großer Sound.",
      l2: "Karaoke-Raum inklusive.",
      lead: "Willkommen in der Kanzel. Decks, Sync, Cues und Loops liegen da, wo deine Hände sie erwarten, und deine rekordbox-Crates kommen samt Cues mit. Dann das Neue: jeder Track, während er läuft, in Stimme und Musik getrennt – deine ganze Sammlung wird zum Karaoke, mit dem Text auf dem Bildschirm, Punkten fürs Singen und einem Quiz aus deinen eigenen Tracks; und ein Assistent, der den nächsten Track in passender Tonart vorschlägt und sagt, warum. Heute Nacht kostenlos ausprobieren. Mikrofon-Manieren nicht im Lieferumfang.",
    },
    fr: {
      l1: "Petit club, gros son.",
      l2: "Salle de karaoké comprise.",
      lead: "Bienvenue en cabine. Platines, sync, cues et boucles sont là où vos mains les attendent, et vos crates rekordbox arrivent avec leurs cues. Puis les nouveautés : n'importe quel morceau séparé en voix et musique pendant qu'il joue — toute votre collection devient karaoké, avec les paroles à l'écran, le chant noté et un quiz tiré de vos propres morceaux ; et un assistant qui propose le suivant dans la bonne tonalité, en disant pourquoi. À essayer gratuitement ce soir. Le savoir-vivre au micro n'est pas fourni.",
    },
    it: {
      l1: "Club piccolo, suono enorme.",
      l2: "Sala karaoke inclusa.",
      lead: "Benvenuto in consolle. Deck, sync, cue e loop sono dove le tue mani se li aspettano, e le tue crate di rekordbox arrivano con i loro cue. Poi le novità: qualsiasi brano separato in voce e musica mentre suona — tutta la tua collezione diventa karaoke, con il testo sullo schermo, il canto a punteggio e un quiz fatto con i tuoi brani; e un assistente che ti suggerisce il prossimo nella tonalità giusta e ti dice perché. Provalo gratis stasera. Il galateo del microfono non è incluso.",
    },
    ja: {
      l1: "小さなクラブに、大きな音。",
      l2: "カラオケルーム付き。",
      lead: "ブースへようこそ。デッキ、シンク、キュー、ループは手が覚えている場所に。rekordboxのクレートもキューごとそのまま。そして新しいこと：再生中の曲をボーカルと演奏に分離。手持ちの曲がそのままカラオケになり、歌詞を画面に表示、採点も、あなたの曲から作る音楽クイズも。アシスタントはキーの合う次の一曲を、理由つきで提案します。今夜、無料で試してください。マイクの順番は、みんなで守りましょう。",
    },
  },

  oasis: {
    en: {
      l1: "From the zaffa to the rooftop.",
      l2: "One booth, all night.",
      lead: "Ahlan! Welcome to the booth. Your decks, sync, cues and loops are where your hands expect them, and your rekordbox or Serato crates arrive with their cues. Then the new things: take the vocal out of any record while it plays, or keep only the drums for a darbuka break; the key and tempo of every song, so the shaabi meets the deep house in tune; and requests from the guests by QR code, no app. Try it free tonight. The wedding still ends at 4 a.m. — you'll just be less tired.",
    },
    es: {
      l1: "De la zaffa a la azotea.",
      l2: "Una cabina para toda la noche.",
      lead: "¡Ahlan! Bienvenido a la cabina. Tus platos, el sync, los cues y los loops están donde tus manos los esperan, y tus crates de rekordbox o Serato llegan con sus cues. Y lo nuevo: quítale la voz a cualquier tema mientras suena, o deja solo la percusión para un break de darbuka; el tono y el BPM de cada canción, para que el shaabi y el deep house se encuentren en tono; y peticiones de los invitados por código QR, sin app. Pruébalo gratis esta noche. La boda seguirá acabando a las 4 de la mañana; tú, menos cansado.",
    },
    pt: {
      l1: "Da zaffa ao rooftop.",
      l2: "Uma cabine a noite inteira.",
      lead: "Ahlan! Bem-vindo à cabine. Seus decks, sync, cues e loops estão onde suas mãos esperam, e suas crates do rekordbox ou Serato chegam com os cues. E as novidades: tire a voz de qualquer faixa enquanto toca, ou deixe só a percussão para um break de darbuka; o tom e o BPM de cada música, para o shaabi encontrar o deep house no tom; e pedidos dos convidados por QR code, sem app. Teste de graça hoje à noite. O casamento continua acabando às 4 da manhã — você só vai chegar menos cansado.",
    },
    de: {
      l1: "Von der Zaffa bis aufs Dach.",
      l2: "Eine Kanzel für die ganze Nacht.",
      lead: "Ahlan! Willkommen in der Kanzel. Decks, Sync, Cues und Loops liegen da, wo deine Hände sie erwarten, und deine Crates aus rekordbox oder Serato kommen samt Cues mit. Dann das Neue: die Stimme aus jedem Track lösen, während er läuft, oder nur die Percussion für einen Darbuka-Break stehen lassen; Tonart und BPM jedes Songs, damit Shaabi und Deep House sich in der Tonart treffen; und Wünsche der Gäste per QR-Code, ohne App. Heute Nacht kostenlos ausprobieren. Die Hochzeit endet trotzdem um vier Uhr früh – du bist nur weniger müde.",
    },
    fr: {
      l1: "Du raï au rooftop.",
      l2: "Une cabine pour toute la nuit.",
      lead: "Ahlan ! Bienvenue en cabine. Platines, sync, cues et boucles sont là où vos mains les attendent, et vos crates rekordbox ou Serato arrivent avec leurs cues. Puis les nouveautés : retirez la voix de n'importe quel morceau pendant qu'il joue, ou gardez seulement les percussions pour un break de derbouka ; la tonalité et le tempo de chaque titre, pour que le chaâbi rejoigne la deep house dans le ton ; et les demandes des invités par QR code, sans application. À essayer gratuitement ce soir. Le mariage finira toujours à 4 h du matin — vous, moins fatigué.",
    },
    it: {
      l1: "Dalla zaffa alla terrazza.",
      l2: "Una consolle per tutta la notte.",
      lead: "Ahlan! Benvenuto in consolle. Deck, sync, cue e loop sono dove le tue mani se li aspettano, e le tue crate di rekordbox o Serato arrivano con i loro cue. Poi le novità: togli la voce da qualsiasi brano mentre suona, o lascia solo le percussioni per un break di darbuka; tonalità e BPM di ogni canzone, così lo shaabi incontra la deep house nella stessa tonalità; e le richieste degli ospiti con un QR code, senza app. Provalo gratis stasera. Il matrimonio finirà comunque alle quattro del mattino: tu, solo meno stanco.",
    },
    ja: {
      l1: "結婚式からルーフトップまで。",
      l2: "ひとつのブースで一晩中。",
      lead: "アハラン！ブースへようこそ。デッキ、シンク、キュー、ループは手が覚えている場所に。rekordboxやSeratoのクレートもキューごとOK。そして新しいこと：再生中の曲からボーカルを抜く。パーカッションだけ残してダルブッカのブレイクも。曲ごとのキーとBPMで、シャアビとディープハウスもキーを合わせてつなげます。ゲストからのリクエストはQRコードで、アプリ不要。今夜、無料で試してください。結婚式が朝4時まで続くのは変わりませんが、疲れ方は変わります。",
    },
  },

  monsoon: {
    en: {
      l1: "Sangeet, baraat, after-party.",
      l2: "One booth for all three.",
      lead: "Welcome to the booth. Your decks, sync, cues and loops are where your hands expect them, and your rekordbox or Serato crates arrive with their cues. Then the new things: pull the vocal out of any Bollywood track for a live mashup over a house beat, keep only the drums so the dhol carries the baraat, see every song's key so the mashups land in tune, and take requests from the guests by QR code. Try it free tonight. The uncle who wants one more Punjabi song still gets it — from the requests list.",
    },
    es: {
      l1: "Sangeet, baraat y after.",
      l2: "Una cabina para las tres.",
      lead: "Bienvenido a la cabina. Tus platos, el sync, los cues y los loops están donde tus manos los esperan, y tus crates de rekordbox o Serato llegan con sus cues. Y lo nuevo: quítale la voz a cualquier tema de Bollywood para un mashup en vivo sobre un beat de house, deja solo la percusión para que el dhol lleve el baraat, mira el tono de cada canción para que los mashups encajen, y recibe peticiones de los invitados por código QR. Pruébalo gratis esta noche. El tío que pide «una punjabi más» la tendrá, desde la lista de peticiones.",
    },
    pt: {
      l1: "Sangeet, baraat e after.",
      l2: "Uma cabine para os três.",
      lead: "Bem-vindo à cabine. Seus decks, sync, cues e loops estão onde suas mãos esperam, e suas crates do rekordbox ou Serato chegam com os cues. E as novidades: tire a voz de qualquer faixa de Bollywood para um mashup ao vivo sobre uma batida house, deixe só a percussão para o dhol levar o baraat, veja o tom de cada música para os mashups baterem certo, e receba pedidos dos convidados por QR code. Teste de graça hoje à noite. O tio que pede \"só mais uma punjabi\" vai ouvir — direto da lista de pedidos.",
    },
    de: {
      l1: "Sangeet, Baraat, Afterparty.",
      l2: "Eine Kanzel für alle drei.",
      lead: "Willkommen in der Kanzel. Decks, Sync, Cues und Loops liegen da, wo deine Hände sie erwarten, und deine Crates aus rekordbox oder Serato kommen samt Cues mit. Dann das Neue: die Stimme aus jedem Bollywood-Track lösen, für ein Live-Mashup über einem House-Beat; nur die Percussion stehen lassen, damit der Dhol die Baraat trägt; die Tonart jedes Songs, damit die Mashups passen; und Wünsche der Gäste per QR-Code. Heute Nacht kostenlos ausprobieren. Der Onkel, der „noch einen Punjabi-Song“ will, bekommt ihn – von der Wunschliste.",
    },
    fr: {
      l1: "Sangeet, baraat, after.",
      l2: "Une cabine pour les trois.",
      lead: "Bienvenue en cabine. Platines, sync, cues et boucles sont là où vos mains les attendent, et vos crates rekordbox ou Serato arrivent avec leurs cues. Puis les nouveautés : retirez la voix de n'importe quel titre de Bollywood pour un mashup en direct sur un beat house, gardez seulement les percussions pour que le dhol porte la baraat, voyez la tonalité de chaque titre pour des mashups justes, et recevez les demandes des invités par QR code. À essayer gratuitement ce soir. L'oncle qui veut « encore un punjabi » l'aura — depuis la liste des demandes.",
    },
    it: {
      l1: "Sangeet, baraat, after party.",
      l2: "Una consolle per tutti e tre.",
      lead: "Benvenuto in consolle. Deck, sync, cue e loop sono dove le tue mani se li aspettano, e le tue crate di rekordbox o Serato arrivano con i loro cue. Poi le novità: togli la voce da qualsiasi brano di Bollywood per un mashup dal vivo su una base house, lascia solo le percussioni perché il dhol porti la baraat, guarda la tonalità di ogni canzone perché i mashup tornino, e ricevi le richieste degli ospiti con un QR code. Provalo gratis stasera. Lo zio che vuole «ancora una punjabi» la avrà, dalla lista delle richieste.",
    },
    ja: {
      l1: "サンギート、バラート、アフター。",
      l2: "ひとつのブースで全部。",
      lead: "ブースへようこそ。デッキ、シンク、キュー、ループは手が覚えている場所に。rekordboxやSeratoのクレートもキューごとOK。そして新しいこと：ボリウッドの曲からボーカルを抜いて、ハウスのビートの上でその場でマッシュアップ。パーカッションだけ残して、ドールにバラートを任せることも。曲ごとのキーが見えるので、マッシュアップも外しません。ゲストからのリクエストはQRコードで。今夜、無料で試してください。「パンジャビをもう一曲」のおじさんにも、リクエスト一覧からちゃんと応えられます。",
    },
  },

  pacific: {
    en: {
      l1: "Beach bar at sunset.",
      l2: "Bush doof till sunrise.",
      lead: "G'day, kia ora, welcome to the booth. Your decks, sync, cues and loops are where your hands expect them, and your rekordbox or Serato crates come along with their cues. Then the new things: split any record into vocal, drums and bass while it plays; hand the sunset set to the autopilot while you grab a drink — it gives the decks back the moment you touch a fader; and send tonight's tracklist to the crew when you're done. Try it free tonight. Sunscreen not included.",
    },
    es: {
      l1: "Chiringuito al atardecer.",
      l2: "Y rave en el monte hasta el amanecer.",
      lead: "Bienvenido a la cabina. Tus platos, el sync, los cues y los loops están donde tus manos los esperan, y tus crates de rekordbox o Serato llegan con sus cues. Y lo nuevo: separa cualquier tema en voz, batería y bajo mientras suena; déjale la sesión del atardecer al piloto automático mientras vas a por algo de beber — te devuelve los platos en cuanto tocas un fader; y manda la lista de temas de la noche a tu gente al acabar. Pruébalo gratis esta noche. Protector solar no incluido.",
    },
    pt: {
      l1: "Pôr do sol no quiosque.",
      l2: "Festa no mato até o sol nascer.",
      lead: "Bem-vindo à cabine. Seus decks, sync, cues e loops estão onde suas mãos esperam, e suas crates do rekordbox ou Serato chegam com os cues. E as novidades: separe qualquer faixa em voz, bateria e baixo enquanto toca; deixe o set do pôr do sol no piloto automático enquanto pega uma bebida — ele devolve os decks assim que você toca num fader; e mande a tracklist da noite para a galera no final. Teste de graça hoje à noite. Protetor solar não incluso.",
    },
    de: {
      l1: "Strandbar zum Sonnenuntergang.",
      l2: "Open Air bis zum Sonnenaufgang.",
      lead: "Willkommen in der Kanzel. Decks, Sync, Cues und Loops liegen da, wo deine Hände sie erwarten, und deine Crates aus rekordbox oder Serato kommen samt Cues mit. Dann das Neue: jeden Track, während er läuft, in Stimme, Drums und Bass zerlegen; das Sunset-Set dem Autopiloten überlassen, während du dir was zu trinken holst – er gibt dir die Decks zurück, sobald du einen Fader anfasst; und die Tracklist der Nacht danach an deine Leute schicken. Heute Nacht kostenlos ausprobieren. Sonnencreme musst du selbst mitbringen.",
    },
    fr: {
      l1: "Paillote au coucher du soleil.",
      l2: "Free party jusqu'à l'aube.",
      lead: "Bienvenue en cabine. Platines, sync, cues et boucles sont là où vos mains les attendent, et vos crates rekordbox ou Serato arrivent avec leurs cues. Puis les nouveautés : séparez n'importe quel morceau en voix, batterie et basse pendant qu'il joue ; confiez le set du coucher de soleil au pilote automatique le temps d'aller chercher un verre — il vous rend les platines dès que vous touchez un fader ; et envoyez la tracklist de la soirée à la bande en fin de nuit. À essayer gratuitement ce soir. Crème solaire non fournie.",
    },
    it: {
      l1: "Lido al tramonto.",
      l2: "Rave nel bosco fino all'alba.",
      lead: "Benvenuto in consolle. Deck, sync, cue e loop sono dove le tue mani se li aspettano, e le tue crate di rekordbox o Serato arrivano con i loro cue. Poi le novità: separa qualsiasi brano in voce, batteria e basso mentre suona; lascia il set del tramonto al pilota automatico mentre vai a prenderti da bere — ti restituisce i deck appena tocchi un fader; e a fine serata manda la tracklist alla compagnia. Provalo gratis stasera. Crema solare non inclusa.",
    },
    ja: {
      l1: "夕暮れのビーチバー。",
      l2: "朝日まで野外パーティー。",
      lead: "ブースへようこそ。デッキ、シンク、キュー、ループは手が覚えている場所に。rekordboxやSeratoのクレートもキューごとOK。そして新しいこと：再生中の曲をボーカル・ドラム・ベースに分離。サンセットのセットはオートパイロットに任せて、ドリンクを取りに行っても大丈夫。フェーダーに触れた瞬間にデッキを返してくれます。終わったら、今夜のトラックリストを仲間に送信。今夜、無料で試してください。日焼け止めは各自でどうぞ。",
    },
  },

  studio: {
    en: {
      l1: "Everything you mix with.",
      l2: "And a second pair of ears.",
      lead: "Welcome to the booth. Your decks, sync, cues, loops and effects are where your hands expect them, and your rekordbox, Serato or Traktor crates come along with their cues and grids. Then the new things: any record taken apart into vocals, drums and bass while it plays; a whole karaoke night in the same download; and an assistant that suggests the next record and says why, waits for your yes, and lets go the moment you touch a control. Try it free tonight. The neighbours will cope.",
    },
    es: {
      l1: "Todo con lo que mezclas.",
      l2: "Y un segundo par de oídos.",
      lead: "Bienvenido a la cabina. Tus platos, el sync, los cues, los loops y los efectos están donde tus manos los esperan, y tus crates de rekordbox, Serato o Traktor llegan con sus cues y sus grids. Y luego lo nuevo: cualquier tema separado en voz, batería y bajo mientras suena; una noche de karaoke completa en la misma descarga; y un asistente que te sugiere el próximo tema y te dice por qué, espera tu sí y suelta el control en cuanto tocas un botón. Pruébalo gratis esta noche. Los vecinos sobrevivirán.",
    },
    pt: {
      l1: "Tudo com que você mixa.",
      l2: "E um segundo par de ouvidos.",
      lead: "Bem-vindo à cabine. Seus decks, o sync, os cues, os loops e os efeitos estão onde suas mãos esperam, e suas crates do rekordbox, Serato ou Traktor chegam com seus cues e grids. Depois, as novidades: qualquer faixa separada em voz, bateria e baixo enquanto toca; uma noite inteira de karaokê no mesmo download; e um assistente que sugere a próxima faixa e diz por quê, espera o seu sim e solta o controle assim que você toca num botão. Teste de graça hoje à noite. Os vizinhos que lutem.",
    },
    de: {
      l1: "Alles, womit du mixt.",
      l2: "Und ein zweites Paar Ohren.",
      lead: "Willkommen in der Kanzel. Decks, Sync, Cues, Loops und Effekte sind da, wo deine Hände sie erwarten, und deine Crates aus rekordbox, Serato oder Traktor kommen mit ihren Cues und Grids mit. Dann das Neue: jeder Track in Stimme, Drums und Bass zerlegt, während er läuft; ein ganzer Karaoke-Abend im selben Download; und ein Assistent, der den nächsten Track vorschlägt und sagt warum, auf dein Ja wartet und loslässt, sobald du einen Regler berührst. Heute Nacht kostenlos ausprobieren. Die Nachbarn halten das aus.",
    },
    fr: {
      l1: "Tout ce avec quoi vous mixez.",
      l2: "Et une deuxième paire d'oreilles.",
      lead: "Bienvenue en cabine. Vos platines, le sync, les cues, les boucles et les effets sont là où vos mains les attendent, et vos crates rekordbox, Serato ou Traktor arrivent avec leurs cues et leurs grilles. Puis les nouveautés : n'importe quel morceau séparé en voix, batterie et basse pendant qu'il joue ; une soirée karaoké complète dans le même téléchargement ; et un assistant qui propose le prochain morceau en disant pourquoi, attend votre feu vert et lâche les commandes dès que vous touchez un bouton. À essayer gratuitement ce soir. Les voisins s'en remettront.",
    },
    it: {
      l1: "Tutto quello con cui mixi.",
      l2: "E un secondo paio di orecchie.",
      lead: "Benvenuto in consolle. I tuoi deck, il sync, i cue, i loop e gli effetti sono dove le tue mani li cercano, e le tue crate di rekordbox, Serato o Traktor arrivano con i loro cue e le loro griglie. Poi le novità: qualsiasi brano separato in voce, batteria e basso mentre suona; un'intera serata karaoke nello stesso download; e un assistente che ti suggerisce il prossimo brano e ti dice perché, aspetta il tuo sì e lascia il controllo appena tocchi un comando. Provalo gratis stasera. I vicini sopravviveranno.",
    },
    ja: {
      l1: "ミックスに要るもの、全部。",
      l2: "そして、もうひとつの耳。",
      lead: "ブースへようこそ。デッキ、シンク、キュー、ループ、エフェクトは手が覚えている場所に。rekordbox・Serato・TraktorのクレートもキューとBPMグリッドごと引き継げます。そして新しいこと：再生中の曲をボーカル・ドラム・ベースにその場で分離。カラオケナイトがまるごと同じダウンロードに。次の曲を理由つきで提案し、あなたのOKを待ち、コントロールに触れた瞬間に手を離すアシスタント。今夜、無料で試してください。ご近所への音量配慮だけは、お忘れなく。",
    },
  },
} satisfies Record<SkinId, Record<BuiltInLang, Welcome>>) as Record<SkinId, Record<Lang, Welcome>>;
