/**
 * The home page's remaining sections — the keys, the karaoke night, the
 * hardware, the marketplace and forum, the questions — in every language
 * the site speaks. A phrase marked "html" carries the section's own `<kbd>`,
 * `<b>` and links, and is drawn with `{@html}`: these are the site's own
 * words, never a visitor's. `{community}`, `{market}` and `{wishes}` are the
 * site's addresses, filled in where the words are drawn.
 *
 * djmanzo's interface is in English, so its labels — As recorded · Guide ·
 * Out, Next when this ends, Repeat, the stems' names in a diagram — stay as
 * the application shows them.
 */

import type { Lang } from "./strings";

type QA = [string, string];

export interface SectionWords {
  keys: {
    eyebrow: string;
    title: string;
    /** html */
    lead: string;
    /** html */
    sets: string;
    wearOne: string;
    wearAria: string;
    /** html */
    orOne: string;
    marketAria: string;
    pack: string;
    tryAria: string;
    hint: string;
    sketch: string;
    pressSpace: string;
    orClick: string;
    note: string;
    inApp: string;
  };
  karaoke: {
    eyebrow: string;
    /** html */
    title: string;
    lead: string;
    night: { before: string; singing: string; between: string; after: string };
    decksEyebrow: string;
    decksTitle: string;
    diagramAria: string;
    deck1: string;
    singerLine: string;
    deck2: string;
    playlist: string;
    fillers: [string, string, string, string];
    /** html */
    decksText: string;
    guestEyebrow: string;
    guestTitle: string;
    flow: [{ title: string; text: string }, { title: string; text: string }, { title: string; text: string }, { title: string; text: string }];
    guestCaveat: string;
    drawer: string;
    drawerLabel: string;
    more: string;
    guide: string;
  };
  hardware: {
    eyebrow: string;
    title: string;
    lead: string;
    search: string;
    placeholder: string;
    show: string;
    all: string;
    mapped: string;
    planned: string;
    plannedCaveat: string;
    /** html */
    none: string;
    kinds: { Controller: string; Player: string; "Pad grid": string; Generic: string; Turntables: string };
  };
  live: {
    eyebrow: string;
    title: string;
    lead: string;
    market: string;
    browse: string;
    /** html */
    marketEmpty: string;
    loading: string;
    forum: string;
    join: string;
    /** html */
    forumEmpty: string;
    reply: string;
    replies: string;
    /** html */
    wishes: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    /** html */
    lead: string;
    price: string;
    platforms: string;
    privacy: string;
    free: QA;
    plans: [string, string];
    cheaper: QA;
    trial: [string, string];
    upgrade: QA;
    linux: string;
    windows: string;
    oldmac: string;
    controller: QA;
    knows: QA;
    watch: string;
    market: QA;
  };
}

const en: SectionWords = {
  keys: {
    eyebrow: "Your hands",
    title: "Keys that read as words.",
    lead: "Press <kbd>Space</kbd> and djmanzo shows every key. <kbd>d</kbd> <kbd>1</kbd> <kbd>p</kbd> is <b>d</b>eck <b>1</b> <b>p</b>lay; <kbd>o</kbd> <kbd>i</kbd> opens the s<b>i</b>ngers. Nothing to memorise first: the guide is there until your fingers know the way.",
    sets: "A <b>keyboard set</b> adds keys for one way of working — a karaoke host's rotation, a scratch DJ's crossfader — on letters djmanzo leaves free, under any keys you made yourself. It complements the keys you have; it never takes one away. Nine come with djmanzo, one for each way of working; more are in the <a href=\"{market}\">marketplace</a>, where a set can carry one of djmanzo's whole and add to it, even inside djmanzo's own groups; and your own can be saved as a set, or published with your name.",
    wearOne: "Wear one: they come with djmanzo",
    wearAria: "Wear a keyboard set djmanzo ships",
    orOne: "Or one from <a href=\"{market}\">Outboard</a>, free",
    marketAria: "Wear a keyboard set from the marketplace",
    pack: "pack",
    tryAria: "Try the keys: press Space, then the letters",
    hint: "Backspace: back · Esc: close",
    sketch: "a sketch of the guide",
    pressSpace: "Press Space",
    orClick: "or click here and use your keyboard",
    note: "The real guide lists every panel, theme, workspace and preset on your machine; this sketch shows the shape of it.",
    inApp: "In djmanzo: the Keys panel",
  },
  karaoke: {
    eyebrow: "Karaoke",
    title: "A whole karaoke night,<br />in the same download.",
    lead: "The queue and the singers' screen, the voice taken out of any record in your collection — or left in, quietly, as a guide — a microphone and its effects for every singer, phones that put names down, a quiz, scores, and a song made for the guest who sang. The Karaoke edition carries all of it; so does Full.",
    night: { before: "Before the first singer", singing: "Somebody is singing", between: "Between singers", after: "After their song" },
    decksEyebrow: "Two decks, two playlists",
    decksTitle: "The singer's song on one deck. The filler going round on the other.",
    diagramAria: "Deck 1 plays the singer's song with its voice as recorded, as a guide or out; deck 2 plays a playlist of fillers on Repeat; break music leads from one into the next singer's song.",
    deck1: "Deck 1 · the singer",
    singerLine: "Ana — \"Paper Moons\", −1 key",
    deck2: "Deck 2 · the filler deck",
    playlist: "Playlist: Jingles and loops",
    fillers: ["House jingle", "Drum loop, 8 bars", "Venue ident", "Crowd loop"],
    decksText: "Every deck has its own playlist drawer. For the singer, <b>As recorded · Guide · Out</b> decides how much of the original voice is left — the vocal is a stem like the drums, so it comes out of any record. On the other deck, tick <b>Next when this ends</b> and <b>Repeat</b> and your jingles and loops go round by themselves while you look after the room; <b>break music</b> leads from them into the next singer's song.",
    guestEyebrow: "A song for the guest",
    guestTitle: "From the guest book to their WhatsApp.",
    flow: [
      { title: "They sang", text: "Marked as sung, they are written into the night's guest book with the song and the time." },
      { title: "They agree", text: "One question at a time: keep their details, record fifteen seconds of their voice, make a song for them. Under sixteen, contact and voice are refused." },
      { title: "A song for them", text: "Your AI provider writes the words — about them, the song they sang, the place and the night — and djmanzo fills Suno's form. You check it and press Create." },
      { title: "Sent to their WhatsApp", text: "The finished link comes into their card; WhatsApp opens at their chat with the message written. You press send." },
    ],
    guestCaveat: "Suno has no public API and its terms forbid robots: djmanzo fills the form, you press Create and send. Nothing leaves the machine unless you send it. Writing the words needs an AI provider set up in djmanzo.",
    drawer: "In djmanzo: the filler deck",
    drawerLabel: "A playlist under the deck",
    more: "Every karaoke feature, with what is not yet proven →",
    guide: "The host's guide: what to press on the night →",
  },
  hardware: {
    eyebrow: "Hardware",
    title: "Plug in what you own.",
    lead: "Mappings written from each maker's own MIDI table ship with djmanzo. Anything else, map yourself: press a control, choose what it does, save. Your laptop's keyboard is a controller too.",
    search: "Search controllers",
    placeholder: "Search a maker or model — “pioneer 400”, “launchpad”",
    show: "Show",
    all: "All",
    mapped: "Mapping ships",
    planned: "Planned",
    plannedCaveat: "Not in djmanzo yet.",
    none: "Not in the list. Map it yourself in djmanzo — or ask for it on the <a href=\"{wishes}\">feature requests</a>.",
    kinds: { Controller: "Controller", Player: "Player", "Pad grid": "Pad grid", Generic: "Generic", Turntables: "Turntables" },
  },
  live: {
    eyebrow: "Made by DJs",
    title: "A marketplace that costs nothing. A forum that stays on topic.",
    lead: "Themes, skins and visuals made by DJs for djmanzo, free, signed by their makers and checked before they are listed. And a place to ask the question everyone at the gig was thinking.",
    market: "Marketplace",
    browse: "Browse all →",
    marketEmpty: "New shelves: nothing listed yet. Made a theme, a skin or a look in djmanzo? <a href=\"{market}\">Put it up</a> — free for everyone.",
    loading: "Loading…",
    forum: "Forum",
    join: "Join in →",
    forumEmpty: "Quiet so far. Ask the first question — mixing, harmonic keys, karaoke hosting, gear — <a href=\"{community}\">in the forum</a>.",
    reply: "reply",
    replies: "replies",
    wishes: "<a href=\"{wishes}\">Feature requests</a>: ask for what djmanzo should do next, and vote.",
  },
  faq: {
    eyebrow: "Questions",
    title: "Straight answers.",
    lead: "Something missing? <a href=\"{community}\">Ask in the forum</a>, or ask the assistant at the bottom of the page.",
    price: "Price and licence",
    platforms: "Platforms and hardware",
    privacy: "Privacy and the room",
    free: ["Is it really free?", "Yes: the Hobbyist edition."],
    plans: ["Buy once, or subscribe?", "Either. Buy once: paid once, and it keeps working — offline too. Monthly: every update while it runs; cancel any time. Yearly: every update while it runs, for ten months' price."],
    cheaper: ["Why is it cheaper where I live?", "Prices follow what living costs: 40, 60 or 70 % off, by the World Bank's income groups, for a card and a billing address from there. Students and teachers pay half. Discounts never stack — you get the larger."],
    trial: ["Can I try a paid edition first?", "{days} days of any edition, Full included, once per account."],
    upgrade: ["What if I outgrow my edition?", "Upgrade and pay only the difference: what you paid counts in full."],
    linux: "Does it really run on Linux?",
    windows: "And Windows?",
    oldmac: "My Mac is old.",
    controller: ["Will my controller work?", "Search the hardware list above. With no shipped mapping, map it yourself in djmanzo: press a control, choose what it does."],
    knows: ["What does this page know about me?", "Only the country your connection comes from, to choose its look and its prices. The look you pick stays in your browser. The shop and the forum keep what you buy and post, as the privacy notice says."],
    watch: "Does djmanzo watch the crowd?",
    market: ["Is the marketplace really free?", "Everything in it is free, for everyone: no payments, no commission. A maker may link their own tip jar. Packs are signed by their maker and checked before they are listed; other people's music is never allowed."],
  },
};

