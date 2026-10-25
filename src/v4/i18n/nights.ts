/**
 * Kinds of nights (`pages/Nights.svelte`, the island's gig board until 25
 * October), each walked through in djmanzo's phases of a night with what
 * djmanzo does at each and the edition it needs — in every language the
 * site speaks. Edition names and djmanzo's own labels (SAFE, the Wedding and
 * Sunset themes, the Karaoke activity) stay as the application shows them.
 */

import type { Lang } from "./strings";

export const NIGHT_IDS = ["bedroom", "learning", "family", "wedding", "club", "bar", "karaoke", "radio", "allin"] as const;
export type NightId = (typeof NIGHT_IDS)[number];

export interface Night {
  title: string;
  why: string;
  /** The night's phases, in order: each its name and what djmanzo does then. */
  phases: [string, string][];
}

export interface NightsWords {
  eyebrow: string;
  /** html */
  title: string;
  lead: string;
  theEdition: string;
  /** `{edition}` is the edition's name. */
  editions: string;
  karaoke: string;
  nights: Record<NightId, Night>;
}

export const NIGHTS: Record<Lang, NightsWords> = {
  en: {
    eyebrow: "Kinds of nights",
    title: "Every night asks<br />for something different.",
    lead: "Pick yours: what djmanzo does in each part of it, and which edition it needs.",
    theEdition: "The edition:",
    editions: "{edition}: the editions and prices",
    karaoke: "The karaoke, on the home page",
    nights: {
      bedroom: {
        title: "Practising at home",
        why: "Everything basic a DJ needs, at the lowest price; a laptop alone is enough.",
        phases: [
          ["Setup", "No controller? The keyboard is one. Import the folder of music you already have; djmanzo analyses tempo, key and phrases."],
          ["Practice", "Loop a passage and mix into it again; the phrase markers show where a mix will land."],
          ["Review", "Record the master and listen back to what the room would have heard."],
        ],
      },
      learning: {
        title: "Learning to DJ",
        why: "The Hobbyist's, with the teacher and the assistant: they show you what to try next and name what you just did.",
        phases: [
          ["Warm up", "A practice deck only your headphones hear: try a record, a loop or an effect while the music plays on."],
          ["Practice", "The coach names what your hands just did, catches one mistake at a time and sets the easiest thing you haven't tried."],
          ["Learn", "Twenty-eight techniques, each with what it needs and when it works, and a quiz to check yourself."],
        ],
      },
      family: {
        title: "Family party & cookout",
        why: "You are the host as much as the DJ: Auto-Pilot mixes two decks itself, and you take over whenever you like.",
        phases: [
          ["Warm-up", "Merengue and bachata classics while the food cooks; the autopilot keeps mixing while you're at the grill."],
          ["Build", "It mixes from a set assembled with an arc, no repeats and no two records by one artist in a row. Touch a fader and the deck is yours."],
          ["Peak", "Requests from phones: guests scan a QR code and type what they want to hear. No app to install."],
          ["Closing", "Slow it down for the last dance, by hand; the night's tracklist is saved."],
        ],
      },
      wedding: {
        title: "Weddings & events",
        why: "A paid night that must not stop: Pro DJ adds the assistant and the autopilot, any controller, and the event kept step by step.",
        phases: [
          ["Setup", "The Wedding theme: a screen calm enough for a room that is not there for the DJ. Set the first-dance record aside."],
          ["Dinner", "Low, warm, unobtrusive: lounge and bolero; the autopilot carries it while you talk to the planner."],
          ["Peak", "Merengue for the aunts, reggaeton for the cousins — the set planner keeps the arc and never repeats an artist twice in a row."],
          ["Emergency", "SAFE takes every control back at once without stopping the music. Nothing a DJ hopes to need, everything they want to have."],
        ],
      },
      club: {
        title: "Club resident",
        why: "Decks three to six, live stems, timecode vinyl, replay, and MIDI clock for the light desk.",
        phases: [
          ["Warm-up", "Lower tempos, no anthems; djmanzo's night engine reads the room's loudness and tempo against the whole night so far."],
          ["Build", "Phrase-locked mixes: the transition planner shows where a mix can start and how long it can run, with its reasons."],
          ["Peak", "Stems: one record's vocal over another's drums, live, with no added latency."],
          ["Closing", "Record the master; the whole set is saved as data to replay or re-render at studio quality."],
        ],
      },
      bar: {
        title: "Bar & beach bar",
        why: "Long hours and a bar to run: Auto-Pilot mixes the afternoon itself, and the deck is yours the moment you touch it. Pro DJ if you bring turntables.",
        phases: [
          ["Afternoon", "The Sunset theme, lounge and kompa; the autopilot runs the set while you serve, and touching a control takes it back."],
          ["Golden hour", "Bachata and salsa, mixed from a set assembled with an arc."],
          ["Night", "Dembow and reggaeton; the room's requests come in from a printed QR sticker on the bar."],
        ],
      },
      karaoke: {
        title: "Karaoke night",
        why: "The singers are the show: the rotation, the singers' screen, vocals out, a microphone per singer — and the Hobbyist's two decks for a DJ set between them.",
        phases: [
          ["Doors", "Guests put their names down from their phones; the rotation keeps it fair, one song each."],
          ["Singing", "Words lit in time on the singers' screen; the key shifted for the singer; a guide voice for a song new to them."],
          ["Between singers", "Break music fades under the next singer; a quiz keeps the room in it."],
          ["Last song", "Each performance is recorded."],
        ],
      },
      radio: {
        title: "Radio & live streams",
        why: "Going live is in Pro DJ: the stream overlay and the set shared, with stems and replay.",
        phases: [
          ["On air", "A now-playing overlay for OBS — Twitch, YouTube, TikTok, Kick — naming the record listeners actually hear."],
          ["After", "The set as a tracklist, shared to WhatsApp, X, Bluesky or Threads with the message already written."],
        ],
      },
      allin: {
        title: "DJ and karaoke host",
        why: "Friday the club, Saturday the karaoke bar, Sunday a wedding — both halves in one application.",
        phases: [
          ["Early", "DJ sets with the whole Pro toolkit."],
          ["Midnight", "Switch to the Karaoke activity: the same decks, the singers' panel opens beside them."],
          ["Late", "Back to the decks for the last hour, while the singers' screen shows the room's emoji."],
        ],
      },
    },
  },
  es: {
    eyebrow: "Tipos de noche",
    title: "Cada noche pide<br />algo distinto.",
    lead: "Elige la tuya: lo que hace djmanzo en cada parte y qué edición necesita.",
    theEdition: "La edición:",
    editions: "{edition}: las ediciones y los precios",
    karaoke: "El karaoke, en la página principal",
    nights: {
      bedroom: {
        title: "Practicar en casa",
        why: "Todo lo básico que necesita un DJ, al precio más bajo; basta con un portátil.",
        phases: [
          ["Preparación", "¿Sin controlador? El teclado es uno. Importa la carpeta de música que ya tienes; djmanzo analiza tempo, tonalidad y frases."],
          ["Práctica", "Pon un pasaje en loop y vuelve a mezclar hacia él; las marcas de frase muestran dónde caerá una mezcla."],
          ["Repaso", "Graba el master y escucha lo que habría oído la sala."],
        ],
      },
      learning: {
        title: "Aprender a pinchar",
        why: "Lo de la Hobbyist, con el profesor y el asistente: te enseñan qué probar después y ponen nombre a lo que acabas de hacer.",
        phases: [
          ["Calentar", "Un plato de práctica que solo oyen tus auriculares: prueba un disco, un loop o un efecto mientras sigue la música."],
          ["Practicar", "El coach nombra lo que acaban de hacer tus manos, señala un error cada vez y te propone lo más fácil que aún no has probado."],
          ["Aprender", "Veintiocho técnicas, cada una con lo que necesita y cuándo funciona, y un test para comprobarte."],
        ],
      },
      family: {
        title: "Fiesta familiar y barbacoa",
        why: "Eres tanto anfitrión como DJ: Auto-Pilot mezcla dos platos solo, y tú tomas el mando cuando quieras.",
        phases: [
          ["Calentamiento", "Clásicos de merengue y bachata mientras se hace la comida; el piloto automático sigue mezclando mientras estás en la parrilla."],
          ["Subida", "Mezcla desde un set armado con un arco, sin repeticiones ni dos discos seguidos del mismo artista. Toca un fader y el plato es tuyo."],
          ["Pico", "Peticiones desde el móvil: los invitados escanean un código QR y escriben lo que quieren oír. Sin app que instalar."],
          ["Cierre", "Baja el ritmo para el último baile, a mano; la lista de temas de la noche queda guardada."],
        ],
      },
      wedding: {
        title: "Bodas y eventos",
        why: "Una noche pagada que no puede pararse: Pro DJ añade el asistente y el piloto automático, cualquier controlador y el evento guardado paso a paso.",
        phases: [
          ["Preparación", "El tema Wedding: una pantalla tranquila para una sala que no está ahí por el DJ. Aparta el disco del primer baile."],
          ["Cena", "Bajo, cálido, discreto: lounge y bolero; el piloto automático lo lleva mientras hablas con quien organiza."],
          ["Pico", "Merengue para las tías, reguetón para los primos: el planificador del set mantiene el arco y nunca repite artista seguido."],
          ["Emergencia", "SAFE recupera todos los controles de golpe sin parar la música. Nada que un DJ espere necesitar, todo lo que quiere tener."],
        ],
      },
      club: {
        title: "Residente de club",
        why: "Platos tres a seis, stems en directo, vinilo de timecode, repetición del set y MIDI clock para la mesa de luces.",
        phases: [
          ["Calentamiento", "Tempos más bajos, sin himnos; el motor de la noche de djmanzo lee el volumen y el tempo de la sala frente a toda la noche hasta ahora."],
          ["Subida", "Mezclas encajadas en la frase: el planificador de transiciones muestra dónde puede empezar una mezcla y cuánto puede durar, con sus motivos."],
          ["Pico", "Stems: la voz de un disco sobre la batería de otro, en directo, sin latencia añadida."],
          ["Cierre", "Graba el master; todo el set queda guardado como datos para repetirlo o volver a renderizarlo con calidad de estudio."],
        ],
      },
      bar: {
        title: "Bar y chiringuito",
        why: "Muchas horas y una barra que atender: Auto-Pilot mezcla la tarde solo, y el plato es tuyo en cuanto lo tocas. Pro DJ si traes platos.",
        phases: [
          ["Tarde", "El tema Sunset, lounge y kompa; el piloto automático lleva el set mientras sirves, y tocar un control te lo devuelve."],
          ["Hora dorada", "Bachata y salsa, mezcladas desde un set armado con un arco."],
          ["Noche", "Dembow y reguetón; las peticiones de la sala llegan desde una pegatina QR impresa en la barra."],
        ],
      },
      karaoke: {
        title: "Noche de karaoke",
        why: "Los cantantes son el espectáculo: la rotación, la pantalla de los cantantes, la voz fuera, un micrófono por cantante, y los dos platos de la Hobbyist para un set entre ellos.",
        phases: [
          ["Puertas", "Los invitados se apuntan desde el móvil; la rotación es justa, una canción cada uno."],
          ["Cantando", "La letra se ilumina a tiempo en la pantalla de los cantantes; la tonalidad se ajusta al cantante; una voz guía para una canción que no conoce."],
          ["Entre cantantes", "La música de pausa se funde bajo el siguiente cantante; un concurso mantiene a la sala dentro."],
          ["Última canción", "Cada actuación queda grabada."],
        ],
      },
      radio: {
        title: "Radio y directos",
        why: "Salir en directo está en Pro DJ: el overlay para el stream y el set compartido, con stems y repetición.",
        phases: [
          ["En el aire", "Un overlay de lo que suena para OBS —Twitch, YouTube, TikTok, Kick— con el disco que el público oye de verdad."],
          ["Después", "El set como lista de temas, compartido en WhatsApp, X, Bluesky o Threads con el mensaje ya escrito."],
        ],
      },
      allin: {
        title: "DJ y presentador de karaoke",
        why: "El viernes el club, el sábado el bar de karaoke, el domingo una boda: las dos mitades en una sola aplicación.",
        phases: [
          ["Pronto", "Sets de DJ con todas las herramientas de Pro."],
          ["Medianoche", "Cambia a la actividad Karaoke: los mismos platos, y el panel de los cantantes se abre al lado."],
          ["Tarde", "De vuelta a los platos para la última hora, mientras la pantalla de los cantantes muestra los emojis de la sala."],
        ],
      },
    },
  },
  pt: {
    eyebrow: "Tipos de noite",
    title: "Cada noite pede<br />uma coisa diferente.",
    lead: "Escolha a sua: o que o djmanzo faz em cada parte dela e qual edição ela pede.",
    theEdition: "A edição:",
    editions: "{edition}: as edições e os preços",
    karaoke: "O karaokê, na página inicial",
    nights: {
      bedroom: {
        title: "Praticar em casa",
        why: "Tudo o que um DJ precisa de básico, pelo menor preço; um notebook basta.",
        phases: [
          ["Preparação", "Sem controlador? O teclado é um. Importe a pasta de músicas que você já tem; o djmanzo analisa tempo, tom e frases."],
          ["Prática", "Faça loop de um trecho e mixe nele de novo; as marcas de frase mostram onde uma mixagem vai cair."],
          ["Revisão", "Grave o master e ouça de volta o que a pista teria ouvido."],
        ],
      },
      learning: {
        title: "Aprender a discotecar",
        why: "O da Hobbyist, com o professor e o assistente: eles mostram o que tentar depois e dão nome ao que você acabou de fazer.",
        phases: [
          ["Aquecer", "Um deck de prática que só o seu fone ouve: teste um disco, um loop ou um efeito enquanto a música segue."],
          ["Praticar", "O coach dá nome ao que suas mãos acabaram de fazer, aponta um erro de cada vez e propõe a coisa mais fácil que você ainda não tentou."],
          ["Aprender", "Vinte e oito técnicas, cada uma com o que precisa e quando funciona, e um quiz para se testar."],
        ],
      },
      family: {
        title: "Festa de família e churrasco",
        why: "Você é tanto o anfitrião quanto o DJ: o Auto-Pilot mixa dois decks sozinho, e você assume quando quiser.",
        phases: [
          ["Aquecimento", "Clássicos de merengue e bachata enquanto a comida fica pronta; o piloto automático segue mixando enquanto você está na grelha."],
          ["Subida", "Ele mixa de um set montado com um arco, sem repetições e sem dois discos seguidos do mesmo artista. Toque num fader e o deck é seu."],
          ["Pico", "Pedidos pelo celular: os convidados escaneiam um QR code e digitam o que querem ouvir. Sem aplicativo para instalar."],
          ["Encerramento", "Desacelere para a última dança, na mão; a lista de músicas da noite fica salva."],
        ],
      },
      wedding: {
        title: "Casamentos e eventos",
        why: "Uma noite paga que não pode parar: o Pro DJ traz o assistente e o piloto automático, qualquer controlador e o evento guardado passo a passo.",
        phases: [
          ["Preparação", "O tema Wedding: uma tela calma para um salão que não está ali pelo DJ. Separe o disco da primeira dança."],
          ["Jantar", "Baixo, quente, discreto: lounge e bolero; o piloto automático conduz enquanto você fala com o cerimonial."],
          ["Pico", "Merengue para as tias, reggaeton para os primos — o planejador do set mantém o arco e nunca repete artista em seguida."],
          ["Emergência", "O SAFE devolve todos os controles de uma vez sem parar a música. Nada que um DJ espera precisar, tudo o que ele quer ter."],
        ],
      },
      club: {
        title: "Residente de clube",
        why: "Decks três a seis, stems ao vivo, vinil de timecode, replay e MIDI clock para a mesa de luz.",
        phases: [
          ["Aquecimento", "Tempos mais baixos, sem hinos; o motor da noite do djmanzo lê o volume e o tempo da pista em relação à noite toda até agora."],
          ["Subida", "Mixagens presas à frase: o planejador de transições mostra onde uma mixagem pode começar e quanto pode durar, com os motivos."],
          ["Pico", "Stems: a voz de um disco sobre a bateria de outro, ao vivo, sem latência a mais."],
          ["Encerramento", "Grave o master; o set inteiro fica salvo como dados para repetir ou renderizar de novo com qualidade de estúdio."],
        ],
      },
      bar: {
        title: "Bar e quiosque de praia",
        why: "Muitas horas e um bar para tocar: o Auto-Pilot mixa a tarde sozinho, e o deck é seu no instante em que você o toca. Pro DJ se você levar toca-discos.",
        phases: [
          ["Tarde", "O tema Sunset, lounge e kompa; o piloto automático conduz o set enquanto você serve, e tocar num controle o devolve a você."],
          ["Hora dourada", "Bachata e salsa, mixadas de um set montado com um arco."],
          ["Noite", "Dembow e reggaeton; os pedidos da pista chegam por um adesivo de QR code impresso no balcão."],
        ],
      },
      karaoke: {
        title: "Noite de karaokê",
        why: "Os cantores são o show: a rodada, a tela dos cantores, a voz fora, um microfone por cantor — e os dois decks da Hobbyist para um set entre eles.",
        phases: [
          ["Portas", "Os convidados se inscrevem pelo celular; a rodada é justa, uma música para cada um."],
          ["Cantando", "A letra acende no tempo na tela dos cantores; o tom é ajustado ao cantor; uma voz guia para uma música nova para ele."],
          ["Entre cantores", "A música de intervalo some por baixo do próximo cantor; um quiz mantém a pista ligada."],
          ["Última música", "Cada apresentação é gravada."],
        ],
      },
      radio: {
        title: "Rádio e lives",
        why: "Entrar ao vivo está no Pro DJ: o overlay da transmissão e o set compartilhado, com stems e replay.",
        phases: [
          ["No ar", "Um overlay do que está tocando para o OBS — Twitch, YouTube, TikTok, Kick — com o disco que os ouvintes realmente ouvem."],
          ["Depois", "O set como lista de músicas, compartilhado no WhatsApp, X, Bluesky ou Threads com a mensagem já escrita."],
        ],
      },
      allin: {
        title: "DJ e apresentador de karaokê",
        why: "Sexta o clube, sábado o bar de karaokê, domingo um casamento — as duas metades num aplicativo só.",
        phases: [
          ["Cedo", "Sets de DJ com todo o kit do Pro."],
          ["Meia-noite", "Mude para a atividade Karaoke: os mesmos decks, e o painel dos cantores abre ao lado."],
          ["Tarde da noite", "De volta aos decks para a última hora, enquanto a tela dos cantores mostra os emojis da pista."],
        ],
      },
    },
  },
  de: {
    eyebrow: "Arten von Abenden",
    title: "Jeder Abend verlangt<br />etwas anderes.",
    lead: "Such dir deinen aus: was djmanzo in jedem Teil davon tut, und welche Edition er braucht.",
    theEdition: "Die Edition:",
    editions: "{edition}: die Editionen und Preise",
    karaoke: "Das Karaoke, auf der Startseite",
    nights: {
      bedroom: {
        title: "Üben zu Hause",
        why: "Alles Grundlegende, was ein DJ braucht, zum niedrigsten Preis; ein Laptop allein reicht.",
        phases: [
          ["Vorbereitung", "Kein Controller? Die Tastatur ist einer. Importier den Musikordner, den du schon hast; djmanzo analysiert Tempo, Tonart und Phrasen."],
          ["Üben", "Loop eine Passage und mix noch einmal hinein; die Phrasenmarken zeigen, wo ein Mix landen wird."],
          ["Nachhören", "Nimm den Master auf und hör dir an, was der Raum gehört hätte."],
        ],
      },
      learning: {
        title: "Auflegen lernen",
        why: "Das der Hobbyist, mit dem Lehrer und dem Assistenten: Sie zeigen dir, was du als Nächstes probieren kannst, und benennen, was du gerade getan hast.",
        phases: [
          ["Aufwärmen", "Ein Übungsdeck, das nur deine Kopfhörer hören: Probier eine Platte, einen Loop oder einen Effekt, während die Musik weiterläuft."],
          ["Üben", "Der Coach benennt, was deine Hände gerade getan haben, erwischt einen Fehler nach dem anderen und schlägt das Leichteste vor, das du noch nicht probiert hast."],
          ["Lernen", "Achtundzwanzig Techniken, jede mit dem, was sie braucht und wann sie funktioniert, und ein Quiz zum Selbsttest."],
        ],
      },
      family: {
        title: "Familienfest und Grillabend",
        why: "Du bist genauso Gastgeber wie DJ: Auto-Pilot mischt zwei Decks selbst, und du übernimmst, wann immer du willst.",
        phases: [
          ["Aufwärmen", "Merengue- und Bachata-Klassiker, während das Essen gart; der Autopilot mischt weiter, während du am Grill stehst."],
          ["Aufbau", "Er mischt aus einem Set mit einem Bogen, ohne Wiederholungen und ohne zwei Platten desselben Künstlers hintereinander. Fass einen Fader an, und das Deck gehört dir."],
          ["Höhepunkt", "Wünsche vom Handy: Die Gäste scannen einen QR-Code und tippen, was sie hören wollen. Keine App zu installieren."],
          ["Ausklang", "Für den letzten Tanz langsamer werden, von Hand; die Titelliste des Abends wird gespeichert."],
        ],
      },
      wedding: {
        title: "Hochzeiten und Events",
        why: "Ein bezahlter Abend, der nicht stehen bleiben darf: Pro DJ bringt den Assistenten und den Autopiloten, jeden Controller und das Event Schritt für Schritt festgehalten.",
        phases: [
          ["Vorbereitung", "Das Theme Wedding: ein Bildschirm, ruhig genug für einen Raum, der nicht wegen des DJs da ist. Leg die Platte für den Eröffnungstanz bereit."],
          ["Dinner", "Leise, warm, unaufdringlich: Lounge und Bolero; der Autopilot trägt es, während du mit der Planerin sprichst."],
          ["Höhepunkt", "Merengue für die Tanten, Reggaeton für die Cousins — der Set-Planer hält den Bogen und wiederholt nie einen Künstler direkt hintereinander."],
          ["Notfall", "SAFE holt jeden Regler auf einmal zurück, ohne die Musik anzuhalten. Nichts, was ein DJ brauchen möchte, alles, was er haben will."],
        ],
      },
      club: {
        title: "Club-Resident",
        why: "Decks drei bis sechs, Live-Stems, Timecode-Vinyl, Replay und MIDI Clock fürs Lichtpult.",
        phases: [
          ["Aufwärmen", "Niedrigere Tempi, keine Hymnen; djmanzos Nacht-Engine liest Lautheit und Tempo des Raums im Vergleich zum ganzen bisherigen Abend."],
          ["Aufbau", "Mixe, die an der Phrase sitzen: Der Übergangsplaner zeigt, wo ein Mix beginnen und wie lange er laufen kann, mit seinen Gründen."],
          ["Höhepunkt", "Stems: der Gesang einer Platte über den Drums einer anderen, live, ohne zusätzliche Latenz."],
          ["Ausklang", "Nimm den Master auf; das ganze Set wird als Daten gespeichert, um es abzuspielen oder in Studioqualität neu zu rendern."],
        ],
      },
      bar: {
        title: "Bar und Strandbar",
        why: "Lange Stunden und eine Bar, die läuft: Auto-Pilot mischt den Nachmittag selbst, und das Deck gehört dir, sobald du es berührst. Pro DJ, wenn du Plattenspieler mitbringst.",
        phases: [
          ["Nachmittag", "Das Theme Sunset, Lounge und Kompa; der Autopilot fährt das Set, während du servierst, und ein Griff an einen Regler holt es zurück."],
          ["Goldene Stunde", "Bachata und Salsa, gemischt aus einem Set mit einem Bogen."],
          ["Nacht", "Dembow und Reggaeton; die Wünsche des Raums kommen über einen gedruckten QR-Aufkleber an der Bar."],
        ],
      },
      karaoke: {
        title: "Karaoke-Abend",
        why: "Die Sänger sind die Show: die Reihenfolge, der Bildschirm der Sänger, Gesang raus, ein Mikrofon pro Sänger — und die zwei Decks der Hobbyist für ein DJ-Set dazwischen.",
        phases: [
          ["Einlass", "Die Gäste tragen sich vom Handy aus ein; die Reihenfolge bleibt fair, ein Lied für jeden."],
          ["Singen", "Der Text leuchtet im Takt auf dem Bildschirm der Sänger; die Tonart passt sich dem Sänger an; eine Führungsstimme für ein Lied, das neu für ihn ist."],
          ["Zwischen den Sängern", "Pausenmusik blendet unter dem nächsten Sänger aus; ein Quiz hält den Raum bei der Sache."],
          ["Letztes Lied", "Jeder Auftritt wird aufgenommen."],
        ],
      },
      radio: {
        title: "Radio und Livestreams",
        why: "Live gehen steckt in Pro DJ: das Stream-Overlay und das geteilte Set, mit Stems und Replay.",
        phases: [
          ["Auf Sendung", "Ein Now-Playing-Overlay für OBS — Twitch, YouTube, TikTok, Kick — mit der Platte, die die Zuhörer wirklich hören."],
          ["Danach", "Das Set als Titelliste, geteilt auf WhatsApp, X, Bluesky oder Threads, die Nachricht schon geschrieben."],
        ],
      },
      allin: {
        title: "DJ und Karaoke-Host",
        why: "Freitag der Club, Samstag die Karaoke-Bar, Sonntag eine Hochzeit — beide Hälften in einer Anwendung.",
        phases: [
          ["Früh", "DJ-Sets mit dem ganzen Pro-Werkzeug."],
          ["Mitternacht", "Wechsel zur Aktivität Karaoke: dieselben Decks, das Panel der Sänger öffnet sich daneben."],
          ["Spät", "Zurück an die Decks für die letzte Stunde, während der Bildschirm der Sänger die Emojis des Raums zeigt."],
        ],
      },
    },
  },
  fr: {
    eyebrow: "Types de soirées",
    title: "Chaque soirée demande<br />autre chose.",
    lead: "Choisissez la vôtre : ce que fait djmanzo à chaque moment, et l'édition qu'il faut.",
    theEdition: "L'édition :",
    editions: "{edition} : les éditions et les prix",
    karaoke: "Le karaoké, sur la page d'accueil",
    nights: {
      bedroom: {
        title: "S'entraîner chez soi",
        why: "Tout l'essentiel d'un DJ, au prix le plus bas ; un ordinateur portable suffit.",
        phases: [
          ["Préparation", "Pas de contrôleur ? Le clavier en est un. Importez le dossier de musique que vous avez déjà ; djmanzo analyse le tempo, la tonalité et les phrases."],
          ["Entraînement", "Mettez un passage en boucle et mixez-y de nouveau ; les repères de phrase montrent où tombera un mix."],
          ["Réécoute", "Enregistrez le master et réécoutez ce que la salle aurait entendu."],
        ],
      },
      learning: {
        title: "Apprendre à mixer",
        why: "Celle de la Hobbyist, avec le professeur et l'assistant : ils vous montrent quoi essayer ensuite et nomment ce que vous venez de faire.",
        phases: [
          ["Échauffement", "Une platine d'entraînement que seul votre casque entend : essayez un disque, une boucle ou un effet pendant que la musique continue."],
          ["Entraînement", "Le coach nomme ce que vos mains viennent de faire, relève une erreur à la fois et propose la chose la plus facile que vous n'avez pas encore essayée."],
          ["Apprendre", "Vingt-huit techniques, chacune avec ce qu'il lui faut et quand elle marche, et un quiz pour vous tester."],
        ],
      },
      family: {
        title: "Fête de famille et barbecue",
        why: "Vous êtes l'hôte autant que le DJ : Auto-Pilot mixe deux platines tout seul, et vous reprenez la main quand vous voulez.",
        phases: [
          ["Échauffement", "Des classiques de merengue et de bachata pendant que ça cuit ; le pilote automatique continue de mixer pendant que vous êtes au barbecue."],
          ["Montée", "Il mixe depuis un set construit avec un arc, sans répétition et sans deux disques du même artiste à la suite. Touchez un fader et la platine est à vous."],
          ["Sommet", "Les demandes depuis les téléphones : les invités scannent un QR code et tapent ce qu'ils veulent entendre. Aucune appli à installer."],
          ["Fin", "Ralentissez pour la dernière danse, à la main ; la playlist de la soirée est gardée."],
        ],
      },
      wedding: {
        title: "Mariages et événements",
        why: "Une soirée payée qui ne doit pas s'arrêter : Pro DJ ajoute l'assistant et le pilote automatique, n'importe quel contrôleur, et l'événement gardé étape par étape.",
        phases: [
          ["Préparation", "Le thème Wedding : un écran assez calme pour une salle qui n'est pas là pour le DJ. Mettez de côté le disque de l'ouverture du bal."],
          ["Dîner", "Bas, chaleureux, discret : lounge et boléro ; le pilote automatique tient le tout pendant que vous parlez à l'organisatrice."],
          ["Sommet", "Du merengue pour les tantes, du reggaeton pour les cousins — le planificateur de set garde l'arc et ne répète jamais un artiste deux fois de suite."],
          ["Urgence", "SAFE reprend toutes les commandes d'un coup sans arrêter la musique. Rien dont un DJ espère avoir besoin, tout ce qu'il veut avoir."],
        ],
      },
      club: {
        title: "Résident de club",
        why: "Les platines trois à six, les stems en direct, le vinyle timecode, la relecture, et le MIDI clock pour la console lumière.",
        phases: [
          ["Échauffement", "Des tempos plus bas, pas d'hymnes ; le moteur de soirée de djmanzo lit le volume et le tempo de la salle par rapport à toute la soirée jusque-là."],
          ["Montée", "Des mix calés sur les phrases : le planificateur de transitions montre où un mix peut commencer et combien de temps il peut durer, avec ses raisons."],
          ["Sommet", "Les stems : la voix d'un disque sur la batterie d'un autre, en direct, sans latence ajoutée."],
          ["Fin", "Enregistrez le master ; tout le set est gardé sous forme de données pour le rejouer ou le recalculer en qualité studio."],
        ],
      },
      bar: {
        title: "Bar et paillote",
        why: "De longues heures et un bar à faire tourner : Auto-Pilot mixe l'après-midi tout seul, et la platine est à vous dès que vous la touchez. Pro DJ si vous apportez des platines vinyle.",
        phases: [
          ["Après-midi", "Le thème Sunset, lounge et kompa ; le pilote automatique tient le set pendant que vous servez, et toucher une commande vous le rend."],
          ["Heure dorée", "Bachata et salsa, mixées depuis un set construit avec un arc."],
          ["Nuit", "Dembow et reggaeton ; les demandes de la salle arrivent par un autocollant QR imprimé sur le comptoir."],
        ],
      },
      karaoke: {
        title: "Soirée karaoké",
        why: "Les chanteurs sont le spectacle : la rotation, l'écran des chanteurs, la voix retirée, un micro par chanteur — et les deux platines de la Hobbyist pour un set entre eux.",
        phases: [
          ["Ouverture", "Les invités s'inscrivent depuis leur téléphone ; la rotation reste équitable, une chanson chacun."],
          ["Chant", "Les paroles s'allument en rythme sur l'écran des chanteurs ; la tonalité s'ajuste au chanteur ; une voix guide pour une chanson qu'il découvre."],
          ["Entre deux chanteurs", "La musique d'entracte s'efface sous le chanteur suivant ; un quiz garde la salle dedans."],
          ["Dernière chanson", "Chaque prestation est enregistrée."],
        ],
      },
      radio: {
        title: "Radio et directs",
        why: "Passer en direct, c'est dans Pro DJ : l'overlay du stream et le set partagé, avec les stems et la relecture.",
        phases: [
          ["À l'antenne", "Un overlay de lecture en cours pour OBS — Twitch, YouTube, TikTok, Kick — qui nomme le disque que les auditeurs entendent vraiment."],
          ["Après", "Le set en playlist, partagé sur WhatsApp, X, Bluesky ou Threads avec le message déjà écrit."],
        ],
      },
      allin: {
        title: "DJ et animateur karaoké",
        why: "Vendredi le club, samedi le bar karaoké, dimanche un mariage — les deux moitiés dans une seule application.",
        phases: [
          ["Tôt", "Des sets DJ avec toute la boîte à outils Pro."],
          ["Minuit", "Passez à l'activité Karaoke : les mêmes platines, le panneau des chanteurs s'ouvre à côté."],
          ["Tard", "Retour aux platines pour la dernière heure, pendant que l'écran des chanteurs montre les emojis de la salle."],
        ],
      },
    },
  },
  it: {
    eyebrow: "Tipi di serata",
    title: "Ogni serata chiede<br />qualcosa di diverso.",
    lead: "Scegli la tua: cosa fa djmanzo in ogni sua parte, e quale edizione serve.",
    theEdition: "L'edizione:",
    editions: "{edition}: le edizioni e i prezzi",
    karaoke: "Il karaoke, nella pagina principale",
    nights: {
      bedroom: {
        title: "Esercitarsi a casa",
        why: "Tutto il necessario di base per un DJ, al prezzo più basso; basta un portatile.",
        phases: [
          ["Preparazione", "Niente controller? La tastiera è uno. Importa la cartella di musica che hai già; djmanzo analizza tempo, tonalità e frasi."],
          ["Esercizio", "Metti in loop un passaggio e mixaci dentro di nuovo; i segni di frase mostrano dove cadrà un mix."],
          ["Riascolto", "Registra il master e riascolta ciò che la sala avrebbe sentito."],
        ],
      },
      learning: {
        title: "Imparare a fare il DJ",
        why: "Quella della Hobbyist, con l'insegnante e l'assistente: ti mostrano cosa provare dopo e danno un nome a ciò che hai appena fatto.",
        phases: [
          ["Riscaldamento", "Un deck di pratica che sentono solo le tue cuffie: prova un disco, un loop o un effetto mentre la musica continua."],
          ["Esercizio", "Il coach nomina ciò che le tue mani hanno appena fatto, coglie un errore alla volta e propone la cosa più facile che non hai ancora provato."],
          ["Imparare", "Ventotto tecniche, ognuna con ciò che le serve e quando funziona, e un quiz per verificarti."],
        ],
      },
      family: {
        title: "Festa di famiglia e grigliata",
        why: "Sei padrone di casa quanto DJ: Auto-Pilot mixa due deck da solo, e tu prendi il comando quando vuoi.",
        phases: [
          ["Riscaldamento", "Classici di merengue e bachata mentre il cibo cuoce; il pilota automatico continua a mixare mentre sei alla griglia."],
          ["Crescita", "Mixa da un set costruito con un arco, senza ripetizioni e senza due dischi di fila dello stesso artista. Tocca un fader e il deck è tuo."],
          ["Picco", "Richieste dai telefoni: gli ospiti scansionano un codice QR e scrivono cosa vogliono sentire. Nessuna app da installare."],
          ["Chiusura", "Rallenta per l'ultimo ballo, a mano; la scaletta della serata viene salvata."],
        ],
      },
      wedding: {
        title: "Matrimoni ed eventi",
        why: "Una serata pagata che non deve fermarsi: Pro DJ aggiunge l'assistente e il pilota automatico, qualsiasi controller e l'evento conservato passo per passo.",
        phases: [
          ["Preparazione", "Il tema Wedding: uno schermo abbastanza calmo per una sala che non è lì per il DJ. Metti da parte il disco del primo ballo."],
          ["Cena", "Basso, caldo, discreto: lounge e bolero; il pilota automatico lo porta avanti mentre parli con chi organizza."],
          ["Picco", "Merengue per le zie, reggaeton per i cugini: il pianificatore del set mantiene l'arco e non ripete mai un artista due volte di fila."],
          ["Emergenza", "SAFE riprende tutti i controlli in un colpo senza fermare la musica. Niente che un DJ speri di dover usare, tutto ciò che vuole avere."],
        ],
      },
      club: {
        title: "Resident di club",
        why: "Deck da tre a sei, stem dal vivo, vinile timecode, replay e MIDI clock per la console luci.",
        phases: [
          ["Riscaldamento", "Tempi più bassi, niente inni; il motore della serata di djmanzo legge volume e tempo della sala rispetto a tutta la serata fin qui."],
          ["Crescita", "Mix agganciati alla frase: il pianificatore delle transizioni mostra dove può iniziare un mix e quanto può durare, con i suoi motivi."],
          ["Picco", "Stem: la voce di un disco sulla batteria di un altro, dal vivo, senza latenza aggiunta."],
          ["Chiusura", "Registra il master; l'intero set viene salvato come dati per rifarlo o renderizzarlo di nuovo in qualità da studio."],
        ],
      },
      bar: {
        title: "Bar e chiringuito",
        why: "Tante ore e un bar da mandare avanti: Auto-Pilot mixa il pomeriggio da solo, e il deck è tuo appena lo tocchi. Pro DJ se porti i giradischi.",
        phases: [
          ["Pomeriggio", "Il tema Sunset, lounge e kompa; il pilota automatico conduce il set mentre servi, e toccare un controllo te lo restituisce."],
          ["Ora d'oro", "Bachata e salsa, mixate da un set costruito con un arco."],
          ["Notte", "Dembow e reggaeton; le richieste della sala arrivano da un adesivo QR stampato sul bancone."],
        ],
      },
      karaoke: {
        title: "Serata karaoke",
        why: "I cantanti sono lo spettacolo: la rotazione, lo schermo dei cantanti, la voce tolta, un microfono per cantante — e i due deck della Hobbyist per un set tra un cantante e l'altro.",
        phases: [
          ["Apertura", "Gli ospiti si iscrivono dal telefono; la rotazione resta equa, una canzone a testa."],
          ["Canto", "Il testo si illumina a tempo sullo schermo dei cantanti; la tonalità si adatta al cantante; una voce guida per una canzone che non conosce."],
          ["Tra un cantante e l'altro", "La musica di pausa sfuma sotto il cantante successivo; un quiz tiene la sala dentro."],
          ["Ultima canzone", "Ogni esibizione viene registrata."],
        ],
      },
      radio: {
        title: "Radio e dirette",
        why: "Andare in diretta è in Pro DJ: l'overlay dello stream e il set condiviso, con stem e replay.",
        phases: [
          ["In onda", "Un overlay di ciò che suona per OBS — Twitch, YouTube, TikTok, Kick — con il disco che gli ascoltatori sentono davvero."],
          ["Dopo", "Il set come scaletta, condiviso su WhatsApp, X, Bluesky o Threads con il messaggio già scritto."],
        ],
      },
      allin: {
        title: "DJ e presentatore di karaoke",
        why: "Venerdì il club, sabato il karaoke bar, domenica un matrimonio — le due metà in un'unica applicazione.",
        phases: [
          ["Presto", "Set da DJ con tutti gli strumenti di Pro."],
          ["Mezzanotte", "Passa all'attività Karaoke: gli stessi deck, il pannello dei cantanti si apre accanto."],
          ["Tardi", "Di nuovo ai deck per l'ultima ora, mentre lo schermo dei cantanti mostra le emoji della sala."],
        ],
      },
    },
  },
  ja: {
    eyebrow: "夜のタイプ",
    title: "夜ごとに<br />求められるものは違う。",
    lead: "あなたの夜を選んでください：その夜のそれぞれの場面で djmanzo が何をするか、そしてどのエディションが必要か。",
    theEdition: "エディション：",
    editions: "{edition}：エディションと価格",
    karaoke: "ホームページのカラオケ",
    nights: {
      bedroom: {
        title: "自宅で練習",
        why: "DJ に必要な基本のすべてを、いちばん安い価格で。ノート PC だけで十分です。",
        phases: [
          ["準備", "コントローラーがない？ キーボードがコントローラーです。手持ちの音楽フォルダーを読み込めば、djmanzo がテンポ、キー、フレーズを解析します。"],
          ["練習", "一部分をループして、もう一度そこへミックス。フレーズのマーカーがミックスの着地点を示します。"],
          ["振り返り", "マスターを録音して、フロアに聞こえたはずの音を聴き直します。"],
        ],
      },
      learning: {
        title: "DJ を学ぶ",
        why: "Hobbyist の内容に、先生とアシスタントが加わります。次に試すことを示し、今したことに名前を付けてくれます。",
        phases: [
          ["ウォームアップ", "ヘッドホンだけに聞こえる練習デッキ：音楽を流したまま、レコード、ループ、エフェクトを試せます。"],
          ["練習", "コーチが手の動きに名前を付け、ミスをひとつずつ指摘し、まだ試していないいちばん簡単なことを出してくれます。"],
          ["学ぶ", "28 のテクニック。それぞれに必要なものと効く場面、そして自分を確かめるクイズ付き。"],
        ],
      },
      family: {
        title: "家族のパーティーとバーベキュー",
        why: "DJ であると同時にホストでもある夜。Auto-Pilot が 2 台のデッキを自分でミックスし、いつでもあなたが引き継げます。",
        phases: [
          ["ウォームアップ", "料理ができるまでメレンゲとバチャータの名曲を。グリルにいる間もオートパイロットがミックスを続けます。"],
          ["ビルド", "流れを考えて組んだセットからミックス。同じ曲の繰り返しも、同じアーティストの連続もなし。フェーダーに触れればデッキはあなたのもの。"],
          ["ピーク", "スマホからリクエスト：ゲストが QR コードを読み取って聴きたい曲を入力。アプリのインストールは不要です。"],
          ["クロージング", "最後のダンスに向けて手でテンポを落とします。その夜のトラックリストは保存されます。"],
        ],
      },
      wedding: {
        title: "結婚式とイベント",
        why: "止まってはいけない有料の夜。Pro DJ はアシスタントとオートパイロット、あらゆるコントローラー、一歩ずつ記録されるイベントを加えます。",
        phases: [
          ["準備", "Wedding テーマ：DJ を見に来たわけではない会場にふさわしい、落ち着いた画面。ファーストダンスの曲を取っておきます。"],
          ["ディナー", "控えめで温かく、邪魔にならない：ラウンジとボレロ。プランナーと話している間はオートパイロットが進めます。"],
          ["ピーク", "おばさんたちにはメレンゲ、いとこたちにはレゲトン。セットプランナーが流れを保ち、同じアーティストを続けません。"],
          ["非常時", "SAFE は音楽を止めずに、すべてのコントロールを一度に戻します。DJ が使いたくないもの、でも持っていたいもの。"],
        ],
      },
      club: {
        title: "クラブのレジデント",
        why: "3〜6 台目のデッキ、ライブのステム、タイムコードヴァイナル、リプレイ、照明卓への MIDI クロック。",
        phases: [
          ["ウォームアップ", "低めのテンポ、アンセムはなし。djmanzo のナイトエンジンが、フロアの音量とテンポをその夜全体と比べて読み取ります。"],
          ["ビルド", "フレーズに合わせたミックス：トランジションプランナーが、ミックスを始められる場所と続けられる長さを理由とともに示します。"],
          ["ピーク", "ステム：あるレコードのボーカルを別のレコードのドラムに重ねて、ライブで。追加のレイテンシーなし。"],
          ["クロージング", "マスターを録音。セット全体がデータとして保存され、リプレイしたり、スタジオ品質で書き出し直したりできます。"],
        ],
      },
      bar: {
        title: "バーとビーチバー",
        why: "長い営業時間と回すべきバー。Auto-Pilot が午後を自分でミックスし、触れた瞬間にデッキはあなたのもの。ターンテーブルを持ち込むなら Pro DJ を。",
        phases: [
          ["午後", "Sunset テーマ、ラウンジとコンパ。接客している間はオートパイロットがセットを回し、コントロールに触れれば戻ってきます。"],
          ["ゴールデンアワー", "流れを考えて組んだセットから、バチャータとサルサをミックス。"],
          ["夜", "デンボウとレゲトン。フロアのリクエストは、バーに貼った QR ステッカーから届きます。"],
        ],
      },
      karaoke: {
        title: "カラオケナイト",
        why: "主役はシンガー：順番の管理、シンガー用の画面、歌声を抜く機能、シンガーごとのマイク。そして合間の DJ セットには Hobbyist の 2 台のデッキ。",
        phases: [
          ["開場", "ゲストはスマホから名前を登録。順番は公平に、ひとり 1 曲ずつ。"],
          ["歌", "シンガー用の画面で歌詞がタイミングよく光り、キーはシンガーに合わせて変わり、初めての曲にはガイドボーカル。"],
          ["シンガーの合間", "幕間の音楽が次のシンガーの下でフェードし、クイズで会場を盛り上げ続けます。"],
          ["ラストソング", "すべてのパフォーマンスが録音されます。"],
        ],
      },
      radio: {
        title: "ラジオとライブ配信",
        why: "ライブ配信は Pro DJ に含まれます：配信用オーバーレイとセットの共有、ステムとリプレイ付き。",
        phases: [
          ["オンエア", "OBS 用の再生中オーバーレイ（Twitch、YouTube、TikTok、Kick）が、リスナーが実際に聴いているレコードを表示します。"],
          ["そのあと", "セットをトラックリストにして、メッセージを書いた状態で WhatsApp、X、Bluesky、Threads に共有。"],
        ],
      },
      allin: {
        title: "DJ とカラオケのホスト",
        why: "金曜はクラブ、土曜はカラオケバー、日曜は結婚式。ふたつの役割がひとつのアプリに。",
        phases: [
          ["序盤", "Pro のツールをすべて使った DJ セット。"],
          ["真夜中", "Karaoke アクティビティに切り替え：同じデッキの横に、シンガーのパネルが開きます。"],
          ["終盤", "最後の 1 時間はデッキに戻り、シンガー用の画面にはフロアの絵文字が映ります。"],
        ],
      },
    },
  },
};
