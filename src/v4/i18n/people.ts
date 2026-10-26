/**
 * The people page (`pages/People.svelte`, the island's plaza until 25
 * October): what DJs and singers say about djmanzo, their mixes, the
 * conversation, and a way to tell friends — in every language the site
 * speaks. What people write stays in the language they wrote it in. A
 * phrase marked "html" carries its own link; `{wishes}` is its address.
 */

import { carried, type Lang } from "./strings";

type Kind = "comment" | "testimonial" | "sample";

export interface PeopleWords {
  eyebrow: string;
  /** html */
  title: string;
  lead: string;
  say: string;
  outOf5: string;
  noTestimonials: string;
  mixes: string;
  play: string;
  listen: string;
  loads: string;
  noMixes: string;
  conversation: string;
  quiet: string;
  leaving: string;
  kinds: Record<Kind, string>;
  linkLabel: string;
  rating: string;
  stars: { one: string; other: string };
  bodyLabel: Record<Kind, string>;
  name: string;
  submit: string;
  posted: string;
  heldComment: string;
  heldOther: string;
  tell: string;
  share: string;
  shareText: string;
  /** html */
  wishes: string;
}

export const PEOPLE: Record<Lang, PeopleWords> = carried({
  en: {
    eyebrow: "People",
    title: "What DJs and singers<br />say and share.",
    lead: "Nothing here is written by the site about itself: testimonials are real people's words, read by the crew before they appear.",
    say: "What people say",
    outOf5: "{n} out of 5",
    noTestimonials: "No testimonials yet — djmanzo is in beta, and we would rather show none than invent any. If you have played a night with it, yours could be the first.",
    mixes: "Mixes and performances",
    play: "Play: {title} (loads YouTube)",
    listen: "Listen",
    loads: "Videos load from YouTube only when you press play.",
    noMixes: "Nothing here yet. Share a mix or a karaoke performance made with djmanzo — a YouTube, SoundCloud or Mixcloud link — and it appears once the crew has seen it.",
    conversation: "The conversation",
    quiet: "Quiet so far. Start it.",
    leaving: "What are you leaving?",
    kinds: { comment: "💬 A comment", testimonial: "⭐ A testimonial", sample: "🎬 A mix or video" },
    linkLabel: "Link (YouTube, SoundCloud or Mixcloud)",
    rating: "Rating",
    stars: { one: "{n} star", other: "{n} stars" },
    bodyLabel: { comment: "Your comment", testimonial: "Your night with djmanzo", sample: "What is it?" },
    name: "Your name",
    submit: "Leave it here",
    posted: "Posted.",
    heldComment: "Thanks — the crew reads comments from visitors who are not signed in before they appear.",
    heldOther: "Thanks — the crew reads every testimonial and sample before it appears.",
    tell: "Tell a friend",
    share: "Share…",
    shareText: "Found djmanzo — DJ and karaoke software that learns how you play.",
    wishes: 'Wishes for new features go on <a href="{wishes}">the requests page</a>.',
  },
  es: {
    eyebrow: "Gente",
    title: "Lo que DJs y cantantes<br />dicen y comparten.",
    lead: "Nada de lo que hay aquí lo escribe el sitio sobre sí mismo: los testimonios son palabras de personas reales, que el crew lee antes de que aparezcan.",
    say: "Lo que dice la gente",
    outOf5: "{n} de 5",
    noTestimonials: "Aún no hay testimonios: djmanzo está en beta y preferimos no mostrar ninguno antes que inventarlos. Si has hecho una noche con él, el tuyo puede ser el primero.",
    mixes: "Mezclas y actuaciones",
    play: "Reproducir: {title} (carga YouTube)",
    listen: "Escuchar",
    loads: "Los vídeos se cargan de YouTube solo cuando pulsas play.",
    noMixes: "Aún no hay nada. Comparte una mezcla o una actuación de karaoke hecha con djmanzo —un enlace de YouTube, SoundCloud o Mixcloud— y aparecerá cuando el crew la haya visto.",
    conversation: "La conversación",
    quiet: "Todo tranquilo por ahora. Empiézala tú.",
    leaving: "¿Qué dejas?",
    kinds: { comment: "💬 Un comentario", testimonial: "⭐ Un testimonio", sample: "🎬 Una mezcla o un vídeo" },
    linkLabel: "Enlace (YouTube, SoundCloud o Mixcloud)",
    rating: "Valoración",
    stars: { one: "{n} estrella", other: "{n} estrellas" },
    bodyLabel: { comment: "Tu comentario", testimonial: "Tu noche con djmanzo", sample: "¿Qué es?" },
    name: "Tu nombre",
    submit: "Dejarlo aquí",
    posted: "Publicado.",
    heldComment: "Gracias: el crew lee los comentarios de quienes no han iniciado sesión antes de que aparezcan.",
    heldOther: "Gracias: el crew lee cada testimonio y cada mezcla antes de que aparezcan.",
    tell: "Cuéntaselo a alguien",
    share: "Compartir…",
    shareText: "He encontrado djmanzo: software de DJ y karaoke que aprende cómo pinchas.",
    wishes: 'Las peticiones de funciones van en <a href="{wishes}">la página de peticiones</a>.',
  },
  pt: {
    eyebrow: "Pessoas",
    title: "O que DJs e cantores<br />dizem e compartilham.",
    lead: "Nada aqui é escrito pelo site sobre si mesmo: os depoimentos são palavras de pessoas reais, lidas pelo crew antes de aparecerem.",
    say: "O que as pessoas dizem",
    outOf5: "{n} de 5",
    noTestimonials: "Ainda não há depoimentos — o djmanzo está em beta, e preferimos não mostrar nenhum a inventar. Se você já fez uma noite com ele, o seu pode ser o primeiro.",
    mixes: "Mixagens e apresentações",
    play: "Tocar: {title} (carrega o YouTube)",
    listen: "Ouvir",
    loads: "Os vídeos só carregam do YouTube quando você aperta play.",
    noMixes: "Nada aqui ainda. Compartilhe uma mixagem ou uma apresentação de karaokê feita com o djmanzo — um link do YouTube, SoundCloud ou Mixcloud — e ela aparece depois que o crew a vir.",
    conversation: "A conversa",
    quiet: "Tudo quieto por enquanto. Comece você.",
    leaving: "O que você vai deixar?",
    kinds: { comment: "💬 Um comentário", testimonial: "⭐ Um depoimento", sample: "🎬 Uma mixagem ou vídeo" },
    linkLabel: "Link (YouTube, SoundCloud ou Mixcloud)",
    rating: "Avaliação",
    stars: { one: "{n} estrela", other: "{n} estrelas" },
    bodyLabel: { comment: "Seu comentário", testimonial: "Sua noite com o djmanzo", sample: "O que é?" },
    name: "Seu nome",
    submit: "Deixar aqui",
    posted: "Publicado.",
    heldComment: "Obrigado — o crew lê os comentários de quem não entrou na conta antes de aparecerem.",
    heldOther: "Obrigado — o crew lê cada depoimento e cada mixagem antes de aparecerem.",
    tell: "Conte para alguém",
    share: "Compartilhar…",
    shareText: "Achei o djmanzo — software de DJ e karaokê que aprende como você toca.",
    wishes: 'Pedidos de recursos vão na <a href="{wishes}">página de pedidos</a>.',
  },
  de: {
    eyebrow: "Menschen",
    title: "Was DJs und Sänger<br />sagen und teilen.",
    lead: "Nichts hier schreibt die Seite über sich selbst: Erfahrungsberichte sind Worte echter Menschen, die die Crew liest, bevor sie erscheinen.",
    say: "Was die Leute sagen",
    outOf5: "{n} von 5",
    noTestimonials: "Noch keine Erfahrungsberichte — djmanzo ist in der Beta, und wir zeigen lieber keine, als welche zu erfinden. Hast du schon einen Abend damit gespielt, könnte deiner der erste sein.",
    mixes: "Mixe und Auftritte",
    play: "Abspielen: {title} (lädt YouTube)",
    listen: "Anhören",
    loads: "Videos laden erst von YouTube, wenn du auf Play drückst.",
    noMixes: "Noch nichts hier. Teil einen Mix oder einen Karaoke-Auftritt, der mit djmanzo entstanden ist — einen Link zu YouTube, SoundCloud oder Mixcloud —, und er erscheint, sobald die Crew ihn gesehen hat.",
    conversation: "Das Gespräch",
    quiet: "Bisher ist es still. Fang an.",
    leaving: "Was hinterlässt du?",
    kinds: { comment: "💬 Einen Kommentar", testimonial: "⭐ Einen Erfahrungsbericht", sample: "🎬 Einen Mix oder ein Video" },
    linkLabel: "Link (YouTube, SoundCloud oder Mixcloud)",
    rating: "Bewertung",
    stars: { one: "{n} Stern", other: "{n} Sterne" },
    bodyLabel: { comment: "Dein Kommentar", testimonial: "Dein Abend mit djmanzo", sample: "Was ist es?" },
    name: "Dein Name",
    submit: "Hier lassen",
    posted: "Veröffentlicht.",
    heldComment: "Danke — die Crew liest Kommentare von Besuchern, die nicht angemeldet sind, bevor sie erscheinen.",
    heldOther: "Danke — die Crew liest jeden Erfahrungsbericht und jeden Mix, bevor er erscheint.",
    tell: "Erzähl es weiter",
    share: "Teilen…",
    shareText: "djmanzo gefunden — DJ- und Karaoke-Software, die lernt, wie du spielst.",
    wishes: 'Funktionswünsche gehören auf <a href="{wishes}">die Wunschseite</a>.',
  },
  fr: {
    eyebrow: "Les gens",
    title: "Ce que les DJ et les chanteurs<br />disent et partagent.",
    lead: "Rien ici n'est écrit par le site sur lui-même : les témoignages sont les mots de vraies personnes, lus par le crew avant de paraître.",
    say: "Ce que disent les gens",
    outOf5: "{n} sur 5",
    noTestimonials: "Pas encore de témoignage — djmanzo est en bêta, et nous préférons n'en montrer aucun plutôt que d'en inventer. Si vous avez joué une soirée avec, le vôtre peut être le premier.",
    mixes: "Mix et prestations",
    play: "Lire : {title} (charge YouTube)",
    listen: "Écouter",
    loads: "Les vidéos ne se chargent depuis YouTube que lorsque vous appuyez sur lecture.",
    noMixes: "Rien ici pour l'instant. Partagez un mix ou une prestation karaoké faits avec djmanzo — un lien YouTube, SoundCloud ou Mixcloud — et ils apparaissent une fois vus par le crew.",
    conversation: "La conversation",
    quiet: "C'est calme pour l'instant. Lancez-la.",
    leaving: "Que laissez-vous ?",
    kinds: { comment: "💬 Un commentaire", testimonial: "⭐ Un témoignage", sample: "🎬 Un mix ou une vidéo" },
    linkLabel: "Lien (YouTube, SoundCloud ou Mixcloud)",
    rating: "Note",
    stars: { one: "{n} étoile", other: "{n} étoiles" },
    bodyLabel: { comment: "Votre commentaire", testimonial: "Votre soirée avec djmanzo", sample: "Qu'est-ce que c'est ?" },
    name: "Votre nom",
    submit: "Le laisser ici",
    posted: "Publié.",
    heldComment: "Merci — le crew lit les commentaires des visiteurs non connectés avant qu'ils paraissent.",
    heldOther: "Merci — le crew lit chaque témoignage et chaque mix avant qu'il paraisse.",
    tell: "En parler à quelqu'un",
    share: "Partager…",
    shareText: "J'ai trouvé djmanzo — un logiciel de DJ et de karaoké qui apprend votre façon de jouer.",
    wishes: 'Les demandes de fonctions vont sur <a href="{wishes}">la page des demandes</a>.',
  },
  it: {
    eyebrow: "Persone",
    title: "Cosa dicono e condividono<br />DJ e cantanti.",
    lead: "Niente qui è scritto dal sito su sé stesso: le testimonianze sono parole di persone vere, lette dal crew prima che compaiano.",
    say: "Cosa dice la gente",
    outOf5: "{n} su 5",
    noTestimonials: "Ancora nessuna testimonianza: djmanzo è in beta, e preferiamo non mostrarne nessuna piuttosto che inventarle. Se ci hai fatto una serata, la tua può essere la prima.",
    mixes: "Mix ed esibizioni",
    play: "Riproduci: {title} (carica YouTube)",
    listen: "Ascolta",
    loads: "I video si caricano da YouTube solo quando premi play.",
    noMixes: "Ancora niente qui. Condividi un mix o un'esibizione karaoke fatti con djmanzo — un link YouTube, SoundCloud o Mixcloud — e comparirà dopo che il crew l'ha visto.",
    conversation: "La conversazione",
    quiet: "Tutto tranquillo per ora. Comincia tu.",
    leaving: "Cosa lasci?",
    kinds: { comment: "💬 Un commento", testimonial: "⭐ Una testimonianza", sample: "🎬 Un mix o un video" },
    linkLabel: "Link (YouTube, SoundCloud o Mixcloud)",
    rating: "Valutazione",
    stars: { one: "{n} stella", other: "{n} stelle" },
    bodyLabel: { comment: "Il tuo commento", testimonial: "La tua serata con djmanzo", sample: "Che cos'è?" },
    name: "Il tuo nome",
    submit: "Lascialo qui",
    posted: "Pubblicato.",
    heldComment: "Grazie: il crew legge i commenti di chi non ha fatto l'accesso prima che compaiano.",
    heldOther: "Grazie: il crew legge ogni testimonianza e ogni mix prima che compaia.",
    tell: "Dillo a qualcuno",
    share: "Condividi…",
    shareText: "Ho trovato djmanzo: software per DJ e karaoke che impara come suoni.",
    wishes: 'Le richieste di funzioni vanno nella <a href="{wishes}">pagina delle richieste</a>.',
  },
  ja: {
    eyebrow: "みんなの声",
    title: "DJ とシンガーが<br />語り、共有するもの。",
    lead: "ここにあるものは、サイトが自分について書いたものではありません。体験談は実在する人の言葉で、掲載前にクルーが読んでいます。",
    say: "みんなの声",
    outOf5: "5 段階中 {n}",
    noTestimonials: "体験談はまだありません。djmanzo はベータ版で、作り話を載せるくらいなら何も載せないほうを選びます。djmanzo で一夜を過ごしたなら、あなたの声が最初の一件になるかもしれません。",
    mixes: "ミックスとパフォーマンス",
    play: "再生：{title}（YouTube を読み込みます）",
    listen: "聴く",
    loads: "動画は再生を押したときだけ YouTube から読み込まれます。",
    noMixes: "まだ何もありません。djmanzo で作ったミックスやカラオケのパフォーマンス（YouTube、SoundCloud、Mixcloud のリンク）を共有してください。クルーが確認したら表示されます。",
    conversation: "会話",
    quiet: "まだ静かです。あなたから始めてください。",
    leaving: "何を残しますか？",
    kinds: { comment: "💬 コメント", testimonial: "⭐ 体験談", sample: "🎬 ミックスや動画" },
    linkLabel: "リンク（YouTube、SoundCloud、Mixcloud）",
    rating: "評価",
    stars: { one: "星 {n} つ", other: "星 {n} つ" },
    bodyLabel: { comment: "あなたのコメント", testimonial: "djmanzo と過ごした夜", sample: "それは何ですか？" },
    name: "あなたの名前",
    submit: "ここに残す",
    posted: "投稿しました。",
    heldComment: "ありがとうございます。サインインしていない訪問者のコメントは、表示される前にクルーが読みます。",
    heldOther: "ありがとうございます。体験談やミックスはすべて、表示される前にクルーが読みます。",
    tell: "友だちに知らせる",
    share: "共有…",
    shareText: "djmanzo を見つけた。あなたのプレイを覚える DJ・カラオケソフト。",
    wishes: '新しい機能の要望は<a href="{wishes}">リクエストのページ</a>へ。',
  },
});