const es: SectionWords = {
  keys: {
    eyebrow: "Tus manos",
    title: "Teclas que se leen como palabras.",
    lead: "Pulsa <kbd>Space</kbd> y djmanzo muestra todas las teclas. <kbd>d</kbd> <kbd>1</kbd> <kbd>p</kbd> es <b>d</b>eck <b>1</b> <b>p</b>lay (el plato 1 suena); <kbd>o</kbd> <kbd>i</kbd> abre los s<b>i</b>ngers, los cantantes. No hay que memorizar nada antes: la guía está ahí hasta que tus dedos se sepan el camino.",
    sets: "Un <b>juego de teclas</b> añade teclas para una forma de trabajar —la rotación de quien anima un karaoke, el crossfader de un DJ de scratch— en letras que djmanzo deja libres, bajo las teclas que hayas creado tú. Complementa las que tienes; nunca te quita ninguna. djmanzo trae nueve, una por cada forma de trabajar; hay más en el <a href=\"{market}\">mercado</a>, donde un juego puede llevar uno de los de djmanzo entero y ampliarlo, incluso dentro de los grupos propios de djmanzo; y los tuyos se pueden guardar como juego o publicar con tu nombre.",
    wearOne: "Ponte uno: vienen con djmanzo",
    wearAria: "Ponte un juego de teclas que trae djmanzo",
    orOne: "O uno de <a href=\"{market}\">Outboard</a>, gratis",
    marketAria: "Ponte un juego de teclas del mercado",
    pack: "paquete",
    tryAria: "Prueba las teclas: pulsa Space y luego las letras",
    hint: "Retroceso: atrás · Esc: cerrar",
    sketch: "un boceto de la guía",
    pressSpace: "Pulsa Space",
    orClick: "o haz clic aquí y usa tu teclado",
    note: "La guía de verdad lista cada panel, tema, espacio de trabajo y preset de tu equipo; este boceto muestra su forma.",
    inApp: "En djmanzo: el panel Keys",
  },
  karaoke: {
    eyebrow: "Karaoke",
    title: "Una noche de karaoke entera,<br />en la misma descarga.",
    lead: "La cola y la pantalla de los cantantes, la voz quitada de cualquier tema de tu colección —o dejada, bajita, como guía—, un micrófono y sus efectos para cada cantante, móviles que apuntan nombres, un concurso, puntuaciones y una canción hecha para el invitado que cantó. La edición Karaoke lo trae todo; Full también.",
    night: { before: "Antes del primer cantante", singing: "Alguien está cantando", between: "Entre cantantes", after: "Después de su canción" },
    decksEyebrow: "Dos platos, dos listas",
    decksTitle: "La canción del cantante en un plato. El relleno dando vueltas en el otro.",
    diagramAria: "El plato 1 pone la canción del cantante con la voz original, como guía o quitada; el plato 2 pone una lista de rellenos en Repeat; la música entre canciones lleva de uno a la canción del siguiente cantante.",
    deck1: "Plato 1 · el cantante",
    singerLine: "Ana — \"Paper Moons\", −1 tono",
    deck2: "Plato 2 · el plato de relleno",
    playlist: "Lista: cortinillas y loops",
    fillers: ["Cortinilla de la casa", "Loop de batería, 8 compases", "Ident del local", "Loop de público"],
    decksText: "Cada plato tiene su propio cajón de lista. Para el cantante, <b>As recorded · Guide · Out</b> decide cuánto queda de la voz original: la voz es un stem como la batería, así que sale de cualquier tema. En el otro plato, marca <b>Next when this ends</b> y <b>Repeat</b> y tus cortinillas y loops dan vueltas solos mientras tú atiendes la sala; la <b>música entre canciones</b> lleva de ellos a la canción del siguiente cantante.",
    guestEyebrow: "Una canción para el invitado",
    guestTitle: "Del libro de invitados a su WhatsApp.",
    flow: [
      { title: "Cantó", text: "Marcado como cantado, queda escrito en el libro de invitados de la noche con la canción y la hora." },
      { title: "Da su permiso", text: "Una pregunta cada vez: guardar sus datos, grabar quince segundos de su voz, hacerle una canción. Con menos de dieciséis años, el contacto y la voz se rechazan." },
      { title: "Una canción para él", text: "Tu proveedor de IA escribe la letra —sobre la persona, la canción que cantó, el sitio y la noche— y djmanzo rellena el formulario de Suno. Tú lo revisas y pulsas Create." },
      { title: "Enviada a su WhatsApp", text: "El enlace terminado llega a su ficha; WhatsApp se abre en su chat con el mensaje escrito. Tú pulsas enviar." },
    ],
    guestCaveat: "Suno no tiene API pública y sus condiciones prohíben los robots: djmanzo rellena el formulario, tú pulsas Create y envías. Nada sale del equipo si no lo envías tú. Escribir la letra necesita un proveedor de IA configurado en djmanzo.",
    drawer: "En djmanzo: el plato de relleno",
    drawerLabel: "Una lista bajo el plato",
    more: "Todas las funciones de karaoke, con lo que aún no está probado →",
    guide: "La guía del anfitrión: qué pulsar esa noche →",
  },
  hardware: {
    eyebrow: "Hardware",
    title: "Conecta lo que tienes.",
    lead: "djmanzo trae mappings escritos a partir de la tabla MIDI de cada fabricante. Lo demás, mapéalo tú: pulsa un control, elige qué hace, guarda. El teclado de tu portátil también es un controlador.",
    search: "Buscar controladores",
    placeholder: "Busca una marca o un modelo — “pioneer 400”, “launchpad”",
    show: "Mostrar",
    all: "Todos",
    mapped: "Con mapping",
    planned: "Previsto",
    plannedCaveat: "Aún no está en djmanzo.",
    none: "No está en la lista. Mapéalo tú en djmanzo, o pídelo en las <a href=\"{wishes}\">peticiones de funciones</a>.",
    kinds: { Controller: "Controlador", Player: "Reproductor", "Pad grid": "Rejilla de pads", Generic: "Genérico", Turntables: "Giradiscos" },
  },
  live: {
    eyebrow: "Hecho por DJs",
    title: "Un mercado que no cuesta nada. Un foro que no se va por las ramas.",
    lead: "Temas, skins y visuales hechos por DJs para djmanzo, gratis, firmados por quien los hizo y revisados antes de publicarse. Y un sitio para hacer la pregunta que todos en el bolo estaban pensando.",
    market: "Mercado",
    browse: "Ver todo →",
    marketEmpty: "Estantes nuevos: aún no hay nada. ¿Has hecho un tema, una skin o un look en djmanzo? <a href=\"{market}\">Súbelo</a>: gratis para todos.",
    loading: "Cargando…",
    forum: "Foro",
    join: "Participa →",
    forumEmpty: "Todo tranquilo de momento. Haz la primera pregunta —mezcla, tonalidades armónicas, karaoke, equipo— <a href=\"{community}\">en el foro</a>.",
    reply: "respuesta",
    replies: "respuestas",
    wishes: "<a href=\"{wishes}\">Peticiones de funciones</a>: pide lo que djmanzo debería hacer después, y vota.",
  },
  faq: {
    eyebrow: "Preguntas",
    title: "Respuestas claras.",
    lead: "¿Falta algo? <a href=\"{community}\">Pregunta en el foro</a>, o al asistente al final de la página.",
    price: "Precio y licencia",
    platforms: "Plataformas y hardware",
    privacy: "Privacidad y la sala",
    free: ["¿De verdad es gratis?", "Sí: la edición Hobbyist."],
    plans: ["¿Pago único o suscripción?", "Lo que prefieras. Pago único: pagas una vez y sigue funcionando, también sin conexión. Mensual: todas las actualizaciones mientras dure; cancela cuando quieras. Anual: todas las actualizaciones mientras dure, por el precio de diez meses."],
    cheaper: ["¿Por qué es más barato donde vivo?", "Los precios siguen el coste de la vida: 40, 60 o 70 % menos, según los grupos de ingresos del Banco Mundial, con una tarjeta y una dirección de facturación de allí. Estudiantes y docentes pagan la mitad. Los descuentos no se suman: te quedas con el mayor."],
    trial: ["¿Puedo probar antes una edición de pago?", "{days} días de cualquier edición, Full incluida, una vez por cuenta."],
    upgrade: ["¿Y si mi edición se me queda corta?", "Cambia a otra y paga solo la diferencia: lo que pagaste cuenta entero."],
    linux: "¿De verdad funciona en Linux?",
    windows: "¿Y en Windows?",
    oldmac: "Mi Mac es antiguo.",
    controller: ["¿Funcionará mi controlador?", "Búscalo en la lista de hardware de arriba. Si no trae mapping, mapéalo tú en djmanzo: pulsa un control y elige qué hace."],
    knows: ["¿Qué sabe esta página de mí?", "Solo el país desde el que te conectas, para elegir su look y sus precios. El look que eliges se queda en tu navegador. La tienda y el foro guardan lo que compras y publicas, como dice el aviso de privacidad."],
    watch: "¿djmanzo vigila al público?",
    market: ["¿De verdad el mercado es gratis?", "Todo lo que hay es gratis, para todos: sin pagos y sin comisión. Quien lo hace puede enlazar su propio bote de propinas. Los paquetes van firmados por quien los hizo y se revisan antes de publicarse; la música de otros nunca está permitida."],
  },
};

