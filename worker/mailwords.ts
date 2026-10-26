/**
 * What the site writes to a buyer, in each language it speaks
 * (`worker/mail.ts` fills the blanks). French is set as French is set: a
 * narrow no-break space before : ; ! ?.
 */

import type { Lang } from "../src/v4/i18n/strings";

export interface MailWords {
  plan: Record<"perpetual" | "monthly" | "yearly", string>;
  method: Record<"transfer" | "card", string>;
  /** One line on a receipt, with its own line break. */
  discount: string;
  code: { subject: string; body: string };
  waiting: { subject: string; body: string };
  processing: { subject: string; body: string };
  receipt: { subject: string; body: string };
  gift: { subject: string; body: string };
}

export const MAIL_WORDS: Record<Lang, MailWords> = {
  en: {
    plan: {
      perpetual: "bought once",
      monthly: "monthly",
      yearly: "yearly",
    },
    method: {
      transfer: "bank transfer",
      card: "card",
    },
    discount: "Discount: −{amount}\n",
    code: {
      subject: "Your djmanzo code: {code}",
      body: "Type this code on {site} to confirm that this is the address djmanzo writes to you at:\n\n{code}\n\nIt works for 30 minutes. If you did not ask for it, ignore this message; nothing changes.",
    },
    waiting: {
      subject: "djmanzo: order {order} is waiting for your transfer",
      body: "Thank you, {name}.\n\nYour order is placed: djmanzo {edition}, {plan}, {amount}. Nothing has been paid yet.\n\nTo pay, transfer {amount} to the account below, with {order} as the reference:\n\n{details}\n\nWhen the money arrives, usually within one to three working days, we confirm it and write to you again with your receipt and your licence. The licence appears in your account at the same moment, and djmanzo picks it up by itself the next time it signs in with the same account.\n\nYou don't have to wait: download djmanzo now at {download}, start the seven-day trial of any edition, or play with the free Hobbyist edition.\n\nYour account: {account}",
    },
    processing: {
      subject: "djmanzo: your payment for order {order} is on its way",
      body: "Thank you, {name}.\n\nYour payment of {amount} for djmanzo {edition}, {plan}, has been made and your bank is processing it, which can take a few working days. When it is confirmed we write to you again with your receipt and your licence. The licence appears in your account at the same moment, and djmanzo picks it up by itself the next time it signs in with the same account.\n\nYou don't have to wait: download djmanzo now at {download}, start the seven-day trial of any edition, or play with the free Hobbyist edition.\n\nYour account: {account}",
    },
    receipt: {
      subject: "djmanzo: your receipt and licence, order {order}",
      body: "Thank you, {name}. Your payment is confirmed.\n\nRECEIPT\nOrder: {order}\nDate: {date}\nItem: djmanzo {edition}, {plan}\n{discount}Total paid: {amount}\nPaid with: {method}\nSold by: {seller}\n{note}\n\nYOUR LICENCE\nIt is in your account now. Sign in to djmanzo with the same account ({via}) and it is applied by itself. Or, if djmanzo is offline, paste this licence key in djmanzo under Settings → Licence:\n\n{line}\n\nDownload djmanzo: {download}\nYour account: {account}",
    },
    gift: {
      subject: "djmanzo: your receipt and the gift, order {order}",
      body: "Thank you, {name}. Your payment is confirmed.\n\nRECEIPT\nOrder: {order}\nDate: {date}\nItem: djmanzo {edition}, {plan}\n{discount}Total paid: {amount}\nPaid with: {method}\nSold by: {seller}\n{note}\n\nTHE GIFT\ndjmanzo {edition} is ready to hand over. Send this link to the person it is for:\n\n{link}\n\nThey open it, sign in, and the licence is theirs.",
    },
  },
  es: {
    plan: {
      perpetual: "compra única",
      monthly: "mensual",
      yearly: "anual",
    },
    method: {
      transfer: "transferencia bancaria",
      card: "tarjeta",
    },
    discount: "Descuento: −{amount}\n",
    code: {
      subject: "Tu código de djmanzo: {code}",
      body: "Escribe este código en {site} para confirmar que esta es la dirección a la que djmanzo te escribe:\n\n{code}\n\nSirve durante 30 minutos. Si no lo pediste, ignora este mensaje; no cambia nada.",
    },
    waiting: {
      subject: "djmanzo: el pedido {order} espera tu transferencia",
      body: "Gracias, {name}.\n\nTu pedido está hecho: djmanzo {edition}, {plan}, {amount}. Todavía no se ha pagado nada.\n\nPara pagar, transfiere {amount} a la cuenta de abajo, con {order} como referencia:\n\n{details}\n\nCuando llegue el dinero, normalmente en uno a tres días hábiles, lo confirmamos y te volvemos a escribir con tu recibo y tu licencia. La licencia aparece en tu cuenta en ese mismo momento, y djmanzo la recoge sola la próxima vez que inicie sesión con la misma cuenta.\n\nNo tienes que esperar: descarga djmanzo ahora en {download}, empieza la prueba de siete días de cualquier edición o juega con la edición gratuita Hobbyist.\n\nTu cuenta: {account}",
    },
    processing: {
      subject: "djmanzo: tu pago del pedido {order} está en camino",
      body: "Gracias, {name}.\n\nTu pago de {amount} por djmanzo {edition}, {plan}, está hecho y tu banco lo está procesando, lo que puede tardar unos días hábiles. Cuando se confirme, te volvemos a escribir con tu recibo y tu licencia. La licencia aparece en tu cuenta en ese mismo momento, y djmanzo la recoge sola la próxima vez que inicie sesión con la misma cuenta.\n\nNo tienes que esperar: descarga djmanzo ahora en {download}, empieza la prueba de siete días de cualquier edición o juega con la edición gratuita Hobbyist.\n\nTu cuenta: {account}",
    },
    receipt: {
      subject: "djmanzo: tu recibo y tu licencia, pedido {order}",
      body: "Gracias, {name}. Tu pago está confirmado.\n\nRECIBO\nPedido: {order}\nFecha: {date}\nArtículo: djmanzo {edition}, {plan}\n{discount}Total pagado: {amount}\nPagado con: {method}\nVendido por: {seller}\n{note}\n\nTU LICENCIA\nYa está en tu cuenta. Inicia sesión en djmanzo con la misma cuenta ({via}) y se aplica sola. O, si djmanzo no tiene conexión, pega esta clave de licencia en djmanzo, en Settings → Licence:\n\n{line}\n\nDescarga djmanzo: {download}\nTu cuenta: {account}",
    },
    gift: {
      subject: "djmanzo: tu recibo y el regalo, pedido {order}",
      body: "Gracias, {name}. Tu pago está confirmado.\n\nRECIBO\nPedido: {order}\nFecha: {date}\nArtículo: djmanzo {edition}, {plan}\n{discount}Total pagado: {amount}\nPagado con: {method}\nVendido por: {seller}\n{note}\n\nEL REGALO\ndjmanzo {edition} está listo para regalar. Envía este enlace a la persona a quien va dirigido:\n\n{link}\n\nLo abre, inicia sesión y la licencia es suya.",
    },
  },
  pt: {
    plan: {
      perpetual: "compra única",
      monthly: "mensal",
      yearly: "anual",
    },
    method: {
      transfer: "transferência bancária",
      card: "cartão",
    },
    discount: "Desconto: −{amount}\n",
    code: {
      subject: "Seu código do djmanzo: {code}",
      body: "Digite este código em {site} para confirmar que este é o endereço em que o djmanzo escreve para você:\n\n{code}\n\nEle vale por 30 minutos. Se você não pediu, ignore esta mensagem; nada muda.",
    },
    waiting: {
      subject: "djmanzo: o pedido {order} aguarda sua transferência",
      body: "Obrigado, {name}.\n\nSeu pedido foi feito: djmanzo {edition}, {plan}, {amount}. Nada foi pago ainda.\n\nPara pagar, transfira {amount} para a conta abaixo, com {order} como referência:\n\n{details}\n\nQuando o dinheiro chegar, normalmente em um a três dias úteis, confirmamos e escrevemos de novo com seu recibo e sua licença. A licença aparece na sua conta no mesmo momento, e o djmanzo a pega sozinho na próxima vez que entrar com a mesma conta.\n\nVocê não precisa esperar: baixe o djmanzo agora em {download}, comece o teste de sete dias de qualquer edição ou brinque com a edição gratuita Hobbyist.\n\nSua conta: {account}",
    },
    processing: {
      subject: "djmanzo: seu pagamento do pedido {order} está a caminho",
      body: "Obrigado, {name}.\n\nSeu pagamento de {amount} pelo djmanzo {edition}, {plan}, foi feito e seu banco está processando, o que pode levar alguns dias úteis. Quando for confirmado, escrevemos de novo com seu recibo e sua licença. A licença aparece na sua conta no mesmo momento, e o djmanzo a pega sozinho na próxima vez que entrar com a mesma conta.\n\nVocê não precisa esperar: baixe o djmanzo agora em {download}, comece o teste de sete dias de qualquer edição ou brinque com a edição gratuita Hobbyist.\n\nSua conta: {account}",
    },
    receipt: {
      subject: "djmanzo: seu recibo e sua licença, pedido {order}",
      body: "Obrigado, {name}. Seu pagamento está confirmado.\n\nRECIBO\nPedido: {order}\nData: {date}\nItem: djmanzo {edition}, {plan}\n{discount}Total pago: {amount}\nPago com: {method}\nVendido por: {seller}\n{note}\n\nSUA LICENÇA\nJá está na sua conta. Entre no djmanzo com a mesma conta ({via}) e ela é aplicada sozinha. Ou, se o djmanzo estiver offline, cole esta chave de licença no djmanzo, em Settings → Licence:\n\n{line}\n\nBaixe o djmanzo: {download}\nSua conta: {account}",
    },
    gift: {
      subject: "djmanzo: seu recibo e o presente, pedido {order}",
      body: "Obrigado, {name}. Seu pagamento está confirmado.\n\nRECIBO\nPedido: {order}\nData: {date}\nItem: djmanzo {edition}, {plan}\n{discount}Total pago: {amount}\nPago com: {method}\nVendido por: {seller}\n{note}\n\nO PRESENTE\nO djmanzo {edition} está pronto para presentear. Envie este link para a pessoa a quem ele se destina:\n\n{link}\n\nEla abre, entra e a licença é dela.",
    },
  },
  de: {
    plan: {
      perpetual: "einmalig gekauft",
      monthly: "monatlich",
      yearly: "jährlich",
    },
    method: {
      transfer: "Banküberweisung",
      card: "Karte",
    },
    discount: "Rabatt: −{amount}\n",
    code: {
      subject: "Dein djmanzo-Code: {code}",
      body: "Gib diesen Code auf {site} ein, um zu bestätigen, dass djmanzo dir an diese Adresse schreibt:\n\n{code}\n\nEr gilt 30 Minuten. Wenn du ihn nicht angefordert hast, ignoriere diese Nachricht; es ändert sich nichts.",
    },
    waiting: {
      subject: "djmanzo: Bestellung {order} wartet auf deine Überweisung",
      body: "Danke, {name}.\n\nDeine Bestellung ist aufgegeben: djmanzo {edition}, {plan}, {amount}. Bezahlt ist noch nichts.\n\nÜberweise zum Bezahlen {amount} auf das Konto unten, mit {order} als Verwendungszweck:\n\n{details}\n\nSobald das Geld ankommt, meist nach einem bis drei Werktagen, bestätigen wir es und schreiben dir wieder, mit deiner Quittung und deiner Lizenz. Die Lizenz erscheint im selben Moment in deinem Konto, und djmanzo holt sie sich von selbst, wenn es sich das nächste Mal mit demselben Konto anmeldet.\n\nDu musst nicht warten: Lade djmanzo jetzt unter {download} herunter, starte die siebentägige Testphase einer beliebigen Edition oder spiel mit der kostenlosen Hobbyist-Edition.\n\nDein Konto: {account}",
    },
    processing: {
      subject: "djmanzo: deine Zahlung für Bestellung {order} ist unterwegs",
      body: "Danke, {name}.\n\nDeine Zahlung von {amount} für djmanzo {edition}, {plan}, ist erfolgt und deine Bank bearbeitet sie gerade, was ein paar Werktage dauern kann. Sobald sie bestätigt ist, schreiben wir dir wieder, mit deiner Quittung und deiner Lizenz. Die Lizenz erscheint im selben Moment in deinem Konto, und djmanzo holt sie sich von selbst, wenn es sich das nächste Mal mit demselben Konto anmeldet.\n\nDu musst nicht warten: Lade djmanzo jetzt unter {download} herunter, starte die siebentägige Testphase einer beliebigen Edition oder spiel mit der kostenlosen Hobbyist-Edition.\n\nDein Konto: {account}",
    },
    receipt: {
      subject: "djmanzo: deine Quittung und Lizenz, Bestellung {order}",
      body: "Danke, {name}. Deine Zahlung ist bestätigt.\n\nQUITTUNG\nBestellung: {order}\nDatum: {date}\nArtikel: djmanzo {edition}, {plan}\n{discount}Bezahlt: {amount}\nBezahlt mit: {method}\nVerkauft von: {seller}\n{note}\n\nDEINE LIZENZ\nSie ist jetzt in deinem Konto. Melde dich in djmanzo mit demselben Konto an ({via}), und sie wird von selbst angewendet. Oder, wenn djmanzo offline ist, füge diesen Lizenzschlüssel in djmanzo unter Settings → Licence ein:\n\n{line}\n\ndjmanzo herunterladen: {download}\nDein Konto: {account}",
    },
    gift: {
      subject: "djmanzo: deine Quittung und das Geschenk, Bestellung {order}",
      body: "Danke, {name}. Deine Zahlung ist bestätigt.\n\nQUITTUNG\nBestellung: {order}\nDatum: {date}\nArtikel: djmanzo {edition}, {plan}\n{discount}Bezahlt: {amount}\nBezahlt mit: {method}\nVerkauft von: {seller}\n{note}\n\nDAS GESCHENK\ndjmanzo {edition} ist bereit zum Verschenken. Schick diesen Link an die Person, für die es ist:\n\n{link}\n\nSie öffnet ihn, meldet sich an, und die Lizenz gehört ihr.",
    },
  },
  fr: {
    plan: {
      perpetual: "achat unique",
      monthly: "mensuel",
      yearly: "annuel",
    },
    method: {
      transfer: "virement bancaire",
      card: "carte",
    },
    discount: "Remise : −{amount}\n",
    code: {
      subject: "Votre code djmanzo : {code}",
      body: "Saisissez ce code sur {site} pour confirmer que c'est à cette adresse que djmanzo vous écrit :\n\n{code}\n\nIl est valable 30 minutes. Si vous ne l'avez pas demandé, ignorez ce message ; rien ne change.",
    },
    waiting: {
      subject: "djmanzo : la commande {order} attend votre virement",
      body: "Merci, {name}.\n\nVotre commande est passée : djmanzo {edition}, {plan}, {amount}. Rien n'a encore été payé.\n\nPour payer, virez {amount} sur le compte ci-dessous, avec {order} comme référence :\n\n{details}\n\nDès que l'argent arrive, en général sous un à trois jours ouvrés, nous le confirmons et vous écrivons à nouveau avec votre reçu et votre licence. La licence apparaît au même moment dans votre compte, et djmanzo la récupère tout seul la prochaine fois qu'il se connecte avec le même compte.\n\nInutile d'attendre : téléchargez djmanzo dès maintenant sur {download}, lancez l'essai de sept jours de n'importe quelle édition, ou jouez avec l'édition gratuite Hobbyist.\n\nVotre compte : {account}",
    },
    processing: {
      subject: "djmanzo : votre paiement pour la commande {order} est en route",
      body: "Merci, {name}.\n\nVotre paiement de {amount} pour djmanzo {edition}, {plan}, a été effectué et votre banque le traite, ce qui peut prendre quelques jours ouvrés. Dès qu'il est confirmé, nous vous écrivons à nouveau avec votre reçu et votre licence. La licence apparaît au même moment dans votre compte, et djmanzo la récupère tout seul la prochaine fois qu'il se connecte avec le même compte.\n\nInutile d'attendre : téléchargez djmanzo dès maintenant sur {download}, lancez l'essai de sept jours de n'importe quelle édition, ou jouez avec l'édition gratuite Hobbyist.\n\nVotre compte : {account}",
    },
    receipt: {
      subject: "djmanzo : votre reçu et votre licence, commande {order}",
      body: "Merci, {name}. Votre paiement est confirmé.\n\nREÇU\nCommande : {order}\nDate : {date}\nArticle : djmanzo {edition}, {plan}\n{discount}Total payé : {amount}\nPayé avec : {method}\nVendu par : {seller}\n{note}\n\nVOTRE LICENCE\nElle est déjà dans votre compte. Connectez-vous à djmanzo avec le même compte ({via}) et elle s'applique toute seule. Ou, si djmanzo est hors ligne, collez cette clé de licence dans djmanzo, sous Settings → Licence :\n\n{line}\n\nTélécharger djmanzo : {download}\nVotre compte : {account}",
    },
    gift: {
      subject: "djmanzo : votre reçu et le cadeau, commande {order}",
      body: "Merci, {name}. Votre paiement est confirmé.\n\nREÇU\nCommande : {order}\nDate : {date}\nArticle : djmanzo {edition}, {plan}\n{discount}Total payé : {amount}\nPayé avec : {method}\nVendu par : {seller}\n{note}\n\nLE CADEAU\ndjmanzo {edition} est prêt à être offert. Envoyez ce lien à la personne à qui il est destiné :\n\n{link}\n\nElle l'ouvre, se connecte, et la licence est à elle.",
    },
  },
  it: {
    plan: {
      perpetual: "acquisto unico",
      monthly: "mensile",
      yearly: "annuale",
    },
    method: {
      transfer: "bonifico bancario",
      card: "carta",
    },
    discount: "Sconto: −{amount}\n",
    code: {
      subject: "Il tuo codice djmanzo: {code}",
      body: "Inserisci questo codice su {site} per confermare che è questo l'indirizzo a cui djmanzo ti scrive:\n\n{code}\n\nVale 30 minuti. Se non l'hai chiesto, ignora questo messaggio; non cambia nulla.",
    },
    waiting: {
      subject: "djmanzo: l'ordine {order} aspetta il tuo bonifico",
      body: "Grazie, {name}.\n\nIl tuo ordine è fatto: djmanzo {edition}, {plan}, {amount}. Non è ancora stato pagato nulla.\n\nPer pagare, fai un bonifico di {amount} sul conto qui sotto, con {order} come causale:\n\n{details}\n\nQuando arriva il denaro, di solito in uno-tre giorni lavorativi, lo confermiamo e ti scriviamo di nuovo con la ricevuta e la licenza. La licenza compare nel tuo account nello stesso momento, e djmanzo la prende da solo la prossima volta che accede con lo stesso account.\n\nNon devi aspettare: scarica djmanzo ora da {download}, inizia la prova di sette giorni di qualsiasi edizione o gioca con l'edizione gratuita Hobbyist.\n\nIl tuo account: {account}",
    },
    processing: {
      subject: "djmanzo: il tuo pagamento per l'ordine {order} è in arrivo",
      body: "Grazie, {name}.\n\nIl tuo pagamento di {amount} per djmanzo {edition}, {plan}, è stato fatto e la tua banca lo sta elaborando, cosa che può richiedere qualche giorno lavorativo. Quando è confermato ti scriviamo di nuovo con la ricevuta e la licenza. La licenza compare nel tuo account nello stesso momento, e djmanzo la prende da solo la prossima volta che accede con lo stesso account.\n\nNon devi aspettare: scarica djmanzo ora da {download}, inizia la prova di sette giorni di qualsiasi edizione o gioca con l'edizione gratuita Hobbyist.\n\nIl tuo account: {account}",
    },
    receipt: {
      subject: "djmanzo: la tua ricevuta e la tua licenza, ordine {order}",
      body: "Grazie, {name}. Il tuo pagamento è confermato.\n\nRICEVUTA\nOrdine: {order}\nData: {date}\nArticolo: djmanzo {edition}, {plan}\n{discount}Totale pagato: {amount}\nPagato con: {method}\nVenduto da: {seller}\n{note}\n\nLA TUA LICENZA\nÈ già nel tuo account. Accedi a djmanzo con lo stesso account ({via}) e si applica da sola. Oppure, se djmanzo è offline, incolla questa chiave di licenza in djmanzo, in Settings → Licence:\n\n{line}\n\nScarica djmanzo: {download}\nIl tuo account: {account}",
    },
    gift: {
      subject: "djmanzo: la tua ricevuta e il regalo, ordine {order}",
      body: "Grazie, {name}. Il tuo pagamento è confermato.\n\nRICEVUTA\nOrdine: {order}\nData: {date}\nArticolo: djmanzo {edition}, {plan}\n{discount}Totale pagato: {amount}\nPagato con: {method}\nVenduto da: {seller}\n{note}\n\nIL REGALO\ndjmanzo {edition} è pronto da regalare. Manda questo link alla persona a cui è destinato:\n\n{link}\n\nLo apre, accede e la licenza è sua.",
    },
  },
  ja: {
    plan: {
      perpetual: "買い切り",
      monthly: "月額",
      yearly: "年額",
    },
    method: {
      transfer: "銀行振込",
      card: "カード",
    },
    discount: "割引: −{amount}\n",
    code: {
      subject: "djmanzo の確認コード: {code}",
      body: "djmanzo からのご連絡先がこのアドレスであることを確認するため、{site} でこのコードを入力してください:\n\n{code}\n\n有効期限は30分です。心当たりがない場合は、このメッセージを無視してください。何も変わりません。",
    },
    waiting: {
      subject: "djmanzo: ご注文 {order} はお振り込みをお待ちしています",
      body: "{name} 様、ありがとうございます。\n\nご注文を承りました: djmanzo {edition}、{plan}、{amount}。まだお支払いはされていません。\n\nお支払いは、{amount} を下記の口座へ、{order} を参照番号としてお振り込みください:\n\n{details}\n\n入金を確認でき次第（通常1〜3営業日）、領収書とライセンスをお送りします。ライセンスは同時にアカウントに追加され、次回同じアカウントでサインインしたときに djmanzo が自動で取り込みます。\n\nお待ちいただく必要はありません。今すぐ {download} から djmanzo をダウンロードして、お好きなエディションの7日間トライアルを始めるか、無料の Hobbyist エディションでお楽しみください。\n\nアカウント: {account}",
    },
    processing: {
      subject: "djmanzo: ご注文 {order} のお支払いを処理中です",
      body: "{name} 様、ありがとうございます。\n\ndjmanzo {edition}、{plan} の {amount} のお支払いが行われ、現在銀行で処理中です。数営業日かかる場合があります。確認でき次第、領収書とライセンスをお送りします。ライセンスは同時にアカウントに追加され、次回同じアカウントでサインインしたときに djmanzo が自動で取り込みます。\n\nお待ちいただく必要はありません。今すぐ {download} から djmanzo をダウンロードして、お好きなエディションの7日間トライアルを始めるか、無料の Hobbyist エディションでお楽しみください。\n\nアカウント: {account}",
    },
    receipt: {
      subject: "djmanzo: 領収書とライセンス（ご注文 {order}）",
      body: "{name} 様、ありがとうございます。お支払いを確認しました。\n\n領収書\nご注文: {order}\n日付: {date}\n品目: djmanzo {edition}、{plan}\n{discount}お支払い合計: {amount}\nお支払い方法: {method}\n販売者: {seller}\n{note}\n\nライセンス\nすでにアカウントに追加されています。同じアカウント（{via}）で djmanzo にサインインすると自動で適用されます。djmanzo がオフラインの場合は、このライセンスキーを djmanzo の Settings → Licence に貼り付けてください:\n\n{line}\n\ndjmanzo のダウンロード: {download}\nアカウント: {account}",
    },
    gift: {
      subject: "djmanzo: 領収書とギフト（ご注文 {order}）",
      body: "{name} 様、ありがとうございます。お支払いを確認しました。\n\n領収書\nご注文: {order}\n日付: {date}\n品目: djmanzo {edition}、{plan}\n{discount}お支払い合計: {amount}\nお支払い方法: {method}\n販売者: {seller}\n{note}\n\nギフト\ndjmanzo {edition} を贈る準備ができました。贈りたい方にこのリンクを送ってください:\n\n{link}\n\n開いてサインインすると、ライセンスはその方のものになります。",
    },
  },
};
