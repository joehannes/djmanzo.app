/**
 * The small pieces that sit on several pages — the support pages under an
 * account, the line in the corner after a sign-in, and a screenshot's own
 * buttons — in every language the site speaks. `{name}`s are filled in
 * where they are drawn; theme and skin names are the application's own and
 * stay as it shows them.
 */

import type { Lang } from "./strings";

export interface BitsWords {
  support: {
    about: string;
    aboutPlaceholder: string;
    page: string;
    remove: string;
    notPlatform: string;
    another: string;
    save: string;
    demo: string;
    saved: string;
    verified: string;
  };
  toast: { signedInAs: string; account: string; again: string };
  shot: { full: string; fullSize: string; closeUp: string; whole: string; theme: string; skin: string; close: string };
  videos: { title: string; lead: string; play: string };
}

export const BITS: Record<Lang, BitsWords> = {
  en: {
    support: {
      about: "A few words about you",
      aboutPlaceholder: "Where you play, what you make, what the support pays for.",
      page: "Support page {n}",
      remove: "Remove",
      notPlatform: "Not a page on one of the platforms below.",
      another: "+ Another page",
      save: "Save",
      demo: "A demo account cannot publish a profile.",
      saved: "Saved. It shows on your profile, your packs and beside your name in the forum.",
      verified: "verified by Patreon",
    },
    toast: { signedInAs: "Signed in with {p} as {name}.", account: "Your account", again: "Try again" },
    shot: { full: "See it full screen: {alt}", fullSize: "full size", closeUp: "close-up", whole: "whole window", theme: "{theme} theme", skin: "{skin} skin", close: "Close" },
    videos: { title: "See it played", lead: "Videos of djmanzo, made by the people who make it. YouTube is reached only when you press play.", play: "Play: {title}" },
  },
  es: {
    support: {
      about: "Unas palabras sobre ti",
      aboutPlaceholder: "Dónde pinchas, qué haces, qué paga el apoyo.",
      page: "Página de apoyo {n}",
      remove: "Quitar",
      notPlatform: "No es una página de una de las plataformas de abajo.",
      another: "+ Otra página",
      save: "Guardar",
      demo: "Una cuenta de demostración no puede publicar un perfil.",
      saved: "Guardado. Aparece en tu perfil, en tus paquetes y junto a tu nombre en el foro.",
      verified: "verificado por Patreon",
    },
    toast: { signedInAs: "Sesión iniciada con {p} como {name}.", account: "Tu cuenta", again: "Intentar de nuevo" },
    shot: { full: "Verla a pantalla completa: {alt}", fullSize: "tamaño real", closeUp: "detalle", whole: "ventana entera", theme: "tema {theme}", skin: "skin {skin}", close: "Cerrar" },
    videos: { title: "Míralo en acción", lead: "Vídeos de djmanzo, hechos por quienes lo hacen. Solo se conecta con YouTube cuando pulsas play.", play: "Reproducir: {title}" },
  },
  pt: {
    support: {
      about: "Algumas palavras sobre você",
      aboutPlaceholder: "Onde você toca, o que você faz, o que o apoio paga.",
      page: "Página de apoio {n}",
      remove: "Remover",
      notPlatform: "Não é uma página de uma das plataformas abaixo.",
      another: "+ Outra página",
      save: "Salvar",
      demo: "Uma conta de demonstração não pode publicar um perfil.",
      saved: "Salvo. Aparece no seu perfil, nos seus pacotes e ao lado do seu nome no fórum.",
      verified: "verificado pelo Patreon",
    },
    toast: { signedInAs: "Você entrou com {p} como {name}.", account: "Sua conta", again: "Tentar de novo" },
    shot: { full: "Ver em tela cheia: {alt}", fullSize: "tamanho real", closeUp: "detalhe", whole: "janela inteira", theme: "tema {theme}", skin: "skin {skin}", close: "Fechar" },
    videos: { title: "Veja em ação", lead: "Vídeos do djmanzo, feitos por quem o faz. O YouTube só é acessado quando você aperta play.", play: "Tocar: {title}" },
  },
  de: {
    support: {
      about: "Ein paar Worte über dich",
      aboutPlaceholder: "Wo du spielst, was du machst, wofür die Unterstützung bezahlt.",
      page: "Unterstützungsseite {n}",
      remove: "Entfernen",
      notPlatform: "Keine Seite auf einer der Plattformen unten.",
      another: "+ Noch eine Seite",
      save: "Speichern",
      demo: "Ein Demo-Konto kann kein Profil veröffentlichen.",
      saved: "Gespeichert. Es erscheint auf deinem Profil, bei deinen Packs und neben deinem Namen im Forum.",
      verified: "von Patreon bestätigt",
    },
    toast: { signedInAs: "Angemeldet mit {p} als {name}.", account: "Dein Konto", again: "Noch einmal versuchen" },
    shot: { full: "Im Vollbild ansehen: {alt}", fullSize: "volle Größe", closeUp: "Nahaufnahme", whole: "ganzes Fenster", theme: "Theme {theme}", skin: "Skin {skin}", close: "Schließen" },
    videos: { title: "So sieht es gespielt aus", lead: "Videos von djmanzo, gemacht von denen, die es machen. YouTube wird erst erreicht, wenn du auf Play drückst.", play: "Abspielen: {title}" },
  },
  fr: {
    support: {
      about: "Quelques mots sur vous",
      aboutPlaceholder: "Où vous jouez, ce que vous faites, ce que le soutien finance.",
      page: "Page de soutien {n}",
      remove: "Retirer",
      notPlatform: "Ce n'est pas une page d'une des plateformes ci-dessous.",
      another: "+ Une autre page",
      save: "Enregistrer",
      demo: "Un compte de démonstration ne peut pas publier de profil.",
      saved: "Enregistré. Cela apparaît sur votre profil, vos packs et à côté de votre nom dans le forum.",
      verified: "vérifié par Patreon",
    },
    toast: { signedInAs: "Connecté avec {p} en tant que {name}.", account: "Votre compte", again: "Réessayer" },
    shot: { full: "La voir en plein écran : {alt}", fullSize: "taille réelle", closeUp: "gros plan", whole: "fenêtre entière", theme: "thème {theme}", skin: "skin {skin}", close: "Fermer" },
    videos: { title: "Le voir en action", lead: "Des vidéos de djmanzo, faites par ceux qui le font. YouTube n'est contacté que lorsque vous appuyez sur lecture.", play: "Lire : {title}" },
  },
  it: {
    support: {
      about: "Due parole su di te",
      aboutPlaceholder: "Dove suoni, cosa fai, cosa paga il sostegno.",
      page: "Pagina di sostegno {n}",
      remove: "Rimuovi",
      notPlatform: "Non è una pagina di una delle piattaforme qui sotto.",
      another: "+ Un'altra pagina",
      save: "Salva",
      demo: "Un account demo non può pubblicare un profilo.",
      saved: "Salvato. Compare sul tuo profilo, sui tuoi pacchetti e accanto al tuo nome nel forum.",
      verified: "verificato da Patreon",
    },
    toast: { signedInAs: "Accesso con {p} come {name}.", account: "Il tuo account", again: "Riprova" },
    shot: { full: "Vedila a schermo intero: {alt}", fullSize: "dimensione reale", closeUp: "primo piano", whole: "finestra intera", theme: "tema {theme}", skin: "skin {skin}", close: "Chiudi" },
    videos: { title: "Guardalo in azione", lead: "Video di djmanzo, fatti da chi lo fa. YouTube viene contattato solo quando premi play.", play: "Riproduci: {title}" },
  },
  ja: {
    support: {
      about: "あなたについてひとこと",
      aboutPlaceholder: "どこでプレイしているか、何を作っているか、支援が何に使われるか。",
      page: "支援ページ {n}",
      remove: "削除",
      notPlatform: "下のプラットフォームのページではありません。",
      another: "+ ページを追加",
      save: "保存",
      demo: "デモアカウントではプロフィールを公開できません。",
      saved: "保存しました。プロフィール、パック、フォーラムの名前の横に表示されます。",
      verified: "Patreon で確認済み",
    },
    toast: { signedInAs: "{p} で {name} としてサインインしました。", account: "あなたのアカウント", again: "もう一度試す" },
    shot: { full: "全画面で見る：{alt}", fullSize: "実寸", closeUp: "拡大", whole: "ウィンドウ全体", theme: "{theme} テーマ", skin: "{skin} スキン", close: "閉じる" },
    videos: { title: "動いているところを見る", lead: "djmanzo を作っている人たちによる djmanzo の動画。YouTube に接続するのは再生を押したときだけです。", play: "再生：{title}" },
  },
};