const pt: SectionWords = {
  keys: {
    eyebrow: "Suas mãos",
    title: "Teclas que se leem como palavras.",
    lead: "Aperte <kbd>Space</kbd> e o djmanzo mostra todas as teclas. <kbd>d</kbd> <kbd>1</kbd> <kbd>p</kbd> é <b>d</b>eck <b>1</b> <b>p</b>lay (o deck 1 toca); <kbd>o</kbd> <kbd>i</kbd> abre os s<b>i</b>ngers, os cantores. Nada para decorar antes: o guia fica ali até seus dedos aprenderem o caminho.",
    sets: "Um <b>conjunto de teclas</b> acrescenta teclas para um jeito de trabalhar — o rodízio de quem apresenta um karaokê, o crossfader de um DJ de scratch — em letras que o djmanzo deixa livres, abaixo das teclas que você mesmo criou. Ele complementa as teclas que você tem; nunca tira nenhuma. Nove vêm com o djmanzo, um para cada jeito de trabalhar; há mais no <a href=\"{market}\">marketplace</a>, onde um conjunto pode trazer um dos do djmanzo inteiro e ampliá-lo, até dentro dos grupos do próprio djmanzo; e os seus podem ser salvos como conjunto ou publicados com seu nome.",
    wearOne: "Use um: eles vêm com o djmanzo",
    wearAria: "Use um conjunto de teclas que vem com o djmanzo",
    orOne: "Ou um do <a href=\"{market}\">Outboard</a>, grátis",
    marketAria: "Use um conjunto de teclas do marketplace",
    pack: "pacote",
    tryAria: "Experimente as teclas: aperte Space e depois as letras",
    hint: "Backspace: voltar · Esc: fechar",
    sketch: "um esboço do guia",
    pressSpace: "Aperte Space",
    orClick: "ou clique aqui e use seu teclado",
    note: "O guia de verdade lista cada painel, tema, espaço de trabalho e preset da sua máquina; este esboço mostra o formato dele.",
    inApp: "No djmanzo: o painel Keys",
  },
  karaoke: {
    eyebrow: "Karaokê",
    title: "Uma noite inteira de karaokê,<br />no mesmo download.",
    lead: "A fila e a tela dos cantores, a voz tirada de qualquer faixa da sua coleção — ou deixada, baixinha, como guia —, um microfone e seus efeitos para cada cantor, celulares que anotam nomes, um quiz, pontuações e uma música feita para o convidado que cantou. A edição Karaoke traz tudo isso; a Full também.",
    night: { before: "Antes do primeiro cantor", singing: "Alguém está cantando", between: "Entre um cantor e outro", after: "Depois da música" },
    decksEyebrow: "Dois decks, duas playlists",
    decksTitle: "A música do cantor num deck. O enchimento rodando no outro.",
    diagramAria: "O deck 1 toca a música do cantor com a voz original, como guia ou retirada; o deck 2 toca uma playlist de vinhetas em Repeat; a música de intervalo leva de uma à música do próximo cantor.",
    deck1: "Deck 1 · o cantor",
    singerLine: "Ana — \"Paper Moons\", −1 tom",
    deck2: "Deck 2 · o deck de enchimento",
    playlist: "Playlist: vinhetas e loops",
    fillers: ["Vinheta da casa", "Loop de bateria, 8 compassos", "Ident do local", "Loop de plateia"],
    decksText: "Cada deck tem sua própria gaveta de playlist. Para o cantor, <b>As recorded · Guide · Out</b> decide quanto sobra da voz original — a voz é um stem como a bateria, então sai de qualquer faixa. No outro deck, marque <b>Next when this ends</b> e <b>Repeat</b> e suas vinhetas e loops rodam sozinhos enquanto você cuida da casa; a <b>música de intervalo</b> leva deles à música do próximo cantor.",
    guestEyebrow: "Uma música para o convidado",
    guestTitle: "Do livro de convidados para o WhatsApp dele.",
    flow: [
      { title: "Cantou", text: "Marcado como cantado, entra no livro de convidados da noite com a música e o horário." },
      { title: "Concorda", text: "Uma pergunta de cada vez: guardar seus dados, gravar quinze segundos da sua voz, fazer uma música para ele. Com menos de dezesseis anos, contato e voz são recusados." },
      { title: "Uma música para ele", text: "Seu provedor de IA escreve a letra — sobre a pessoa, a música que cantou, o lugar e a noite — e o djmanzo preenche o formulário do Suno. Você confere e aperta Create." },
      { title: "Enviada ao WhatsApp dele", text: "O link pronto chega à ficha dele; o WhatsApp abre na conversa com a mensagem escrita. Você aperta enviar." },
    ],
    guestCaveat: "O Suno não tem API pública e seus termos proíbem robôs: o djmanzo preenche o formulário, você aperta Create e envia. Nada sai da máquina se você não enviar. Escrever a letra precisa de um provedor de IA configurado no djmanzo.",
    drawer: "No djmanzo: o deck de enchimento",
    drawerLabel: "Uma playlist sob o deck",
    more: "Todos os recursos de karaokê, com o que ainda não foi provado →",
    guide: "O guia do apresentador: o que apertar na noite →",
  },
  hardware: {
    eyebrow: "Hardware",
    title: "Conecte o que você tem.",
    lead: "O djmanzo vem com mapeamentos escritos a partir da tabela MIDI de cada fabricante. O resto, mapeie você mesmo: aperte um controle, escolha o que ele faz, salve. O teclado do seu notebook também é um controlador.",
    search: "Buscar controladores",
    placeholder: "Busque uma marca ou modelo — “pioneer 400”, “launchpad”",
    show: "Mostrar",
    all: "Todos",
    mapped: "Com mapeamento",
    planned: "Planejado",
    plannedCaveat: "Ainda não está no djmanzo.",
    none: "Não está na lista. Mapeie você mesmo no djmanzo — ou peça nos <a href=\"{wishes}\">pedidos de recursos</a>.",
    kinds: { Controller: "Controlador", Player: "Player", "Pad grid": "Grade de pads", Generic: "Genérico", Turntables: "Toca-discos" },
  },
  live: {
    eyebrow: "Feito por DJs",
    title: "Um marketplace que não custa nada. Um fórum que não foge do assunto.",
    lead: "Temas, skins e visuais feitos por DJs para o djmanzo, grátis, assinados por quem fez e revisados antes de entrar na lista. E um lugar para fazer a pergunta que todo mundo no show estava pensando.",
    market: "Marketplace",
    browse: "Ver tudo →",
    marketEmpty: "Prateleiras novas: nada listado ainda. Fez um tema, uma skin ou um look no djmanzo? <a href=\"{market}\">Publique</a> — grátis para todos.",
    loading: "Carregando…",
    forum: "Fórum",
    join: "Participe →",
    forumEmpty: "Tudo quieto por enquanto. Faça a primeira pergunta — mixagem, tons harmônicos, karaokê, equipamento — <a href=\"{community}\">no fórum</a>.",
    reply: "resposta",
    replies: "respostas",
    wishes: "<a href=\"{wishes}\">Pedidos de recursos</a>: peça o que o djmanzo deve fazer a seguir, e vote.",
  },
  faq: {
    eyebrow: "Perguntas",
    title: "Respostas diretas.",
    lead: "Faltou algo? <a href=\"{community}\">Pergunte no fórum</a>, ou ao assistente no fim da página.",
    price: "Preço e licença",
    platforms: "Plataformas e hardware",
    privacy: "Privacidade e a pista",
    free: ["É grátis mesmo?", "Sim: a edição Hobbyist."],
    plans: ["Comprar uma vez ou assinar?", "Como preferir. Compra única: paga uma vez e continua funcionando — offline também. Mensal: todas as atualizações enquanto durar; cancele quando quiser. Anual: todas as atualizações enquanto durar, pelo preço de dez meses."],
    cheaper: ["Por que é mais barato onde eu moro?", "Os preços acompanham o custo de vida: 40, 60 ou 70 % de desconto, pelos grupos de renda do Banco Mundial, com cartão e endereço de cobrança de lá. Estudantes e professores pagam metade. Descontos não se somam — vale o maior."],
    trial: ["Posso testar uma edição paga antes?", "{days} dias de qualquer edição, Full incluída, uma vez por conta."],
    upgrade: ["E se minha edição ficar pequena?", "Faça upgrade e pague só a diferença: o que você pagou conta inteiro."],
    linux: "Roda mesmo no Linux?",
    windows: "E no Windows?",
    oldmac: "Meu Mac é antigo.",
    controller: ["Meu controlador vai funcionar?", "Procure na lista de hardware acima. Sem mapeamento incluído, mapeie você mesmo no djmanzo: aperte um controle e escolha o que ele faz."],
    knows: ["O que esta página sabe sobre mim?", "Só o país de onde vem sua conexão, para escolher o look e os preços. O look que você escolhe fica no seu navegador. A loja e o fórum guardam o que você compra e publica, como diz o aviso de privacidade."],
    watch: "O djmanzo vigia o público?",
    market: ["O marketplace é grátis mesmo?", "Tudo nele é grátis, para todos: sem pagamentos, sem comissão. Quem faz pode colocar o link do próprio cofrinho de gorjetas. Os pacotes são assinados por quem fez e revisados antes de entrar na lista; música dos outros nunca é permitida."],
  },
};

