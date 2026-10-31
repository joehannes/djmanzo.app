/**
 * Indonesian words for the features (shared/facts.ts): fetched only when
 * Indonesian is chosen. The friendly kamu of Indonesian apps; djmanzo's own
 * interface labels stay as the application shows them.
 */

import type { FactWords } from "../factwords";

const w: FactWords = {
  status: "djmanzo masih beta: aplikasi DJ lengkap untuk Windows, macOS, dan Linux, diuji di repositorinya sendiri — dengan pengganti di tempat perangkat kerasnya tidak ada — dan belum pernah melewati manggung sungguhan.",
  soon: { almost: "Hampir jadi", progress: "Sedang dikerjakan", planned: "Direncanakan" },
  areas: {
    mixing: { name: "Mixing", about: "Deck, mixer, cue, loop, efek, dan stem." },
    library: { name: "Library", about: "Rekaman-rekamanmu, dibaca, diurutkan, dan mudah ditemukan." },
    hands: { name: "Tombol, controller, dan layar", about: "Keyboard, tombol yang mudah diingat, controller, vinyl, dan tampilan tempat kamu bekerja." },
    karaoke: { name: "Karaoke", about: "Semua yang dibutuhkan host karaoke, dari antrean sampai lagu yang dibuat untuk seorang tamu." },
    assist: { name: "Asisten dan autopilot", about: "Saran yang menjelaskan alasannya, mix yang berjalan sendiri, dan mengambil alih kapan saja." },
    learn: { name: "Belajar", about: "Guru, kursus, dan pengetahuannya." },
    show: { name: "Pertunjukan", about: "Video, visual, lampu, siaran langsung, ruangan, dan malamnya." },
    look: { name: "Tampilan dan paket", about: "Tema, skin, studio tampilan, dan marketplace." },
    editions: { name: "Edisi, platform, dan status", about: "Apa jalan di mana, berapa harganya, dan apa yang belum terbukti." },
  },
  facts: {
    decks: {
      name: "Dua deck dan mixer",
      about: "Play, cue, sync, keylock, pitch fader yang rentangnya bisa diubah dari ±6 sampai ±100 %, fader kanal dan crossfader dengan penempatan A / thru / B serta kurva halus, linear, atau tajam, EQ tiga band dengan kill, filter, gain dari analisis kenyaringan, cue headphone, output booth, dan limiter.",
      scene: "Jumat, jam 11 malam, pembukaan: dua rekaman, satu fader, dan telingamu. Semua hal lain di halaman ini dibangun di atas dua deck ini.",
    },
    transport: {
      name: "Slip, reverse, brake, backspin, dan deck kloning",
      about: "Gerakan performa di deck itu sendiri, dengan quantize dan beat jump; dan duplikat instan: rekaman yang sama di deck lain, di posisi, kecepatan, kunci, dan grid yang sama — sampel yang sama, bukan dimuat ulang.",
    },
    pads: {
      name: "Cue, loop, dan pad",
      about: "Delapan hot cue dengan nama dan warna (diimpor dari Serato dan rekordbox, atau dipasang dengan Shift+klik kanan), loop berdasarkan jumlah ketukan, loop roll sampai 1/16, slicer, dan halaman pad untuk cue, loop, roll, loop tersimpan, sampler, dan efek.",
      scene: "Vokal yang kamu butuhkan muncul di bar ke-32. Hot cue bernama dan berwarna membawamu ke sana dengan sekali tekan, dan lantai dansa tidak sadar.",
    },
    fx: {
      name: "Rak efek",
      about: "Echo, delay, reverb, gate, crush, flanger, phaser, dan filter — tersinkron dengan ketukan, tiga slot per deck dan di master, dengan preset rantai.",
      scene: "Drop-nya telat; echo out di ketukan terakhir frasa memberimu empat bar yang kamu perlukan.",
    },
    sampler: { name: "Sampler", about: "Bank pad — one-shot, loop, hold, stutter — tersinkron dengan tempo master, dan direkam dari deck." },
    record: { name: "Merekam master", about: "Set-nya ke disk, sebagai WAV." },
    library: {
      name: "Library",
      about: "Folder, playlist, crate, dan folder pintar; impor dari rekordbox, Traktor, dan iTunes beserta cue dan grid-nya, dan dari Serato beserta crate, hot cue, dan loop-nya; duplikat ditemukan; pencarian instan; koleksi sebagai kartu dengan artwork masing-masing.",
      scene: "Kamu pindah dari rekordbox hari Selasa; Sabtu nanti cue, grid, dan crate-mu ada di tempat yang tanganmu harapkan.",
    },
    camelot: {
      name: "Kunci dan tempo, terbaca",
      about: "BPM, kunci di roda Camelot beserta kunci yang cocok, kenyaringan, dan 31 keluarga genre dari Amerika Latin, Amerika Utara, Eropa, Afrika, dan lainnya.",
      scene: "8A ke 9A: roda bilang ini akan pas, sebelum lantai dansa harus mencari tahu sendiri.",
    },
    waveforms: {
      name: "Waveform yang digambar dengan Rust",
      about: "Waveform bergulir dan ringkasan dengan beat grid yang bisa diedit, lapisan cue dan loop, dan warna per band, dirender dengan Rust supaya tetap cepat di Linux.",
    },
    phrases: {
      name: "Frasa, intro, dan outro",
      about: "Panjang frasa dan titik jangkarnya ditemukan di rekaman dan ditandai di waveform, dengan loop dan lompatan yang terkunci ke frasa; build, drop, breakdown, dan masuknya vokal; serta di mana musik mulai dan berhenti, sehingga automix keluar tepat di mana musik rekaman berakhir.",
      caveat: "Diverifikasi dengan trek sintetis, belum diukur pada kumpulan rekaman sungguhan. Tepuk tangan di rekaman live terbaca sebagai musik.",
      scene: "Mix di frasa, bukan tebakan: 16 bar berikutnya sudah ditandai sebelum datang.",
    },
    find: {
      name: "Temukan dari ingatan",
      about: "Sebaris lirik yang setengah diingat, sebuah deskripsi, atau senandung.",
      caveat: "Senandung belum pernah dicoba dengan mikrofon sungguhan, dan hanya menemukan rekaman yang sudah ada di koleksi; hanya deskripsi yang bisa menyebut rekaman yang tidak kamu punya.",
      scene: "«Yang bunyinya da-da-daa... ada terompetnya»: senandungkan, dan rekamannya muncul.",
    },
    keyboard: {
      name: "Keyboard adalah controller",
      about: "Kosakata dan format file yang sama dengan mapping MIDI, jadi laptop tanpa apa pun yang tercolok tetap bisa dimainkan seperti alat musik.",
      scene: "Controller ketinggalan di mobil: tombol laptop memainkan seluruh set, dengan format mapping yang sama dengan controller.",
    },
    mapped: {
      name: "Controller dengan mapping bawaan",
      about: "Mapping yang ditulis dari tabel MIDI tiap pembuatnya, termasuk knob browse dan tombol load: keluarga DDJ-400 dan FLX4 dari Pioneer, DDJ-200, DDJ-SR, dan CDJ-3000 (dalam mode HID), Denon MC4000, Hercules Inpulse 300, Numark DJ2GO, Reloop Mixon 4, bagian deck Roland DJ-707M, dan Launchpad Mini MK3 sebagai grid pad, serta mapping umum dua deck.",
      caveat: "Belum ada yang dimainkan di perangkatnya sendiri: masing-masing bekerja dengan pengganti. Beberapa controller tidak menerbitkan tabel dan menunggu mode learn.",
    },
    themes: {
      name: "Tema dan skin",
      about: "Palet, di antaranya empat tema Karibia, dengan lapisan artwork di atasnya; panel bisa dipindah, diperbesar, dan dikeluarkan ke jendela sendiri.",
    },
    layouts: {
      name: "Layout",
      about: "Starter, Essentials, Pro, Performance, Scratch, dan Stem Performance, serta layout milik DJ sendiri sebagai file yang tidak bisa menjalankan kode.",
    },
    requests: {
      name: "Request dari ruangan",
      about: "Tamu meminta lagu lewat kode QR — tanpa aplikasi yang perlu dipasang — dan DJ membaca daftarnya mulai dari yang paling banyak diminta.",
    },
    share: {
      name: "Bagikan set",
      about: "Tracklist malam ini diteruskan ke WhatsApp, X, Bluesky, atau Threads dengan pesannya sudah tertulis; DJ tinggal menekan kirim.",
    },
    linux: {
      name: "Linux dan macOS",
      about: "Di Linux, audio lewat perangkat default ALSA, yang dilayani PipeWire; Windows, macOS, dan Linux adalah platform tempat aplikasi ini dirilis.",
      caveat: "JACK belum bisa dipilih sebagai host audio, dan CI berjalan di Ubuntu, bukan Xubuntu.",
    },
    decks6: { name: "Empat sampai enam deck", about: "Deck tiga dan empat, dan sampai enam." },
    stems: {
      name: "Stem langsung",
      about: "Vokal, drum, bass, dan sisanya terpisah, dipisahkan di depan playhead ke dalam cache, jadi audionya tidak menambah latensi; EQ per stem, dan vokal satu deck di atas mix deck lain.",
      scene: "Tamu ingin acapella dari rekaman yang hanya kamu punya utuh. Bisukan semua kecuali vokal, langsung, tanpa bunyi klik.",
    },
    automix: {
      name: "Automix dan autopilot",
      about: "Aplikasi menjalankan mix dari set yang sudah disusun, dalam enam gaya, dan mundur begitu ada tangan yang menyentuh kontrol.",
      caveat: "Belum pernah diverifikasi dengan audio sungguhan: mesin pengembangannya tidak punya perangkat output.",
      scene: "Jam makan malam resepsi: autopilot memainkan alur yang kamu atur sementara kamu ngobrol dengan pengantin, dan mengembalikan deck begitu kamu menyentuh salah satunya.",
    },
    "autopilot-surface": {
      name: "Panel Auto-Pilot",
      about: "Atur malam berdasarkan bentuk, durasi, rentang tempo, era, dan genre yang kamu suka atau kamu hindari; isi dari koleksimu, mulai, ambil alih, serahkan kembali, simpan sebagai playlist.",
      caveat: "Hanya mengisi dari koleksimu sendiri. Mengisi dari sumber online, dan menggambar energi malam dengan tangan alih-alih memilih salah satu dari empat bentuk, masih akan datang.",
    },
    suggest: {
      name: "Apa yang diputar berikutnya, dan kenapa",
      about: "Saran lagu berikutnya yang diurutkan berdasarkan kunci, tempo, kenyaringan, dan frasa, masing-masing dengan alasannya; dan perencana transisi yang mengusulkan di mana dan bagaimana.",
      caveat: "Energi didekati dengan kenyaringan. Perencana tidak bisa tahu di mana outro-nya: batas frasa di dekat akhir adalah tebakan.",
      scene: "Dua menit tersisa di rekaman ini dan belum ada yang dimuat: daftar menunjukkan tiga mana yang akan mendarat, dan alasan masing-masing.",
    },
    asks: {
      name: "Bertanya sebelum bertindak",
      about: "Asisten menyiapkan seluruh transisi sebagai satu hal untuk kamu terima, ubah, atau tolak, dan hanya berbicara dalam aksi yang bisa ditekan seorang DJ.",
    },
    packs: { name: "Paket pengetahuan dan panduan", about: "Bentuk sebuah genre atau malam untuk asisten, dan panduan untuk tiap topik." },
    teacher: {
      name: "Guru",
      about: "Lab latihan dan deck latihan yang hanya terdengar di headphone, pelatih yang menyebut apa yang baru saja dilakukan tanganmu, dua puluh delapan teknik, dan kuis.",
      scene: "Minggu siang, headphone terpasang: pelatih bilang itu tadi bass swap, dua ketukan terlalu cepat.",
    },
    curriculum: {
      name: "Kursus Apprentice",
      about: "Sepuluh tahap berurutan, dari deck dan beatmatching sampai manggung pertama dan jalan sesudahnya: dua puluh tiga pelajaran, pelajaran genre ditulis dari paket pengetahuanmu. Pelatih memeriksa setiap gerakan dari apa yang baru kamu mainkan; beatmatching dengan telinga diperiksa dari kedua tempo, dan SYNC tidak dihitung. Kemajuanmu disimpan.",
      caveat: "Dua puluh tiga pelajaran sejauh ini; masih ada lagi yang akan datang, dan pemilik masih harus meninjau isi tiap pelajaran.",
      scene: "Dari beatmatch pertama sampai manggung pertama, berurutan, dengan pelatih memeriksa apa yang benar-benar kamu lakukan.",
    },
    karaoke: {
      name: "Malam karaoke",
      about: "Layar penyanyi dengan lirik tepat waktu, antrean dan halaman pendaftaran, vokal dihilangkan, mikrofon dan efek per penyanyi, duet, vokal pemandu, musik jeda, nyanyian dengan skor, kuis, dan menemukan lagu yang judulnya tidak diingat penyanyi.",
      caveat: "Masih akan datang: bagian duet dan ponsel sebagai mikrofon.",
      waits: "Bagian duet menunggu model pemisah yang lisensinya bisa dipakai djmanzo; ponsel sebagai mikrofon menunggu koneksi lokal yang aman.",
      scene: "Karaoke di bar jam sepuluh: kode QR di meja, antrean di layar, lirik tepat waktu, dan vokal hilang dari rekamannya.",
    },
    oldmac: {
      name: "djmanzo di Mac lama",
      about: "Seluruh aplikasi, terbuka langsung ke karaoke, untuk Mac Intel sampai macOS 10.13.",
      caveat: "Belum ada yang menjalankannya di Mac tahun 2011. Mengatur waktu lirik dengan mendengarkan dan perintah suara butuh macOS 10.15 atau lebih baru.",
    },
    room: {
      name: "Membaca ruangan",
      about: "Kamera dan mikrofon memberi tahu apakah lantai dansa lebih tenang atau lebih ramai dibanding tadi; reaksi penonton dari ponsel mereka; apa yang dilakukan tiap mix — masing-masing disertai seberapa yakin.",
      caveat: "Pengukurannya belum pernah dijalankan dengan kamera sungguhan. Tidak ada gambar yang direkam, disimpan, atau dikirim.",
      scene: "Berhasil nggak? Lantai dansa lebih ramai dari dua puluh menit lalu, dan layar bilang begitu, beserta seberapa yakin.",
    },
    mapping: {
      name: "Map controller apa saja",
      about: "Tekan kontrol, pilih fungsinya, simpan; perangkat HID, lampu, Lua untuk yang tidak bisa diungkapkan tabel, dan antarmuka yang membaca apa yang tercolok.",
      caveat: "Belum diuji di perangkat keras: bekerja dengan pengganti dan belum bertemu perangkatnya sendiri.",
      scene: "Controller yang belum pernah dibuatkan mapping: tekan knob, pilih fungsinya, simpan.",
    },
    platters: {
      name: "Platter bermotor",
      about: "Posisi platter absolut, dengan motor digerakkan oleh transport.",
      caveat: "Belum diuji di perangkat keras: bekerja dengan pengganti dan belum bertemu perangkatnya sendiri.",
    },
    dvs: {
      name: "Vinyl timecode",
      about: "Turntable sungguhan menggerakkan deck, relatif atau absolut; djmanzo menulis sinyal kontrolnya sendiri, jadi tidak perlu rekaman berlisensi.",
      caveat: "Belum dijalankan dengan piringan hasil press.",
      scene: "Turntable-mu, tanganmu, piringan apa pun di deck: djmanzo menulis timecode-nya sendiri.",
    },
    visuals: {
      name: "Video dan visual",
      about: "Video di deck, gambarnya ikut crossfade bersama suaranya, tampilan WebGL berlapis dan preset MilkDrop — preset milik DJ juga — untuk proyektor atau layar kedua.",
      caveat: "Di Linux, video H.264 hanya jalan jika gstreamer1.0-libav dari distribusinya terpasang; video sejauh ini baru dijalankan di Linux.",
      scene: "Proyektor di belakang booth menampilkan video musik seirama dengan mix, atau tampilan yang bernapas bersama bass.",
    },
    live: {
      name: "Siaran langsung",
      about: "Lagu yang sedang diputar di siaran: overlay untuk OBS dan file teks, untuk Twitch, YouTube, Instagram, TikTok, atau Kick.",
      scene: "Menyiarkan set: OBS menampilkan lagunya setiap kali berganti, tanpa ada yang mengetik.",
    },
    outputs: {
      name: "Output stem",
      about: "Stem satu deck sebagai empat pasang stereo — vokal, drum, bass, sisanya — untuk pemrosesan eksternal.",
      caveat: "Belum diuji di perangkat keras: bekerja dengan pengganti dan belum bertemu perangkatnya sendiri.",
    },
    deckouts: {
      name: "Output deck",
      about: "Tiap deck di pasangan stereo-nya sendiri, sebelum fader-nya, untuk mixer eksternal.",
      caveat: "Belum diuji di perangkat keras: bekerja dengan pengganti dan belum bertemu perangkatnya sendiri.",
    },
    clap: { name: "Plugin CLAP", about: "Plugin audio di master, dengan kontrol umum dan tanpa jendela plugin." },
    sources: {
      name: "Sumber online",
      about: "Cari di Spotify, YouTube, Jamendo, dan Internet Archive, lalu cocokkan hasilnya dengan file yang sudah kamu punya. Untuk mencari dan merencanakan: mixing audio Spotify atau YouTube Music tidak diizinkan oleh mereka.",
    },
    events: {
      name: "Acara dan press kit",
      about: "Booking yang dicatat langkah demi langkah, rencana malamnya, dan press kit.",
      scene: "Booking di bulan Maret: rencananya, lembar info untuk venue, press kit, semua di tempat kamu meninggalkannya.",
    },
    replay: {
      name: "Replay",
      about: "Set adalah data: didengar ulang, satu mix dirender lagi dari panel Mixes, satu transisi diulang untuk latihan, dua take dibandingkan.",
      caveat: "Merender ulang seluruh set secara offline masih berupa perintah tanpa tombol. Input langsung — mikrofon, aux, timecode — tidak bisa direproduksi, dan itu dikatakan terus terang.",
      waits: "Tombol untuk merender ulang seluruh set secara offline.",
    },
    api: {
      name: "Permukaan yang terbuka",
      about: "API kontrol lewat OSC dan JSON per baris di TCP, dengan aksi yang sama yang dipakai antarmuka; MIDI clock masuk dan keluar; dan sinkronisasi tempo antar mesin djmanzo (bukan Ableton Link).",
    },
    editions: {
      name: "Tujuh edisi, satu unduhan",
      about: "Auto-Pilot, Hobbyist, Apprentice, Karaoke, Pro DJ, Full, dan Custom, semuanya satu aplikasi, dibuka dengan masuk akun. Tiap edisi hanya menampilkan isinya; yang tidak dimiliki muncul sebagai kartu tenang yang menyebut edisi mana yang punya.",
      caveat: "Masuk dari djmanzo akan sampai ke toko ini begitu ada rilis yang dibangun untuk menyebutnya, dan itu langkah pemilik. Sampai saat itu djmanzo tidak menolak apa pun; setelahnya, djmanzo tanpa lisensi adalah edisi Hobbyist yang gratis.",
      waits: "Sudah dibangun di djmanzo dan aktif di sini dalam mode demo; pembelian dibuka begitu pembayaran dan login sungguhan dinyalakan.",
    },
    trial: {
      name: "Tujuh hari edisi apa pun",
      about: "Uji coba gratis edisi apa pun, termasuk Full, sekali per akun. Jika berakhir tanpa pembelian, djmanzo menjadi edisi Hobbyist, gratis, selamanya: yang ditambahkan uji coba muncul sebagai kartu tenang, dan tidak ada yang kamu buat yang hilang.",
      caveat: "Dimulai di sini, atau di djmanzo dari Settings → Licence begitu ada rilis yang menyebut toko ini; sisa harinya tampil di bilah status djmanzo.",
      waits: "Uji coba bisa dimulai begitu login sungguhan dinyalakan.",
    },
    marketplace: {
      name: "Marketplace",
      about: "Paket gratis buatan para DJ, ditandatangani pembuatnya: tema, skin, visual, teknik DJ yang dimainkan autopilot, set keyboard, mapping controller, paket pengetahuan, dan pelajaran yang bergabung ke kursus di tahapnya masing-masing. Panel Marketplace di djmanzo menjelajahinya berdasarkan jenis dan genre, dengan gambar dan lisensi di setiap kartu, dan memasang atau menghapusnya dengan sekali tekan; situs ini juga mencantumkannya, dengan tujuh set keyboard dari kru sebagai permulaan.",
      caveat: "Layar karaoke dan plugin sebagai paket masih akan datang. Situs ini sejauh ini mencantumkan tema, skin, visual, dan set keyboard; jenis lainnya dipasang di djmanzo dari file atau indeks.",
      waits: "Delapan jenis sudah tersedia; berikutnya layar karaoke, plugin audio, dan antrean tinjauan.",
    },
    setplan: { name: "Rencana set", about: "Malam direncanakan sebagai alur, diarahkan tanpa disusun ulang." },
    "hobbyist-free": {
      name: "Edisi Hobbyist, gratis selamanya",
      about: "Dua deck, mixer, library, cue, loop dan pad, efek, sampler, perekaman, keyboard, dan sebuah controller, tanpa pembelian. Ke sinilah uji coba berakhir: yang ditambahkan uji coba muncul sebagai kartu tenang, dan tidak ada yang kamu buat yang hilang.",
      caveat: "Begitu toko dibuka di djmanzo; sampai saat itu djmanzo tidak menolak apa pun.",
      waits: "Gratis diunduh hari ini; masuk akun ke dalamnya dibuka bersama toko.",
    },
    "quiet-cards": {
      name: "Sekilas tentang apa lagi yang ada",
      about: "Di setiap edisi kecuali Full, panel yang tidak dimiliki edisi itu digambar sebagai kartu tenang: apa fungsinya dan edisi termurah yang memilikinya. Tidak pernah tombol rusak, tidak pernah pop-up, tidak pernah saat kamu sedang mix.",
      caveat: "Kontrol di dalam panel, seperti tombol stem di deck Hobbyist, dihilangkan saja alih-alih ditampilkan sebagai kartu.",
    },
    "look-studio": {
      name: "Studio tampilan",
      about: "Rakit tema dan skin-nya dengan klik dari delapan titik awal, enam belas palet, atau tiga warna apa saja, delapan gaya, dan dua belas motif, dipakai di seluruh jendela saat kamu membuatnya; atau minta AI apa pun membuatnya dari template yang kamu salin. Setiap tema tetap terbaca dengan kontras WCAG. Simpan sebagai paket yang ditandatangani dengan kuncimu, atau bagikan sebagai .djpack.",
      caveat: "Membuatnya dengan penyedia AI-mu sendiri di dalam djmanzo butuh asisten; menyalin template ke AI apa pun bisa di semua edisi. Visual proyektor dan karaoke belum termasuk dalam desain.",
    },
    "theme-packs": {
      name: "Tema dan skin sebagai paket",
      about: "Sebuah tema (empat belas warna untuk ruangan gelap dan terang, setiap pasangan yang kamu baca dijaga kontrasnya) atau skin (ubin SVG yang hanya bisa menggambar, diam, melayang, atau bernapas bersama bass) dipasang sebagai .djpack bertanda tangan dari Settings, di semua edisi, dan dipakai seperti milik djmanzo sendiri.",
    },
    hardware: {
      name: "Lebih banyak perangkat keras",
      about: "Mapping untuk lebih banyak controller yang dimiliki orang — DDJ Pioneer yang lebih besar, Hercules Inpulse 500, Traktor Kontrol S2 dan S4, Denon dan Rane, lebih banyak Reloop — masing-masing dari tabel pembuatnya atau perangkat di tangan, dan ponsel sebagai remote.",
      waits: "Tabel MIDI yang diterbitkan tiap pembuat, atau perangkatnya di tangan.",
    },
    club: {
      name: "Player klub dan lebih banyak pencahayaan",
      about: "Pro DJ Link, StagelinQ, Ableton Link, antarmuka USB DMX, moving head dan lebih dari satu universe, MIDI 2.0.",
      caveat: "Tidak satu pun terbukti sampai bertemu perangkat sungguhan.",
      waits: "Player sungguhan untuk diuji, dan lisensi Ableton Link yang bisa dipakai djmanzo.",
    },
    windows: {
      name: "Windows",
      about: "Dibangun, diuji di CI, dan dikemas di setiap rilis, dan sudah dijalankan pemilik djmanzo di mesin Windows.",
      caveat: "Masih beta, seperti semua yang ada di sini: sejauh ini dicoba oleh satu orang di Windows.",
    },
    gig: {
      name: "Manggung sungguhan",
      about: "Semua di sini sudah diuji di repositori; belum ada yang di depan penonton.",
      waits: "Satu malam dengan penonton, dan apa yang ditemukannya dicatat.",
    },
    leader: {
      name: "Tombol mudah diingat di bawah Space",
      about: "Tekan Space dan sebuah panduan menunjukkan setiap tombol: urutan yang terbaca seperti kata — Space d 1 p artinya deck 1 play, Space o i membuka daftar penyanyi. Letakkan tombolmu sendiri di atas tombol djmanzo, dan pakai set keyboard untuk tujuan tertentu di atasnya.",
      scene: "Space, d, 1, p: deck satu berputar. Baca seperti kata, dan kamu ingat.",
    },
    keysets: {
      name: "Set keyboard",
      about: "Tata letak yang mudah diingat untuk cara kerja tertentu: sembilan ikut bersama djmanzo — satu untuk cara kerja tiap edisi (Essentials, Learning, Karaoke host, Performance, Autopilot, Dashboards) serta Scratch, Open format, dan One hand — dan lebih banyak lagi datang sebagai paket marketplace. Sebuah set menambah tombol di huruf yang dibiarkan kosong oleh djmanzo, di bawah tombolmu sendiri, jadi memakainya tidak pernah merebut tombol; tombolmu sendiri bisa disimpan sebagai set, atau diterbitkan dengan namamu dan tautan dukungan dengan sekali tekan.",
      caveat: "Hanya satu set yang dipakai dalam satu waktu.",
    },
    launcher: {
      name: "Launcher dan board",
      about: "Tekan 0 untuk launcher: tampilan penuh yang menggantikan deck — board Karaoke menaruh penyanyi dan musikmu berdampingan dengan deck secara ringkas, Karaoke prep untuk satu jam sebelumnya — dan board milikmu sendiri, disusun dengan tangan.",
    },
    palette: {
      name: "Satu pencarian untuk semuanya",
      about: "Palet perintah (Ctrl atau Cmd + K) menemukan rekaman, panel, preset, tema, atau aksi apa pun, tahan salah ketik; setiap panel bisa dikeluarkan ke jendela sendiri dan tetap hidup.",
    },
    deckqueue: {
      name: "Playlist di bawah setiap deck",
      about: "Tiap deck punya laci playlist sendiri: sekali tekan memuat rekaman, ▶ memuat dan memutarnya, dan dengan Next when this ends dan Repeat ia berjalan sendiri, berputar terus, diacak kalau mau — deck pengisi berisi jingle dan loop sementara deck lain bekerja.",
      scene: "Di sela penyanyi karaoke, deck lain menjaga suasana sendirian, jingle dan loop berputar terus.",
    },
    "current-deck": {
      name: "Deck aktif, dua desain, dan deck melayang",
      about: "Selalu ada satu deck aktif yang diberi garis tepi; tombol bekerja padanya, dan Tab, sekali tekan, atau sentuhan di controller memindahkannya. Tiap deck tersedia penuh atau ringkas — yang ringkas menyimpan waveform, transport, volume, dan filter serta membuka EQ, pad, loop, dan efek di tempat — dan deck mana pun bisa melayang, ukuran penuh, di atas yang lain. Enam deck muat di laptop.",
      scene: "Empat deck di laptop 13 inci di rooftop bar: deck ringkas, setiap fader di layar, dan yang akan kamu sentuh diberi garis tepi.",
    },
    "context-rail": {
      name: "Rel konteks",
      about: "Apa yang sedang aktif di tiap deck — loop, efek, filter, stem yang dibisukan — dicantumkan di sampingnya, masing-masing sekali tekan kembali polos.",
      scene: "Di tengah blend panjang dan masih ada yang menyala: rel menunjukkan echo di deck 2, dan sekali tekan mematikannya.",
    },
    "booth-moves": {
      name: "Kloning deck, rentang pitch, kurva crossfader, intro dan outro",
      about: "Duplikat instan rekaman yang sedang diputar di deck lain; rentang pitch dari ±6 sampai ±100 %; crossfader halus, linear, atau tajam; hot cue dengan nama dan warna; dan di mana musik tiap rekaman mulai dan berakhir, ditemukan oleh analisis.",
      scene: "Beat juggle butuh rekaman yang sama dua kali: kloning, dan kedua salinannya seirama.",
    },
    "licence-updates": {
      name: "Lisensi, voucher, dan pembaruan",
      about: "Masuk dari Settings → Licence, atau tempel baris lisensi; voucher memberi diskon atau satu edisi penuh, diperiksa tanpa koneksi; djmanzo mencari versi baru sekali sehari dan memasangnya saat ditutup, tidak pernah di tengah set.",
      scene: "Persiapan di venue tanpa Wi-Fi: lisensi dan voucher diperiksa offline, dan tidak ada yang diperbarui sampai kamu menutup djmanzo.",
    },
    lineage: {
      name: "Dari mana musiknya berasal, dan jurnal",
      about: "Sejarah enam puluh tujuh genre — di mana dan kapan masing-masing dimulai, apa yang masuk ke dalamnya dan apa yang lahir darinya, apa yang perlu didengarkan, dan rekaman yang dikenal semua orang di dalamnya — tiap genre yang disebut hanya sekali tekan; tiga puluh detik rekaman bersejarah; Wikipedia dalam bahasamu; dan jurnal yang menyimpan apa yang kamu pelajari di malam kamu mempelajarinya.",
      scene: "Berpindah dari reggae ke dancehall ke reggaeton di sela set, dan menyimpan ceritanya untuk lain kali ada yang bertanya.",
    },
    "in-app-feedback": {
      name: "Masukan dari dalam djmanzo, dibaca AI",
      about: "Masalah, keinginan, dan pertanyaan yang dikirim dari ikon roda gigi, dibaca dan diterjemahkan ke bahasa Inggris oleh AI, disimpan di situs ini untuk pemilik, dan dicatat di GitHub.",
      waits: "Sedang dibangun: saat ini 💬 membuka formulir issue GitHub untuk kamu kirim sendiri.",
    },
    "site-downloads": {
      name: "Versi terbaru, langsung dari situs ini",
      about: "Satu unduhan untuk semua edisi, installer rilis terbaru untuk sistemmu, dari layar unduhan; lisensi atau uji coba membuka sisanya di dalam djmanzo.",
      waits: "Layar unduhan sudah dibangun; installer akan muncul di sana begitu file rilisnya tersambung.",
    },
    safe: {
      name: "Tombol SAFE",
      about: "Sekali tekan di bilah atas mengembalikan setiap kontrol, menghapus setiap efek, dan meratakan suaranya.",
      scene: "Ada yang terdengar salah dan kamu tidak tahu apa: sekali tekan, dan semuanya polos lagi.",
    },
    feedback: {
      name: "Masukan, keinginan, dan masalah",
      about: "💬 di samping roda gigi mengirim masalah, keinginan, atau apa pun sebagai formulir issue GitHub proyek, sudah terisi; versi, sistem, dan edisi hanya ditambahkan selama sebuah kotak dicentang, dan ditampilkan lebih dulu.",
    },
    lights: {
      name: "Lampu yang mengikuti musik",
      about: "Lampu ruangan lewat Art-Net atau sACN, mengikuti ketukan, frasa, dan seberapa keras musiknya: satu universe, lima tata letak kanal, pulse, chase, wash, dan tampilan otomatis yang hanya berubah di frasa. Tanpa strobo.",
      caveat: "Belum dicoba dengan lampu sungguhan.",
      scene: "Klub kecil dengan node DMX dan empat lampu par: lampunya berubah di frasa, tanpa operator lampu.",
    },
    knowhow: {
      name: "Pengetahuan",
      about: "Tab kedua kursus: 110 keluarga genre dari enam wilayah — dengan apa masing-masing dipadukan, tempo yang terasa, ritmenya, dan gerakan yang dipakai DJ-nya — 72 teknik beserta teori di baliknya, dan teori musik yang dipakai DJ dan host karaoke, tiap gagasan menyebut di mana djmanzo menampilkannya. Enam puluh tujuh genre menceritakan sejarahnya — di mana dan kapan dimulai, apa yang masuk dan apa yang lahir darinya, apa yang perlu didengarkan, rekaman yang dikenal semua orang — tiap genre yang disebut hanya sekali tekan; dan apa pun yang dipelajari disimpan di jurnal, di malamnya, dengan buku catatan yang memuat semuanya.",
      scene: "Ada request merengue típico padahal kamu biasanya memutar house: dengan apa ia dipadukan dan apa yang dipakai DJ-nya, sebelum rekamannya habis.",
    },
    "k-rotation": {
      name: "Penyanyi dan giliran",
      about: "Ketik nama penyanyi dan mulai ketik lagunya; kartu paling atas adalah giliran berikutnya: muat lagunya di deck mana pun dalam kunci yang diminta, masukkan di frasa berikutnya, tandai sudah bernyanyi atau tidak ada. Seret baris untuk mengubah urutan, atau seret rekaman ke panel untuk memintanya.",
    },
    "k-voice": {
      name: "Suara seperti rekamannya, sebagai pemandu, atau dihilangkan",
      about: "Di bawah tiap deck: As recorded, Guide — sedikit suara asli dibiarkan untuk diikuti — atau Out. Lagu yang baru bagi penyanyi ditawarkan dengan vokal pemandu sudah dicentang. Kuncinya bergeser setengah nada setiap kali tanpa mengubah tempo.",
    },
    "k-screen": {
      name: "Layar penyanyi",
      about: "Jendela kedua untuk proyektor atau TV: lirik terhapus saat dinyanyikan, baris berikutnya, hitungan masuk, siapa giliran berikutnya — di atas artwork rekaman atau latar yang dihasilkan.",
    },
    "k-words": {
      name: "Lirik ditemukan, dan diatur waktunya dengan mendengarkan",
      about: "Lirik dari file itu sendiri, .lrc di sebelahnya, atau LRCLIB untuk seluruh koleksi di latar belakang, disimpan untuk malam itu. Lirik tanpa waktu diatur dengan mendengarkan rekamannya, di dalam djmanzo, di mana mesinnya bisa menjalankan model ucapan.",
      caveat: "Mengatur waktu dengan mendengarkan butuh macOS 10.15 atau lebih baru di Mac; lirik yang sudah berwaktu mengikuti lagu di mesin apa pun.",
    },
    "k-visuals": {
      name: "Visual di balik lirik",
      about: "Lapisan milik djmanzo yang mengikuti ketukan, stem, dan mikrofon penyanyi, termasuk preset MilkDrop dan milikmu sendiri, serta foto artis dari Wikimedia Commons, dengan kredit — dipilih di panel Singers.",
    },
    "k-mics": {
      name: "Satu mikrofon untuk tiap penyanyi",
      about: "Rantai per mikrofon dengan preset yang dibuat untuk karaoke — Singer, Stadium, Radio voice, Big echo, Duet — monitor masing-masing di antarmuka dengan output yang cukup, dan duet dengan nama dan baris tiap penyanyi dalam warnanya sendiri.",
    },
    "k-phones": {
      name: "Penyanyi dari ruangan",
      about: "Kode QR memasukkan siapa pun di Wi-Fi ke antrean dengan lagu dari musikmu — tidak ada yang diputar sampai kamu memuatnya — dan, kalau kamu nyalakan, emoji mereka melayang di sudut layar penyanyi.",
    },
    "k-breaks": {
      name: "Musik jeda yang mengarah ke suatu tempat",
      about: "Musik dari playlist pilihanmu selama penyanyi berikutnya bersiap, dipilih untuk mengantar ke lagunya, memudar saat kamu memulainya.",
    },
    "k-presets": {
      name: "Preset malam karaoke",
      about: "Vocals out, Guide vocal, Everyone sings, Down a tone, Down a fourth, Up a tone, Original key, dan Open microphones — limiter menyala dan master sedikit diturunkan, supaya mikrofon punya ruang sebelum berdengung.",
    },
    "k-score": {
      name: "Nyanyian dengan skor, dan ronde tanding",
      about: "Rekaman apa pun di koleksimu bisa diberi skor, melodinya dibaca dari vokal yang dipisahkan; skornya ada di layar penyanyi selama mereka bernyanyi, dengan papan peringkat sesudahnya, per penyanyi dalam duet dan per tim dalam ronde tanding.",
      caveat: "Belum pernah dicoba dengan mikrofon sungguhan di ruangan sungguhan.",
    },
    "k-quiz": {
      name: "Kuis dari rekaman-rekamanmu",
      about: "Ronde yang dibuat dengan aturan dari koleksimu sendiri — tebak judulnya, klip yang dibalik atau dipercepat, stem yang masuk satu per satu, baris yang hilang — dijawab dari ponsel dengan empat tombol masing-masing.",
    },
    "k-range": {
      name: "Jangkauan suara penyanyi, dan kunci untuk bernyanyi",
      about: "Dua puluh detik penyanyi meluncur dari nada rendah ke tinggi, dan djmanzo menyarankan lagu yang cocok dengan suaranya, masing-masing dengan perubahan kunci yang dibutuhkan.",
      caveat: "Belum pernah dicoba dengan mikrofon sungguhan di ruangan sungguhan.",
    },
    "k-guests": {
      name: "Buku tamu, lagu untuk seorang tamu, dan WhatsApp",
      about: "Setiap penyanyi yang tampil dicatat di jurnal malam itu. Dengan persetujuannya, ditanya satu per satu: datanya disimpan, lima belas detik suaranya, dan lagu yang ditulis untuknya oleh penyedia AI-mu — tentang dia, lagu yang dia nyanyikan, dan malam itu — yang dimasukkan djmanzo ke formulir Suno, dan tautan jadinya dikirim ke WhatsApp-nya. Tidak ada yang keluar dari mesin kecuali kamu mengirimnya.",
      caveat: "Suno tidak punya API publik: djmanzo mengisi formulirnya dan kamu yang menekan Create; kamu juga yang menekan kirim di WhatsApp. Menulis liriknya butuh penyedia AI yang diatur di djmanzo.",
    },
    "k-record": {
      name: "Lagu sang penyanyi, direkam untuknya",
      about: "Dengan persetujuan tersendiri, lagunya seperti yang didengar ruangan — mikrofon dan efeknya di atas rekaman — disimpan sebagai file untuk diberikan kepadanya; dan koreksi pitch di mikrofon.",
    },
  },
};

export default w;
