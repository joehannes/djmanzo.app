/**
 * The assistant's own questions, answered in advance, in every language the
 * site speaks. A question offered as a button is answered from here, at
 * once and the same for everyone; only a question the visitor writes in
 * their own words goes to the AI (`/api/guide`).
 *
 * Every answer is what `shared/facts.ts` says ships, with its caveats where
 * they matter to the person asking: a controller mapping that has not met
 * its device, Windows that nobody has run, karaoke duets still to come, no
 * gig yet. When a fact changes, change its answer here in all seven.
 */

import type { Action } from "../../../shared/guide";
import type { BuiltInLang, Lang, PackLang } from "./strings";

export interface Canned {
  id: string;
  /** A packed language's question and answer arrive with its pack (`packs.ts`). */
  q: Record<BuiltInLang, string> & Partial<Record<PackLang, string>>;
  a: Record<BuiltInLang, string> & Partial<Record<PackLang, string>>;
  actions: Action[];
}

export const CANNED: Canned[] = [
  {
    id: "different",
    actions: [{ kind: "go_to", value: "needle" }],
    q: {
      en: "What makes djmanzo different?",
      es: "¿Qué hace diferente a djmanzo?",
      pt: "O que o djmanzo tem de diferente?",
      de: "Was ist an djmanzo anders?",
      fr: "Qu'est-ce qui rend djmanzo différent ?",
      it: "Cosa rende djmanzo diverso?",
      ja: "djmanzoは何が違うの？",
    },
    a: {
      en: "Any record split into vocals, drums and bass while it plays; an assistant that suggests the next record with its reasons, waits for your yes, and steps back the moment you touch a control; a whole karaoke night in the same download; and native Linux as well as macOS. The Hobbyist edition is free, for ever.",
      es: "Cualquier tema separado en voz, batería y bajo mientras suena; un asistente que te sugiere el siguiente tema con sus razones, espera tu sí y se aparta en cuanto tocas un control; una noche de karaoke completa en la misma descarga; y Linux nativo además de macOS. La edición Hobbyist es gratis, para siempre.",
      pt: "Qualquer faixa separada em voz, bateria e baixo enquanto toca; um assistente que sugere a próxima faixa com os motivos, espera o seu sim e sai de cena assim que você toca num controle; uma noite inteira de karaokê no mesmo download; e Linux nativo, além do macOS. A edição Hobbyist é grátis, para sempre.",
      de: "Jeder Track live in Stimme, Drums und Bass zerlegt, während er läuft; ein Assistent, der den nächsten Track mit Begründung vorschlägt, auf dein Ja wartet und zurücktritt, sobald du einen Regler berührst; ein ganzer Karaoke-Abend im selben Download; und Linux nativ, nicht nur macOS. Die Hobbyist-Edition ist kostenlos, für immer.",
      fr: "N'importe quel morceau séparé en voix, batterie et basse pendant qu'il joue ; un assistant qui propose le morceau suivant avec ses raisons, attend votre accord et s'efface dès que vous touchez une commande ; une soirée karaoké complète dans le même téléchargement ; et Linux en natif, en plus de macOS. L'édition Hobbyist est gratuite, pour toujours.",
      it: "Qualsiasi brano separato in voce, batteria e basso mentre suona; un assistente che ti suggerisce il prossimo brano con le sue ragioni, aspetta il tuo sì e si fa da parte appena tocchi un comando; un'intera serata karaoke nello stesso download; e Linux nativo oltre a macOS. L'edizione Hobbyist è gratis, per sempre.",
      ja: "再生中のどの曲もボーカル・ドラム・ベースに分離。次の一曲を理由つきで提案し、あなたのOKを待ち、コントロールに触れた瞬間に手を離すアシスタント。カラオケナイトまるごとが同じダウンロードに。そしてmacOSだけでなくLinuxにもネイティブ対応。Hobbyistエディションはずっと無料です。",
    },
  },
  {
    id: "free",
    actions: [{ kind: "start_trial", value: "" }],
    q: {
      en: "Is it free?",
      es: "¿Es gratis?",
      pt: "É grátis?",
      de: "Ist es kostenlos?",
      fr: "C'est gratuit ?",
      it: "È gratis?",
      ja: "無料ですか？",
    },
    a: {
      en: "The Hobbyist edition is, for ever: two decks, the mixer, the library, cues, loops and pads, the effects, the sampler, recording, the keyboard and a controller. Any other edition can be tried free for seven days, once per account; then djmanzo is the Hobbyist edition again, and nothing you made is lost.",
      es: "La edición Hobbyist lo es, para siempre: dos platos, el mezclador, la biblioteca, cues, loops y pads, los efectos, el sampler, la grabación, el teclado y un controlador. Cualquier otra edición se puede probar gratis siete días, una vez por cuenta; después djmanzo vuelve a ser la edición Hobbyist y no pierdes nada de lo que hiciste.",
      pt: "A edição Hobbyist é, para sempre: dois decks, o mixer, a biblioteca, cues, loops e pads, os efeitos, o sampler, a gravação, o teclado e um controlador. Qualquer outra edição pode ser testada de graça por sete dias, uma vez por conta; depois o djmanzo volta a ser a edição Hobbyist e nada do que você fez se perde.",
      de: "Die Hobbyist-Edition ist es, für immer: zwei Decks, der Mixer, die Bibliothek, Cues, Loops und Pads, die Effekte, der Sampler, die Aufnahme, die Tastatur und ein Controller. Jede andere Edition kannst du sieben Tage kostenlos testen, einmal pro Konto; danach ist djmanzo wieder die Hobbyist-Edition, und nichts, was du gemacht hast, geht verloren.",
      fr: "L'édition Hobbyist l'est, pour toujours : deux platines, la table de mixage, la bibliothèque, les cues, boucles et pads, les effets, le sampler, l'enregistrement, le clavier et un contrôleur. Toute autre édition s'essaie gratuitement sept jours, une fois par compte ; ensuite djmanzo redevient l'édition Hobbyist, et rien de ce que vous avez fait n'est perdu.",
      it: "L'edizione Hobbyist lo è, per sempre: due deck, il mixer, la libreria, cue, loop e pad, gli effetti, il sampler, la registrazione, la tastiera e un controller. Ogni altra edizione si può provare gratis per sette giorni, una volta per account; poi djmanzo torna l'edizione Hobbyist e niente di ciò che hai fatto va perso.",
      ja: "Hobbyistエディションはずっと無料です。2デッキ、ミキサー、ライブラリ、キュー・ループ・パッド、エフェクト、サンプラー、録音、キーボード操作とコントローラー1台。ほかのエディションはアカウントごとに1回、7日間無料で試せます。その後はHobbyistエディションに戻り、作ったものは何も失われません。",
    },
  },
  {
    id: "edition",
    actions: [{ kind: "go_to", value: "amp" }],
    q: {
      en: "Which edition fits me?",
      es: "¿Qué edición me conviene?",
      pt: "Qual edição combina comigo?",
      de: "Welche Edition passt zu mir?",
      fr: "Quelle édition me convient ?",
      it: "Quale edizione fa per me?",
      ja: "どのエディションが合う？",
    },
    a: {
      en: "Hobbyist, free, if you play for fun. Auto-Pilot if the music should run itself at a party or a bar. Karaoke for hosts and bars. Apprentice if you are learning, with a teacher and an assistant. Pro DJ for the working DJ: everything except karaoke and the teacher. Full for all of it — or a Custom edition, built from the modules you pick.",
      es: "Hobbyist, gratis, si pinchas por diversión. Auto-Pilot si la música debe sonar sola en una fiesta o un bar. Karaoke para anfitriones y bares. Apprentice si estás aprendiendo, con un profesor y un asistente. Pro DJ para quien vive de pinchar: todo menos el karaoke y el profesor. Full para tenerlo todo, o una edición Custom con los módulos que elijas.",
      pt: "Hobbyist, grátis, se você toca por diversão. Auto-Pilot se a música deve rolar sozinha numa festa ou num bar. Karaoke para anfitriões e bares. Apprentice se você está aprendendo, com um professor e um assistente. Pro DJ para quem vive de tocar: tudo menos o karaokê e o professor. Full para ter tudo — ou uma edição Custom, com os módulos que você escolher.",
      de: "Hobbyist, kostenlos, wenn du zum Spaß auflegst. Auto-Pilot, wenn die Musik auf einer Party oder in einer Bar von selbst laufen soll. Karaoke für Gastgeber und Bars. Apprentice, wenn du es lernst, mit Lehrer und Assistent. Pro DJ für alle, die davon leben: alles außer Karaoke und Lehrer. Full für alles – oder eine Custom-Edition aus den Modulen, die du wählst.",
      fr: "Hobbyist, gratuite, si vous mixez pour le plaisir. Auto-Pilot si la musique doit tourner seule à une fête ou dans un bar. Karaoke pour les animateurs et les bars. Apprentice si vous apprenez, avec un professeur et un assistant. Pro DJ pour les DJ qui en vivent : tout sauf le karaoké et le professeur. Full pour tout avoir — ou une édition Custom, avec les modules que vous choisissez.",
      it: "Hobbyist, gratis, se suoni per divertimento. Auto-Pilot se la musica deve andare da sola a una festa o in un bar. Karaoke per chi conduce le serate e per i bar. Apprentice se stai imparando, con un insegnante e un assistente. Pro DJ per chi ci lavora: tutto tranne il karaoke e l'insegnante. Full per avere tutto — oppure un'edizione Custom con i moduli che scegli tu.",
      ja: "趣味でプレイするなら無料のHobbyist。パーティーやバーで音楽を自動で流したいならAuto-Pilot。カラオケのホストやバーにはKaraoke。学んでいる途中なら、先生とアシスタント付きのApprentice。仕事でプレイするDJにはPro DJ（カラオケと先生以外すべて）。全部ほしいならFull、または必要なモジュールだけを選ぶCustomエディションも。",
    },
  },
  {
    id: "controller",
    actions: [{ kind: "go_to", value: "floor" }],
    q: {
      en: "Will my controller work?",
      es: "¿Funcionará mi controlador?",
      pt: "Meu controlador vai funcionar?",
      de: "Funktioniert mein Controller?",
      fr: "Mon contrôleur va-t-il fonctionner ?",
      it: "Il mio controller funzionerà?",
      ja: "手持ちのコントローラーは使える？",
    },
    a: {
      en: "Mappings ship for Pioneer's DDJ-400 and FLX4 family, DDJ-200, DDJ-SR and CDJ-3000 (in HID mode), Denon MC4000, Hercules Inpulse 300, Numark DJ2GO, Reloop Mixon 4, the Roland DJ-707M's decks and the Launchpad Mini MK3, plus a generic two-deck mapping, each written from its maker's MIDI table. Honestly: none has yet been played on the device itself. Anything else you can map yourself.",
      es: "Hay mapeos para la familia DDJ-400 y FLX4 de Pioneer, DDJ-200, DDJ-SR y CDJ-3000 (en modo HID), Denon MC4000, Hercules Inpulse 300, Numark DJ2GO, Reloop Mixon 4, los platos del Roland DJ-707M y el Launchpad Mini MK3, más uno genérico de dos platos, cada uno escrito a partir de la tabla MIDI del fabricante. Con sinceridad: ninguno se ha tocado aún en el aparato real. Cualquier otro lo puedes mapear tú.",
      pt: "Há mapeamentos para a família DDJ-400 e FLX4 da Pioneer, DDJ-200, DDJ-SR e CDJ-3000 (em modo HID), Denon MC4000, Hercules Inpulse 300, Numark DJ2GO, Reloop Mixon 4, os decks do Roland DJ-707M e o Launchpad Mini MK3, além de um genérico de dois decks, cada um escrito a partir da tabela MIDI do fabricante. Sendo sincero: nenhum foi tocado ainda no aparelho de verdade. Qualquer outro você pode mapear sozinho.",
      de: "Mappings gibt es für Pioneers DDJ-400- und FLX4-Familie, DDJ-200, DDJ-SR und CDJ-3000 (im HID-Modus), Denon MC4000, Hercules Inpulse 300, Numark DJ2GO, Reloop Mixon 4, die Decks des Roland DJ-707M und das Launchpad Mini MK3, dazu ein allgemeines Zwei-Deck-Mapping, jedes nach der MIDI-Tabelle des Herstellers geschrieben. Ehrlich gesagt: Keins wurde bisher am echten Gerät gespielt. Alles andere kannst du selbst mappen.",
      fr: "Des mappings existent pour la famille DDJ-400 et FLX4 de Pioneer, le DDJ-200, le DDJ-SR et la CDJ-3000 (en mode HID), le Denon MC4000, l'Hercules Inpulse 300, le Numark DJ2GO, le Reloop Mixon 4, les platines du Roland DJ-707M et le Launchpad Mini MK3, plus un mapping générique à deux platines, chacun écrit d'après la table MIDI du fabricant. Honnêtement : aucun n'a encore été joué sur l'appareil réel. Tout autre contrôleur, vous pouvez le mapper vous-même.",
      it: "Ci sono mappature per la famiglia DDJ-400 e FLX4 di Pioneer, DDJ-200, DDJ-SR e CDJ-3000 (in modalità HID), Denon MC4000, Hercules Inpulse 300, Numark DJ2GO, Reloop Mixon 4, i deck del Roland DJ-707M e il Launchpad Mini MK3, più una mappatura generica a due deck, ognuna scritta dalla tabella MIDI del produttore. Onestamente: nessuna è stata ancora suonata sul dispositivo vero. Qualsiasi altro controller puoi mapparlo tu.",
      ja: "PioneerのDDJ-400／FLX4ファミリー、DDJ-200、DDJ-SR、CDJ-3000（HIDモード）、Denon MC4000、Hercules Inpulse 300、Numark DJ2GO、Reloop Mixon 4、Roland DJ-707Mのデッキ部、Launchpad Mini MK3、そして汎用の2デッキ用マッピングを同梱。どれもメーカーのMIDI表から書いたものです。正直に言うと、実機ではまだ一度も演奏していません。そのほかの機材は自分でマッピングできます。",
    },
  },
  {
    id: "systems",
    actions: [{ kind: "go_to", value: "afterglow" }],
    q: {
      en: "Does it run on my computer?",
      es: "¿Funciona en mi ordenador?",
      pt: "Roda no meu computador?",
      de: "Läuft es auf meinem Computer?",
      fr: "Est-ce que ça tourne sur mon ordinateur ?",
      it: "Funziona sul mio computer?",
      ja: "自分のパソコンで動く？",
    },
    a: {
      en: "On macOS, Apple silicon and Intel, with a karaoke build that reaches back to macOS 10.13 on older Intel Macs; and natively on Linux, through PipeWire or ALSA, as a .deb, an .rpm or an AppImage. Windows is built and packaged with every release, but nobody has run it on a Windows machine yet. Phones are not a platform.",
      es: "En macOS, Apple silicon e Intel, con una versión karaoke que llega hasta macOS 10.13 en Macs Intel antiguos; y de forma nativa en Linux, con PipeWire o ALSA, como .deb, .rpm o AppImage. Windows se compila y empaqueta en cada versión, pero aún nadie lo ha ejecutado en un equipo con Windows. Los móviles no son una plataforma.",
      pt: "No macOS, Apple silicon e Intel, com uma versão karaokê que vai até o macOS 10.13 em Macs Intel antigos; e nativo no Linux, com PipeWire ou ALSA, em .deb, .rpm ou AppImage. O Windows é compilado e empacotado em cada versão, mas ninguém o rodou ainda num computador com Windows. Celulares não são uma plataforma.",
      de: "Auf macOS, Apple silicon und Intel, mit einem Karaoke-Build, der auf älteren Intel-Macs bis macOS 10.13 zurückreicht; und nativ auf Linux, über PipeWire oder ALSA, als .deb, .rpm oder AppImage. Windows wird mit jeder Version gebaut und verpackt, aber noch niemand hat es auf einem Windows-Rechner gestartet. Smartphones sind keine Plattform.",
      fr: "Sur macOS, Apple silicon et Intel, avec une version karaoké qui remonte jusqu'à macOS 10.13 sur les anciens Mac Intel ; et en natif sur Linux, via PipeWire ou ALSA, en .deb, .rpm ou AppImage. Windows est compilé et empaqueté à chaque version, mais personne ne l'a encore lancé sur une machine Windows. Les téléphones ne sont pas une plateforme.",
      it: "Su macOS, Apple silicon e Intel, con una build karaoke che arriva fino a macOS 10.13 sui vecchi Mac Intel; e in modo nativo su Linux, con PipeWire o ALSA, come .deb, .rpm o AppImage. Windows viene compilato e impacchettato a ogni versione, ma nessuno l'ha ancora avviato su un computer Windows. I telefoni non sono una piattaforma.",
      ja: "macOS（Apple siliconとIntel）。古いIntel Mac向けにはmacOS 10.13まで動くカラオケ版もあります。LinuxにはPipeWireまたはALSAでネイティブ対応し、.deb・.rpm・AppImageで配布。Windows版も毎リリースでビルド・パッケージしていますが、まだ実際のWindowsマシンで動かした人はいません。スマートフォンは対象外です。",
    },
  },
  {
    id: "library",
    actions: [{ kind: "go_to", value: "groove" }],
    q: {
      en: "Can I bring my rekordbox, Serato or Traktor library?",
      es: "¿Puedo traer mi biblioteca de rekordbox, Serato o Traktor?",
      pt: "Posso trazer minha biblioteca do rekordbox, Serato ou Traktor?",
      de: "Kann ich meine rekordbox-, Serato- oder Traktor-Bibliothek mitnehmen?",
      fr: "Puis-je importer ma bibliothèque rekordbox, Serato ou Traktor ?",
      it: "Posso portare la mia libreria di rekordbox, Serato o Traktor?",
      ja: "rekordbox・Serato・Traktorのライブラリは持ち込める？",
    },
    a: {
      en: "Yes. djmanzo imports rekordbox, Traktor and iTunes with their cues and grids, and Serato with its crates, hot cues and loops. It finds duplicates, reads every record's key and tempo, and searches as you type.",
      es: "Sí. djmanzo importa rekordbox, Traktor e iTunes con sus cues y grids, y Serato con sus crates, hot cues y loops. Encuentra duplicados, lee el tono y el tempo de cada tema y busca mientras escribes.",
      pt: "Sim. O djmanzo importa rekordbox, Traktor e iTunes com os cues e grids, e o Serato com as crates, hot cues e loops. Ele encontra duplicadas, lê o tom e o andamento de cada faixa e busca enquanto você digita.",
      de: "Ja. djmanzo importiert rekordbox, Traktor und iTunes mit Cues und Beatgrids und Serato mit Crates, Hot Cues und Loops. Es findet Duplikate, liest Tonart und Tempo jedes Tracks und sucht, während du tippst.",
      fr: "Oui. djmanzo importe rekordbox, Traktor et iTunes avec leurs cues et leurs grilles, et Serato avec ses crates, hot cues et boucles. Il trouve les doublons, lit la tonalité et le tempo de chaque morceau et cherche pendant que vous tapez.",
      it: "Sì. djmanzo importa rekordbox, Traktor e iTunes con i loro cue e le griglie, e Serato con crate, hot cue e loop. Trova i doppioni, legge tonalità e tempo di ogni brano e cerca mentre scrivi.",
      ja: "はい。rekordbox・Traktor・iTunesはキューとビートグリッドごと、Seratoはクレート・ホットキュー・ループごと取り込めます。重複を見つけ、全曲のキーとテンポを解析し、入力したそばから検索します。",
    },
  },
  {
    id: "karaoke",
    actions: [{ kind: "go_to", value: "voice" }],
    q: {
      en: "How does a karaoke night work?",
      es: "¿Cómo funciona una noche de karaoke?",
      pt: "Como funciona uma noite de karaokê?",
      de: "Wie läuft ein Karaoke-Abend?",
      fr: "Comment se passe une soirée karaoké ?",
      it: "Come funziona una serata karaoke?",
      ja: "カラオケナイトはどう進む？",
    },
    a: {
      en: "Guests join the queue from a QR code, with no app to install. The singers' screen shows the words in time, with the vocal taken out of your own records; each singer gets a microphone and effects, scored singing and versus rounds if you like, and there is a quiz made from your collection. djmanzo can even suggest the key a singer should sing in. Duet parts and phones as microphones are still to come.",
      es: "Los invitados se apuntan a la cola con un código QR, sin instalar nada. La pantalla de los cantantes muestra la letra a tiempo, con la voz quitada de tus propios temas; cada cantante tiene su micrófono y sus efectos, puntuación y duelos si quieres, y hay un quiz hecho con tu colección. djmanzo incluso sugiere el tono en que debe cantar cada uno. Las partes de dúo y los móviles como micrófono aún están por llegar.",
      pt: "Os convidados entram na fila por um QR code, sem instalar nada. A tela dos cantores mostra a letra no tempo, com a voz tirada das suas próprias faixas; cada cantor tem microfone e efeitos, pontuação e duelos se você quiser, e há um quiz feito com a sua coleção. O djmanzo até sugere o tom em que cada um deve cantar. Partes de dueto e celulares como microfone ainda estão por vir.",
      de: "Gäste reihen sich per QR-Code ein, ganz ohne App. Der Bildschirm für die Sänger zeigt den Text im Takt, die Stimme aus deinen eigenen Tracks entfernt; jede Sängerin und jeder Sänger bekommt Mikrofon und Effekte, auf Wunsch Punkte und Duelle, und es gibt ein Quiz aus deiner Sammlung. djmanzo schlägt sogar die Tonart vor, in der jemand singen sollte. Duett-Stimmen und Handys als Mikrofon kommen noch.",
      fr: "Les invités rejoignent la file avec un QR code, sans application à installer. L'écran des chanteurs affiche les paroles en rythme, la voix retirée de vos propres morceaux ; chaque chanteur a son micro et ses effets, un score et des duels si vous voulez, et il y a un quiz tiré de votre collection. djmanzo suggère même la tonalité dans laquelle chacun devrait chanter. Les parties de duo et les téléphones comme micros sont encore à venir.",
      it: "Gli ospiti si mettono in coda con un QR code, senza installare niente. Lo schermo dei cantanti mostra il testo a tempo, con la voce tolta dai tuoi brani; ogni cantante ha il suo microfono e i suoi effetti, punteggio e sfide se vuoi, e c'è un quiz fatto con la tua collezione. djmanzo suggerisce persino la tonalità in cui ognuno dovrebbe cantare. Le parti in duetto e i telefoni come microfono arriveranno più avanti.",
      ja: "ゲストはQRコードから予約に並べて、アプリのインストールは不要。歌い手用の画面には歌詞がタイミングよく流れ、あなたの曲からボーカルを抜いて伴奏にします。歌い手ごとにマイクとエフェクト、お好みで採点や対戦、手持ちの曲から作るクイズも。歌い手に合うキーまで提案します。デュエットのパート分けとスマホのマイク化はこれからです。",
    },
  },
  {
    id: "gig",
    actions: [{ kind: "go_to", value: "afterglow" }],
    q: {
      en: "Is it ready for a real gig?",
      es: "¿Está listo para un bolo de verdad?",
      pt: "Está pronto para uma festa de verdade?",
      de: "Ist es bereit für einen echten Gig?",
      fr: "Est-il prêt pour une vraie date ?",
      it: "È pronto per una serata vera?",
      ja: "本番のギグで使える？",
    },
    a: {
      en: "Not proven yet, and we would rather say so. It is in beta: everything is tested in the code, but none of it has been through a night with a crowd. There is a SAFE button that takes every control back and flattens the sound in one press, and the set can be recorded to disk. Try it at home first, and tell us what you find.",
      es: "Aún no está probado, y preferimos decirlo. Está en beta: todo está probado en el código, pero nada ha pasado todavía por una noche con público. Hay un botón SAFE que recupera todos los controles y deja el sonido plano con una pulsación, y la sesión se puede grabar a disco. Pruébalo primero en casa y cuéntanos qué encuentras.",
      pt: "Ainda não foi provado, e preferimos dizer isso. Está em beta: tudo é testado no código, mas nada passou ainda por uma noite com público. Há um botão SAFE que retoma todos os controles e deixa o som neutro num toque, e o set pode ser gravado em disco. Teste em casa primeiro e conte para a gente o que encontrar.",
      de: "Noch nicht bewiesen, und das sagen wir lieber gleich. Es ist in der Beta: Alles ist im Code getestet, aber nichts davon hat schon eine Nacht vor Publikum hinter sich. Ein SAFE-Knopf holt mit einem Druck jeden Regler zurück und macht den Klang neutral, und das Set lässt sich auf die Platte aufnehmen. Probier es erst zu Hause aus und sag uns, was du findest.",
      fr: "Pas encore éprouvé, et nous préférons le dire. Il est en bêta : tout est testé dans le code, mais rien n'a encore passé une nuit devant un public. Un bouton SAFE reprend toutes les commandes et remet le son à plat d'une pression, et le set peut être enregistré sur disque. Essayez-le d'abord chez vous, et dites-nous ce que vous trouvez.",
      it: "Non è ancora provato, e preferiamo dirlo. È in beta: tutto è testato nel codice, ma niente ha ancora affrontato una serata con il pubblico. Un pulsante SAFE riprende ogni comando e rende il suono neutro con un tocco, e il set si può registrare su disco. Provalo prima a casa e raccontaci cosa trovi.",
      ja: "まだ実証されていません。正直にお伝えします。現在ベータ版で、すべてコード上ではテスト済みですが、観客の前で一晩を通した実績はまだありません。ワンプッシュで全コントロールを取り戻し音をフラットに戻すSAFEボタンがあり、セットはディスクに録音できます。まずは自宅で試して、気づいたことを教えてください。",
    },
  },
];

export const CANNED_BY_ID: Record<string, Canned> = Object.fromEntries(CANNED.map((c) => [c.id, c]));

/** A canned question in `lang`, English where its pack has none. */
export const questionOf = (c: Canned, lang: Lang): string => c.q[lang] ?? c.q.en;
/** A canned answer in `lang`, English where its pack has none. */
export const answerOf = (c: Canned, lang: Lang): string => c.a[lang] ?? c.a.en;