const de: SectionWords = {
  keys: {
    eyebrow: "Deine Hände",
    title: "Tasten, die sich wie Wörter lesen.",
    lead: "Drück <kbd>Space</kbd>, und djmanzo zeigt jede Taste. <kbd>d</kbd> <kbd>1</kbd> <kbd>p</kbd> ist <b>d</b>eck <b>1</b> <b>p</b>lay (Deck 1 spielt); <kbd>o</kbd> <kbd>i</kbd> öffnet die S<b>i</b>ngers, die Singenden. Vorher nichts auswendig lernen: Die Übersicht ist da, bis deine Finger den Weg kennen.",
    sets: "Ein <b>Tastatur-Set</b> fügt Tasten für eine Arbeitsweise hinzu — die Reihenfolge eines Karaoke-Hosts, den Crossfader eines Scratch-DJs — auf Buchstaben, die djmanzo frei lässt, unter deinen eigenen Tasten. Es ergänzt deine Tasten; es nimmt dir nie eine weg. Neun kommen mit djmanzo, eins für jede Arbeitsweise; weitere gibt es im <a href=\"{market}\">Marktplatz</a>, wo ein Set eines von djmanzo komplett mitbringen und erweitern kann, sogar in djmanzos eigenen Gruppen; und deine eigenen lassen sich als Set speichern oder mit deinem Namen veröffentlichen.",
    wearOne: "Trag eins: Sie kommen mit djmanzo",
    wearAria: "Ein Tastatur-Set tragen, das mit djmanzo kommt",
    orOne: "Oder eins von <a href=\"{market}\">Outboard</a>, kostenlos",
    marketAria: "Ein Tastatur-Set aus dem Marktplatz tragen",
    pack: "Pack",
    tryAria: "Probier die Tasten: Space drücken, dann die Buchstaben",
    hint: "Rücktaste: zurück · Esc: schließen",
    sketch: "eine Skizze der Übersicht",
    pressSpace: "Space drücken",
    orClick: "oder hier klicken und deine Tastatur benutzen",
    note: "Die echte Übersicht listet jedes Panel, Theme, jeden Arbeitsbereich und jedes Preset auf deinem Rechner; diese Skizze zeigt ihre Form.",
    inApp: "In djmanzo: das Keys-Panel",
  },
  karaoke: {
    eyebrow: "Karaoke",
    title: "Ein ganzer Karaoke-Abend,<br />im selben Download.",
    lead: "Die Warteschlange und der Bildschirm für die Singenden, die Stimme aus jeder Platte deiner Sammlung entfernt — oder leise als Führung gelassen —, ein Mikrofon samt Effekten für jede Stimme, Handys, die Namen eintragen, ein Quiz, Punkte und ein Song für den Gast, der gesungen hat. Die Karaoke-Edition hat alles davon; Full auch.",
    night: { before: "Vor der ersten Person am Mikro", singing: "Jemand singt", between: "Zwischen zwei Auftritten", after: "Nach dem Song" },
    decksEyebrow: "Zwei Decks, zwei Playlists",
    decksTitle: "Der Song der singenden Person auf einem Deck. Der Lückenfüller dreht seine Runden auf dem anderen.",
    diagramAria: "Deck 1 spielt den Song mit der Stimme wie aufgenommen, als Führung oder raus; Deck 2 spielt eine Playlist mit Lückenfüllern auf Repeat; Pausenmusik führt vom einen zum Song der nächsten Person.",
    deck1: "Deck 1 · wer singt",
    singerLine: "Ana — \"Paper Moons\", −1 Ton",
    deck2: "Deck 2 · das Füller-Deck",
    playlist: "Playlist: Jingles und Loops",
    fillers: ["Haus-Jingle", "Drum-Loop, 8 Takte", "Location-Jingle", "Publikums-Loop"],
    decksText: "Jedes Deck hat seine eigene Playlist-Schublade. Für die singende Person entscheidet <b>As recorded · Guide · Out</b>, wie viel von der Originalstimme bleibt — die Vocals sind ein Stem wie die Drums, also gehen sie aus jeder Platte raus. Auf dem anderen Deck hak <b>Next when this ends</b> und <b>Repeat</b> an, und deine Jingles und Loops drehen von selbst ihre Runden, während du dich um den Raum kümmerst; <b>Pausenmusik</b> führt von dort in den Song der nächsten Person.",
    guestEyebrow: "Ein Song für den Gast",
    guestTitle: "Vom Gästebuch in ihr WhatsApp.",
    flow: [
      { title: "Gesungen", text: "Als gesungen markiert, wird die Person mit Song und Uhrzeit ins Gästebuch des Abends eingetragen." },
      { title: "Einverstanden", text: "Eine Frage nach der anderen: Angaben speichern, fünfzehn Sekunden der Stimme aufnehmen, einen Song machen. Unter sechzehn werden Kontakt und Stimme abgelehnt." },
      { title: "Ein Song für sie", text: "Dein KI-Anbieter schreibt den Text — über die Person, den Song, den sie gesungen hat, den Ort und den Abend — und djmanzo füllt Sunos Formular aus. Du prüfst es und drückst Create." },
      { title: "An ihr WhatsApp geschickt", text: "Der fertige Link landet auf ihrer Karte; WhatsApp öffnet ihren Chat mit der geschriebenen Nachricht. Du drückst Senden." },
    ],
    guestCaveat: "Suno hat keine öffentliche API, und seine Bedingungen verbieten Bots: djmanzo füllt das Formular aus, du drückst Create und sendest. Nichts verlässt den Rechner, außer du schickst es. Das Texten braucht einen in djmanzo eingerichteten KI-Anbieter.",
    drawer: "In djmanzo: das Füller-Deck",
    drawerLabel: "Eine Playlist unter dem Deck",
    more: "Jede Karaoke-Funktion, samt dem, was noch nicht bewiesen ist →",
    guide: "Der Leitfaden für Hosts: was am Abend zu drücken ist →",
  },
  hardware: {
    eyebrow: "Hardware",
    title: "Schließ an, was du hast.",
    lead: "Mappings nach der MIDI-Tabelle des jeweiligen Herstellers kommen mit djmanzo. Alles andere mappst du selbst: Bedienelement drücken, Funktion wählen, speichern. Auch die Tastatur deines Laptops ist ein Controller.",
    search: "Controller suchen",
    placeholder: "Hersteller oder Modell suchen — „pioneer 400“, „launchpad“",
    show: "Zeigen",
    all: "Alle",
    mapped: "Mapping dabei",
    planned: "Geplant",
    plannedCaveat: "Noch nicht in djmanzo.",
    none: "Nicht in der Liste. Mapp ihn selbst in djmanzo — oder wünsch ihn dir bei den <a href=\"{wishes}\">Funktionswünschen</a>.",
    kinds: { Controller: "Controller", Player: "Player", "Pad grid": "Pad-Raster", Generic: "Generisch", Turntables: "Plattenspieler" },
  },
  live: {
    eyebrow: "Von DJs gemacht",
    title: "Ein Marktplatz, der nichts kostet. Ein Forum, das beim Thema bleibt.",
    lead: "Themes, Skins und Visuals, von DJs für djmanzo gemacht, kostenlos, von ihren Machern signiert und geprüft, bevor sie gelistet werden. Und ein Ort für die Frage, die sich beim Gig alle gestellt haben.",
    market: "Marktplatz",
    browse: "Alle ansehen →",
    marketEmpty: "Neue Regale: noch nichts gelistet. Ein Theme, einen Skin oder einen Look in djmanzo gebaut? <a href=\"{market}\">Stell es rein</a> — kostenlos für alle.",
    loading: "Lädt …",
    forum: "Forum",
    join: "Mitmachen →",
    forumEmpty: "Bisher ruhig. Stell die erste Frage — Mixen, harmonische Tonarten, Karaoke-Hosting, Equipment — <a href=\"{community}\">im Forum</a>.",
    reply: "Antwort",
    replies: "Antworten",
    wishes: "<a href=\"{wishes}\">Funktionswünsche</a>: Wünsch dir, was djmanzo als Nächstes können soll, und stimm ab.",
  },
  faq: {
    eyebrow: "Fragen",
    title: "Klare Antworten.",
    lead: "Fehlt etwas? <a href=\"{community}\">Frag im Forum</a>, oder frag den Assistenten unten auf der Seite.",
    price: "Preis und Lizenz",
    platforms: "Plattformen und Hardware",
    privacy: "Datenschutz und der Raum",
    free: ["Ist es wirklich kostenlos?", "Ja: die Hobbyist-Edition."],
    plans: ["Einmal kaufen oder abonnieren?", "Beides geht. Einmal kaufen: einmal bezahlt, und es läuft weiter — auch offline. Monatlich: jedes Update, solange es läuft; jederzeit kündbar. Jährlich: jedes Update, solange es läuft, zum Preis von zehn Monaten."],
    cheaper: ["Warum ist es dort billiger, wo ich wohne?", "Die Preise folgen den Lebenshaltungskosten: 40, 60 oder 70 % günstiger, nach den Einkommensgruppen der Weltbank, mit Karte und Rechnungsadresse von dort. Studierende und Lehrkräfte zahlen die Hälfte. Rabatte werden nie addiert — du bekommst den größeren."],
    trial: ["Kann ich eine bezahlte Edition vorher testen?", "{days} Tage jede Edition, Full eingeschlossen, einmal pro Konto."],
    upgrade: ["Und wenn mir meine Edition zu klein wird?", "Upgrade und zahl nur die Differenz: Was du gezahlt hast, zählt voll."],
    linux: "Läuft es wirklich unter Linux?",
    windows: "Und Windows?",
    oldmac: "Mein Mac ist alt.",
    controller: ["Funktioniert mein Controller?", "Such oben in der Hardware-Liste. Ohne mitgeliefertes Mapping mappst du ihn selbst in djmanzo: Bedienelement drücken, Funktion wählen."],
    knows: ["Was weiß diese Seite über mich?", "Nur das Land, aus dem deine Verbindung kommt, um Look und Preise zu wählen. Der Look, den du wählst, bleibt in deinem Browser. Shop und Forum speichern, was du kaufst und postest, wie es in der Datenschutzerklärung steht."],
    watch: "Beobachtet djmanzo das Publikum?",
    market: ["Ist der Marktplatz wirklich kostenlos?", "Alles darin ist kostenlos, für alle: keine Zahlungen, keine Provision. Wer etwas macht, darf die eigene Trinkgeld-Seite verlinken. Packs sind von ihren Machern signiert und werden vor dem Listen geprüft; Musik anderer ist nie erlaubt."],
  },
};

