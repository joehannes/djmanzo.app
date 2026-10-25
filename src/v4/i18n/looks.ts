/**
 * The look picker's words in every language the site speaks: where each
 * skin is the first look, and what its ornaments refer to. English is the
 * skins' own (`skins.ts`, `looks.ts`); a skin's name is a name and stays.
 * A country is named by the browser, in the visitor's language.
 */

import { LOOKS } from "../looks";
import { SKIN_BY_ID, type SkinId } from "../skins";
import { LANG_INFO, type Lang } from "./strings";

export const LOOK_WORDS: Record<Exclude<Lang, "en">, Record<SkinId, { region: string; about: string }>> = {
  es: {
    club: { region: "Europa", about: "Flyers de naves y raves: la rejilla de LED, los abanicos de láser y el cono de la torre de altavoces." },
    tropical: { region: "América Latina y el Caribe", about: "El Caribe y América Latina: la calada de madera de las casas, el papel picado sobre la calle, el sol de los petroglifos taínos." },
    urban: { region: "Norteamérica", about: "Flyers de block parties y fundas de discos: tramas de puntos, las barras del ecualizador, un disco en el plato." },
    afro: { region: "África", about: "Telas y signos de África occidental: las marcas del bògòlanfini, los bloques del kente y Nkyinkyim, el zigzag adinkra de un camino que se tuerce y sigue." },
    neon: { region: "Asia oriental y el Sudeste Asiático", about: "Las noches de Asia oriental y el Sudeste Asiático: las olas seigaiha en telas y azulejos, los tubos de neón sobre las salas de karaoke, la luz redonda del farol." },
    oasis: { region: "Oriente Medio y el norte de África", about: "Oriente Medio y el norte de África: la estrella de ocho puntas del zellige y del girih, los arcos del patio, la luz de la lámpara." },
    monsoon: { region: "Asia del Sur", about: "Las celebraciones del sur de Asia: el rangoli dibujado en la puerta, el toran de caléndulas sobre ella, los anillos del mandala." },
    pacific: { region: "Oceanía", about: "Oceanía: los triángulos de la tapa y el siapo, telas de corteza; el rizo de la ola que rompe; la fronda del helecho que se despliega." },
    studio: { region: "Cualquier otro lugar", about: "El propio estudio: las lamas de un difusor acústico, las marcas de un vúmetro, su aguja." },
  },
  pt: {
    club: { region: "Europa", about: "Flyers de galpão e rave: a grade de LED, os leques de laser e o cone da pilha de caixas de som." },
    tropical: { region: "América Latina e Caribe", about: "O Caribe e a América Latina: os lambrequins das casas de madeira, o papel picado sobre a rua, o sol dos petróglifos taínos." },
    urban: { region: "América do Norte", about: "Flyers de festas de rua e capas de discos: retículas de pontos, as barras do equalizador, um disco no toca-discos." },
    afro: { region: "África", about: "Tecidos e signos da África Ocidental: as marcas do bògòlanfini, os blocos do kente e Nkyinkyim, o zigue-zague adinkra de um caminho que se curva e continua." },
    neon: { region: "Leste e Sudeste Asiático", about: "As noites do Leste e Sudeste Asiático: as ondas seigaiha em tecidos e azulejos, os tubos de neon sobre as salas de karaokê, a luz redonda da lanterna." },
    oasis: { region: "Oriente Médio e Norte da África", about: "O Oriente Médio e o Norte da África: a estrela de oito pontas do zellige e do girih, os arcos do pátio, a luz da lamparina." },
    monsoon: { region: "Sul da Ásia", about: "As celebrações do Sul da Ásia: o rangoli desenhado na porta, o toran de cravos-de-defunto sobre ela, os anéis da mandala." },
    pacific: { region: "Oceania", about: "Oceania: os triângulos da tapa e do siapo, tecidos de casca de árvore; a curva da onda quebrando; a folha de samambaia que se desenrola." },
    studio: { region: "Qualquer outro lugar", about: "O próprio estúdio: as ripas de um difusor acústico, as marcas de um VU meter, o seu ponteiro." },
  },
  de: {
    club: { region: "Europa", about: "Flyer von Lagerhallen und Raves: das LED-Raster, Laserfächer und der Konus des Boxenturms." },
    tropical: { region: "Lateinamerika und die Karibik", about: "Die Karibik und Lateinamerika: das Gingerbread-Schnitzwerk an Holzhäusern, Papel picado über der Straße, die Sonne der Taíno-Petroglyphen." },
    urban: { region: "Nordamerika", about: "Flyer von Block-Partys und Plattenhüllen: Rasterpunkte, die Balken des Equalizers, eine Platte auf dem Plattenteller." },
    afro: { region: "Afrika", about: "Stoffe und Zeichen Westafrikas: die Muster des Bògòlanfini-Schlammtuchs, die Blöcke des Kente und Nkyinkyim, das Adinkra-Zickzack eines Weges, der sich windet und weitergeht." },
    neon: { region: "Ost- und Südostasien", about: "Die Nächte Ost- und Südostasiens: Seigaiha-Wellen auf Stoff und Fliesen, Neonröhren über den Karaoke-Räumen, das runde Licht der Laterne." },
    oasis: { region: "Naher Osten und Nordafrika", about: "Der Nahe Osten und Nordafrika: der achtzackige Stern der Zellige- und Girih-Fliesen, die Bögen des Innenhofs, Lampenlicht." },
    monsoon: { region: "Südasien", about: "Die Feste Südasiens: Rangoli vor der Tür, darüber der Toran aus Studentenblumen, die Ringe des Mandalas." },
    pacific: { region: "Ozeanien", about: "Ozeanien: die Dreiecke von Tapa und Siapo, Stoffen aus Rinde; die Locke der brechenden Welle; der sich entrollende Farnwedel." },
    studio: { region: "Überall sonst", about: "Das Studio selbst: die Lamellen eines Akustikdiffusors, die Skala eines VU-Meters, seine Nadel." },
  },
  fr: {
    club: { region: "Europe", about: "Flyers d'entrepôts et de raves : la grille de LED, les éventails de lasers et le cône du mur d'enceintes." },
    tropical: { region: "Amérique latine et Caraïbes", about: "Les Caraïbes et l'Amérique latine : les dentelles de bois des maisons, le papel picado au-dessus de la rue, le soleil des pétroglyphes taïnos." },
    urban: { region: "Amérique du Nord", about: "Flyers de block parties et pochettes de disques : trames de points, les barres de l'égaliseur, un disque sur la platine." },
    afro: { region: "Afrique", about: "Tissus et signes d'Afrique de l'Ouest : les motifs du bogolan, les blocs du kente et Nkyinkyim, le zigzag adinkra d'un chemin qui tourne et continue." },
    neon: { region: "Asie de l'Est et du Sud-Est", about: "Les nuits d'Asie de l'Est et du Sud-Est : les vagues seigaiha sur les tissus et les tuiles, les tubes de néon au-dessus des salles de karaoké, la lumière ronde de la lanterne." },
    oasis: { region: "Moyen-Orient et Afrique du Nord", about: "Le Moyen-Orient et l'Afrique du Nord : l'étoile à huit branches du zellige et du girih, les arcs de la cour, la lumière des lampes." },
    monsoon: { region: "Asie du Sud", about: "Les fêtes d'Asie du Sud : le rangoli dessiné devant la porte, le toran de soucis au-dessus, les anneaux du mandala." },
    pacific: { region: "Océanie", about: "L'Océanie : les triangles du tapa et du siapo, étoffes d'écorce ; la volute de la vague qui déferle ; la crosse de fougère qui se déroule." },
    studio: { region: "Partout ailleurs", about: "Le studio lui-même : les lattes d'un diffuseur acoustique, les graduations d'un VU-mètre, son aiguille." },
  },
  it: {
    club: { region: "Europa", about: "Flyer di capannoni e rave: la griglia di LED, i ventagli di laser e il cono della torre di casse." },
    tropical: { region: "America Latina e Caraibi", about: "I Caraibi e l'America Latina: i trafori in legno delle case, il papel picado sopra la strada, il sole dei petroglifi taíno." },
    urban: { region: "Nord America", about: "Flyer di block party e copertine di dischi: retini a punti, le barre dell'equalizzatore, un disco sul piatto." },
    afro: { region: "Africa", about: "Tessuti e segni dell'Africa occidentale: i segni del bògòlanfini, i blocchi del kente e Nkyinkyim, lo zigzag adinkra di un cammino che piega e prosegue." },
    neon: { region: "Asia orientale e sud-orientale", about: "Le notti dell'Asia orientale e sud-orientale: le onde seigaiha su stoffe e piastrelle, i tubi al neon sopra le sale karaoke, la luce rotonda della lanterna." },
    oasis: { region: "Medio Oriente e Nord Africa", about: "Il Medio Oriente e il Nord Africa: la stella a otto punte dello zellige e del girih, gli archi del cortile, la luce delle lampade." },
    monsoon: { region: "Asia meridionale", about: "Le feste dell'Asia meridionale: il rangoli disegnato sulla porta, il toran di calendule sopra, gli anelli del mandala." },
    pacific: { region: "Oceania", about: "Oceania: i triangoli della tapa e del siapo, tessuti di corteccia; il ricciolo dell'onda che si rompe; la fronda di felce che si srotola." },
    studio: { region: "Ovunque altrove", about: "Lo studio stesso: le doghe di un diffusore acustico, le tacche di un VU meter, il suo ago." },
  },
  ja: {
    club: { region: "ヨーロッパ", about: "倉庫パーティーとレイブのフライヤー：LED のグリッド、レーザーの扇、スピーカースタックのコーン。" },
    tropical: { region: "ラテンアメリカとカリブ", about: "カリブとラテンアメリカ：木造家屋のジンジャーブレッド装飾、通りに渡したパペル・ピカド、タイノの岩絵の太陽。" },
    urban: { region: "北米", about: "ブロックパーティーのフライヤーとレコードジャケット：網点、イコライザーのバー、ターンテーブルの上のレコード。" },
    afro: { region: "アフリカ", about: "西アフリカの布としるし：ボゴランフィニ（泥染め）の模様、ケンテのブロック、そして曲がりながら続く旅を表すアディンクラのジグザグ、ンキンキム。" },
    neon: { region: "東アジアと東南アジア", about: "東アジアと東南アジアの夜：布や瓦の青海波、カラオケルームの上のネオン管、提灯の丸い灯り。" },
    oasis: { region: "中東と北アフリカ", about: "中東と北アフリカ：ゼリージュやギリのタイルの八芒星、中庭のアーチ、ランプの灯り。" },
    monsoon: { region: "南アジア", about: "南アジアの祝祭：戸口に描かれるランゴーリー、その上のマリーゴールドのトーラン、マンダラの輪。" },
    pacific: { region: "オセアニア", about: "オセアニア：樹皮布タパとシアポの三角形、砕ける波の巻き、ほどけていくシダの若葉。" },
    studio: { region: "その他の地域", about: "スタジオそのもの：音響ディフューザーの板、VU メーターの目盛り、その針。" },
  },
};

/** Where a skin is the first look, in `lang`. */
export const regionOf = (id: SkinId, lang: Lang): string => (lang === "en" ? SKIN_BY_ID[id].region : LOOK_WORDS[lang][id].region);

/** What a skin's ornaments refer to, in `lang`. */
export const aboutOf = (id: SkinId, lang: Lang): string => (lang === "en" ? LOOKS[id].about : LOOK_WORDS[lang][id].about);

/** A country's name in `lang`, from its two-letter code; the code itself where the browser has no name for it. */
export function countryName(code: string, lang: Lang): string {
  try {
    return new Intl.DisplayNames([LANG_INFO[lang].tag], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
