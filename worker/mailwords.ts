/**
 * What the site writes to a buyer, in each language it speaks
 * (`worker/mail.ts` fills the blanks). French is set as French is set: a
 * narrow no-break space before : ; ! ?.
 */

import type { BuiltInLang, PackLang } from "../src/v4/i18n/strings";

export interface MailWords {
  plan: Record<"perpetual" | "lifetime" | "monthly" | "yearly", string>;
  method: Record<"transfer" | "card", string>;
  /** One line on a receipt, with its own line break. */
  discount: string;
  code: { subject: string; body: string };
  waiting: { subject: string; body: string };
  processing: { subject: string; body: string };
  receipt: { subject: string; body: string };
  gift: { subject: string; body: string };
}

/** Every language the site speaks; a language added later is written to in English until its words are here. */
export const MAIL_WORDS: Record<BuiltInLang, MailWords> & Partial<Record<PackLang, MailWords>> = {
  en: {
    plan: {
      perpetual: "bought once",

      lifetime: "for a lifetime, every version",
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

      lifetime: "de por vida, todas las versiones",
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

      lifetime: "vitalício, todas as versões",
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

      lifetime: "auf Lebenszeit, jede Version",
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

      lifetime: "à vie, toutes les versions",
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

      lifetime: "a vita, ogni versione",
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

      lifetime: "永久ライセンス（すべてのバージョン）",
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
  zh: {
    plan: {
      perpetual: "一次买断",
      lifetime: "终身，所有版本",
      monthly: "按月",
      yearly: "按年",
    },
    method: {
      transfer: "银行转账",
      card: "银行卡",
    },
    discount: "折扣：−{amount}\n",
    code: {
      subject: "你的 djmanzo 验证码：{code}",
      body: "请在 {site} 输入这个验证码，确认 djmanzo 可以通过这个地址给你写信：\n\n{code}\n\n验证码 30 分钟内有效。如果不是你申请的，请忽略这封邮件，什么都不会改变。",
    },
    waiting: {
      subject: "djmanzo：订单 {order} 正在等待你的转账",
      body: "谢谢你，{name}。\n\n你的订单已下：djmanzo {edition}，{plan}，{amount}。目前还没有付款。\n\n付款时，请把 {amount} 转到下面的账户，并以 {order} 作为附言：\n\n{details}\n\n款项到账后（通常需要一到三个工作日），我们会确认，并再次写信给你，附上收据和许可证。许可证会同时出现在你的账户里，djmanzo 下次用同一个账户登录时会自动取回。\n\n你不必等待：现在就从 {download} 下载 djmanzo，开始任一版本的七天试用，或者先玩免费的 Hobbyist 版。\n\n你的账户：{account}",
    },
    processing: {
      subject: "djmanzo：订单 {order} 的付款正在处理中",
      body: "谢谢你，{name}。\n\n你为 djmanzo {edition}（{plan}）支付的 {amount} 已经付出，银行正在处理，可能需要几个工作日。确认之后，我们会再次写信给你，附上收据和许可证。许可证会同时出现在你的账户里，djmanzo 下次用同一个账户登录时会自动取回。\n\n你不必等待：现在就从 {download} 下载 djmanzo，开始任一版本的七天试用，或者先玩免费的 Hobbyist 版。\n\n你的账户：{account}",
    },
    receipt: {
      subject: "djmanzo：你的收据和许可证，订单 {order}",
      body: "谢谢你，{name}。你的付款已确认。\n\n收据\n订单：{order}\n日期：{date}\n商品：djmanzo {edition}，{plan}\n{discount}实付金额：{amount}\n付款方式：{method}\n销售方：{seller}\n{note}\n\n你的许可证\n它已经在你的账户里。用同一个账户（{via}）登录 djmanzo，许可证就会自动生效。如果 djmanzo 处于离线状态，也可以把这串许可证密钥粘贴到 djmanzo 的 Settings → Licence：\n\n{line}\n\n下载 djmanzo：{download}\n你的账户：{account}",
    },
    gift: {
      subject: "djmanzo：你的收据和礼物，订单 {order}",
      body: "谢谢你，{name}。你的付款已确认。\n\n收据\n订单：{order}\n日期：{date}\n商品：djmanzo {edition}，{plan}\n{discount}实付金额：{amount}\n付款方式：{method}\n销售方：{seller}\n{note}\n\n礼物\ndjmanzo {edition} 已经可以送出了。把这个链接发给你要送的人：\n\n{link}\n\n对方打开链接并登录，许可证就归对方所有。",
    },
  },
  he: {
    plan: {
      perpetual: "קנייה חד־פעמית",
      lifetime: "לכל החיים, כל גרסה",
      monthly: "חודשי",
      yearly: "שנתי",
    },
    method: {
      transfer: "העברה בנקאית",
      card: "כרטיס",
    },
    discount: "הנחה: −{amount}\n",
    code: {
      subject: "הקוד שלכם ב־djmanzo: {code}",
      body: "הקלידו את הקוד הזה ב־{site} כדי לאשר שזו הכתובת ש־djmanzo כותבת אליכם בה:\n\n{code}\n\nהקוד תקף ל־30 דקות. אם לא ביקשתם אותו, התעלמו מההודעה; שום דבר לא משתנה.",
    },
    waiting: {
      subject: "djmanzo: הזמנה {order} ממתינה להעברה שלכם",
      body: "תודה, {name}.\n\nההזמנה שלכם נקלטה: djmanzo {edition}, {plan}, {amount}. עדיין לא שולם דבר.\n\nכדי לשלם, העבירו {amount} לחשבון שלהלן, עם {order} כאסמכתה:\n\n{details}\n\nכשהכסף יגיע, בדרך כלל תוך יום עד שלושה ימי עסקים, נאשר זאת ונכתוב לכם שוב עם הקבלה והרישיון. הרישיון מופיע בחשבון שלכם באותו רגע, ו־djmanzo לוקחת אותו מעצמה בפעם הבאה שהיא מתחברת עם אותו חשבון.\n\nאין צורך לחכות: הורידו את djmanzo עכשיו מ־{download}, התחילו ניסיון של שבעה ימים בכל מהדורה, או נגנו במהדורת Hobbyist החינמית.\n\nהחשבון שלכם: {account}",
    },
    processing: {
      subject: "djmanzo: התשלום שלכם על הזמנה {order} בדרך",
      body: "תודה, {name}.\n\nהתשלום שלכם על סך {amount} עבור djmanzo {edition}, {plan}, בוצע והבנק שלכם מעבד אותו, מה שעשוי לקחת כמה ימי עסקים. כשהוא יאושר נכתוב לכם שוב עם הקבלה והרישיון. הרישיון מופיע בחשבון שלכם באותו רגע, ו־djmanzo לוקחת אותו מעצמה בפעם הבאה שהיא מתחברת עם אותו חשבון.\n\nאין צורך לחכות: הורידו את djmanzo עכשיו מ־{download}, התחילו ניסיון של שבעה ימים בכל מהדורה, או נגנו במהדורת Hobbyist החינמית.\n\nהחשבון שלכם: {account}",
    },
    receipt: {
      subject: "djmanzo: הקבלה והרישיון שלכם, הזמנה {order}",
      body: "תודה, {name}. התשלום שלכם אושר.\n\nקבלה\nהזמנה: {order}\nתאריך: {date}\nפריט: djmanzo {edition}, {plan}\n{discount}סך הכול שולם: {amount}\nאמצעי תשלום: {method}\nנמכר על ידי: {seller}\n{note}\n\nהרישיון שלכם\nהוא כבר בחשבון שלכם. התחברו ל־djmanzo עם אותו חשבון ({via}) והוא מוחל מעצמו. או, אם djmanzo לא מחוברת לאינטרנט, הדביקו את מפתח הרישיון הזה ב־djmanzo תחת Settings → Licence:\n\n{line}\n\nהורדת djmanzo: {download}\nהחשבון שלכם: {account}",
    },
    gift: {
      subject: "djmanzo: הקבלה שלכם והמתנה, הזמנה {order}",
      body: "תודה, {name}. התשלום שלכם אושר.\n\nקבלה\nהזמנה: {order}\nתאריך: {date}\nפריט: djmanzo {edition}, {plan}\n{discount}סך הכול שולם: {amount}\nאמצעי תשלום: {method}\nנמכר על ידי: {seller}\n{note}\n\nהמתנה\ndjmanzo {edition} מוכנה למסירה. שלחו את הקישור הזה למי שהיא מיועדת לו:\n\n{link}\n\nפותחים אותו, מתחברים, והרישיון שלהם.",
    },
  },
  ar: {
    plan: {
      perpetual: "شراء مرة واحدة",
      lifetime: "مدى الحياة، كل إصدار",
      monthly: "شهري",
      yearly: "سنوي",
    },
    method: {
      transfer: "تحويل مصرفي",
      card: "بطاقة",
    },
    discount: "الخصم: −{amount}\n",
    code: {
      subject: "رمزكم في djmanzo: {code}",
      body: "اكتبوا هذا الرمز في {site} لتأكيد أن هذا هو العنوان الذي يراسلكم عليه djmanzo:\n\n{code}\n\nيصلح الرمز 30 دقيقة. إن لم تطلبوه، فتجاهلوا هذه الرسالة؛ لن يتغيّر شيء.",
    },
    waiting: {
      subject: "djmanzo: الطلب {order} ينتظر تحويلكم",
      body: "شكرًا لكم، {name}.\n\nتم تسجيل طلبكم: djmanzo {edition}، {plan}، {amount}. لم يُدفع شيء بعد.\n\nللدفع، حوّلوا {amount} إلى الحساب أدناه، مع كتابة {order} مرجعًا:\n\n{details}\n\nحين يصل المبلغ، عادةً خلال يوم إلى ثلاثة أيام عمل، نؤكّده ونراسلكم من جديد بالإيصال والترخيص. يظهر الترخيص في حسابكم في اللحظة نفسها، ويلتقطه djmanzo من تلقاء نفسه في المرة التالية التي يسجّل فيها الدخول بالحساب نفسه.\n\nلا داعي للانتظار: نزّلوا djmanzo الآن من {download}، وابدؤوا تجربة الأيام السبعة لأي نسخة، أو العبوا بنسخة Hobbyist المجانية.\n\nحسابكم: {account}",
    },
    processing: {
      subject: "djmanzo: دفعتكم للطلب {order} في الطريق",
      body: "شكرًا لكم، {name}.\n\nتمّت دفعتكم البالغة {amount} مقابل djmanzo {edition}، {plan}، ويعالجها مصرفكم الآن، وقد يستغرق ذلك بضعة أيام عمل. حين تُؤكَّد نراسلكم من جديد بالإيصال والترخيص. يظهر الترخيص في حسابكم في اللحظة نفسها، ويلتقطه djmanzo من تلقاء نفسه في المرة التالية التي يسجّل فيها الدخول بالحساب نفسه.\n\nلا داعي للانتظار: نزّلوا djmanzo الآن من {download}، وابدؤوا تجربة الأيام السبعة لأي نسخة، أو العبوا بنسخة Hobbyist المجانية.\n\nحسابكم: {account}",
    },
    receipt: {
      subject: "djmanzo: إيصالكم وترخيصكم، الطلب {order}",
      body: "شكرًا لكم، {name}. تم تأكيد دفعتكم.\n\nالإيصال\nالطلب: {order}\nالتاريخ: {date}\nالبند: djmanzo {edition}، {plan}\n{discount}المبلغ المدفوع: {amount}\nطريقة الدفع: {method}\nالبائع: {seller}\n{note}\n\nترخيصكم\nإنه في حسابكم الآن. سجّلوا الدخول إلى djmanzo بالحساب نفسه ({via}) فيُطبَّق من تلقاء نفسه. أو، إن كان djmanzo دون اتصال، الصقوا مفتاح الترخيص هذا في djmanzo ضمن Settings → Licence:\n\n{line}\n\nتنزيل djmanzo: {download}\nحسابكم: {account}",
    },
    gift: {
      subject: "djmanzo: إيصالكم والهدية، الطلب {order}",
      body: "شكرًا لكم، {name}. تم تأكيد دفعتكم.\n\nالإيصال\nالطلب: {order}\nالتاريخ: {date}\nالبند: djmanzo {edition}، {plan}\n{discount}المبلغ المدفوع: {amount}\nطريقة الدفع: {method}\nالبائع: {seller}\n{note}\n\nالهدية\ndjmanzo {edition} جاهز للإهداء. أرسلوا هذا الرابط إلى من هو له:\n\n{link}\n\nيفتحه، ويسجّل الدخول، فيصبح الترخيص له.",
    },
  },
  hi: {
    plan: {
      perpetual: "एक बार ख़रीदा",
      lifetime: "आजीवन, हर संस्करण",
      monthly: "मासिक",
      yearly: "वार्षिक",
    },
    method: {
      transfer: "बैंक ट्रांसफ़र",
      card: "कार्ड",
    },
    discount: "छूट: −{amount}\n",
    code: {
      subject: "आपका djmanzo कोड: {code}",
      body: "यह पुष्टि करने के लिए कि djmanzo आपको इसी पते पर लिखे, {site} पर यह कोड डालें:\n\n{code}\n\nयह 30 मिनट तक चलता है। अगर आपने यह नहीं माँगा था, तो इस संदेश को अनदेखा करें; कुछ नहीं बदलेगा।",
    },
    waiting: {
      subject: "djmanzo: ऑर्डर {order} आपके ट्रांसफ़र की प्रतीक्षा में है",
      body: "धन्यवाद, {name}।\n\nआपका ऑर्डर दर्ज हो गया है: djmanzo {edition}, {plan}, {amount}। अभी तक कोई भुगतान नहीं हुआ है।\n\nभुगतान के लिए, {amount} नीचे दिए खाते में ट्रांसफ़र करें, संदर्भ में {order} लिखें:\n\n{details}\n\nपैसा पहुँचने पर, आमतौर पर एक से तीन कार्यदिवसों में, हम उसकी पुष्टि करेंगे और आपकी रसीद और लाइसेंस के साथ फिर लिखेंगे। लाइसेंस उसी पल आपके खाते में दिखता है, और अगली बार जब djmanzo उसी खाते से साइन इन करता है, तो वह उसे अपने-आप ले लेता है।\n\nइंतज़ार की ज़रूरत नहीं: djmanzo अभी {download} से डाउनलोड करें, किसी भी संस्करण का सात दिन का ट्रायल शुरू करें, या मुफ़्त Hobbyist संस्करण से बजाएँ।\n\nआपका खाता: {account}",
    },
    processing: {
      subject: "djmanzo: ऑर्डर {order} के लिए आपका भुगतान रास्ते में है",
      body: "धन्यवाद, {name}।\n\ndjmanzo {edition}, {plan}, के लिए {amount} का आपका भुगतान हो गया है और आपका बैंक उसे प्रोसेस कर रहा है, जिसमें कुछ कार्यदिवस लग सकते हैं। पुष्टि होते ही हम आपकी रसीद और लाइसेंस के साथ फिर लिखेंगे। लाइसेंस उसी पल आपके खाते में दिखता है, और अगली बार जब djmanzo उसी खाते से साइन इन करता है, तो वह उसे अपने-आप ले लेता है।\n\nइंतज़ार की ज़रूरत नहीं: djmanzo अभी {download} से डाउनलोड करें, किसी भी संस्करण का सात दिन का ट्रायल शुरू करें, या मुफ़्त Hobbyist संस्करण से बजाएँ।\n\nआपका खाता: {account}",
    },
    receipt: {
      subject: "djmanzo: आपकी रसीद और लाइसेंस, ऑर्डर {order}",
      body: "धन्यवाद, {name}। आपके भुगतान की पुष्टि हो गई है।\n\nरसीद\nऑर्डर: {order}\nतारीख़: {date}\nआइटम: djmanzo {edition}, {plan}\n{discount}कुल भुगतान: {amount}\nभुगतान का तरीका: {method}\nविक्रेता: {seller}\n{note}\n\nआपका लाइसेंस\nयह अब आपके खाते में है। उसी खाते ({via}) से djmanzo में साइन इन करें और यह अपने-आप लग जाता है। या, अगर djmanzo ऑफ़लाइन है, तो यह लाइसेंस कुंजी djmanzo में Settings → Licence के अंदर पेस्ट करें:\n\n{line}\n\ndjmanzo डाउनलोड करें: {download}\nआपका खाता: {account}",
    },
    gift: {
      subject: "djmanzo: आपकी रसीद और उपहार, ऑर्डर {order}",
      body: "धन्यवाद, {name}। आपके भुगतान की पुष्टि हो गई है।\n\nरसीद\nऑर्डर: {order}\nतारीख़: {date}\nआइटम: djmanzo {edition}, {plan}\n{discount}कुल भुगतान: {amount}\nभुगतान का तरीका: {method}\nविक्रेता: {seller}\n{note}\n\nउपहार\ndjmanzo {edition} देने के लिए तैयार है। यह लिंक उस व्यक्ति को भेजें जिसके लिए यह है:\n\n{link}\n\nवे इसे खोलें, साइन इन करें, और लाइसेंस उनका हो जाता है।",
    },
  },
  ko: {
    plan: {
      perpetual: "한 번 구매",
      lifetime: "평생, 모든 버전",
      monthly: "월간",
      yearly: "연간",
    },
    method: {
      transfer: "계좌 이체",
      card: "카드",
    },
    discount: "할인: −{amount}\n",
    code: {
      subject: "djmanzo 인증 코드: {code}",
      body: "djmanzo가 이 주소로 연락드려도 되는지 확인하려면 {site}에 이 코드를 입력하세요:\n\n{code}\n\n코드는 30분 동안 유효합니다. 요청하지 않으셨다면 이 메일은 무시하셔도 됩니다. 아무것도 바뀌지 않습니다.",
    },
    waiting: {
      subject: "djmanzo: 주문 {order}이(가) 이체를 기다리고 있습니다",
      body: "{name} 님, 감사합니다.\n\n주문이 접수되었습니다: djmanzo {edition}, {plan}, {amount}. 아직 결제된 금액은 없습니다.\n\n결제하시려면 아래 계좌로 {amount}을(를) 이체하시고, 받는 분 메모에 {order}을(를) 적어 주세요:\n\n{details}\n\n입금이 확인되면(보통 영업일 기준 1~3일) 영수증과 라이선스를 담아 다시 메일을 드립니다. 라이선스는 같은 순간 계정에 나타나고, djmanzo가 다음에 같은 계정으로 로그인할 때 알아서 가져갑니다.\n\n기다리실 필요는 없습니다. 지금 {download}에서 djmanzo를 내려받아 어느 에디션이든 7일 체험을 시작하거나, 무료 Hobbyist 에디션으로 플레이해 보세요.\n\n내 계정: {account}",
    },
    processing: {
      subject: "djmanzo: 주문 {order}의 결제가 처리 중입니다",
      body: "{name} 님, 감사합니다.\n\ndjmanzo {edition}, {plan}에 대한 {amount} 결제가 이루어졌고 은행에서 처리 중입니다. 영업일 기준 며칠이 걸릴 수 있습니다. 확인되면 영수증과 라이선스를 담아 다시 메일을 드립니다. 라이선스는 같은 순간 계정에 나타나고, djmanzo가 다음에 같은 계정으로 로그인할 때 알아서 가져갑니다.\n\n기다리실 필요는 없습니다. 지금 {download}에서 djmanzo를 내려받아 어느 에디션이든 7일 체험을 시작하거나, 무료 Hobbyist 에디션으로 플레이해 보세요.\n\n내 계정: {account}",
    },
    receipt: {
      subject: "djmanzo: 영수증과 라이선스, 주문 {order}",
      body: "{name} 님, 감사합니다. 결제가 확인되었습니다.\n\n영수증\n주문: {order}\n날짜: {date}\n품목: djmanzo {edition}, {plan}\n{discount}결제 금액: {amount}\n결제 수단: {method}\n판매자: {seller}\n{note}\n\n라이선스\n이미 계정에 들어 있습니다. 같은 계정({via})으로 djmanzo에 로그인하면 자동으로 적용됩니다. djmanzo가 오프라인이라면 이 라이선스 키를 djmanzo의 Settings → Licence에 붙여 넣으세요:\n\n{line}\n\ndjmanzo 내려받기: {download}\n내 계정: {account}",
    },
    gift: {
      subject: "djmanzo: 영수증과 선물, 주문 {order}",
      body: "{name} 님, 감사합니다. 결제가 확인되었습니다.\n\n영수증\n주문: {order}\n날짜: {date}\n품목: djmanzo {edition}, {plan}\n{discount}결제 금액: {amount}\n결제 수단: {method}\n판매자: {seller}\n{note}\n\n선물\ndjmanzo {edition}을(를) 건넬 준비가 되었습니다. 선물받을 분께 이 링크를 보내 주세요:\n\n{link}\n\n링크를 열고 로그인하면 라이선스는 그분의 것이 됩니다.",
    },
  },
  id: {
    plan: {
      perpetual: "beli sekali",
      lifetime: "seumur hidup, semua versi",
      monthly: "bulanan",
      yearly: "tahunan",
    },
    method: {
      transfer: "transfer bank",
      card: "kartu",
    },
    discount: "Diskon: −{amount}\n",
    code: {
      subject: "Kode djmanzo Anda: {code}",
      body: "Ketik kode ini di {site} untuk memastikan bahwa ini alamat yang dipakai djmanzo untuk menulis kepada Anda:\n\n{code}\n\nKode berlaku 30 menit. Jika Anda tidak memintanya, abaikan pesan ini; tidak ada yang berubah.",
    },
    waiting: {
      subject: "djmanzo: pesanan {order} menunggu transfer Anda",
      body: "Terima kasih, {name}.\n\nPesanan Anda sudah tercatat: djmanzo {edition}, {plan}, {amount}. Belum ada yang dibayar.\n\nUntuk membayar, transfer {amount} ke rekening di bawah ini, dengan {order} sebagai berita/referensi:\n\n{details}\n\nSaat dananya masuk, biasanya dalam satu sampai tiga hari kerja, kami mengonfirmasinya dan menulis lagi kepada Anda dengan kuitansi dan lisensi. Lisensinya muncul di akun Anda pada saat yang sama, dan djmanzo mengambilnya sendiri saat berikutnya masuk dengan akun yang sama.\n\nTidak perlu menunggu: unduh djmanzo sekarang di {download}, mulai uji coba tujuh hari untuk edisi mana pun, atau bermain dengan edisi Hobbyist yang gratis.\n\nAkun Anda: {account}",
    },
    processing: {
      subject: "djmanzo: pembayaran Anda untuk pesanan {order} sedang diproses",
      body: "Terima kasih, {name}.\n\nPembayaran Anda sebesar {amount} untuk djmanzo {edition}, {plan}, sudah dilakukan dan bank Anda sedang memprosesnya, yang bisa memakan beberapa hari kerja. Begitu dikonfirmasi, kami menulis lagi kepada Anda dengan kuitansi dan lisensi. Lisensinya muncul di akun Anda pada saat yang sama, dan djmanzo mengambilnya sendiri saat berikutnya masuk dengan akun yang sama.\n\nTidak perlu menunggu: unduh djmanzo sekarang di {download}, mulai uji coba tujuh hari untuk edisi mana pun, atau bermain dengan edisi Hobbyist yang gratis.\n\nAkun Anda: {account}",
    },
    receipt: {
      subject: "djmanzo: kuitansi dan lisensi Anda, pesanan {order}",
      body: "Terima kasih, {name}. Pembayaran Anda sudah dikonfirmasi.\n\nKUITANSI\nPesanan: {order}\nTanggal: {date}\nItem: djmanzo {edition}, {plan}\n{discount}Total dibayar: {amount}\nDibayar dengan: {method}\nDijual oleh: {seller}\n{note}\n\nLISENSI ANDA\nLisensinya sudah ada di akun Anda. Masuk ke djmanzo dengan akun yang sama ({via}) dan lisensi terpasang sendiri. Atau, jika djmanzo sedang offline, tempel kunci lisensi ini di djmanzo pada Settings → Licence:\n\n{line}\n\nUnduh djmanzo: {download}\nAkun Anda: {account}",
    },
    gift: {
      subject: "djmanzo: kuitansi Anda dan hadiahnya, pesanan {order}",
      body: "Terima kasih, {name}. Pembayaran Anda sudah dikonfirmasi.\n\nKUITANSI\nPesanan: {order}\nTanggal: {date}\nItem: djmanzo {edition}, {plan}\n{discount}Total dibayar: {amount}\nDibayar dengan: {method}\nDijual oleh: {seller}\n{note}\n\nHADIAHNYA\ndjmanzo {edition} siap diberikan. Kirim tautan ini kepada orang yang akan menerimanya:\n\n{link}\n\nMereka membukanya, masuk, dan lisensinya menjadi milik mereka.",
    },
  },
  vi: {
    plan: {
      perpetual: "mua một lần",
      lifetime: "trọn đời, mọi phiên bản",
      monthly: "hằng tháng",
      yearly: "hằng năm",
    },
    method: {
      transfer: "chuyển khoản ngân hàng",
      card: "thẻ",
    },
    discount: "Giảm giá: −{amount}\n",
    code: {
      subject: "Mã djmanzo của bạn: {code}",
      body: "Nhập mã này trên {site} để xác nhận đây là địa chỉ djmanzo dùng để viết cho bạn:\n\n{code}\n\nMã có hiệu lực trong 30 phút. Nếu bạn không yêu cầu, hãy bỏ qua thư này; không có gì thay đổi.",
    },
    waiting: {
      subject: "djmanzo: đơn hàng {order} đang chờ bạn chuyển khoản",
      body: "Cảm ơn bạn, {name}.\n\nĐơn hàng của bạn đã được ghi nhận: djmanzo {edition}, {plan}, {amount}. Chưa có khoản nào được thanh toán.\n\nĐể thanh toán, hãy chuyển {amount} vào tài khoản dưới đây, ghi {order} làm nội dung chuyển khoản:\n\n{details}\n\nKhi tiền đến, thường trong một đến ba ngày làm việc, chúng tôi sẽ xác nhận và viết lại cho bạn kèm biên nhận và giấy phép. Giấy phép xuất hiện trong tài khoản của bạn cùng lúc đó, và djmanzo sẽ tự nhận nó vào lần tới đăng nhập bằng cùng tài khoản.\n\nBạn không cần chờ: tải djmanzo ngay tại {download}, bắt đầu dùng thử bảy ngày bất kỳ phiên bản nào, hoặc chơi với phiên bản Hobbyist miễn phí.\n\nTài khoản của bạn: {account}",
    },
    processing: {
      subject: "djmanzo: khoản thanh toán cho đơn hàng {order} đang được xử lý",
      body: "Cảm ơn bạn, {name}.\n\nKhoản thanh toán {amount} của bạn cho djmanzo {edition}, {plan}, đã được thực hiện và ngân hàng đang xử lý, việc này có thể mất vài ngày làm việc. Khi được xác nhận, chúng tôi sẽ viết lại cho bạn kèm biên nhận và giấy phép. Giấy phép xuất hiện trong tài khoản của bạn cùng lúc đó, và djmanzo sẽ tự nhận nó vào lần tới đăng nhập bằng cùng tài khoản.\n\nBạn không cần chờ: tải djmanzo ngay tại {download}, bắt đầu dùng thử bảy ngày bất kỳ phiên bản nào, hoặc chơi với phiên bản Hobbyist miễn phí.\n\nTài khoản của bạn: {account}",
    },
    receipt: {
      subject: "djmanzo: biên nhận và giấy phép của bạn, đơn hàng {order}",
      body: "Cảm ơn bạn, {name}. Khoản thanh toán của bạn đã được xác nhận.\n\nBIÊN NHẬN\nĐơn hàng: {order}\nNgày: {date}\nMặt hàng: djmanzo {edition}, {plan}\n{discount}Tổng đã trả: {amount}\nThanh toán bằng: {method}\nNgười bán: {seller}\n{note}\n\nGIẤY PHÉP CỦA BẠN\nGiấy phép đã có trong tài khoản của bạn. Đăng nhập djmanzo bằng cùng tài khoản ({via}) và nó sẽ tự được áp dụng. Hoặc, nếu djmanzo đang ngoại tuyến, hãy dán khóa giấy phép này vào djmanzo ở Settings → Licence:\n\n{line}\n\nTải djmanzo: {download}\nTài khoản của bạn: {account}",
    },
    gift: {
      subject: "djmanzo: biên nhận của bạn và món quà, đơn hàng {order}",
      body: "Cảm ơn bạn, {name}. Khoản thanh toán của bạn đã được xác nhận.\n\nBIÊN NHẬN\nĐơn hàng: {order}\nNgày: {date}\nMặt hàng: djmanzo {edition}, {plan}\n{discount}Tổng đã trả: {amount}\nThanh toán bằng: {method}\nNgười bán: {seller}\n{note}\n\nMÓN QUÀ\ndjmanzo {edition} đã sẵn sàng để trao tặng. Hãy gửi liên kết này cho người nhận:\n\n{link}\n\nHọ mở liên kết, đăng nhập, và giấy phép thuộc về họ.",
    },
  },
  th: {
    plan: {
      perpetual: "ซื้อครั้งเดียว",
      lifetime: "ตลอดชีพ ทุกเวอร์ชัน",
      monthly: "รายเดือน",
      yearly: "รายปี",
    },
    method: {
      transfer: "โอนเงินผ่านธนาคาร",
      card: "บัตร",
    },
    discount: "ส่วนลด: −{amount}\n",
    code: {
      subject: "รหัส djmanzo ของคุณ: {code}",
      body: "พิมพ์รหัสนี้ที่ {site} เพื่อยืนยันว่านี่คือที่อยู่ที่ djmanzo ใช้เขียนถึงคุณ:\n\n{code}\n\nรหัสใช้ได้ 30 นาที หากคุณไม่ได้ขอ ไม่ต้องสนใจข้อความนี้ ไม่มีอะไรเปลี่ยนแปลง",
    },
    waiting: {
      subject: "djmanzo: คำสั่งซื้อ {order} รอการโอนเงินจากคุณ",
      body: "ขอบคุณ {name}\n\nคำสั่งซื้อของคุณได้รับแล้ว: djmanzo {edition}, {plan}, {amount} ยังไม่มีการชำระเงินใด ๆ\n\nหากต้องการชำระ ให้โอน {amount} เข้าบัญชีด้านล่าง โดยใส่ {order} เป็นข้อมูลอ้างอิง:\n\n{details}\n\nเมื่อเงินเข้า ซึ่งปกติใช้เวลาหนึ่งถึงสามวันทำการ เราจะยืนยันและเขียนถึงคุณอีกครั้งพร้อมใบเสร็จและไลเซนส์ ไลเซนส์จะปรากฏในบัญชีของคุณในเวลาเดียวกัน และ djmanzo จะดึงไปเองในครั้งถัดไปที่เข้าสู่ระบบด้วยบัญชีเดียวกัน\n\nไม่ต้องรอ: ดาวน์โหลด djmanzo ได้เลยที่ {download} เริ่มทดลองใช้เจ็ดวันกับรุ่นใดก็ได้ หรือเล่นกับรุ่น Hobbyist ที่ฟรี\n\nบัญชีของคุณ: {account}",
    },
    processing: {
      subject: "djmanzo: การชำระเงินสำหรับคำสั่งซื้อ {order} กำลังดำเนินการ",
      body: "ขอบคุณ {name}\n\nการชำระเงิน {amount} ของคุณสำหรับ djmanzo {edition}, {plan} ได้ทำแล้ว และธนาคารของคุณกำลังดำเนินการ ซึ่งอาจใช้เวลาสองสามวันทำการ เมื่อยืนยันแล้ว เราจะเขียนถึงคุณอีกครั้งพร้อมใบเสร็จและไลเซนส์ ไลเซนส์จะปรากฏในบัญชีของคุณในเวลาเดียวกัน และ djmanzo จะดึงไปเองในครั้งถัดไปที่เข้าสู่ระบบด้วยบัญชีเดียวกัน\n\nไม่ต้องรอ: ดาวน์โหลด djmanzo ได้เลยที่ {download} เริ่มทดลองใช้เจ็ดวันกับรุ่นใดก็ได้ หรือเล่นกับรุ่น Hobbyist ที่ฟรี\n\nบัญชีของคุณ: {account}",
    },
    receipt: {
      subject: "djmanzo: ใบเสร็จและไลเซนส์ของคุณ คำสั่งซื้อ {order}",
      body: "ขอบคุณ {name} การชำระเงินของคุณได้รับการยืนยันแล้ว\n\nใบเสร็จ\nคำสั่งซื้อ: {order}\nวันที่: {date}\nรายการ: djmanzo {edition}, {plan}\n{discount}ยอดชำระทั้งหมด: {amount}\nชำระด้วย: {method}\nผู้ขาย: {seller}\n{note}\n\nไลเซนส์ของคุณ\nอยู่ในบัญชีของคุณแล้ว เข้าสู่ระบบ djmanzo ด้วยบัญชีเดียวกัน ({via}) แล้วไลเซนส์จะถูกนำไปใช้เอง หรือหาก djmanzo ออฟไลน์อยู่ ให้วางคีย์ไลเซนส์นี้ใน djmanzo ที่ Settings → Licence:\n\n{line}\n\nดาวน์โหลด djmanzo: {download}\nบัญชีของคุณ: {account}",
    },
    gift: {
      subject: "djmanzo: ใบเสร็จของคุณและของขวัญ คำสั่งซื้อ {order}",
      body: "ขอบคุณ {name} การชำระเงินของคุณได้รับการยืนยันแล้ว\n\nใบเสร็จ\nคำสั่งซื้อ: {order}\nวันที่: {date}\nรายการ: djmanzo {edition}, {plan}\n{discount}ยอดชำระทั้งหมด: {amount}\nชำระด้วย: {method}\nผู้ขาย: {seller}\n{note}\n\nของขวัญ\ndjmanzo {edition} พร้อมมอบให้แล้ว ส่งลิงก์นี้ให้คนที่คุณจะมอบให้:\n\n{link}\n\nเขาเปิดลิงก์ เข้าสู่ระบบ แล้วไลเซนส์ก็เป็นของเขา",
    },
  },
  tr: {
    plan: {
      perpetual: "bir kez satın alındı",
      lifetime: "ömür boyu, her sürüm",
      monthly: "aylık",
      yearly: "yıllık",
    },
    method: {
      transfer: "banka havalesi",
      card: "kart",
    },
    discount: "İndirim: −{amount}\n",
    code: {
      subject: "djmanzo kodun: {code}",
      body: "djmanzo'nun sana bu adresten yazdığını onaylamak için bu kodu {site} üzerinde gir:\n\n{code}\n\nKod 30 dakika geçerlidir. İstemediysen bu mesajı yok say; hiçbir şey değişmez.",
    },
    waiting: {
      subject: "djmanzo: {order} numaralı sipariş havaleni bekliyor",
      body: "Teşekkürler, {name}.\n\nSiparişin alındı: djmanzo {edition}, {plan}, {amount}. Henüz bir ödeme yapılmadı.\n\nÖdemek için {amount} tutarını aşağıdaki hesaba, açıklamaya {order} yazarak gönder:\n\n{details}\n\nPara ulaştığında, genellikle bir ile üç iş günü içinde, bunu onaylar ve makbuzun ile lisansınla sana yeniden yazarız. Lisans aynı anda hesabında görünür ve djmanzo aynı hesapla bir sonraki girişinde onu kendiliğinden alır.\n\nBeklemene gerek yok: djmanzo'yu şimdi {download} adresinden indir, herhangi bir sürümün yedi günlük denemesini başlat ya da ücretsiz Hobbyist sürümüyle çal.\n\nHesabın: {account}",
    },
    processing: {
      subject: "djmanzo: {order} numaralı sipariş için ödemen yolda",
      body: "Teşekkürler, {name}.\n\ndjmanzo {edition}, {plan} için {amount} tutarındaki ödemen yapıldı ve bankan işliyor; bu birkaç iş günü sürebilir. Onaylandığında makbuzun ve lisansınla sana yeniden yazarız. Lisans aynı anda hesabında görünür ve djmanzo aynı hesapla bir sonraki girişinde onu kendiliğinden alır.\n\nBeklemene gerek yok: djmanzo'yu şimdi {download} adresinden indir, herhangi bir sürümün yedi günlük denemesini başlat ya da ücretsiz Hobbyist sürümüyle çal.\n\nHesabın: {account}",
    },
    receipt: {
      subject: "djmanzo: makbuzun ve lisansın, sipariş {order}",
      body: "Teşekkürler, {name}. Ödemen onaylandı.\n\nMAKBUZ\nSipariş: {order}\nTarih: {date}\nÜrün: djmanzo {edition}, {plan}\n{discount}Ödenen toplam: {amount}\nÖdeme yöntemi: {method}\nSatıcı: {seller}\n{note}\n\nLİSANSIN\nŞu an hesabında. djmanzo'ya aynı hesapla ({via}) giriş yap, lisans kendiliğinden uygulanır. Ya da djmanzo çevrimdışıysa bu lisans anahtarını djmanzo'da Settings → Licence altına yapıştır:\n\n{line}\n\ndjmanzo'yu indir: {download}\nHesabın: {account}",
    },
    gift: {
      subject: "djmanzo: makbuzun ve hediye, sipariş {order}",
      body: "Teşekkürler, {name}. Ödemen onaylandı.\n\nMAKBUZ\nSipariş: {order}\nTarih: {date}\nÜrün: djmanzo {edition}, {plan}\n{discount}Ödenen toplam: {amount}\nÖdeme yöntemi: {method}\nSatıcı: {seller}\n{note}\n\nHEDİYE\ndjmanzo {edition} vermeye hazır. Bu bağlantıyı hediyenin sahibine gönder:\n\n{link}\n\nAçar, giriş yapar ve lisans onun olur.",
    },
  },
  sw: {
    plan: {
      perpetual: "nunua mara moja",
      lifetime: "maisha yote, kila toleo",
      monthly: "kila mwezi",
      yearly: "kila mwaka",
    },
    method: {
      transfer: "uhamisho wa benki",
      card: "kadi",
    },
    discount: "Punguzo: −{amount}\n",
    code: {
      subject: "Msimbo wako wa djmanzo: {code}",
      body: "Andika msimbo huu kwenye {site} kuthibitisha kwamba hii ndiyo anwani ambayo djmanzo inakuandikia:\n\n{code}\n\nUnafanya kazi kwa dakika 30. Kama hukuuomba, puuza ujumbe huu; hakuna kinachobadilika.",
    },
    waiting: {
      subject: "djmanzo: oda {order} inasubiri uhamisho wako",
      body: "Asante, {name}.\n\nOda yako imewekwa: djmanzo {edition}, {plan}, {amount}. Bado hakuna kilicholipwa.\n\nKulipa, hamisha {amount} kwenda akaunti iliyo hapa chini, ukiandika {order} kama kumbukumbu:\n\n{details}\n\nPesa zikifika, kwa kawaida ndani ya siku moja hadi tatu za kazi, tunazithibitisha na kukuandikia tena pamoja na risiti na leseni yako. Leseni inaonekana kwenye akaunti yako wakati huo huo, na djmanzo inaichukua yenyewe mara ijayo inapoingia kwa akaunti ile ile.\n\nHuna haja ya kusubiri: pakua djmanzo sasa kwenye {download}, anza jaribio la siku saba la toleo lolote, au cheza na toleo la Hobbyist lisilo na malipo.\n\nAkaunti yako: {account}",
    },
    processing: {
      subject: "djmanzo: malipo yako ya oda {order} yako njiani",
      body: "Asante, {name}.\n\nMalipo yako ya {amount} kwa djmanzo {edition}, {plan}, yamefanyika na benki yako inayashughulikia, jambo linaloweza kuchukua siku chache za kazi. Yakithibitishwa tunakuandikia tena pamoja na risiti na leseni yako. Leseni inaonekana kwenye akaunti yako wakati huo huo, na djmanzo inaichukua yenyewe mara ijayo inapoingia kwa akaunti ile ile.\n\nHuna haja ya kusubiri: pakua djmanzo sasa kwenye {download}, anza jaribio la siku saba la toleo lolote, au cheza na toleo la Hobbyist lisilo na malipo.\n\nAkaunti yako: {account}",
    },
    receipt: {
      subject: "djmanzo: risiti na leseni yako, oda {order}",
      body: "Asante, {name}. Malipo yako yamethibitishwa.\n\nRISITI\nOda: {order}\nTarehe: {date}\nBidhaa: djmanzo {edition}, {plan}\n{discount}Jumla iliyolipwa: {amount}\nImelipwa kwa: {method}\nMuuzaji: {seller}\n{note}\n\nLESENI YAKO\nIko kwenye akaunti yako sasa. Ingia kwenye djmanzo kwa akaunti ile ile ({via}) nayo inawekwa yenyewe. Au, kama djmanzo haiko mtandaoni, bandika ufunguo huu wa leseni kwenye djmanzo chini ya Settings → Licence:\n\n{line}\n\nPakua djmanzo: {download}\nAkaunti yako: {account}",
    },
    gift: {
      subject: "djmanzo: risiti yako na zawadi, oda {order}",
      body: "Asante, {name}. Malipo yako yamethibitishwa.\n\nRISITI\nOda: {order}\nTarehe: {date}\nBidhaa: djmanzo {edition}, {plan}\n{discount}Jumla iliyolipwa: {amount}\nImelipwa kwa: {method}\nMuuzaji: {seller}\n{note}\n\nZAWADI\ndjmanzo {edition} iko tayari kukabidhiwa. Tuma kiungo hiki kwa mtu anayepewa:\n\n{link}\n\nAnakifungua, anaingia, na leseni inakuwa yake.",
    },
  },
};