const fr: SectionWords = {
  keys: {
    eyebrow: "Vos mains",
    title: "Des touches qui se lisent comme des mots.",
    lead: "Appuyez sur <kbd>Space</kbd> et djmanzo montre chaque touche. <kbd>d</kbd> <kbd>1</kbd> <kbd>p</kbd>, c'est <b>d</b>eck <b>1</b> <b>p</b>lay (la platine 1 joue) ; <kbd>o</kbd> <kbd>i</kbd> ouvre les s<b>i</b>ngers, les chanteurs. Rien à apprendre par cœur d'abord : le guide est là jusqu'à ce que vos doigts connaissent le chemin.",
    sets: "Un <b>jeu de touches</b> ajoute des touches pour une façon de travailler — la rotation d'un animateur karaoké, le crossfader d'un DJ scratch — sur les lettres que djmanzo laisse libres, sous les touches que vous avez créées. Il complète vos touches ; il ne vous en retire jamais une. Neuf sont livrés avec djmanzo, un par façon de travailler ; d'autres sont sur la <a href=\"{market}\">place de marché</a>, où un jeu peut reprendre l'un de ceux de djmanzo en entier et le compléter, même dans les groupes propres à djmanzo ; et les vôtres peuvent être enregistrés comme jeu, ou publiés sous votre nom.",
    wearOne: "Portez-en un : ils sont livrés avec djmanzo",
    wearAria: "Porter un jeu de touches livré avec djmanzo",
    orOne: "Ou un de l'<a href=\"{market}\">Outboard</a>, gratuit",
    marketAria: "Porter un jeu de touches de la place de marché",
    pack: "pack",
    tryAria: "Essayez les touches : appuyez sur Space, puis sur les lettres",
    hint: "Retour arrière : revenir · Échap : fermer",
    sketch: "une esquisse du guide",
    pressSpace: "Appuyez sur Space",
    orClick: "ou cliquez ici et utilisez votre clavier",
    note: "Le vrai guide liste chaque panneau, thème, espace de travail et preset de votre machine ; cette esquisse en montre la forme.",
    inApp: "Dans djmanzo : le panneau Keys",
  },
  karaoke: {
    eyebrow: "Karaoké",
    title: "Une soirée karaoké entière,<br />dans le même téléchargement.",
    lead: "La file d'attente et l'écran des chanteurs, la voix retirée de n'importe quel disque de votre collection — ou laissée, discrètement, comme guide —, un micro et ses effets pour chaque chanteur, des téléphones qui inscrivent les noms, un quiz, des scores et une chanson faite pour l'invité qui a chanté. L'édition Karaoke contient tout cela ; Full aussi.",
    night: { before: "Avant le premier chanteur", singing: "Quelqu'un chante", between: "Entre deux chanteurs", after: "Après sa chanson" },
    decksEyebrow: "Deux platines, deux playlists",
    decksTitle: "La chanson du chanteur sur une platine. Le remplissage qui tourne sur l'autre.",
    diagramAria: "La platine 1 joue la chanson du chanteur avec la voix d'origine, en guide ou retirée ; la platine 2 joue une playlist de remplissage en Repeat ; la musique d'entracte mène de l'une à la chanson du chanteur suivant.",
    deck1: "Platine 1 · le chanteur",
    singerLine: "Ana — \"Paper Moons\", −1 ton",
    deck2: "Platine 2 · la platine de remplissage",
    playlist: "Playlist : jingles et boucles",
    fillers: ["Jingle maison", "Boucle de batterie, 8 mesures", "Habillage du lieu", "Boucle de public"],
    decksText: "Chaque platine a son propre tiroir de playlist. Pour le chanteur, <b>As recorded · Guide · Out</b> décide ce qui reste de la voix d'origine — la voix est un stem comme la batterie, elle sort donc de n'importe quel disque. Sur l'autre platine, cochez <b>Next when this ends</b> et <b>Repeat</b>, et vos jingles et boucles tournent tout seuls pendant que vous vous occupez de la salle ; la <b>musique d'entracte</b> mène de là à la chanson du chanteur suivant.",
    guestEyebrow: "Une chanson pour l'invité",
    guestTitle: "Du livre d'or à son WhatsApp.",
    flow: [
      { title: "Il a chanté", text: "Marqué comme passé, il est inscrit dans le livre d'or de la soirée avec la chanson et l'heure." },
      { title: "Il est d'accord", text: "Une question à la fois : garder ses coordonnées, enregistrer quinze secondes de sa voix, lui faire une chanson. Avant seize ans, le contact et la voix sont refusés." },
      { title: "Une chanson pour lui", text: "Votre fournisseur d'IA écrit les paroles — sur la personne, la chanson qu'elle a chantée, le lieu et la soirée — et djmanzo remplit le formulaire de Suno. Vous vérifiez et appuyez sur Create." },
      { title: "Envoyée sur son WhatsApp", text: "Le lien final arrive sur sa fiche ; WhatsApp s'ouvre sur sa conversation avec le message rédigé. Vous appuyez sur envoyer." },
    ],
    guestCaveat: "Suno n'a pas d'API publique et ses conditions interdisent les robots : djmanzo remplit le formulaire, vous appuyez sur Create et envoyez. Rien ne quitte la machine tant que vous ne l'envoyez pas. Écrire les paroles demande un fournisseur d'IA configuré dans djmanzo.",
    drawer: "Dans djmanzo : la platine de remplissage",
    drawerLabel: "Une playlist sous la platine",
    more: "Toutes les fonctions karaoké, avec ce qui n'est pas encore prouvé →",
    guide: "Le guide de l'animateur : quoi presser pendant la soirée →",
  },
  hardware: {
    eyebrow: "Matériel",
    title: "Branchez ce que vous avez.",
    lead: "djmanzo est livré avec des mappings écrits d'après la table MIDI de chaque fabricant. Pour le reste, mappez vous-même : appuyez sur une commande, choisissez ce qu'elle fait, enregistrez. Le clavier de votre portable est aussi un contrôleur.",
    search: "Chercher un contrôleur",
    placeholder: "Cherchez une marque ou un modèle — « pioneer 400 », « launchpad »",
    show: "Afficher",
    all: "Tous",
    mapped: "Mapping livré",
    planned: "Prévu",
    plannedCaveat: "Pas encore dans djmanzo.",
    none: "Pas dans la liste. Mappez-le vous-même dans djmanzo — ou demandez-le dans les <a href=\"{wishes}\">demandes de fonctionnalités</a>.",
    kinds: { Controller: "Contrôleur", Player: "Lecteur", "Pad grid": "Grille de pads", Generic: "Générique", Turntables: "Platines vinyle" },
  },
  live: {
    eyebrow: "Fait par des DJ",
    title: "Une place de marché qui ne coûte rien. Un forum qui reste dans le sujet.",
    lead: "Thèmes, skins et visuels faits par des DJ pour djmanzo, gratuits, signés par leurs auteurs et vérifiés avant d'être listés. Et un endroit pour poser la question que toute la soirée se posait.",
    market: "Place de marché",
    browse: "Tout voir →",
    marketEmpty: "Rayons neufs : rien de listé pour l'instant. Vous avez fait un thème, un skin ou un look dans djmanzo ? <a href=\"{market}\">Publiez-le</a> — gratuit pour tous.",
    loading: "Chargement…",
    forum: "Forum",
    join: "Participer →",
    forumEmpty: "Calme pour l'instant. Posez la première question — mix, tonalités harmoniques, animation karaoké, matériel — <a href=\"{community}\">sur le forum</a>.",
    reply: "réponse",
    replies: "réponses",
    wishes: "<a href=\"{wishes}\">Demandes de fonctionnalités</a> : demandez ce que djmanzo devrait faire ensuite, et votez.",
  },
  faq: {
    eyebrow: "Questions",
    title: "Des réponses franches.",
    lead: "Il manque quelque chose ? <a href=\"{community}\">Demandez sur le forum</a>, ou à l'assistant en bas de la page.",
    price: "Prix et licence",
    platforms: "Plateformes et matériel",
    privacy: "Vie privée et la salle",
    free: ["C'est vraiment gratuit ?", "Oui : l'édition Hobbyist."],
    plans: ["Acheter une fois ou s'abonner ?", "Au choix. Achat unique : payé une fois, et ça continue de marcher — hors ligne aussi. Mensuel : toutes les mises à jour tant qu'il court ; résiliable à tout moment. Annuel : toutes les mises à jour tant qu'il court, pour le prix de dix mois."],
    cheaper: ["Pourquoi est-ce moins cher là où je vis ?", "Les prix suivent le coût de la vie : 40, 60 ou 70 % de moins, selon les groupes de revenus de la Banque mondiale, avec une carte et une adresse de facturation de là-bas. Étudiants et enseignants paient moitié prix. Les réductions ne se cumulent jamais — vous avez la plus grande."],
    trial: ["Puis-je d'abord essayer une édition payante ?", "{days} jours de n'importe quelle édition, Full comprise, une fois par compte."],
    upgrade: ["Et si mon édition devient trop petite ?", "Passez à la suivante et ne payez que la différence : ce que vous avez payé compte en entier."],
    linux: "Ça tourne vraiment sous Linux ?",
    windows: "Et sous Windows ?",
    oldmac: "Mon Mac est ancien.",
    controller: ["Mon contrôleur va-t-il marcher ?", "Cherchez dans la liste du matériel ci-dessus. Sans mapping livré, mappez-le vous-même dans djmanzo : appuyez sur une commande, choisissez ce qu'elle fait."],
    knows: ["Que sait cette page de moi ?", "Seulement le pays d'où vient votre connexion, pour choisir son look et ses prix. Le look que vous choisissez reste dans votre navigateur. La boutique et le forum gardent ce que vous achetez et publiez, comme le dit la politique de confidentialité."],
    watch: "djmanzo surveille-t-il le public ?",
    market: ["La place de marché est-elle vraiment gratuite ?", "Tout y est gratuit, pour tous : aucun paiement, aucune commission. Un auteur peut mettre un lien vers sa propre cagnotte. Les packs sont signés par leur auteur et vérifiés avant d'être listés ; la musique des autres n'est jamais autorisée."],
  },
};

