/**
 * Turkish words for the features (shared/facts.ts): fetched only when Turkish is
 * chosen. The friendly sen of Turkish music apps; djmanzo's own interface labels
 * stay as the application shows them.
 */

import type { FactWords } from "../factwords";

const w: FactWords = {
  status: "djmanzo beta aşamasında: Windows, macOS ve Linux için eksiksiz bir DJ uygulaması, kendi deposunda test edildi — donanımın olmadığı yerlerde yerine geçen taklitlerle — ve henüz gerçek bir sahneden geçmedi.",
  soon: { almost: "Neredeyse hazır", progress: "Üzerinde çalışılıyor", planned: "Planlandı" },
  areas: {
    mixing: { name: "Miksleme", about: "Deck'ler, mikser, cue'lar, loop'lar, efektler ve stem'ler." },
    library: { name: "Kütüphane", about: "Plakların okunmuş, sıralanmış ve bulunmuş halde." },
    hands: { name: "Tuşlar, kontrolcüler ve ekranlar", about: "Klavye, akılda kalan tuşlar, kontrolcüler, plak ve içinde çalıştığın görünümler." },
    karaoke: { name: "Karaoke", about: "Bir karaoke sunucusunun ihtiyaç duyduğu her şey, sıradan bir misafir için yapılan şarkıya kadar." },
    assist: { name: "Asistan ve otopilot", about: "Nedenini söyleyen öneriler, kendi kendine akan bir miks ve istediğin an kontrolü geri almak." },
    learn: { name: "Öğrenmek", about: "Öğretmen, kurs ve bilgi birikimi." },
    show: { name: "Gösteri", about: "Video, görseller, ışıklar, canlı yayın, salon ve gece." },
    look: { name: "Görünümler ve paketler", about: "Temalar, skin'ler, görünüm stüdyosu ve pazaryeri." },
    editions: { name: "Sürümler, platformlar ve durum", about: "Ne nerede çalışıyor, ne kadar tutuyor ve henüz neler kanıtlanmadı." },
  },
  facts: {
    decks: {
      name: "İki deck ve mikser",
      about: "Play, cue, sync, keylock, aralığı ±6'dan ±100 %'e kadar değişen bir pitch fader, kanal fader'ları ve A / thru / B atamalı, yumuşak, doğrusal ya da keskin eğrili bir crossfader, kill'li üç bantlı EQ, bir filtre, ses yüksekliği analizinden gelen gain, kulaklık cue'su, kabin çıkışı ve bir limiter.",
      scene: "Cuma, gece 11, açılış: iki plak, bir fader ve kulakların. Bu sayfadaki her şey bu iki deck'in üzerine kurulu.",
    },
    transport: {
      name: "Slip, ters çalma, fren, backspin ve kopya deck",
      about: "Deck'in kendisindeki performans hareketleri, quantize ve beat jump ile; ve anında bir ikiz: aynı plak diğer deck'te aynı yerde, aynı hız, ton ve grid ile — aynı örnekler, yeniden yükleme değil.",
    },
    pads: {
      name: "Cue'lar, loop'lar ve pad'ler",
      about: "İsimli ve renkli sekiz hot cue (Serato ve rekordbox'tan aktarılır ya da Shift+sağ tıkla konur), vuruş sayısıyla loop'lar, 1/16'ya kadar loop roll, bir slicer ve cue, loop, roll, kayıtlı loop, sampler ve efektler için pad sayfaları.",
      scene: "İhtiyacın olan vokal 32 ölçü sonra geliyor. İsimli, renkli bir hot cue seni tek basışta oraya götürür, pist fark etmez bile.",
    },
    fx: {
      name: "Efekt rafı",
      about: "Echo, delay, reverb, gate, crush, flanger, phaser ve filtre — vuruşa senkron, her deck'te ve master'da üçer slot, zincir hazır ayarlarıyla.",
      scene: "Drop gecikiyor; cümlenin son vuruşunda bir echo out ihtiyacın olan dört ölçüyü kazandırır.",
    },
    sampler: { name: "Sampler", about: "Pad bankaları — one-shot, loop, hold, stutter — master tempoya senkron ve bir deck'ten kaydedilmiş." },
    record: { name: "Master kaydı", about: "Set diske, WAV olarak." },
    library: {
      name: "Kütüphane",
      about: "Klasörler, çalma listeleri, kasalar ve akıllı klasörler; rekordbox, Traktor ve iTunes'tan cue ve grid'leriyle, Serato'dan kasaları, hot cue'ları ve loop'larıyla aktarma; kopyaların bulunması; anında arama; koleksiyonun kendi kapak görselleriyle kartlar halinde görünmesi.",
      scene: "Salı günü rekordbox'tan geçiyorsun; cumartesiye kadar cue'ların, grid'lerin ve kasaların ellerinin beklediği yerde.",
    },
    camelot: {
      name: "Ton ve tempo, okunmuş",
      about: "BPM, Camelot çarkında ton ve uyumlu tonlar, ses yüksekliği ve Latin Amerika, Kuzey Amerika, Avrupa, Afrika ve ötesinden 31 tür ailesi.",
      scene: "8A'dan 9A'ya: pist anlamadan önce çark sana uyacağını söyler.",
    },
    waveforms: {
      name: "Rust ile çizilen dalga formları",
      about: "Kayan ve genel bakış dalga formları, düzenlenebilir beat grid, cue ve loop katmanları ve banda göre renk; Linux'ta da hızlı kalsın diye Rust ile çizilir.",
    },
    phrases: {
      name: "Cümleler, intro'lar ve outro'lar",
      about: "Cümle uzunluğu ve çapası plakta bulunur ve dalga formunda işaretlenir, cümleye kilitli loop ve atlamalarla; build'ler, drop'lar, breakdown'lar ve vokalin girişi; ve müziğin nerede başlayıp bittiği, böylece automix plağın müziği bittiği yerde çıkar.",
      caveat: "Yapay parçalarla doğrulandı, henüz gerçek plaklardan oluşan bir derlemeyle ölçülmedi. Canlı kayıttaki alkış müzik olarak okunur.",
      scene: "Tahminle değil cümleyle miksle: sonraki 16 ölçü gelmeden işaretlenmiş olur.",
    },
    find: {
      name: "Hafızadan bul",
      about: "Yarım hatırlanan bir dize, bir tarif ya da bir mırıltı.",
      caveat: "Mırıltı henüz gerçek bir mikrofonla denenmedi ve yalnızca koleksiyonda olan plakları bulur; sende olmayan bir plağın adını yalnızca tarif verebilir.",
      scene: "«Hani şu da-da-daa... diye giden, nefeslilerle olan»: mırıldan, plak karşına çıksın.",
    },
    keyboard: {
      name: "Klavye bir kontrolcüdür",
      about: "Bir MIDI eşlemesiyle aynı kelime dağarcığı ve aynı dosya biçimi; böylece hiçbir şey takılı olmayan bir dizüstü de çalınabilir bir enstrüman olur.",
      scene: "Kontrolcü arabada kaldı: dizüstünün tuşları bütün seti çalar, bir kontrolcünün kullandığı eşleme biçimiyle.",
    },
    mapped: {
      name: "Hazır eşlemesiyle gelen kontrolcü",
      about: "Her üreticinin kendi MIDI tablosundan yazılmış eşlemeler, gezinme düğmesi ve yükleme tuşları dahil: Pioneer'ın DDJ-400 ve FLX4 ailesi, DDJ-200, DDJ-SR ve CDJ-3000 (HID modunda), Denon MC4000, Hercules Inpulse 300, Numark DJ2GO, Reloop Mixon 4, Roland DJ-707M'in deck bölümü, pad ızgarası olarak Launchpad Mini MK3 ve genel bir iki deck eşlemesi.",
      caveat: "Hiçbiri henüz cihazın kendisinde çalınmadı: her biri taklitlere karşı çalışıyor. Bazı kontrolcüler tablo yayımlamıyor ve öğrenme modunu bekliyor.",
    },
    themes: {
      name: "Temalar ve skin'ler",
      about: "Paletler, aralarında dört Karayip teması, üzerlerinde görsel katmanlar; paneller taşınır, büyütülür ve kendi pencerelerine çıkarılır.",
    },
    layouts: {
      name: "Yerleşimler",
      about: "Starter, Essentials, Pro, Performance, Scratch ve Stem Performance, bir de DJ'in kendi yerleşimi, kod çalıştıramayan bir dosya olarak.",
    },
    requests: { name: "Pistten istekler", about: "Salon şarkıları bir QR kodundan ister — kurulacak uygulama yok — DJ de listeyi en çok istenenden başlayarak okur." },
    share: { name: "Bir seti paylaş", about: "Bu gecenin parça listesi, mesajı yazılmış halde WhatsApp, X, Bluesky ya da Threads'e gider; DJ gönder'e basar." },
    linux: {
      name: "Linux ve macOS",
      about: "Linux'ta ses, PipeWire'ın sunduğu ALSA varsayılan cihazından geçer; Windows, macOS ve Linux, uygulamanın çıktığı platformlardır.",
      caveat: "JACK henüz ses sunucusu olarak seçilemiyor ve CI Xubuntu'da değil Ubuntu'da çalışıyor.",
    },
    decks6: { name: "Dört ila altı deck", about: "Üçüncü ve dördüncü deck'ler, ve altıya kadar." },
    stems: {
      name: "Canlı stem'ler",
      about: "Vokal, davul, bas ve geri kalanı ayrı ayrı; çalma kafasının önünde bir önbelleğe ayrılır, böylece ses gecikme eklemez; stem başına EQ ve bir deck'in vokali diğerinin miksinin üzerinde.",
      scene: "Bir misafir, sende yalnızca tamamı olan bir plağın akapellasını istiyor. Vokal dışında her şeyi kapat, canlı, tık sesi olmadan.",
    },
    automix: {
      name: "Automix ve otopilot",
      about: "Uygulama miksi hazırlanmış bir setten altı farklı tavırla kendisi yürütür ve bir el bir kontrole dokunduğu anda çekilir.",
      caveat: "Gerçek sesle hiç doğrulanmadı: geliştirme makinesinin çıkış cihazı yok.",
      scene: "Düğün yemeği saati: sen gelin ve damatla konuşurken otopilot kurduğun akışı çalar ve bir deck'e dokunduğun anda deck'leri geri verir.",
    },
    "autopilot-surface": {
      name: "Auto-Pilot paneli",
      about: "Geceyi şekli, süresi, tempo aralığı, dönemi ve sevdiğin ya da dışarıda bıraktığın türlerle tasarla; koleksiyonundan doldur, başlat, devral, geri ver, çalma listesi olarak sakla.",
      caveat: "Yalnızca kendi koleksiyonundan doldurur. Çevrim içi kaynaklardan doldurmak ve dört şekilden birini seçmek yerine gecenin enerjisini elle çizmek henüz yolda.",
    },
    suggest: {
      name: "Sırada ne çalmalı, ve neden",
      about: "Ton, tempo, ses yüksekliği ve cümleye göre sıralanmış sonraki parça önerileri, her biri gerekçeleriyle; ve nerede ve nasıl geçileceğini öneren bir geçiş planlayıcısı.",
      caveat: "Enerji ses yüksekliğiyle yaklaşık hesaplanır. Planlayıcı outro'nun nerede olduğunu bilemez: sona yakın bir cümle sınırı bir tahmindir.",
      scene: "Bu plakta iki dakika kaldı ve hiçbir şey yüklü değil: liste hangi üçünün oturacağını ve her birinin nedenini söyler.",
    },
    asks: {
      name: "Harekete geçmeden önce sorar",
      about: "Asistan bütün bir geçişi kabul edeceğin, değiştireceğin ya da reddedeceğin tek bir şey olarak hazırlar ve yalnızca bir DJ'in basabileceği hareketlerle konuşur.",
    },
    packs: { name: "Bilgi paketleri ve rehberler", about: "Asistan için bir türün ya da bir gecenin şekli, ve her konuda rehberler." },
    teacher: {
      name: "Öğretmen",
      about: "Alıştırma laboratuvarı ve yalnızca kulaklığın duyduğu bir alıştırma deck'i, ellerin az önce ne yaptığını söyleyen koç, yirmi sekiz teknik ve bir test.",
      scene: "Pazar öğleden sonra, kulaklık takılı: koç sana bunun bir bas değişimi olduğunu, iki vuruş erken yapıldığını söylüyor.",
    },
    curriculum: {
      name: "Apprentice kursu",
      about: "Deck'ler ve beatmatching'den ilk sahneye ve sonraki yola kadar sırayla on aşama: yirmi üç ders, tür dersi senin bilgi paketinden yazılır. Koç her hareketi az önce çaldığından kontrol eder; kulakla beatmatching iki tempodan kontrol edilir ve SYNC sayılmaz. İlerlemen saklanır.",
      caveat: "Şimdiye kadar yirmi üç ders; daha fazlası geliyor ve sahibinin her dersin ne dediğini henüz gözden geçirmesi gerekiyor.",
      scene: "İlk beatmatch'ten ilk sahneye, sırayla, koç gerçekten ne yaptığını kontrol ederken.",
    },
    karaoke: {
      name: "Bir karaoke gecesi",
      about: "Sözlerin zamanında aktığı şarkıcı ekranı, sıra ve kayıt sayfası, vokalin çıkarılması, her şarkıcıya mikrofon ve efektler, düetler, rehber vokal, ara müziği, puanlanan şarkı söyleme, bir bilgi yarışması ve şarkıcının adını söyleyemediği şarkıyı bulmak.",
      caveat: "Henüz yolda: düet bölümleri ve mikrofon olarak telefonlar.",
      waits: "Düet bölümleri, djmanzo'nun lisansını kullanabileceği bir ayırma modelini; mikrofon olarak telefonlar güvenli bir yerel bağlantıyı bekliyor.",
      scene: "Saat onda bar karaokesi: masada bir QR kodu, ekranda sıra, sözler zamanında ve plaktan vokal gitmiş.",
    },
    oldmac: {
      name: "Eski Mac'lerde djmanzo",
      about: "Uygulamanın tamamı, karaoke ile açılarak, macOS 10.13'e kadar Intel Mac'ler için.",
      caveat: "Henüz kimse 2011 model bir Mac'te çalıştırmadı. Dinleyerek söz zamanlama ve sesli komutlar macOS 10.15 ya da üstünü gerektirir.",
    },
    room: {
      name: "Salonu okumak",
      about: "Bir kamera ve bir mikrofon, pistin bu gece daha önceye göre durgun mu hareketli mi olduğunu söyler; telefonlardan gelen kalabalık tepkileri; her miksin ne yaptığı — her biri ne kadar emin olunduğuyla birlikte.",
      caveat: "Ölçüm hiç gerçek bir kamerayla çalıştırılmadı. Hiçbir görüntü kaydedilmez, saklanmaz ya da gönderilmez.",
      scene: "Tutuyor mu? Pist yirmi dakika öncesinden daha kalabalık ve ekran bunu, ne kadar emin olduğuyla birlikte söylüyor.",
    },
    mapping: {
      name: "Her kontrolcüyü eşle",
      about: "Bir kontrole bas, ne yapacağını seç, kaydet; HID cihazları, ışıklar, bir tablonun söyleyemediği için Lua ve neyin takılı olduğunu okuyan bir arayüz.",
      caveat: "Donanımda denenmedi: taklitlere karşı çalışıyor ve henüz cihazın kendisiyle buluşmadı.",
      scene: "Kimsenin eşleme yazmadığı bir kontrolcü: bir düğmeye bas, ne yapacağını seç, sakla.",
    },
    platters: {
      name: "Motorlu tablalar",
      about: "Tablanın mutlak konumu, motoru çalmaya göre dönen.",
      caveat: "Donanımda denenmedi: taklitlere karşı çalışıyor ve henüz cihazın kendisiyle buluşmadı.",
    },
    dvs: {
      name: "Timecode plak",
      about: "Gerçek pikaplar bir deck'i sürer, göreli ya da mutlak; djmanzo kendi kontrol sinyalini yazar, bu yüzden lisanslı bir plağa gerek yoktur.",
      caveat: "Henüz basılmış bir plakla çalıştırılmadı.",
      scene: "Senin pikapların, senin ellerin, deck'te herhangi bir plak: djmanzo kendi timecode'unu yazar.",
    },
    visuals: {
      name: "Video ve görseller",
      about: "Bir deck'te video, görüntüsü ses gibi crossfade olur; katmanlı WebGL görünümleri ve MilkDrop hazır ayarları — DJ'in kendileri de — bir projektör ya da ikinci ekran için.",
      caveat: "Linux'ta H.264 video yalnızca dağıtımın gstreamer1.0-libav paketi kuruluysa oynar; video şimdiye kadar yalnızca Linux'ta çalıştırıldı.",
      scene: "Kabinin arkasındaki projektör müzik videosunu miksle eş zamanlı gösterir ya da basla nefes alan bir görünüm.",
    },
    live: {
      name: "Canlı yayın",
      about: "Yayında şu an çalan: OBS için bir katman ve bir metin dosyası, Twitch, YouTube, Instagram, TikTok ya da Kick için.",
      scene: "Set yayında: kimse yazmadan OBS parçayı değiştiği anda gösterir.",
    },
    outputs: {
      name: "Stem çıkışları",
      about: "Bir deck'in stem'leri dört stereo çift olarak — vokal, davul, bas, geri kalanı — harici işleme için.",
      caveat: "Donanımda denenmedi: taklitlere karşı çalışıyor ve henüz cihazın kendisiyle buluşmadı.",
    },
    deckouts: {
      name: "Deck çıkışları",
      about: "Her deck kendi stereo çiftinde, fader'ından önce, harici bir mikser için.",
      caveat: "Donanımda denenmedi: taklitlere karşı çalışıyor ve henüz cihazın kendisiyle buluşmadı.",
    },
    clap: { name: "CLAP eklentileri", about: "Master'da barındırılan ses eklentileri, genel kontrollerle ve eklenti penceresi olmadan." },
    sources: {
      name: "Çevrim içi kaynaklar",
      about: "Spotify, YouTube, Jamendo ve Internet Archive'da ara ve bir sonucu zaten sahip olduğun bir dosyayla eşleştir. Bulmak ve planlamak için: Spotify ya da YouTube Music sesini miksleme izni onlardan yok.",
    },
    events: {
      name: "Etkinlikler ve basın kiti",
      about: "Adım adım takip edilen bir rezervasyon, gecenin planı ve bir basın kiti.",
      scene: "Mart'ta bir rezervasyon: plan, mekan için bilgi formu, basın kiti, hepsi bıraktığın yerde.",
    },
    replay: {
      name: "Tekrar",
      about: "Bir set veridir: yeniden dinlenir, Mixes panelinden tek bir miks yeniden render edilir, alıştırma için bir geçiş döngüye alınır, iki deneme karşılaştırılır.",
      caveat: "Bütün bir seti çevrim dışı yeniden render etmek henüz düğmesi olmayan bir komut. Canlı girişler — mikrofon, aux, timecode — yeniden üretilemez ve bu açıkça söylenir.",
      waits: "Bütün bir seti çevrim dışı yeniden render etmek için bir düğme.",
    },
    api: {
      name: "Açık bir yüzey",
      about: "OSC ve TCP üzerinde satır satır JSON ile, arayüzün kullandığı aynı hareketlerle bir kontrol API'si; MIDI clock giriş ve çıkış; ve djmanzo makineleri arasında tempo senkronu (Ableton Link değil).",
    },
    editions: {
      name: "Yedi sürüm, tek indirme",
      about: "Auto-Pilot, Hobbyist, Apprentice, Karaoke, Pro DJ, Full ve Custom; hepsi tek bir uygulama, oturum açarak açılır. Her sürüm yalnızca taşıdığını gösterir; eksik olan, ona sahip sürümün adını veren sessiz bir karttır.",
      caveat: "djmanzo'dan oturum açmak, bir sürüm bu mağazanın adını verecek şekilde derlendiğinde buraya ulaşır; bu da sahibinin adımı. O zamana kadar djmanzo hiçbir şeyi reddetmez; sonrasında lisanssız djmanzo ücretsiz Hobbyist sürümüdür.",
      waits: "djmanzo'da yapıldı ve burada demo modunda canlı; ödemeler ve gerçek oturum açma açılır açılmaz satın alma açılır.",
    },
    trial: {
      name: "Herhangi bir sürümle yedi gün",
      about: "Full dahil herhangi bir sürümün ücretsiz denemesi, hesap başına bir kez. Satın almadan biterse djmanzo Hobbyist sürümüne döner, ücretsiz, sonsuza dek: denemenin eklediği şeyler sessiz kartlar olarak görünür ve yaptığın hiçbir şey kaybolmaz.",
      caveat: "Burada başlar ya da bir sürüm bu mağazanın adını verdiğinde djmanzo'da Settings → Licence'tan; kalan günler djmanzo'nun durum şeridinde görünür.",
      waits: "Gerçek oturum açma açılır açılmaz deneme başlayabilir.",
    },
    marketplace: {
      name: "Pazaryeri",
      about: "DJ'lerin yaptığı, yapanlarının imzaladığı ücretsiz paketler: temalar, skin'ler, görseller, otopilotun uyguladığı DJ teknikleri, klavye setleri, kontrolcü eşlemeleri, bilgi paketleri ve kursa kendi aşamalarında katılan dersler. djmanzo'nun Marketplace paneli bunları türe ve müzik türüne göre gezdirir, her kartta resimler ve lisansla, ve tek basışta kurar ya da kaldırır; bu site de onları listeler, başlangıç için ekibin yedi klavye setiyle.",
      caveat: "Paket olarak karaoke ekranları ve eklentiler henüz yolda. Bu site şimdilik temaları, skin'leri, görselleri ve klavye setlerini listeler; diğer türler djmanzo'da bir dosyadan ya da dizinden kurulur.",
      waits: "Sekiz tür hazır; sırada karaoke ekranları, ses eklentileri ve bir inceleme kuyruğu var.",
    },
    setplan: { name: "Set planı", about: "Gece bir yay gibi planlanır, yeniden kurmadan yönlendirilir." },
    "hobbyist-free": {
      name: "Hobbyist sürümü, sonsuza dek ücretsiz",
      about: "İki deck, mikser, kütüphane, cue'lar, loop'lar ve pad'ler, efektler, sampler, kayıt, klavye ve bir kontrolcü, satın almadan. Denemenin bittiği yer burasıdır: denemenin eklediği şeyler sessiz kartlar olarak görünür ve yaptığın hiçbir şey kaybolmaz.",
      caveat: "Mağaza djmanzo'da açıldığında; o zamana kadar djmanzo hiçbir şeyi reddetmez.",
      waits: "Bugün ücretsiz indirilebilir; oturum açma mağazayla birlikte açılır.",
    },
    "quiet-cards": {
      name: "Dahası neler, bir bakış",
      about: "Full dışındaki her sürümde, sürümün taşımadığı bir panel sessiz bir kart olarak çizilir: ne yaptığı ve onu içeren en ucuz sürüm. Asla bozuk bir düğme, asla bir açılır pencere, asla miks yaparken değil.",
      caveat: "Bir panelin içindeki kontroller, örneğin bir Hobbyist deck'indeki stem düğmesi, kart olarak gösterilmek yerine dışarıda bırakılır.",
    },
    "look-studio": {
      name: "Görünüm stüdyosu",
      about: "Sekiz başlangıçtan, on altı paletten ya da herhangi üç renkten, sekiz stil ve on iki motiften bir tema ve skin'lerini tıklayarak birleştir, yaparken bütün pencereye giydirilmiş halde; ya da kopyaladığın bir şablondan herhangi bir yapay zekaya yaptır. Her tema WCAG kontrastında okunur kalır. Anahtarınla imzalanmış bir paket olarak sakla ya da .djpack olarak paylaş.",
      caveat: "djmanzo içinde kendi yapay zeka sağlayıcınla yapmak asistanı gerektirir; şablonu herhangi bir yapay zekaya kopyalamak her sürümde çalışır. Projektör ve karaoke görselleri henüz tasarımın parçası değil.",
    },
    "theme-packs": {
      name: "Paket olarak temalar ve skin'ler",
      about: "Bir tema (karanlık ve aydınlık bir oda için on dört renk, okuduğun her çift kontrastına bağlı) ya da bir skin (yalnızca çizebilen SVG karoları, durgun, süzülen ya da basla nefes alan) Settings'ten imzalı bir .djpack olarak kurulur, her sürümde, ve djmanzo'nun kendisininkiler gibi giyilir.",
    },
    hardware: {
      name: "Daha fazla donanım",
      about: "İnsanların sahip olduğu daha fazla kontrolcü için eşlemeler — Pioneer'ın büyük DDJ'leri, Hercules Inpulse 500, Traktor Kontrol S2 ve S4, Denon ve Rane, daha fazla Reloop — her biri üreticisinin tablosundan ya da eldeki cihazdan, bir de uzaktan kumanda olarak telefonlar.",
      waits: "Her üreticinin yayımladığı MIDI tablosu ya da eldeki cihaz.",
    },
    club: {
      name: "Kulüp oynatıcıları ve daha fazla ışık",
      about: "Pro DJ Link, StagelinQ, Ableton Link, USB DMX arayüzleri, hareketli kafalar ve birden fazla universe, MIDI 2.0.",
      caveat: "Bunların hiçbiri gerçek cihazla buluşana kadar kanıtlanmış değil.",
      waits: "Karşısında test edilecek gerçek bir oynatıcı ve djmanzo'nun Ableton Link için kullanabileceği bir lisans.",
    },
    windows: {
      name: "Windows",
      about: "Her sürümle derlenir, CI'da test edilir ve paketlenir; djmanzo'nun sahibi onu bir Windows makinede çalıştırdı.",
      caveat: "Buradaki her şey gibi beta: şimdiye kadar Windows'ta tek bir kişi denedi.",
    },
    gig: {
      name: "Gerçek bir sahne",
      about: "Buradaki her şey depoda test edildi; hiçbiri henüz bir kalabalığın önünde değil.",
      waits: "Kalabalıklı bir gece ve bulduklarının yazıya geçmesi.",
    },
    leader: {
      name: "Space altında akılda kalan tuşlar",
      about: "Space'e bas, bir rehber her tuşu göstersin: kelime gibi okunan diziler — Space d 1 p, deck 1 çal demek; Space o i şarkıcıları açar. Kendi tuşlarını djmanzo'nunkilerin üzerine koy ve üstüne belli bir amaç için yapılmış bir klavye setini giy.",
      scene: "Space, d, 1, p: birinci deck çalar. Kelime gibi oku, aklında kalsın.",
    },
    keysets: {
      name: "Klavye setleri",
      about: "Bir çalışma biçimi için akılda kalan yerleşimler: dokuzu djmanzo ile gelir — her sürümün çalışma biçimi için bir tane (Essentials, Learning, Karaoke host, Performance, Autopilot, Dashboards), artı Scratch, Open format ve One hand — ve daha fazlası pazaryeri paketleri olarak gelir. Bir set, djmanzo'nun boş bıraktığı harflere, senin tuşlarının altına tuş ekler; yani giymek asla bir tuşu elinden almaz. Kendi tuşların bir set olarak kaydedilebilir ya da tek basışta adın ve destek bağlantılarınla yayımlanabilir.",
      caveat: "Aynı anda tek bir set giyilir.",
    },
    launcher: {
      name: "Başlatıcı ve panolar",
      about: "Başlatıcı için 0'a bas: deck'lerin yerini alan tam görünümler — Karaoke panosu şarkıcıları ve müziğini yan yana, deck'leri kısaca koyar; Karaoke prep öncesindeki bir saat içindir — ve elle düzenlenmiş kendi panoların.",
    },
    palette: {
      name: "Her şey için tek arama",
      about: "Komut paleti (Ctrl ya da Cmd + K) herhangi bir plağı, paneli, hazır ayarı, temayı ya da hareketi yazım hatalarına rağmen bulur; her panel kendi penceresine çıkar ve canlı kalır.",
    },
    deckqueue: {
      name: "Her deck'in altında bir çalma listesi",
      about: "Her deck'in kendi çalma listesi çekmecesi var: bir basış plak yükler, ▶ yükler ve çalar, Next when this ends ve Repeat ile kendi kendine devam eder, dönüp dolaşarak, istersen karışık — diğer deck işi yaparken cıngıl ve loop'larla dolduran bir deck.",
      scene: "Karaoke şarkıcıları arasında diğer deck salonu tek başına canlı tutar, cıngıllar ve loop'lar dönüp dolaşır.",
    },
    "current-deck": {
      name: "Geçerli deck, iki tasarım ve yüzen bir deck",
      about: "Her zaman bir deck geçerlidir ve çerçevelidir; tuşlar onun üzerinde çalışır, Tab, bir basış ya da kontrolcüde bir dokunuş onu değiştirir. Her deck tam ya da kompakt gelir — kompakt olan dalga formunu, çalma kontrollerini, ses düzeyini ve filtreyi tutar, EQ, pad'ler, loop'lar ve efektleri yerinde açar — ve herhangi bir deck tam boyutta diğerlerinin üzerinde yüzebilir. Altı deck bir dizüstüne sığar.",
      scene: "Bir çatı barında 13 inçlik dizüstünde dört deck: kompakt deck'ler, ekranda her fader ve dokunmak üzere olduğun çerçeveli.",
    },
    "context-rail": {
      name: "Bağlam rayı",
      about: "Her deck'te devrede olan şey — bir loop, bir efekt, bir filtre, susturulmuş bir stem — yanında listelenir, her biri sade hale tek basış uzaklıkta.",
      scene: "Uzun bir blend'in ortasında bir şey hâlâ açık: ray deck 2'deki echo'yu gösterir ve tek basış onu kapatır.",
    },
    "booth-moves": {
      name: "Kopya deck, pitch aralığı, crossfader eğrisi, intro ve outro",
      about: "Çalan bir plağın başka bir deck'te anında ikizi; ±6'dan ±100 %'e pitch aralığı; yumuşak, doğrusal ya da keskin bir crossfader; isimli ve renkli hot cue'lar; ve analizin bulduğu, her plağın müziğinin başladığı ve bittiği yer.",
      scene: "Bir beat juggle aynı plağı iki kez ister: kopyala, iki kopya da tempoda.",
    },
    "licence-updates": {
      name: "Lisans, kuponlar ve güncellemeler",
      about: "Settings → Licence'tan oturum aç ya da bir lisans satırı yapıştır; bir kupon indirim ya da bütün bir sürüm verir, bağlantısız kontrol edilir; djmanzo günde bir kez yeni sürüme bakar ve kapanırken kurar, asla set sırasında değil.",
      scene: "Wi-Fi'sı olmayan bir mekanda kurulum: lisans ve kupon çevrim dışı kontrol edilir ve djmanzo'yu kapatana kadar hiçbir şey güncellenmez.",
    },
    lineage: {
      name: "Müzik nereden geldi, ve bir günlük",
      about: "Altmış yedi türün tarihi — her biri nerede ve ne zaman başladı, içine ne girdi ve ondan ne çıktı, nelere kulak verilmeli ve o türdeki herkesin bildiği plaklar — andığı her tür tek basış uzaklıkta; dönüm noktası bir plaktan otuz saniye; kendi dilinde Wikipedia; ve öğrendiğini öğrendiğin geceyle birlikte saklayan bir günlük.",
      scene: "Setler arasında reggae'den dancehall'a, oradan reggaeton'a yürümek ve hikâyeyi birisi bir dahaki sefere sorduğunda anlatmak için saklamak.",
    },
    "in-app-feedback": {
      name: "djmanzo içinden geri bildirim, yapay zekaya okutulmuş",
      about: "Çark simgesinden gönderilen sorunlar, dilekler ve sorular, yapay zeka tarafından okunup İngilizceye aktarılır, sahibi için bu sitede tutulur ve GitHub'a kaydedilir.",
      waits: "Yapılıyor: bugün 💬, gönderebilmen için GitHub'ın issue formunu açıyor.",
    },
    "site-downloads": {
      name: "En yeni sürüm, doğrudan bu siteden",
      about: "Her sürüm için tek indirme, indirme ekranından sistemin için en yeni sürümün kurulum dosyası; bir lisans ya da deneme djmanzo içinde gerisini açar.",
      waits: "İndirme ekranı hazır; sürüm dosyaları bağlanır bağlanmaz kurulum dosyaları üzerinde görünür.",
    },
    safe: {
      name: "SAFE düğmesi",
      about: "Üst çubukta tek bir basış her kontrolü geri alır, her efekti temizler ve sesi düzleştirir.",
      scene: "Bir şey yanlış geliyor ve ne olduğunu çıkaramıyorsun: tek basış, her şey yeniden sade.",
    },
    feedback: {
      name: "Geri bildirim, dilekler ve sorunlar",
      about: "Çarkın yanındaki 💬 bir sorunu, bir dileği ya da başka herhangi bir şeyi projenin doldurulmuş GitHub issue formu olarak kaydeder; sürüm, sistem ve baskı bilgisi yalnızca bir kutu işaretliyken eklenir ve önce gösterilir.",
    },
    lights: {
      name: "Müziği izleyen ışıklar",
      about: "Salonun ışıkları Art-Net ya da sACN üzerinden vuruşu, cümleyi ve müziğin ne kadar sert gittiğini izler: tek universe, beş kanal düzeni, pulse, chase, wash ve yalnızca bir cümlede değişen otomatik bir görünüm. Flaş yok.",
      caveat: "Henüz gerçek ışıklarla denenmedi.",
      scene: "Bir DMX düğümü ve dört par'ı olan küçük bir kulüp: ışıklar bir ışıkçı olmadan cümlede değişir.",
    },
    knowhow: {
      name: "Bilgi birikimi",
      about: "Kursun ikinci sekmesi: altı bölgede 110 tür ailesi — her biri neyle harmanlanır, hissedilen temposu, ritmi ve DJ'lerinin başvurduğu hareketler — 72 teknik ve her birinin ardındaki teori, bir DJ'in ve bir karaoke sunucusunun çalıştığı müzik teorisi; her fikir djmanzo'nun onu nerede gösterdiğini söyler. Altmış yedi tür tarihini anlatır — nerede ve ne zaman başladı, içine ne girdi ve ondan ne çıktı, nelere kulak verilmeli, herkesin bildiği plaklar — andığı her tür tek basış uzaklıkta; ve öğrenilen her şey günlükte, kendi gecesinde, hepsini toplayan bir defterle saklanır.",
      scene: "Bir merengue típico isteği geldi ve sen çoğunlukla house çalıyorsun: plak bitmeden neyle harmanlandığı ve DJ'lerinin neye başvurduğu.",
    },
    "k-rotation": {
      name: "Şarkıcılar ve sıra",
      about: "Bir şarkıcının adını yaz ve şarkısını yazmaya başla; en üstteki kart sıradakine aittir: şarkısını istediği tonda herhangi bir deck'e yükle, onu bir sonraki cümlede içeri al, söyledi ya da burada değil olarak işaretle. Sırayı değiştirmek için bir satırı sürükle ya da istemek için bir plağı panele sürükle.",
    },
    "k-voice": {
      name: "Ses kaydedildiği gibi, rehber olarak ya da çıkarılmış",
      about: "Her deck'in altında: As recorded, Guide — takip etmek için orijinal sesin birazı bırakılır — ya da Out. Şarkıcıya yeni gelen bir şarkı rehber vokal zaten işaretli olarak sunulur. Ton, tempoyu değiştirmeden yarım ses yarım ses kayar.",
    },
    "k-screen": {
      name: "Şarkıcı ekranı",
      about: "Projektör ya da televizyon için ikinci bir pencere: söylendikçe silinen sözler, sonraki satır, giriş sayımı, sırada kim var — plağın kapağının ya da üretilmiş bir arka planın üzerinde.",
    },
    "k-words": {
      name: "Bulunan ve dinlenerek zamanlanan sözler",
      about: "Sözler dosyanın kendisinden, yanındaki bir .lrc'den ya da arka planda bütün koleksiyon için LRCLIB'den gelir ve gece için saklanır. Zamanı olmayan sözler, djmanzo içinde, makinenin konuşma modellerini çalıştırabildiği yerde plak dinlenerek zamanlanır.",
      caveat: "Dinleyerek zamanlama bir Mac'te macOS 10.15 ya da üstünü gerektirir; zaten zamanlanmış gelen sözler her makinede şarkıyı izler.",
    },
    "k-visuals": {
      name: "Sözlerin arkasında görseller",
      about: "Vuruşa, stem'lere ve şarkıcıların mikrofonlarına göre djmanzo'nun kendi katmanları, aralarında MilkDrop hazır ayarları ve seninkiler, bir de Wikimedia Commons'tan sanatçının fotoğrafları, kaynağı belirtilerek — Singers panelinde seçilir.",
    },
    "k-mics": {
      name: "Her şarkıcıya bir mikrofon",
      about: "Karaoke için yapılmış hazır ayarlarla mikrofon başına bir zincir — Singer, Stadium, Radio voice, Big echo, Duet — yeterli çıkışı olan bir arayüzde her birine bir monitör, ve her şarkıcının adı ve dizeleri kendi renginde olan düetler.",
    },
    "k-phones": {
      name: "Salondan şarkıcılar",
      about: "Bir QR kodu Wi-Fi'daki herkesi senin müziğinden bir şarkıyla sıraya koyar — sen yüklemeden hiçbir şey çalmaz — ve açtığında emojileri şarkıcı ekranının köşesinde süzülür.",
    },
    "k-breaks": {
      name: "Bir yere götüren ara müziği",
      about: "Sıradaki şarkıcı hazırlanırken seçtiğin bir çalma listesinden müzik, onun şarkısına götürmek için seçilmiş, şarkıyı başlattığında kısılarak biter.",
    },
    "k-presets": {
      name: "Karaoke gecesi hazır ayarları",
      about: "Vocals out, Guide vocal, Everyone sings, Down a tone, Down a fourth, Up a tone, Original key ve Open microphones — limiter açık ve master biraz kısık, böylece bir mikrofon uğuldamadan önce nefes alacak yer bulur.",
    },
    "k-score": {
      name: "Puanlanan şarkı söyleme ve kapışma turları",
      about: "Koleksiyonundaki herhangi bir plak puanlanabilir, melodi ayrılmış vokalinden okunur; puan şarkıcılar söylerken şarkıcı ekranındadır, sonrasında bir lider tablosuyla, düette şarkıcı başına, kapışma turunda takım başına.",
      caveat: "Hiç gerçek bir salonda gerçek bir mikrofonla denenmedi.",
    },
    "k-quiz": {
      name: "Plaklarından yapılan bir bilgi yarışması",
      about: "Kendi koleksiyonundan kurallarla yapılan turlar — adını bil, ters ya da hızlandırılmış bir parça, birer birer giren stem'ler, eksik dize — telefonlardan dörder düğmeyle cevaplanır.",
    },
    "k-range": {
      name: "Bir şarkıcının ses aralığı ve söyleyeceği ton",
      about: "Bir şarkıcının pesten tize kaydığı yirmi saniye, ve djmanzo sesine uyan şarkıları, her birinin gerektirdiği ton değişimiyle önerir.",
      caveat: "Hiç gerçek bir salonda gerçek bir mikrofonla denenmedi.",
    },
    "k-guests": {
      name: "Misafir defteri, bir misafir için şarkı ve WhatsApp",
      about: "Şarkı söyleyen her şarkıcı gecenin günlüğüne yazılır. Onayıyla, her seferinde tek soru sorularak: bilgileri saklanır, sesinden on beş saniye ve yapay zeka sağlayıcının onun için yazdığı bir şarkı — onun hakkında, söylediği şarkı ve gece hakkında — djmanzo bunu Suno'nun formuna koyar ve bitmiş bağlantı onun WhatsApp'ına gönderilir. Sen göndermedikçe hiçbir şey makineden çıkmaz.",
      caveat: "Suno'nun herkese açık bir API'si yok: djmanzo formunu doldurur ve Create'e sen basarsın; WhatsApp'ta gönder'e de sen basarsın. Sözleri yazmak, djmanzo'da kurulu bir yapay zeka sağlayıcısı gerektirir.",
    },
    "k-record": {
      name: "Bir şarkıcının şarkısı, onun için kaydedilmiş",
      about: "Kendine ait bir onayla, şarkısı salonun duyduğu haliyle — mikrofonu ve efektleri plağın üzerinde — ona verilecek bir dosya olarak saklanır; ve mikrofonda perde düzeltme.",
    },
  },
};

export default w;
