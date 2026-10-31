/**
 * Swahili words for the features (shared/facts.ts): fetched only when Swahili is
 * chosen. The booth's English words where Swahili DJs use them; djmanzo's own
 * interface labels stay as the application shows them.
 */

import type { FactWords } from "../factwords";

const w: FactWords = {
  status: "djmanzo iko kwenye beta: programu kamili ya DJ kwa Windows, macOS na Linux, imejaribiwa kwenye hazina yake yenyewe — kwa vifaa vya kuigiza pale vifaa halisi havikuwepo — na bado haijapita kwenye shoo ya kweli.",
  soon: { almost: "Karibu tayari", progress: "Inaendelea", planned: "Imepangwa" },
  areas: {
    mixing: { name: "Kuchanganya", about: "Deck, mixer, cue, loop, athari na stem." },
    library: { name: "Maktaba", about: "Rekodi zako, zimesomwa, zimepangwa na zinapatikana." },
    hands: { name: "Vitufe, vidhibiti na skrini", about: "Kibodi, vitufe vinavyokumbukika, vidhibiti, vinyl na skrini unazofanyia kazi." },
    karaoke: { name: "Karaoke", about: "Kila kitu ambacho mwendeshaji wa karaoke anahitaji, kuanzia foleni hadi wimbo uliotungwa kwa ajili ya mgeni." },
    assist: { name: "Msaidizi na autopilot", about: "Mapendekezo yanayosema kwa nini, mchanganyiko unaojiendesha wenyewe, na kuchukua usukani wakati wowote." },
    learn: { name: "Kujifunza", about: "Mwalimu, kozi na maarifa." },
    show: { name: "Shoo", about: "Video, picha, taa, kurusha moja kwa moja, ukumbi na usiku wenyewe." },
    look: { name: "Mwonekano na vifurushi", about: "Mandhari, ngozi, studio ya mwonekano na soko." },
    editions: { name: "Matoleo, mifumo na hali", about: "Nini kinaendesha wapi, kinagharimu kiasi gani, na nini bado hakijathibitishwa." },
  },
  facts: {
    decks: {
      name: "Deck mbili na mixer",
      about: "Play, cue, sync, keylock, pitch fader ambayo kiwango chake hubadilika kutoka ±6 hadi ±100 %, fader za chaneli na crossfader yenye mpangilio wa A / thru / B na mkunjo laini, wa mstari au mkali, EQ ya bendi tatu yenye kill, filta, gain kutoka uchambuzi wa sauti, cue ya headphone, sauti ya kibanda na limiter.",
      scene: "Ijumaa, saa tano usiku, ufunguzi: rekodi mbili, fader moja na masikio yako. Kila kitu kingine kwenye ukurasa huu kimejengwa juu ya deck hizi mbili.",
    },
    transport: {
      name: "Slip, kurudi nyuma, breki, backspin na deck iliyonakiliwa",
      about: "Miondoko ya utendaji kwenye deck yenyewe, pamoja na quantize na beat jump; na nakala ya papo hapo: rekodi ileile kwenye deck nyingine mahali palepale, kasi, ufunguo na gridi ileile — sampuli zilezile, si kupakia upya.",
    },
    pads: {
      name: "Cue, loop na pedi",
      about: "Hot cue nane zenye majina na rangi (zilizoletwa kutoka Serato na rekordbox, au zinazowekwa kwa Shift+bofya kulia), loop kwa idadi ya mapigo, loop roll hadi 1/16, slicer, na kurasa za pedi kwa cue, loop, roll, loop zilizohifadhiwa, sampler na athari.",
      scene: "Sauti unayohitaji inaanza baada ya mizani 32. Hot cue yenye jina na rangi inakufikisha pale kwa kubonyeza mara moja, na ukumbi haugundui.",
    },
    fx: {
      name: "Rafu ya athari",
      about: "Echo, delay, reverb, gate, crush, flanger, phaser na filta — zimesawazishwa na mdundo, nafasi tatu kwa kila deck na kwenye master, pamoja na mipangilio ya minyororo.",
      scene: "Drop imechelewa; echo out kwenye mdundo wa mwisho wa sentensi inakupa zile mizani nne unazohitaji.",
    },
    sampler: { name: "Sampler", about: "Benki za pedi — one-shot, loop, hold, stutter — zimesawazishwa na tempo ya master, na kurekodiwa kutoka kwenye deck." },
    record: { name: "Kurekodi master", about: "Seti nzima kwenye diski, kama WAV." },
    library: {
      name: "Maktaba",
      about: "Folda, orodha za nyimbo, makreti na folda janja; kuleta kutoka rekordbox, Traktor na iTunes pamoja na cue na gridi zake, na kutoka Serato pamoja na makreti, hot cue na loop zake; nakala zinazojirudia hupatikana; utafutaji wa papo hapo; mkusanyiko kama kadi zenye picha zake.",
      scene: "Unahama kutoka rekordbox Jumanne; kufikia Jumamosi cue, gridi na makreti yako yako pale mikono yako inapoyatarajia.",
    },
    camelot: {
      name: "Ufunguo na tempo, vimesomwa",
      about: "BPM, ufunguo kwenye gurudumu la Camelot pamoja na funguo zinazolingana, ukubwa wa sauti, na familia 31 za mitindo kote Amerika ya Kusini, Amerika ya Kaskazini, Ulaya, Afrika na kwingineko.",
      scene: "8A kwenda 9A: gurudumu linasema zitaendana, kabla ukumbi haujagundua wenyewe.",
    },
    waveforms: {
      name: "Waveform zilizochorwa kwa Rust",
      about: "Waveform zinazosogea na za muhtasari zenye gridi ya mapigo inayoweza kuhaririwa, tabaka za cue na loop na rangi kwa bendi, zinachorwa kwa Rust ili ziwe za haraka kwenye Linux pia.",
    },
    phrases: {
      name: "Sentensi za muziki, intro na outro",
      about: "Urefu wa sentensi na nanga yake hupatikana kwenye rekodi na kuwekwa alama kwenye waveform, pamoja na loop na kurukaruka vilivyofungwa kwenye sentensi; build, drop, breakdown na mahali sauti ya mwimbaji inapoingia; na mahali muziki unapoanzia na kuishia, ili automix itoke pale muziki wa rekodi unapoishia.",
      caveat: "Imethibitishwa kwa nyimbo za kutengenezwa, bado haijapimwa kwenye mkusanyiko wa rekodi halisi. Makofi ya rekodi ya moja kwa moja husomwa kama muziki.",
      scene: "Changanya kwenye sentensi, si kwa kubahatisha: mizani 16 inayofuata imewekwa alama kabla haijafika.",
    },
    find: {
      name: "Ipate kutoka kwenye kumbukumbu",
      about: "Mstari unaokumbukwa nusu, maelezo, au kuvuma.",
      caveat: "Kuvuma bado hakujajaribiwa kwa kipaza sauti halisi, na hupata rekodi zilizo tayari kwenye mkusanyiko pekee; maelezo pekee ndiyo yanaweza kutaja rekodi usiyonayo.",
      scene: "«Ile inayoenda da-da-daa... yenye tarumbeta»: ivume, na rekodi inajitokeza.",
    },
    keyboard: {
      name: "Kibodi ni kidhibiti",
      about: "Msamiati uleule na muundo uleule wa faili kama ramani ya MIDI, kwa hiyo kompyuta mpakato isiyochomekwa kitu chochote ni ala inayopigika.",
      scene: "Kidhibiti kimebaki garini: vitufe vya kompyuta mpakato vinapiga seti nzima, kwa muundo uleule wa ramani ambao kidhibiti hutumia.",
    },
    mapped: {
      name: "Kidhibiti chenye ramani yake tayari",
      about: "Ramani zilizoandikwa kutoka jedwali la MIDI la kila mtengenezaji, pamoja na kitasa cha kuvinjari na vitufe vya kupakia: familia ya DDJ-400 na FLX4 ya Pioneer, DDJ-200, DDJ-SR na CDJ-3000 (katika hali ya HID), Denon MC4000, Hercules Inpulse 300, Numark DJ2GO, Reloop Mixon 4, sehemu ya deck ya Roland DJ-707M na Launchpad Mini MK3 kama gridi ya pedi, na ramani ya jumla ya deck mbili.",
      caveat: "Hakuna hata kimoja kilichochezwa kwenye kifaa chenyewe bado: kila kimoja kinafanya kazi dhidi ya vifaa vya kuigiza. Vidhibiti kadhaa havichapishi jedwali na vinasubiri hali ya kujifunza.",
    },
    themes: {
      name: "Mandhari na ngozi",
      about: "Paleti, zikiwemo mandhari nne za Karibea, zenye tabaka za sanaa juu yake; paneli zinasogezwa, zinakuzwa na kutolewa kwenye madirisha yao wenyewe.",
    },
    layouts: {
      name: "Mipangilio ya skrini",
      about: "Starter, Essentials, Pro, Performance, Scratch na Stem Performance, na mpangilio wa DJ mwenyewe kama faili isiyoweza kuendesha msimbo.",
    },
    requests: {
      name: "Maombi kutoka ukumbini",
      about: "Ukumbi unaomba nyimbo kupitia msimbo wa QR — hakuna programu ya kusakinisha — na DJ anasoma orodha kuanzia ile inayoombwa zaidi.",
    },
    share: {
      name: "Shiriki seti",
      about: "Orodha ya nyimbo za usiku wa leo inapelekwa WhatsApp, X, Bluesky au Threads ujumbe ukiwa tayari umeandikwa; DJ anabonyeza tuma.",
    },
    linux: {
      name: "Linux na macOS",
      about: "Kwenye Linux, sauti inapita kwenye kifaa chaguomsingi cha ALSA, ambacho PipeWire inakihudumia; Windows, macOS na Linux ndiyo mifumo inayotolewa kwayo.",
      caveat: "JACK bado haiwezi kuchaguliwa kama mwenyeji wa sauti, na CI inaendeshwa kwenye Ubuntu badala ya Xubuntu.",
    },
    decks6: { name: "Deck nne hadi sita", about: "Deck ya tatu na ya nne, na hadi sita." },
    stems: {
      name: "Stem moja kwa moja",
      about: "Sauti ya mwimbaji, ngoma, besi na mengine kila kimoja peke yake, vinatenganishwa mbele ya kichwa cha kucheza ndani ya akiba, kwa hiyo sauti haiongezi kuchelewa; EQ kwa kila stem, na sauti ya mwimbaji ya deck moja juu ya mchanganyiko wa deck nyingine.",
      scene: "Mgeni anataka acapella ya rekodi uliyonayo nzima tu. Zima kila kitu isipokuwa sauti ya mwimbaji, moja kwa moja, bila mlio wa kubofya.",
    },
    automix: {
      name: "Automix na autopilot",
      about: "Programu inaendesha mchanganyiko kutoka seti iliyopangwa, kwa mikao sita, na inaachia pale mkono unapogusa kidhibiti.",
      caveat: "Haijawahi kuthibitishwa kwa sauti halisi: mashine ya kutengenezea haina kifaa cha kutoa sauti.",
      scene: "Saa ya chakula cha jioni cha harusi: autopilot inapiga mtiririko uliouweka wakati unazungumza na maharusi, na inakurudishia deck pale unapogusa moja.",
    },
    "autopilot-surface": {
      name: "Paneli ya Auto-Pilot",
      about: "Tengeneza usiku kwa umbo lake, urefu, kiwango cha tempo, enzi na mitindo unayoipenda au unayoiacha; ujaze kutoka kwenye mkusanyiko wako, uanzishe, chukua usukani, urudishe, uhifadhi kama orodha ya nyimbo.",
      caveat: "Hujaza kutoka kwenye mkusanyiko wako pekee. Kujaza kutoka vyanzo vya mtandaoni, na kuchora nguvu ya usiku kwa mkono badala ya kuchagua mojawapo ya maumbo manne, bado vinakuja.",
    },
    suggest: {
      name: "Nini kipigwe baadaye, na kwa nini",
      about: "Mapendekezo ya wimbo unaofuata yaliyopangwa kwa ufunguo, tempo, ukubwa wa sauti na sentensi, kila moja na sababu zake; na mpangaji wa mpito anayependekeza wapi na vipi.",
      caveat: "Nguvu inakadiriwa kwa ukubwa wa sauti. Mpangaji hawezi kujua outro iko wapi: mpaka wa sentensi karibu na mwisho ni makisio.",
      scene: "Dakika mbili zimebaki kwenye rekodi hii na hakuna kilichopakiwa: orodha inasema zipi tatu zitatua vizuri, na kwa nini kila moja.",
    },
    asks: {
      name: "Huuliza kabla ya kutenda",
      about: "Msaidizi huandaa mpito mzima kama kitu kimoja cha kukubali, kubadilisha au kukataa, na huzungumza kwa vitendo ambavyo DJ angeweza kubonyeza mwenyewe tu.",
    },
    packs: { name: "Vifurushi vya maarifa na miongozo", about: "Umbo la mtindo au la usiku kwa ajili ya msaidizi, na miongozo kwa kila mada." },
    teacher: {
      name: "Mwalimu",
      about: "Maabara ya mazoezi na deck ya mazoezi inayosikika kwenye headphone tu, kocha anayetaja kile mikono imefanya hivi punde, mbinu ishirini na nane na chemsha bongo.",
      scene: "Jumapili mchana, headphone masikioni: kocha anakuambia ile ilikuwa bass swap, mapigo mawili mapema.",
    },
    curriculum: {
      name: "Kozi ya Apprentice",
      about: "Hatua kumi kwa mpangilio, kutoka deck na beatmatching hadi shoo ya kwanza na safari inayofuata: masomo ishirini na tatu, somo la mtindo likiandikwa kutoka kifurushi chako cha maarifa. Kocha hukagua kila mwondoko kutoka kile ulichopiga hivi punde; beatmatching kwa sikio hukaguliwa kutoka tempo zote mbili, na SYNC haihesabiwi. Maendeleo yako yanahifadhiwa.",
      caveat: "Masomo ishirini na tatu kufikia sasa; mengine yanakuja, na mmiliki bado anapaswa kupitia kile kila somo linasema.",
      scene: "Kuanzia beatmatch ya kwanza hadi shoo ya kwanza, kwa mpangilio, kocha akikagua kile ulichofanya kweli.",
    },
    karaoke: {
      name: "Usiku wa karaoke",
      about: "Skrini ya waimbaji yenye maneno kwa wakati, foleni na ukurasa wa kujiandikisha, sauti ya mwimbaji kuondolewa, kipaza sauti na athari kwa kila mwimbaji, duet, sauti elekezi, muziki wa mapumziko, uimbaji wenye alama, chemsha bongo, na kupata wimbo ambao mwimbaji hawezi kuutaja.",
      caveat: "Bado vinakuja: sehemu za duet na simu kama vipaza sauti.",
      waits: "Sehemu za duet zinasubiri modeli ya kutenganisha ambayo leseni yake djmanzo inaweza kutumia; simu kama vipaza sauti zinasubiri muunganisho salama wa ndani.",
      scene: "Karaoke ya baa saa nne usiku: msimbo wa QR mezani, foleni kwenye skrini, maneno kwa wakati, na sauti ya mwimbaji imetoweka kwenye rekodi.",
    },
    oldmac: {
      name: "djmanzo kwenye Mac za zamani",
      about: "Programu nzima, ikifunguka kwenye karaoke, kwa Mac za Intel hadi macOS 10.13.",
      caveat: "Hakuna aliyeiendesha bado kwenye Mac ya 2011. Kupanga maneno kwa wakati kwa kusikiliza na amri za sauti vinahitaji macOS 10.15 au mpya zaidi.",
    },
    room: {
      name: "Kusoma ukumbi",
      about: "Kamera na kipaza sauti vinasema kama sakafu ya kucheza imetulia zaidi au ina shughuli zaidi kuliko mapema usiku huu; maoni ya umati kutoka simu zao; kile kila mchanganyiko ulifanya — kila kimoja kikisemwa pamoja na uhakika wake.",
      caveat: "Upimaji haujawahi kuendeshwa kwa kamera halisi. Hakuna picha inayorekodiwa, kuhifadhiwa au kutumwa.",
      scene: "Inafanya kazi? Sakafu ina shughuli zaidi kuliko dakika ishirini zilizopita, na skrini inasema hivyo pamoja na uhakika wake.",
    },
    mapping: {
      name: "Ramani kwa kidhibiti chochote",
      about: "Bonyeza kidhibiti, chagua kinachofanya, hifadhi; vifaa vya HID, taa, Lua kwa kile ambacho jedwali haliwezi kusema, na kiolesura kinachosoma kilichochomekwa.",
      caveat: "Hakijajaribiwa kwenye vifaa: kinafanya kazi dhidi ya vifaa vya kuigiza na bado hakijakutana na kifaa chenyewe.",
      scene: "Kidhibiti ambacho hakuna aliyekiandikia ramani: bonyeza kitasa, chagua kinachofanya, kiweke.",
    },
    platters: {
      name: "Sahani zenye mota",
      about: "Mahali kamili pa sahani, mota ikiendeshwa na uchezaji.",
      caveat: "Hakijajaribiwa kwenye vifaa: kinafanya kazi dhidi ya vifaa vya kuigiza na bado hakijakutana na kifaa chenyewe.",
    },
    dvs: {
      name: "Vinyl ya timecode",
      about: "Turntable halisi zinaendesha deck, kwa kulinganisha au kamili; djmanzo inaandika ishara yake ya udhibiti, kwa hiyo hakuna haja ya rekodi yenye leseni.",
      caveat: "Bado haijaendeshwa na rekodi iliyobonyezwa.",
      scene: "Turntable zako, mikono yako, rekodi yoyote kwenye deck: djmanzo inaandika timecode yake yenyewe.",
    },
    visuals: {
      name: "Video na picha",
      about: "Video kwenye deck, picha yake ikififia pamoja na sauti, mwonekano wa WebGL wenye tabaka na mipangilio ya MilkDrop — ya DJ mwenyewe pia — kwa projekta au skrini ya pili.",
      caveat: "Kwenye Linux, video ya H.264 inacheza tu ikiwa gstreamer1.0-libav ya distro imesakinishwa; video imeendeshwa kwenye Linux pekee kufikia sasa.",
      scene: "Projekta nyuma ya kibanda inaonyesha video ya muziki sambamba na mchanganyiko, au mwonekano unaopumua pamoja na besi.",
    },
    live: {
      name: "Kurusha moja kwa moja",
      about: "Kinachocheza sasa kwenye mtiririko: tabaka la OBS na faili ya maandishi, kwa Twitch, YouTube, Instagram, TikTok au Kick.",
      scene: "Seti inarushwa: OBS inaonyesha wimbo unapobadilika, bila mtu yeyote kuandika.",
    },
    outputs: {
      name: "Stem kutoka nje",
      about: "Stem za deck moja kama jozi nne za stereo — sauti ya mwimbaji, ngoma, besi, mengine — kwa uchakataji wa nje.",
      caveat: "Hakijajaribiwa kwenye vifaa: kinafanya kazi dhidi ya vifaa vya kuigiza na bado hakijakutana na kifaa chenyewe.",
    },
    deckouts: {
      name: "Deck kutoka nje",
      about: "Kila deck kwenye jozi yake ya stereo, kabla ya fader yake, kwa mixer ya nje.",
      caveat: "Hakijajaribiwa kwenye vifaa: kinafanya kazi dhidi ya vifaa vya kuigiza na bado hakijakutana na kifaa chenyewe.",
    },
    clap: { name: "Programu-jalizi za CLAP", about: "Programu-jalizi za sauti zinazokaa kwenye master, kwa vidhibiti vya jumla na bila dirisha la programu-jalizi." },
    sources: {
      name: "Vyanzo vya mtandaoni",
      about: "Tafuta Spotify, YouTube, Jamendo na Internet Archive, na linganisha tokeo na faili uliyonayo tayari. Kwa kutafuta na kupanga: kuchanganya sauti ya Spotify au YouTube Music hakuruhusiwi nao.",
    },
    events: {
      name: "Matukio na press kit",
      about: "Mwaliko wa shoo unaofuatiliwa hatua kwa hatua, mpango wa usiku, na press kit.",
      scene: "Mwaliko wa Machi: mpango, karatasi ya taarifa kwa ukumbi, press kit, vyote pale ulipoviacha.",
    },
    replay: {
      name: "Kurudia",
      about: "Seti ni data: inasikilizwa tena, mchanganyiko mmoja unachorwa upya kutoka paneli ya Mixes, mpito mmoja unarudiwa kwa mazoezi, majaribio mawili yanalinganishwa.",
      caveat: "Kuchora upya seti nzima nje ya mtandao ni amri ambayo bado haina kitufe. Vipokezi vya moja kwa moja — kipaza sauti, aux, timecode — haviwezi kuzalishwa upya, na hilo linasemwa wazi.",
      waits: "Kitufe cha kuchora upya seti nzima nje ya mtandao.",
    },
    api: {
      name: "Uso ulio wazi",
      about: "API ya udhibiti kupitia OSC na JSON ya mstari kwa mstari juu ya TCP, kwa vitendo vilevile ambavyo kiolesura hutumia; MIDI clock kuingia na kutoka; na kusawazisha tempo kati ya mashine za djmanzo (si Ableton Link).",
    },
    editions: {
      name: "Matoleo saba, kipakuliwa kimoja",
      about: "Auto-Pilot, Hobbyist, Apprentice, Karaoke, Pro DJ, Full na Custom, yote ni programu moja, yanafunguliwa kwa kuingia. Kila toleo huonyesha kile linachobeba tu; kinachokosekana ni kadi tulivu inayotaja toleo lenye nacho.",
      caveat: "Kuingia kutoka djmanzo kunafika duka hili mara toleo litakapojengwa kulitaja, na hiyo ni hatua ya mmiliki. Hadi hapo djmanzo haikatai chochote; baada ya hapo djmanzo isiyo na leseni ni toleo la bure la Hobbyist.",
      waits: "Imejengwa ndani ya djmanzo na iko hai hapa kwa hali ya maonyesho; kununua kunafunguka mara malipo na kuingia halisi vitakapowashwa.",
    },
    trial: {
      name: "Siku saba za toleo lolote",
      about: "Jaribio la bure la toleo lolote, ikiwemo Full, mara moja kwa kila akaunti. Likiisha bila kununua, djmanzo inakuwa toleo la Hobbyist, bure, milele: kile jaribio liliongeza kinaonekana kama kadi tulivu, na hakuna ulichotengeneza kinachopotea.",
      caveat: "Huanzia hapa, au ndani ya djmanzo kutoka Settings → Licence mara toleo litakapolitaja duka hili; siku zilizobaki zinaonekana kwenye ukanda wa hali wa djmanzo.",
      waits: "Jaribio linaanza mara kuingia halisi kutakapowashwa.",
    },
    marketplace: {
      name: "Soko",
      about: "Vifurushi vya bure vilivyotengenezwa na DJ, vimesainiwa na watengenezaji wake: mandhari, ngozi, picha, mbinu za DJ ambazo autopilot huzitumia, seti za vitufe, ramani za vidhibiti, vifurushi vya maarifa na masomo yanayojiunga na kozi katika hatua zake. Paneli ya Marketplace ya djmanzo inavipitia kwa aina na mtindo, kwa picha na leseni kwenye kila kadi, na inasakinisha au kuondoa kimoja kwa kubonyeza mara moja; tovuti hii inaviorodhesha pia, na seti saba za vitufe kutoka kwa timu kwa kuanzia.",
      caveat: "Skrini za karaoke na programu-jalizi kama vifurushi bado vinakuja. Tovuti hii inaorodhesha mandhari, ngozi, picha na seti za vitufe kufikia sasa; aina nyingine husakinishwa ndani ya djmanzo kutoka faili au faharasa.",
      waits: "Aina nane zinapatikana; zinazofuata ni skrini za karaoke, programu-jalizi za sauti na foleni ya ukaguzi.",
    },
    setplan: { name: "Mpango wa seti", about: "Usiku uliopangwa kama mtiririko, unaoelekezwa bila kujengwa upya." },
    "hobbyist-free": {
      name: "Toleo la Hobbyist, bure milele",
      about: "Deck mbili, mixer, maktaba, cue, loop na pedi, athari, sampler, kurekodi, kibodi na kidhibiti kimoja, bila kununua. Ndipo jaribio linapoishia: kile jaribio liliongeza kinaonekana kama kadi tulivu, na hakuna ulichotengeneza kinachopotea.",
      caveat: "Mara duka litakapofunguka ndani ya djmanzo; hadi hapo djmanzo haikatai chochote.",
      waits: "Ni bure kupakua leo; kuingia ndani yake kunafunguka pamoja na duka.",
    },
    "quiet-cards": {
      name: "Mtazamo wa kilichopo zaidi",
      about: "Katika kila toleo isipokuwa Full, paneli ambayo toleo halibebi huchorwa kama kadi tulivu: kile inachofanya na toleo la bei nafuu zaidi lenye nayo. Kamwe si kitufe kilichovunjika, kamwe si dirisha ibukizi, kamwe si wakati unachanganya.",
      caveat: "Vidhibiti vilivyo ndani ya paneli, kama kitufe cha stem kwenye deck ya Hobbyist, vinaachwa nje badala ya kuonyeshwa kama kadi.",
    },
    "look-studio": {
      name: "Studio ya mwonekano",
      about: "Unganisha mandhari na ngozi zake kwa kubofya kutoka mianzo minane, paleti kumi na sita au rangi zozote tatu, mitindo minane na michoro kumi na miwili, ikivaliwa kwenye dirisha zima unapoitengeneza; au mwombe AI yoyote aitengeneze kutoka kiolezo unachonakili. Kila mandhari inabaki ikisomeka kwa utofautisho wa WCAG. Ihifadhi kama kifurushi kilichosainiwa kwa ufunguo wako, au ishiriki kama .djpack.",
      caveat: "Kuitengeneza kwa mtoa huduma wako wa AI ndani ya djmanzo kunahitaji msaidizi; kunakili kiolezo kwa AI yoyote kunafanya kazi katika kila toleo. Picha za projekta na karaoke bado si sehemu ya muundo.",
    },
    "theme-packs": {
      name: "Mandhari na ngozi kama vifurushi",
      about: "Mandhari (rangi kumi na nne kwa chumba chenye giza na chenye mwanga, kila jozi unayosoma ikishikiliwa kwa utofautisho wake) au ngozi (vigae vya SVG vinavyoweza kuchora tu, vilivyotulia, vinavyoelea au vinavyopumua pamoja na besi) husakinishwa kama .djpack iliyosainiwa kutoka Settings, katika kila toleo, na huvaliwa kama za djmanzo yenyewe.",
    },
    hardware: {
      name: "Vifaa zaidi",
      about: "Ramani kwa vidhibiti zaidi ambavyo watu wanavyo — DDJ kubwa za Pioneer, Hercules Inpulse 500, Traktor Kontrol S2 na S4, Denon na Rane, Reloop zaidi — kila kimoja kutoka jedwali la mtengenezaji wake au kifaa mkononi, na simu kama rimoti.",
      waits: "Jedwali la MIDI lililochapishwa na kila mtengenezaji, au kifaa mkononi.",
    },
    club: {
      name: "Vicheza vya klabu na taa zaidi",
      about: "Pro DJ Link, StagelinQ, Ableton Link, viunganishi vya USB DMX, taa zinazozunguka na zaidi ya universe moja, MIDI 2.0.",
      caveat: "Hakuna kati ya hivi kilichothibitishwa hadi kikutane na kifaa halisi.",
      waits: "Kicheza halisi cha kujaribia, na leseni ambayo djmanzo inaweza kutumia kwa Ableton Link.",
    },
    windows: {
      name: "Windows",
      about: "Hujengwa, hujaribiwa kwenye CI na hufungashwa kila toleo, na mmiliki wa djmanzo ameiendesha kwenye mashine ya Windows.",
      caveat: "Iko kwenye beta, kama kila kitu hapa: imejaribiwa na mtu mmoja kwenye Windows kufikia sasa.",
    },
    gig: {
      name: "Shoo ya kweli",
      about: "Kila kitu hapa kimejaribiwa kwenye hazina; hakuna kilichofanyika mbele ya umati bado.",
      waits: "Usiku mmoja wenye umati, na kile utakachogundua kikiandikwa.",
    },
    leader: {
      name: "Vitufe vinavyokumbukika chini ya Space",
      about: "Bonyeza Space na mwongozo unaonyesha kila kitufe: mfuatano unaosomeka kama maneno — Space d 1 p ni deck 1 play, Space o i inafungua waimbaji. Weka vitufe vyako juu ya vya djmanzo, na uvae seti ya vitufe iliyotengenezwa kwa kusudi fulani juu yake.",
      scene: "Space, d, 1, p: deck ya kwanza inacheza. Isome kama maneno na utaikumbuka.",
    },
    keysets: {
      name: "Seti za vitufe",
      about: "Mipangilio inayokumbukika kwa njia fulani ya kufanya kazi: tisa zinakuja na djmanzo — moja kwa njia ya kazi ya kila toleo (Essentials, Learning, Karaoke host, Performance, Autopilot, Dashboards) pamoja na Scratch, Open format na One hand — na zaidi zinakuja kama vifurushi sokoni. Seti huongeza vitufe kwenye herufi ambazo djmanzo inaziacha wazi, chini ya vitufe vyako, kwa hiyo kuivaa hakuchukui kitufe chochote; vitufe vyako vinaweza kuhifadhiwa kama seti, au kuchapishwa kwa jina lako na viungo vya kukuunga mkono kwa kubonyeza mara moja.",
      caveat: "Seti moja huvaliwa kwa wakati mmoja.",
    },
    launcher: {
      name: "Kizinduzi na mbao",
      about: "Bonyeza 0 kwa kizinduzi: skrini nzima zinazochukua nafasi ya deck — ubao wa Karaoke unaweka waimbaji na muziki wako bega kwa bega na deck kwa ufupi, Karaoke prep ni kwa saa moja kabla — na mbao zako mwenyewe, zilizopangwa kwa mkono.",
    },
    palette: {
      name: "Utafutaji mmoja kwa kila kitu",
      about: "Paleti ya amri (Ctrl au Cmd + K) inapata rekodi, paneli, mpangilio, mandhari au kitendo chochote, hata ukikosea kuandika; kila paneli inatoka kwenye dirisha lake na inabaki hai.",
    },
    deckqueue: {
      name: "Orodha ya nyimbo chini ya kila deck",
      about: "Kila deck ina droo yake ya orodha ya nyimbo: kubonyeza mara moja kunapakia rekodi, ▶ inapakia na kuicheza, na kwa Next when this ends na Repeat inaendelea yenyewe, kwa mzunguko, kwa mpangilio wa nasibu ukipenda — deck ya kujaza yenye jingle na loop wakati deck nyingine inafanya kazi.",
      scene: "Kati ya waimbaji wa karaoke deck nyingine inaweka ukumbi hai peke yake, jingle na loop kwa mzunguko.",
    },
    "current-deck": {
      name: "Deck ya sasa, miundo miwili, na deck inayoelea",
      about: "Deck moja daima ni ya sasa na ina mstari kuizunguka; vitufe vinaifanyia kazi, na Tab, kubonyeza au kugusa kidhibiti kunaihamisha. Kila deck huja kamili au fupi — fupi inabaki na waveform, uchezaji, sauti na filta na inafungua EQ, pedi, loop na athari papo hapo — na deck yoyote inaweza kuelea, kwa ukubwa kamili, juu ya nyingine. Deck sita zinatoshea kwenye kompyuta mpakato.",
      scene: "Deck nne kwenye kompyuta mpakato ya inchi 13 kwenye baa ya juu ya paa: deck fupi, kila fader kwenye skrini, na ile unayokaribia kugusa ikiwa na mstari.",
    },
    "context-rail": {
      name: "Reli ya muktadha",
      about: "Kilichowashwa kwenye kila deck — loop, athari, filta, stem iliyonyamazishwa — kimeorodheshwa kando yake, kila kimoja kubonyeza mara moja kutoka hali ya kawaida.",
      scene: "Katikati ya mchanganyiko mrefu na kitu bado kimewashwa: reli inaonyesha echo kwenye deck 2, na kubonyeza mara moja kunaizima.",
    },
    "booth-moves": {
      name: "Kunakili deck, kiwango cha pitch, mkunjo wa crossfader, intro na outro",
      about: "Nakala ya papo hapo ya rekodi inayocheza kwenye deck nyingine; kiwango cha pitch kutoka ±6 hadi ±100 %; crossfader laini, ya mstari au kali; hot cue zenye majina na rangi; na mahali muziki wa kila rekodi unapoanzia na kuishia, unaopatikana na uchambuzi.",
      scene: "Beat juggle inahitaji rekodi ileile mara mbili: inakili, na nakala zote mbili ziko kwenye mdundo.",
    },
    "licence-updates": {
      name: "Leseni, vocha na masasisho",
      about: "Ingia kutoka Settings → Licence, au bandika mstari wa leseni; vocha inatoa punguzo au toleo zima, hukaguliwa bila muunganisho; djmanzo hutafuta toleo jipya mara moja kwa siku na kulisakinisha inapofungwa, kamwe si katikati ya seti.",
      scene: "Kujiandaa ukumbini bila Wi-Fi: leseni na vocha zinakaguliwa nje ya mtandao, na hakuna kinachosasishwa hadi ufunge djmanzo.",
    },
    lineage: {
      name: "Muziki ulikotoka, na shajara",
      about: "Historia za mitindo sitini na saba — kila mmoja ulianzia wapi na lini, nini kiliingia ndani yake na nini kilitoka ndani yake, nini cha kusikiliza na rekodi ambazo kila mtu ndani yake anazijua — kila mtindo unaoutaja ukiwa kubonyeza mara moja; sekunde thelathini za rekodi ya kihistoria; Wikipedia kwa lugha yako; na shajara inayohifadhi ulichojifunza usiku ule ulipojifunza.",
      scene: "Kutembea kutoka reggae hadi dancehall hadi reggaeton kati ya seti, na kuhifadhi hadithi kwa mara ijayo mtu atakapouliza.",
    },
    "in-app-feedback": {
      name: "Maoni kutoka ndani ya djmanzo, yanasomwa na AI",
      about: "Matatizo, matakwa na maswali yanayotumwa kutoka gurudumu la mipangilio, yanasomwa na kuwekwa kwa Kiingereza na AI, yanahifadhiwa kwenye tovuti hii kwa ajili ya mmiliki, na kuwasilishwa GitHub.",
      waits: "Inajengwa: leo 💬 inafungua fomu ya issue ya GitHub ili uiwasilishe mwenyewe.",
    },
    "site-downloads": {
      name: "Toleo jipya zaidi, moja kwa moja kutoka tovuti hii",
      about: "Kipakuliwa kimoja kwa kila toleo, kisakinishi cha toleo jipya zaidi kwa mfumo wako, kutoka skrini ya kupakua; leseni au jaribio hufungua yaliyobaki ndani ya djmanzo.",
      waits: "Skrini ya kupakua imejengwa; visakinishi vitaonekana juu yake mara faili za toleo zitakapounganishwa.",
    },
    safe: {
      name: "Kitufe cha SAFE",
      about: "Kubonyeza mara moja kwenye upau wa juu kunarudisha kila kidhibiti, kunafuta kila athari na kunasawazisha sauti.",
      scene: "Kitu kinasikika vibaya na huwezi kujua ni nini: bonyeza mara moja, na kila kitu kinarudi kawaida.",
    },
    feedback: {
      name: "Maoni, matakwa na matatizo",
      about: "💬 kando ya gurudumu la mipangilio huwasilisha tatizo, takwa au chochote kingine kama fomu ya issue ya GitHub ya mradi, ikiwa imejazwa; toleo, mfumo na aina ya leseni huongezwa tu kisanduku kikiwa kimetiwa alama, na huonyeshwa kwanza.",
    },
    lights: {
      name: "Taa zinazofuata muziki",
      about: "Taa za ukumbi kupitia Art-Net au sACN, zikifuata mdundo, sentensi na jinsi muziki unavyokwenda kwa nguvu: universe moja, mipangilio mitano ya chaneli, pulse, chase, wash na mwonekano wa otomatiki unaobadilika kwenye sentensi tu. Hakuna strobe.",
      caveat: "Bado haijajaribiwa kwenye taa halisi.",
      scene: "Klabu ndogo yenye kiunganishi cha DMX na taa nne za par: taa zinabadilika kwenye sentensi, bila fundi wa taa.",
    },
    knowhow: {
      name: "Maarifa",
      about: "Kichupo cha pili cha kozi: familia 110 za mitindo kutoka maeneo sita — kila moja inachanganyika na nini, tempo yake inayohisiwa, mdundo wake na miondoko ambayo DJ wake huitumia — mbinu 72 pamoja na nadharia ya kila moja, na nadharia ya muziki ambayo DJ na mwendeshaji wa karaoke hufanya kazi nayo, kila wazo likisema djmanzo inaionyesha wapi. Mitindo sitini na saba inasimulia historia yake — ilianzia wapi na lini, nini kiliingia na nini kilitoka, nini cha kusikiliza, rekodi ambazo kila mtu anazijua — kila mtindo unaoutaja ukiwa kubonyeza mara moja; na chochote unachojifunza kinahifadhiwa kwenye shajara, katika usiku wake, pamoja na daftari linalokusanya vyote.",
      scene: "Ombi la merengue típico na kwa kawaida unapiga house: inachanganyika na nini na DJ wake hutumia nini, kabla rekodi haijaisha.",
    },
    "k-rotation": {
      name: "Waimbaji na zamu",
      about: "Andika jina la mwimbaji na anza kuandika wimbo wake; kadi ya juu ni ya anayefuata: pakia wimbo wake kwenye deck yoyote kwa ufunguo aliouomba, mlete ndani kwenye sentensi inayofuata, mweke alama kuwa ameimba au hayupo. Buruta mstari kubadilisha mpangilio, au buruta rekodi kwenye paneli kuiomba.",
    },
    "k-voice": {
      name: "Sauti kama ilivyorekodiwa, kama elekezi, au imeondolewa",
      about: "Chini ya kila deck: As recorded, Guide — kidogo cha sauti asili kinaachwa kufuatwa — au Out. Wimbo mpya kwa mwimbaji hutolewa sauti elekezi ikiwa tayari imetiwa alama. Ufunguo unasogea nusu toni kwa wakati bila kubadilisha tempo.",
    },
    "k-screen": {
      name: "Skrini ya waimbaji",
      about: "Dirisha la pili kwa projekta au TV: maneno yanafutwa yanapoimbwa, mstari unaofuata, kuhesabu kuingia, nani anafuata — juu ya picha ya rekodi au mandharinyuma iliyotengenezwa.",
    },
    "k-words": {
      name: "Maneno yanapatikana, na kupangwa kwa wakati kwa kusikiliza",
      about: "Maneno ya nyimbo kutoka faili yenyewe, .lrc kando yake, au LRCLIB kwa mkusanyiko wote chinichini, yanahifadhiwa kwa ajili ya usiku. Maneno yasiyo na wakati hupangwa kwa wakati kwa kusikiliza rekodi, ndani ya djmanzo, pale mashine inapoweza kuendesha modeli za usemi.",
      caveat: "Kupanga kwa wakati kwa kusikiliza kunahitaji macOS 10.15 au mpya zaidi kwenye Mac; maneno yanayokuja tayari yamepangwa hufuata wimbo kwenye mashine yoyote.",
    },
    "k-visuals": {
      name: "Picha nyuma ya maneno",
      about: "Tabaka za djmanzo yenyewe kwenye mdundo, stem na vipaza sauti vya waimbaji, zikiwemo mipangilio ya MilkDrop na yako mwenyewe, na picha za msanii kutoka Wikimedia Commons, zikitajwa chanzo — zinachaguliwa kwenye paneli ya Singers.",
    },
    "k-mics": {
      name: "Kipaza sauti kwa kila mwimbaji",
      about: "Mnyororo kwa kila kipaza sauti wenye mipangilio iliyotengenezwa kwa karaoke — Singer, Stadium, Radio voice, Big echo, Duet — kifuatiliaji kwa kila mmoja kwenye kiunganishi chenye matoleo ya kutosha, na duet zenye jina na mistari ya kila mwimbaji kwa rangi yake.",
    },
    "k-phones": {
      name: "Waimbaji kutoka ukumbini",
      about: "Msimbo wa QR unamweka yeyote aliye kwenye Wi-Fi kwenye foleni na wimbo kutoka muziki wako — hakuna kinachocheza hadi ukipakie — na ukiiwasha, emoji zao zinaelea kwenye kona ya skrini ya waimbaji.",
    },
    "k-breaks": {
      name: "Muziki wa mapumziko unaoelekea mahali",
      about: "Muziki kutoka orodha ya nyimbo unayochagua wakati mwimbaji anayefuata anajiandaa, umechaguliwa kuelekea wimbo wake, ukififia unapoanzisha wimbo.",
    },
    "k-presets": {
      name: "Mipangilio ya usiku wa karaoke",
      about: "Vocals out, Guide vocal, Everyone sings, Down a tone, Down a fourth, Up a tone, Original key na Open microphones — limiter imewashwa na master imeshushwa kidogo, ili kipaza sauti kipate nafasi kabla ya kulia.",
    },
    "k-score": {
      name: "Uimbaji wenye alama, na mizunguko ya mashindano",
      about: "Rekodi yoyote kwenye mkusanyiko wako inaweza kupewa alama, mdundo wa wimbo ukisomwa kutoka sauti yake iliyotenganishwa; alama iko kwenye skrini ya waimbaji wanapoimba, na ubao wa viongozi baadaye, kwa kila mwimbaji kwenye duet na kwa timu kwenye mzunguko wa mashindano.",
      caveat: "Haijawahi kujaribiwa kwa kipaza sauti halisi kwenye ukumbi halisi.",
    },
    "k-quiz": {
      name: "Chemsha bongo kutoka rekodi zako",
      about: "Mizunguko inayotengenezwa kwa sheria kutoka mkusanyiko wako mwenyewe — itaje, kipande kilichopinduliwa au kuharakishwa, stem zikiingia moja moja, mstari uliokosekana — inajibiwa kutoka simu kwa vitufe vinne kila moja.",
    },
    "k-range": {
      name: "Wigo wa sauti ya mwimbaji, na ufunguo wa kuimbia",
      about: "Sekunde ishirini za mwimbaji akiteleza kutoka chini hadi juu, na djmanzo inapendekeza nyimbo zinazoendana na sauti yake, kila moja na badiliko la ufunguo inalohitaji.",
      caveat: "Haijawahi kujaribiwa kwa kipaza sauti halisi kwenye ukumbi halisi.",
    },
    "k-guests": {
      name: "Kitabu cha wageni, wimbo kwa mgeni, na WhatsApp",
      about: "Kila mwimbaji aliyeimba anaandikwa kwenye shajara ya usiku. Kwa ridhaa yake, akiulizwa swali moja kwa wakati: taarifa zake zinahifadhiwa, sekunde kumi na tano za sauti yake, na wimbo ulioandikwa kwa ajili yake na mtoa huduma wako wa AI — kumhusu, wimbo alioimba na usiku ule — ambao djmanzo inauweka kwenye fomu ya Suno, na kiungo kilichokamilika kinatumwa kwenye WhatsApp yake. Hakuna kinachoondoka kwenye mashine usipokituma.",
      caveat: "Suno haina API ya umma: djmanzo inajaza fomu yake na wewe unabonyeza Create; unabonyeza tuma kwenye WhatsApp. Kuandika maneno kunahitaji mtoa huduma wa AI aliyewekwa ndani ya djmanzo.",
    },
    "k-record": {
      name: "Wimbo wa mwimbaji, umerekodiwa kwa ajili yake",
      about: "Kwa ridhaa yake tofauti, wimbo wake kama ukumbi ulivyousikia — kipaza sauti chake na athari zake juu ya rekodi — ukihifadhiwa kama faili ya kumpa; na urekebishaji wa sauti kwenye kipaza sauti.",
    },
  },
};

export default w;