const it: SectionWords = {
  keys: {
    eyebrow: "Le tue mani",
    title: "Tasti che si leggono come parole.",
    lead: "Premi <kbd>Space</kbd> e djmanzo mostra ogni tasto. <kbd>d</kbd> <kbd>1</kbd> <kbd>p</kbd> è <b>d</b>eck <b>1</b> <b>p</b>lay (il deck 1 suona); <kbd>o</kbd> <kbd>i</kbd> apre i s<b>i</b>ngers, i cantanti. Niente da imparare a memoria prima: la guida c'è finché le dita non conoscono la strada.",
    sets: "Un <b>set di tasti</b> aggiunge tasti per un modo di lavorare — la rotazione di chi conduce un karaoke, il crossfader di un DJ di scratch — sulle lettere che djmanzo lascia libere, sotto i tasti che hai creato tu. Completa i tasti che hai; non te ne toglie mai uno. Nove arrivano con djmanzo, uno per ogni modo di lavorare; altri sono nel <a href=\"{market}\">marketplace</a>, dove un set può portare intero uno di quelli di djmanzo e ampliarlo, anche dentro i gruppi di djmanzo; e i tuoi si possono salvare come set o pubblicare con il tuo nome.",
    wearOne: "Indossane uno: arrivano con djmanzo",
    wearAria: "Indossa un set di tasti incluso in djmanzo",
    orOne: "Oppure uno da <a href=\"{market}\">Outboard</a>, gratis",
    marketAria: "Indossa un set di tasti dal marketplace",
    pack: "pack",
    tryAria: "Prova i tasti: premi Space, poi le lettere",
    hint: "Backspace: indietro · Esc: chiudi",
    sketch: "uno schizzo della guida",
    pressSpace: "Premi Space",
    orClick: "oppure clicca qui e usa la tastiera",
    note: "La guida vera elenca ogni pannello, tema, spazio di lavoro e preset sul tuo computer; questo schizzo ne mostra la forma.",
    inApp: "In djmanzo: il pannello Keys",
  },
  karaoke: {
    eyebrow: "Karaoke",
    title: "Un'intera serata karaoke,<br />nello stesso download.",
    lead: "La coda e lo schermo per chi canta, la voce tolta da qualsiasi disco della tua collezione — o lasciata, piano, come guida —, un microfono e i suoi effetti per ogni cantante, telefoni che segnano i nomi, un quiz, i punteggi e una canzone fatta per l'ospite che ha cantato. L'edizione Karaoke ha tutto questo; anche Full.",
    night: { before: "Prima del primo cantante", singing: "Qualcuno sta cantando", between: "Tra un cantante e l'altro", after: "Dopo la sua canzone" },
    decksEyebrow: "Due deck, due playlist",
    decksTitle: "La canzone di chi canta su un deck. Il riempitivo che gira sull'altro.",
    diagramAria: "Il deck 1 suona la canzone di chi canta con la voce originale, come guida o tolta; il deck 2 suona una playlist di riempitivi in Repeat; la musica d'intervallo porta dall'una alla canzone del prossimo cantante.",
    deck1: "Deck 1 · chi canta",
    singerLine: "Ana — \"Paper Moons\", −1 tono",
    deck2: "Deck 2 · il deck riempitivo",
    playlist: "Playlist: jingle e loop",
    fillers: ["Jingle della casa", "Loop di batteria, 8 battute", "Sigla del locale", "Loop del pubblico"],
    decksText: "Ogni deck ha il suo cassetto playlist. Per chi canta, <b>As recorded · Guide · Out</b> decide quanto resta della voce originale — la voce è uno stem come la batteria, quindi si toglie da qualsiasi disco. Sull'altro deck spunta <b>Next when this ends</b> e <b>Repeat</b>, e i tuoi jingle e loop girano da soli mentre ti occupi della sala; la <b>musica d'intervallo</b> porta da lì alla canzone del prossimo cantante.",
    guestEyebrow: "Una canzone per l'ospite",
    guestTitle: "Dal libro degli ospiti al suo WhatsApp.",
    flow: [
      { title: "Ha cantato", text: "Segnato come cantato, entra nel libro degli ospiti della serata con la canzone e l'ora." },
      { title: "È d'accordo", text: "Una domanda alla volta: conservare i suoi dati, registrare quindici secondi della sua voce, fargli una canzone. Sotto i sedici anni, contatto e voce vengono rifiutati." },
      { title: "Una canzone per lui", text: "Il tuo fornitore di IA scrive il testo — sulla persona, la canzone che ha cantato, il posto e la serata — e djmanzo compila il modulo di Suno. Tu controlli e premi Create." },
      { title: "Inviata al suo WhatsApp", text: "Il link finito arriva sulla sua scheda; WhatsApp si apre sulla sua chat con il messaggio scritto. Tu premi invia." },
    ],
    guestCaveat: "Suno non ha un'API pubblica e i suoi termini vietano i robot: djmanzo compila il modulo, tu premi Create e invii. Niente lascia il computer se non lo invii tu. Scrivere il testo richiede un fornitore di IA configurato in djmanzo.",
    drawer: "In djmanzo: il deck riempitivo",
    drawerLabel: "Una playlist sotto il deck",
    more: "Ogni funzione karaoke, con ciò che non è ancora provato →",
    guide: "La guida per chi conduce: cosa premere durante la serata →",
  },
  hardware: {
    eyebrow: "Hardware",
    title: "Collega quello che hai.",
    lead: "djmanzo include mappature scritte dalla tabella MIDI di ciascun produttore. Tutto il resto lo mappi tu: premi un comando, scegli cosa fa, salva. Anche la tastiera del tuo portatile è un controller.",
    search: "Cerca controller",
    placeholder: "Cerca una marca o un modello — «pioneer 400», «launchpad»",
    show: "Mostra",
    all: "Tutti",
    mapped: "Mappatura inclusa",
    planned: "Previsto",
    plannedCaveat: "Non ancora in djmanzo.",
    none: "Non è nella lista. Mappalo tu in djmanzo — o chiedilo nelle <a href=\"{wishes}\">richieste di funzioni</a>.",
    kinds: { Controller: "Controller", Player: "Player", "Pad grid": "Griglia di pad", Generic: "Generico", Turntables: "Giradischi" },
  },
  live: {
    eyebrow: "Fatto da DJ",
    title: "Un marketplace che non costa niente. Un forum che resta in tema.",
    lead: "Temi, skin e visual fatti da DJ per djmanzo, gratis, firmati da chi li ha creati e controllati prima di essere elencati. E un posto per fare la domanda che tutti alla serata si stavano facendo.",
    market: "Marketplace",
    browse: "Vedi tutto →",
    marketEmpty: "Scaffali nuovi: ancora niente in elenco. Hai fatto un tema, una skin o un look in djmanzo? <a href=\"{market}\">Pubblicalo</a> — gratis per tutti.",
    loading: "Caricamento…",
    forum: "Forum",
    join: "Partecipa →",
    forumEmpty: "Tutto tranquillo per ora. Fai la prima domanda — mixaggio, tonalità armoniche, karaoke, attrezzatura — <a href=\"{community}\">nel forum</a>.",
    reply: "risposta",
    replies: "risposte",
    wishes: "<a href=\"{wishes}\">Richieste di funzioni</a>: chiedi cosa dovrebbe fare djmanzo dopo, e vota.",
  },
  faq: {
    eyebrow: "Domande",
    title: "Risposte chiare.",
    lead: "Manca qualcosa? <a href=\"{community}\">Chiedi nel forum</a>, o all'assistente in fondo alla pagina.",
    price: "Prezzo e licenza",
    platforms: "Piattaforme e hardware",
    privacy: "Privacy e la sala",
    free: ["È davvero gratis?", "Sì: l'edizione Hobbyist."],
    plans: ["Comprare una volta o abbonarsi?", "Come preferisci. Acquisto unico: paghi una volta e continua a funzionare — anche offline. Mensile: ogni aggiornamento finché è attivo; disdici quando vuoi. Annuale: ogni aggiornamento finché è attivo, al prezzo di dieci mesi."],
    cheaper: ["Perché dove vivo costa meno?", "I prezzi seguono il costo della vita: 40, 60 o 70 % in meno, secondo le fasce di reddito della Banca Mondiale, con carta e indirizzo di fatturazione di lì. Studenti e insegnanti pagano metà. Gli sconti non si sommano mai — vale il maggiore."],
    trial: ["Posso provare prima un'edizione a pagamento?", "{days} giorni di qualsiasi edizione, Full compresa, una volta per account."],
    upgrade: ["E se la mia edizione mi sta stretta?", "Passa a un'altra e paga solo la differenza: quello che hai pagato conta per intero."],
    linux: "Gira davvero su Linux?",
    windows: "E su Windows?",
    oldmac: "Il mio Mac è vecchio.",
    controller: ["Il mio controller funzionerà?", "Cercalo nella lista dell'hardware qui sopra. Senza mappatura inclusa, mappalo tu in djmanzo: premi un comando e scegli cosa fa."],
    knows: ["Cosa sa di me questa pagina?", "Solo il paese da cui arriva la tua connessione, per scegliere il look e i prezzi. Il look che scegli resta nel tuo browser. Il negozio e il forum conservano ciò che compri e pubblichi, come dice l'informativa sulla privacy."],
    watch: "djmanzo osserva il pubblico?",
    market: ["Il marketplace è davvero gratis?", "Tutto è gratis, per tutti: niente pagamenti, niente commissioni. Chi crea può mettere il link al proprio salvadanaio per le mance. I pack sono firmati da chi li ha fatti e controllati prima di essere elencati; la musica altrui non è mai ammessa."],
  },
};

