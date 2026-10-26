/**
 * Buying, said to the buyer in each language the site speaks: where the site
 * writes to them (`src/shop/Contact.svelte`), and where an order stands once
 * the checkout is done (`src/shop/Status.svelte`). French is set as French
 * is set: a narrow no-break space before : ; ! ?.
 */

import type { Lang } from "./strings";

/** How an order stands: paid, waiting for a bank transfer, or paid and still being cleared. */
export type State = "paid" | "waiting" | "processing";

export interface StatusWords {
  contact: {
    title: string;
    lead: string;
    address: string;
    useThis: string;
    send: string;
    sentTo: string;
    code: string;
    confirm: string;
    again: string;
    change: string;
    ready: string;
    noMail: string;
    unconfirmed: string;
  };
  status: {
    eyebrow: Record<State, string>;
    title: Record<State, string>;
    happenedTitle: string;
    happened: Record<State, string>;
    order: string;
    standTitle: string;
    stand: Record<State, string>;
    nextTitle: string;
    nextPaid1: string;
    nextPaid2: string;
    nextWait1: string;
    nextWait2: string;
    mailed: Record<State, string>;
    notMailed: string;
    download: string;
    trial: string;
    account: string;
    copy: string;
    copied: string;
  };
}

export const STATUS: Record<Lang, StatusWords> = {
  en: {
    contact: {
      title: "Where we write to you",
      lead: "Your receipt and licence key go to this address, and word of your payment while it is on its way.",
      address: "E-mail address",
      useThis: "Yes, write to me here",
      send: "Send me a code",
      sentTo: "We sent a six-digit code to {email}. Type it here:",
      code: "Code",
      confirm: "Confirm",
      again: "Send a new code",
      change: "Change",
      ready: "Your receipt and licence key go to {email}.",
      noMail:
        "This site cannot send e-mail yet: your receipt and licence stay in your account instead.",
      unconfirmed:
        "Kept, not confirmed: e-mail is not set up on this site yet.",
    },
    status: {
      eyebrow: {
        paid: "Paid",
        waiting: "Waiting for your transfer",
        processing: "Payment on its way",
      },
      title: {
        paid: "djmanzo {edition} is yours.",
        waiting: "djmanzo {edition} is reserved for you.",
        processing: "Your payment is on its way.",
      },
      happenedTitle: "What happened",
      happened: {
        paid: "You paid {amount} with {method}.",
        waiting:
          "You ordered djmanzo {edition}, {plan}, for {amount}. Nothing has been paid yet.",
        processing:
          "You paid {amount} with {method}. Your bank is still clearing it, which can take a few working days.",
      },
      order: "Order {order}",
      standTitle: "Where you stand",
      stand: {
        paid: "Your licence is active on your account now.",
        waiting:
          "To pay, transfer {amount} to this account, with {reference} as the reference:",
        processing:
          "There is nothing more to do: the order waits for your bank.",
      },
      nextTitle: "What happens next",
      nextPaid1: "Download djmanzo for your computer.",
      nextPaid2:
        "In djmanzo, open Settings → Licence and sign in with the same account: the licence is applied by itself.",
      nextWait1:
        "Download djmanzo now and start at once: the Hobbyist edition is free, and the {days}-day trial of any edition starts with a press.",
      nextWait2:
        "When your payment is confirmed, usually within one to three working days, the licence appears in your account and djmanzo applies it by itself.",
      mailed: {
        paid: "We have sent your receipt and licence key to {email}.",
        waiting:
          "We have sent how to pay to {email}, and will write again with your receipt and licence key when the money arrives.",
        processing:
          "We have written to {email}, and will write again with your receipt and licence key when the payment is confirmed.",
      },
      notMailed:
        "Nothing was e-mailed: keep this page's details. Your order is in your account, and the licence appears there once it is paid.",
      download: "Download djmanzo",
      trial: "Start the free trial now",
      account: "Your account",
      copy: "Copy",
      copied: "Copied",
    },
  },
  es: {
    contact: {
      title: "Dónde te escribimos",
      lead: "Tu recibo y tu clave de licencia van a esta dirección, y también el aviso de tu pago mientras está en camino.",
      address: "Correo electrónico",
      useThis: "Sí, escríbeme aquí",
      send: "Envíame un código",
      sentTo: "Enviamos un código de seis cifras a {email}. Escríbelo aquí:",
      code: "Código",
      confirm: "Confirmar",
      again: "Enviar un código nuevo",
      change: "Cambiar",
      ready: "Tu recibo y tu clave de licencia van a {email}.",
      noMail:
        "Esta web todavía no puede enviar correos: tu recibo y tu licencia se quedan en tu cuenta.",
      unconfirmed:
        "Guardada, sin confirmar: el correo aún no está configurado en esta web.",
    },
    status: {
      eyebrow: {
        paid: "Pagado",
        waiting: "Esperando tu transferencia",
        processing: "Pago en camino",
      },
      title: {
        paid: "djmanzo {edition} es tuyo.",
        waiting: "djmanzo {edition} está reservado para ti.",
        processing: "Tu pago está en camino.",
      },
      happenedTitle: "Qué ha pasado",
      happened: {
        paid: "Pagaste {amount} con {method}.",
        waiting:
          "Pediste djmanzo {edition}, {plan}, por {amount}. Todavía no se ha pagado nada.",
        processing:
          "Pagaste {amount} con {method}. Tu banco todavía lo está procesando, lo que puede tardar unos días hábiles.",
      },
      order: "Pedido {order}",
      standTitle: "Dónde estás",
      stand: {
        paid: "Tu licencia ya está activa en tu cuenta.",
        waiting:
          "Para pagar, transfiere {amount} a esta cuenta, con {reference} como referencia:",
        processing:
          "No tienes que hacer nada más: el pedido espera a tu banco.",
      },
      nextTitle: "Qué viene ahora",
      nextPaid1: "Descarga djmanzo para tu ordenador.",
      nextPaid2:
        "En djmanzo, abre Settings → Licence e inicia sesión con la misma cuenta: la licencia se aplica sola.",
      nextWait1:
        "Descarga djmanzo ahora y empieza ya: la edición Hobbyist es gratis, y la prueba de {days} días de cualquier edición empieza con un clic.",
      nextWait2:
        "Cuando se confirme tu pago, normalmente en uno a tres días hábiles, la licencia aparece en tu cuenta y djmanzo la aplica solo.",
      mailed: {
        paid: "Hemos enviado tu recibo y tu clave de licencia a {email}.",
        waiting:
          "Hemos enviado a {email} cómo pagar, y te volveremos a escribir con tu recibo y tu clave de licencia cuando llegue el dinero.",
        processing:
          "Te hemos escrito a {email}, y te volveremos a escribir con tu recibo y tu clave de licencia cuando se confirme el pago.",
      },
      notMailed:
        "No se envió ningún correo: guarda los datos de esta página. Tu pedido está en tu cuenta, y la licencia aparecerá allí cuando esté pagado.",
      download: "Descargar djmanzo",
      trial: "Empezar la prueba gratis ahora",
      account: "Tu cuenta",
      copy: "Copiar",
      copied: "Copiado",
    },
  },
  pt: {
    contact: {
      title: "Onde escrevemos para você",
      lead: "Seu recibo e sua chave de licença vão para este endereço, e também o aviso do seu pagamento enquanto ele está a caminho.",
      address: "E-mail",
      useThis: "Sim, escreva para mim aqui",
      send: "Me envie um código",
      sentTo: "Enviamos um código de seis dígitos para {email}. Digite aqui:",
      code: "Código",
      confirm: "Confirmar",
      again: "Enviar um código novo",
      change: "Mudar",
      ready: "Seu recibo e sua chave de licença vão para {email}.",
      noMail:
        "Este site ainda não envia e-mails: seu recibo e sua licença ficam na sua conta.",
      unconfirmed:
        "Guardado, sem confirmação: o e-mail ainda não está configurado neste site.",
    },
    status: {
      eyebrow: {
        paid: "Pago",
        waiting: "Aguardando sua transferência",
        processing: "Pagamento a caminho",
      },
      title: {
        paid: "O djmanzo {edition} é seu.",
        waiting: "O djmanzo {edition} está reservado para você.",
        processing: "Seu pagamento está a caminho.",
      },
      happenedTitle: "O que aconteceu",
      happened: {
        paid: "Você pagou {amount} com {method}.",
        waiting:
          "Você pediu o djmanzo {edition}, {plan}, por {amount}. Nada foi pago ainda.",
        processing:
          "Você pagou {amount} com {method}. Seu banco ainda está processando, o que pode levar alguns dias úteis.",
      },
      order: "Pedido {order}",
      standTitle: "Onde você está",
      stand: {
        paid: "Sua licença já está ativa na sua conta.",
        waiting:
          "Para pagar, transfira {amount} para esta conta, com {reference} como referência:",
        processing: "Não há mais nada a fazer: o pedido espera o seu banco.",
      },
      nextTitle: "O que vem agora",
      nextPaid1: "Baixe o djmanzo para o seu computador.",
      nextPaid2:
        "No djmanzo, abra Settings → Licence e entre com a mesma conta: a licença é aplicada sozinha.",
      nextWait1:
        "Baixe o djmanzo agora e comece já: a edição Hobbyist é grátis, e o teste de {days} dias de qualquer edição começa com um clique.",
      nextWait2:
        "Quando seu pagamento for confirmado, normalmente em um a três dias úteis, a licença aparece na sua conta e o djmanzo a aplica sozinho.",
      mailed: {
        paid: "Enviamos seu recibo e sua chave de licença para {email}.",
        waiting:
          "Enviamos para {email} como pagar, e escreveremos de novo com seu recibo e sua chave de licença quando o dinheiro chegar.",
        processing:
          "Escrevemos para {email}, e escreveremos de novo com seu recibo e sua chave de licença quando o pagamento for confirmado.",
      },
      notMailed:
        "Nenhum e-mail foi enviado: guarde os dados desta página. Seu pedido está na sua conta, e a licença aparece lá quando for paga.",
      download: "Baixar o djmanzo",
      trial: "Começar o teste grátis agora",
      account: "Sua conta",
      copy: "Copiar",
      copied: "Copiado",
    },
  },
  de: {
    contact: {
      title: "Wohin wir dir schreiben",
      lead: "Deine Quittung und dein Lizenzschlüssel gehen an diese Adresse, ebenso die Nachricht zu deiner Zahlung, solange sie unterwegs ist.",
      address: "E-Mail-Adresse",
      useThis: "Ja, schreib mir hierhin",
      send: "Schick mir einen Code",
      sentTo:
        "Wir haben einen sechsstelligen Code an {email} geschickt. Gib ihn hier ein:",
      code: "Code",
      confirm: "Bestätigen",
      again: "Neuen Code schicken",
      change: "Ändern",
      ready: "Deine Quittung und dein Lizenzschlüssel gehen an {email}.",
      noMail:
        "Diese Seite kann noch keine E-Mails senden: Quittung und Lizenz bleiben stattdessen in deinem Konto.",
      unconfirmed:
        "Gespeichert, nicht bestätigt: E-Mail ist auf dieser Seite noch nicht eingerichtet.",
    },
    status: {
      eyebrow: {
        paid: "Bezahlt",
        waiting: "Wartet auf deine Überweisung",
        processing: "Zahlung unterwegs",
      },
      title: {
        paid: "djmanzo {edition} gehört dir.",
        waiting: "djmanzo {edition} ist für dich reserviert.",
        processing: "Deine Zahlung ist unterwegs.",
      },
      happenedTitle: "Was passiert ist",
      happened: {
        paid: "Du hast {amount} mit {method} bezahlt.",
        waiting:
          "Du hast djmanzo {edition}, {plan}, für {amount} bestellt. Bezahlt ist noch nichts.",
        processing:
          "Du hast {amount} mit {method} bezahlt. Deine Bank bearbeitet die Zahlung noch, das kann ein paar Werktage dauern.",
      },
      order: "Bestellung {order}",
      standTitle: "Wo du stehst",
      stand: {
        paid: "Deine Lizenz ist jetzt in deinem Konto aktiv.",
        waiting:
          "Überweise zum Bezahlen {amount} auf dieses Konto, mit {reference} als Verwendungszweck:",
        processing:
          "Du musst nichts mehr tun: Die Bestellung wartet auf deine Bank.",
      },
      nextTitle: "Wie es weitergeht",
      nextPaid1: "Lade djmanzo für deinen Computer herunter.",
      nextPaid2:
        "Öffne in djmanzo Settings → Licence und melde dich mit demselben Konto an: Die Lizenz wird von selbst angewendet.",
      nextWait1:
        "Lade djmanzo jetzt herunter und leg gleich los: Die Hobbyist-Edition ist kostenlos, und die {days}-tägige Testphase jeder Edition startet mit einem Klick.",
      nextWait2:
        "Sobald deine Zahlung bestätigt ist, meist nach einem bis drei Werktagen, erscheint die Lizenz in deinem Konto und djmanzo wendet sie von selbst an.",
      mailed: {
        paid: "Wir haben deine Quittung und deinen Lizenzschlüssel an {email} geschickt.",
        waiting:
          "Wir haben dir an {email} geschrieben, wie du bezahlst, und melden uns mit Quittung und Lizenzschlüssel, sobald das Geld da ist.",
        processing:
          "Wir haben dir an {email} geschrieben und melden uns mit Quittung und Lizenzschlüssel, sobald die Zahlung bestätigt ist.",
      },
      notMailed:
        "Es wurde keine E-Mail verschickt: Bewahre die Angaben dieser Seite auf. Deine Bestellung ist in deinem Konto, und die Lizenz erscheint dort, sobald sie bezahlt ist.",
      download: "djmanzo herunterladen",
      trial: "Jetzt die kostenlose Testphase starten",
      account: "Dein Konto",
      copy: "Kopieren",
      copied: "Kopiert",
    },
  },
  fr: {
    contact: {
      title: "Où nous vous écrivons",
      lead: "Votre reçu et votre clé de licence vont à cette adresse, ainsi que les nouvelles de votre paiement tant qu'il est en route.",
      address: "Adresse e-mail",
      useThis: "Oui, écrivez-moi ici",
      send: "Envoyez-moi un code",
      sentTo:
        "Nous avons envoyé un code à six chiffres à {email}. Saisissez-le ici :",
      code: "Code",
      confirm: "Confirmer",
      again: "Envoyer un nouveau code",
      change: "Changer",
      ready: "Votre reçu et votre clé de licence vont à {email}.",
      noMail:
        "Ce site ne peut pas encore envoyer d'e-mails : votre reçu et votre licence restent dans votre compte.",
      unconfirmed:
        "Gardée, non confirmée : l'e-mail n'est pas encore configuré sur ce site.",
    },
    status: {
      eyebrow: {
        paid: "Payé",
        waiting: "En attente de votre virement",
        processing: "Paiement en route",
      },
      title: {
        paid: "djmanzo {edition} est à vous.",
        waiting: "djmanzo {edition} vous est réservé.",
        processing: "Votre paiement est en route.",
      },
      happenedTitle: "Ce qui s'est passé",
      happened: {
        paid: "Vous avez payé {amount} avec {method}.",
        waiting:
          "Vous avez commandé djmanzo {edition}, {plan}, pour {amount}. Rien n'a encore été payé.",
        processing:
          "Vous avez payé {amount} avec {method}. Votre banque le traite encore, ce qui peut prendre quelques jours ouvrés.",
      },
      order: "Commande {order}",
      standTitle: "Où vous en êtes",
      stand: {
        paid: "Votre licence est active sur votre compte.",
        waiting:
          "Pour payer, virez {amount} sur ce compte, avec {reference} comme référence :",
        processing:
          "Vous n'avez plus rien à faire : la commande attend votre banque.",
      },
      nextTitle: "La suite",
      nextPaid1: "Téléchargez djmanzo pour votre ordinateur.",
      nextPaid2:
        "Dans djmanzo, ouvrez Settings → Licence et connectez-vous avec le même compte : la licence s'applique toute seule.",
      nextWait1:
        "Téléchargez djmanzo maintenant et commencez tout de suite : l'édition Hobbyist est gratuite, et l'essai de {days} jours de n'importe quelle édition démarre d'un clic.",
      nextWait2:
        "Dès que votre paiement est confirmé, en général sous un à trois jours ouvrés, la licence apparaît dans votre compte et djmanzo l'applique tout seul.",
      mailed: {
        paid: "Nous avons envoyé votre reçu et votre clé de licence à {email}.",
        waiting:
          "Nous avons envoyé à {email} comment payer, et vous écrirons à nouveau avec votre reçu et votre clé de licence dès que l'argent arrive.",
        processing:
          "Nous vous avons écrit à {email}, et vous écrirons à nouveau avec votre reçu et votre clé de licence dès que le paiement est confirmé.",
      },
      notMailed:
        "Aucun e-mail n'a été envoyé : gardez les informations de cette page. Votre commande est dans votre compte, et la licence y apparaît une fois payée.",
      download: "Télécharger djmanzo",
      trial: "Commencer l'essai gratuit maintenant",
      account: "Votre compte",
      copy: "Copier",
      copied: "Copié",
    },
  },
  it: {
    contact: {
      title: "Dove ti scriviamo",
      lead: "La ricevuta e la chiave di licenza arrivano a questo indirizzo, insieme alle notizie sul pagamento mentre è in corso.",
      address: "Indirizzo e-mail",
      useThis: "Sì, scrivimi qui",
      send: "Mandami un codice",
      sentTo:
        "Abbiamo mandato un codice di sei cifre a {email}. Inseriscilo qui:",
      code: "Codice",
      confirm: "Conferma",
      again: "Manda un nuovo codice",
      change: "Cambia",
      ready: "La ricevuta e la chiave di licenza arrivano a {email}.",
      noMail:
        "Questo sito non può ancora inviare e-mail: ricevuta e licenza restano nel tuo account.",
      unconfirmed:
        "Salvato, non confermato: l'e-mail non è ancora configurata su questo sito.",
    },
    status: {
      eyebrow: {
        paid: "Pagato",
        waiting: "In attesa del tuo bonifico",
        processing: "Pagamento in arrivo",
      },
      title: {
        paid: "djmanzo {edition} è tuo.",
        waiting: "djmanzo {edition} è riservato per te.",
        processing: "Il tuo pagamento è in arrivo.",
      },
      happenedTitle: "Cosa è successo",
      happened: {
        paid: "Hai pagato {amount} con {method}.",
        waiting:
          "Hai ordinato djmanzo {edition}, {plan}, per {amount}. Non è ancora stato pagato nulla.",
        processing:
          "Hai pagato {amount} con {method}. La tua banca lo sta ancora elaborando, cosa che può richiedere qualche giorno lavorativo.",
      },
      order: "Ordine {order}",
      standTitle: "A che punto sei",
      stand: {
        paid: "La tua licenza è già attiva nel tuo account.",
        waiting:
          "Per pagare, fai un bonifico di {amount} su questo conto, con {reference} come causale:",
        processing: "Non devi fare altro: l'ordine aspetta la tua banca.",
      },
      nextTitle: "Cosa succede ora",
      nextPaid1: "Scarica djmanzo per il tuo computer.",
      nextPaid2:
        "In djmanzo, apri Settings → Licence e accedi con lo stesso account: la licenza si applica da sola.",
      nextWait1:
        "Scarica djmanzo ora e inizia subito: l'edizione Hobbyist è gratuita, e la prova di {days} giorni di qualsiasi edizione parte con un clic.",
      nextWait2:
        "Quando il pagamento è confermato, di solito in uno-tre giorni lavorativi, la licenza compare nel tuo account e djmanzo la applica da solo.",
      mailed: {
        paid: "Abbiamo mandato la ricevuta e la chiave di licenza a {email}.",
        waiting:
          "Abbiamo mandato a {email} come pagare, e ti scriveremo di nuovo con ricevuta e chiave di licenza quando arriva il denaro.",
        processing:
          "Ti abbiamo scritto a {email}, e ti scriveremo di nuovo con ricevuta e chiave di licenza quando il pagamento è confermato.",
      },
      notMailed:
        "Non è stata inviata nessuna e-mail: conserva i dati di questa pagina. L'ordine è nel tuo account, e la licenza compare lì appena è pagata.",
      download: "Scarica djmanzo",
      trial: "Inizia ora la prova gratuita",
      account: "Il tuo account",
      copy: "Copia",
      copied: "Copiato",
    },
  },
  ja: {
    contact: {
      title: "ご連絡先",
      lead: "領収書とライセンスキーはこのアドレスにお送りします。お支払いの処理中のお知らせも同じです。",
      address: "メールアドレス",
      useThis: "はい、このアドレスに送ってください",
      send: "コードを送る",
      sentTo: "{email} に6桁のコードを送りました。ここに入力してください:",
      code: "コード",
      confirm: "確認する",
      again: "新しいコードを送る",
      change: "変更",
      ready: "領収書とライセンスキーは {email} にお送りします。",
      noMail:
        "このサイトはまだメールを送れません。領収書とライセンスはアカウントに保存されます。",
      unconfirmed:
        "保存しましたが未確認です。このサイトではまだメールが設定されていません。",
    },
    status: {
      eyebrow: {
        paid: "お支払い済み",
        waiting: "お振り込み待ち",
        processing: "お支払い処理中",
      },
      title: {
        paid: "djmanzo {edition} はあなたのものです。",
        waiting: "djmanzo {edition} をお取り置きしました。",
        processing: "お支払いを処理中です。",
      },
      happenedTitle: "ここまでの流れ",
      happened: {
        paid: "{method} で {amount} をお支払いいただきました。",
        waiting:
          "djmanzo {edition}（{plan}）を {amount} でご注文いただきました。まだお支払いはされていません。",
        processing:
          "{method} で {amount} をお支払いいただきました。銀行での処理に数営業日かかる場合があります。",
      },
      order: "ご注文 {order}",
      standTitle: "現在の状況",
      stand: {
        paid: "ライセンスはすでにアカウントで有効です。",
        waiting:
          "お支払いは、{amount} をこの口座へ、{reference} を参照番号としてお振り込みください:",
        processing:
          "これ以上の操作は不要です。ご注文は銀行の処理を待っています。",
      },
      nextTitle: "この後の流れ",
      nextPaid1:
        "お使いのコンピューターに djmanzo をダウンロードしてください。",
      nextPaid2:
        "djmanzo で Settings → Licence を開き、同じアカウントでサインインすると、ライセンスが自動で適用されます。",
      nextWait1:
        "今すぐ djmanzo をダウンロードして始められます。Hobbyist エディションは無料で、どのエディションも{days}日間のトライアルをワンクリックで始められます。",
      nextWait2:
        "お支払いが確認されると（通常1〜3営業日）、ライセンスがアカウントに追加され、djmanzo が自動で適用します。",
      mailed: {
        paid: "領収書とライセンスキーを {email} にお送りしました。",
        waiting:
          "お支払い方法を {email} にお送りしました。入金を確認でき次第、領収書とライセンスキーをお送りします。",
        processing:
          "{email} にご連絡しました。お支払いが確認でき次第、領収書とライセンスキーをお送りします。",
      },
      notMailed:
        "メールは送信されていません。このページの内容を控えておいてください。ご注文はアカウントにあり、お支払い後にライセンスがそこに表示されます。",
      download: "djmanzo をダウンロード",
      trial: "今すぐ無料トライアルを始める",
      account: "アカウント",
      copy: "コピー",
      copied: "コピーしました",
    },
  },
};