const ja: SectionWords = {
  keys: {
    eyebrow: "あなたの手",
    title: "言葉のように読めるキー。",
    lead: "<kbd>Space</kbd> を押すと、djmanzo がすべてのキーを表示します。<kbd>d</kbd> <kbd>1</kbd> <kbd>p</kbd> は <b>d</b>eck <b>1</b> <b>p</b>lay（デッキ 1 を再生）、<kbd>o</kbd> <kbd>i</kbd> は s<b>i</b>ngers（歌い手）を開きます。先に覚える必要はありません。指が道を覚えるまで、ガイドがそこにあります。",
    sets: "<b>キーボードセット</b>は、ひとつの作業スタイル（カラオケ進行役のローテーション、スクラッチ DJ のクロスフェーダーなど）のためのキーを、djmanzo が空けている文字に、あなた自身のキーの下に追加します。今あるキーを補うもので、キーを奪うことはありません。djmanzo には作業スタイルごとに 9 つ付属。さらに<a href=\"{market}\">マーケットプレイス</a>には、djmanzo のセットを丸ごと引き継いで拡張できるもの（djmanzo 自身のグループの中でも）があり、自分のキーもセットとして保存したり、名前を付けて公開したりできます。",
    wearOne: "着けてみる：djmanzo に付属",
    wearAria: "djmanzo 付属のキーボードセットを着ける",
    orOne: "または <a href=\"{market}\">Outboard</a> から無料で",
    marketAria: "マーケットプレイスのキーボードセットを着ける",
    pack: "パック",
    tryAria: "キーを試す：Space を押してから文字を",
    hint: "Backspace：戻る · Esc：閉じる",
    sketch: "ガイドのスケッチ",
    pressSpace: "Space を押す",
    orClick: "または、ここをクリックしてキーボードで",
    note: "本物のガイドは、あなたのマシン上のすべてのパネル、テーマ、ワークスペース、プリセットを一覧にします。このスケッチはその形を見せるものです。",
    inApp: "djmanzo では：Keys パネル",
  },
  karaoke: {
    eyebrow: "カラオケ",
    title: "カラオケの夜をまるごと、<br />同じダウンロードで。",
    lead: "予約の順番待ちと歌い手用の画面、コレクションのどのレコードからでも抜けるボーカル（ガイドとして小さく残すことも）、歌い手ごとのマイクとエフェクト、名前を登録するスマホ、クイズ、採点、そして歌ったゲストのために作る一曲。Karaoke エディションにすべて入っています。Full にも。",
    night: { before: "最初の歌い手の前に", singing: "誰かが歌っているとき", between: "歌い手の合間に", after: "歌い終えたら" },
    decksEyebrow: "2 台のデッキ、2 つのプレイリスト",
    decksTitle: "片方のデッキに歌い手の曲。もう片方ではつなぎの音がぐるぐる。",
    diagramAria: "デッキ 1 は歌い手の曲を、原曲のまま・ガイド・ボーカル抜きで再生。デッキ 2 はつなぎのプレイリストを Repeat で再生。幕間の音楽が次の歌い手の曲へつなぎます。",
    deck1: "デッキ 1 · 歌い手",
    singerLine: "Ana — \"Paper Moons\"、キー −1",
    deck2: "デッキ 2 · つなぎ用デッキ",
    playlist: "プレイリスト：ジングルとループ",
    fillers: ["お店のジングル", "ドラムループ、8 小節", "会場のジングル", "歓声のループ"],
    decksText: "各デッキに専用のプレイリスト引き出しがあります。歌い手には <b>As recorded · Guide · Out</b> で原曲の声をどれだけ残すかを決めます。ボーカルはドラムと同じステムなので、どのレコードからでも抜けます。もう一方のデッキでは <b>Next when this ends</b> と <b>Repeat</b> にチェックを入れれば、フロアの相手をしている間もジングルとループがひとりでに回り、<b>幕間の音楽</b>がそこから次の歌い手の曲へつなぎます。",
    guestEyebrow: "ゲストのための一曲",
    guestTitle: "ゲストブックから、その人の WhatsApp へ。",
    flow: [
      { title: "歌った", text: "歌い終えたとマークすると、曲と時刻と一緒にその夜のゲストブックに記録されます。" },
      { title: "同意する", text: "質問は一つずつ：連絡先の保存、15 秒の声の録音、その人のための一曲。16 歳未満の場合、連絡先と声はお断りします。" },
      { title: "その人のための一曲", text: "あなたの AI プロバイダーが歌詞を書き（本人のこと、歌った曲、場所とその夜について）、djmanzo が Suno のフォームに入力します。確認して Create を押すのはあなたです。" },
      { title: "WhatsApp へ送る", text: "完成したリンクがその人のカードに届き、メッセージを書いた状態で WhatsApp のチャットが開きます。送信を押すのはあなたです。" },
    ],
    guestCaveat: "Suno には公開 API がなく、規約でボットも禁じられています。djmanzo はフォームを埋めるだけで、Create と送信を押すのはあなたです。あなたが送らない限り、何もマシンの外へ出ません。歌詞を書くには、djmanzo に AI プロバイダーの設定が必要です。",
    drawer: "djmanzo では：つなぎ用デッキ",
    drawerLabel: "デッキの下のプレイリスト",
    more: "カラオケの全機能と、まだ実証されていないこと →",
    guide: "進行役ガイド：当日に押すもの →",
  },
  hardware: {
    eyebrow: "ハードウェア",
    title: "手持ちの機材をつなごう。",
    lead: "各メーカー自身の MIDI 表から書いたマッピングが djmanzo に付属します。それ以外は自分でマッピング：コントロールを押し、機能を選び、保存。ノートパソコンのキーボードもコントローラーです。",
    search: "コントローラーを検索",
    placeholder: "メーカーやモデルで検索 —「pioneer 400」「launchpad」",
    show: "表示",
    all: "すべて",
    mapped: "マッピング付属",
    planned: "予定",
    plannedCaveat: "まだ djmanzo にはありません。",
    none: "リストにありません。djmanzo で自分でマッピングするか、<a href=\"{wishes}\">機能リクエスト</a>で頼んでください。",
    kinds: { Controller: "コントローラー", Player: "プレーヤー", "Pad grid": "パッドグリッド", Generic: "汎用", Turntables: "ターンテーブル" },
  },
  live: {
    eyebrow: "DJ がつくる",
    title: "お金のかからないマーケットプレイス。脱線しないフォーラム。",
    lead: "DJ が djmanzo のために作ったテーマ、スキン、ビジュアル。無料で、作者が署名し、掲載前に確認済み。そして、ギグで誰もが思っていた疑問を聞ける場所。",
    market: "マーケットプレイス",
    browse: "すべて見る →",
    marketEmpty: "新しい棚：まだ何もありません。djmanzo でテーマ、スキン、ルックを作りましたか？ <a href=\"{market}\">公開しましょう</a>。誰でも無料です。",
    loading: "読み込み中…",
    forum: "フォーラム",
    join: "参加する →",
    forumEmpty: "まだ静かです。最初の質問をどうぞ：ミックス、ハーモニックなキー、カラオケ進行、機材など。<a href=\"{community}\">フォーラムへ</a>。",
    reply: "件の返信",
    replies: "件の返信",
    wishes: "<a href=\"{wishes}\">機能リクエスト</a>：djmanzo に次にしてほしいことを頼んで、投票しよう。",
  },
  faq: {
    eyebrow: "よくある質問",
    title: "率直な答え。",
    lead: "見つからない？ <a href=\"{community}\">フォーラムで質問</a>するか、ページ下のアシスタントに聞いてください。",
    price: "価格とライセンス",
    platforms: "対応環境とハードウェア",
    privacy: "プライバシーとフロア",
    free: ["本当に無料？", "はい。Hobbyist エディションです。"],
    plans: ["買い切り？ サブスク？", "どちらでも。買い切り：一度払えばずっと動きます（オフラインでも）。月額：契約中はすべてのアップデート、いつでも解約可。年額：契約中はすべてのアップデート、10 か月分の価格で。"],
    cheaper: ["住んでいる国だと安いのはなぜ？", "価格は生活費に合わせています。世界銀行の所得グループに応じて 40・60・70 % 引き。その国のカードと請求先住所が条件です。学生と教員は半額。割引は重ならず、大きい方が適用されます。"],
    trial: ["有料エディションを先に試せる？", "Full を含むどのエディションも {days} 日間、アカウントごとに 1 回。"],
    upgrade: ["エディションが物足りなくなったら？", "アップグレードして差額だけ。支払った分はすべて差し引かれます。"],
    linux: "本当に Linux で動く？",
    windows: "Windows は？",
    oldmac: "Mac が古いんです。",
    controller: ["自分のコントローラーは使える？", "上のハードウェア一覧で検索してください。付属マッピングがなければ、djmanzo で自分でマッピング：コントロールを押して機能を選ぶだけです。"],
    knows: ["このページは私の何を知っている？", "接続元の国だけです。ルックと価格を選ぶために使います。選んだルックはブラウザに保存されます。ショップとフォーラムは、プライバシーポリシーのとおり、購入と投稿の内容を保存します。"],
    watch: "djmanzo は観客を監視する？",
    market: ["マーケットプレイスは本当に無料？", "中のものはすべて、誰でも無料です。支払いも手数料もありません。作者は自分のチップ用ページにリンクできます。パックは作者が署名し、掲載前に確認されます。他人の音楽は一切認めていません。"],
  },
};

export const SECTIONS: Record<Lang, SectionWords> = { en, es, pt, de, fr, it, ja };

/** Fill a phrase's `{name}`s. */
export const fill = (s: string, vars: Record<string, string | number>): string => s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
