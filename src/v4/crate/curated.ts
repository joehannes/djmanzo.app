/**
 * Curated YouTube videos per genre: real, popular, well-known tracks that
 * represent each scene. These are the starting point — a DJ can search for
 * more, but these are what the crate opens with.
 */

export type Era = "80s" | "90s" | "00s" | "10s" | "current" | "evergreen";

export interface CrateTrack {
  id: string;
  title: string;
  artist: string;
  era: Era;
  genres: string[];
}

export const CURATED: CrateTrack[] = [
  // Techno
  { id: "K7t5dJXyOQY", title: "The Bells", artist: "Planetary Assault Systems", era: "90s", genres: ["techno"] },
  { id: "b3jF2vDgU6A", title: "Spastik", artist: "Plastikman", era: "90s", genres: ["techno"] },
  { id: "VnMfGQfnFGA", title: "Sundown", artist: "Mind Against", era: "10s", genres: ["techno", "techhouse"] },
  { id: "lWA2pjMjpBs", title: "Cola", artist: "CamelPhat & Elderbrook", era: "current", genres: ["techno", "house", "techhouse"] },
  // House
  { id: "rRmNMHkIInw", title: "French Kiss", artist: "Lil Louis", era: "80s", genres: ["house"] },
  { id: "u8HVW0pNIFA", title: "Show Me Love", artist: "Robin S", era: "90s", genres: ["house"] },
  { id: "UB7eTjwrzFo", title: "Finally", artist: "CeCe Peniston", era: "90s", genres: ["house", "disco"] },
  { id: "eORqFaf_quM", title: "One More Time", artist: "Daft Punk", era: "00s", genres: ["house", "disco", "pop"] },
  { id: "mNEUkkoUoIA", title: "Levels", artist: "Avicii", era: "10s", genres: ["house", "edm"] },
  // Drum & Bass
  { id: "KrVTxVkGkdg", title: "Inner City Life", artist: "Goldie", era: "90s", genres: ["dnb"] },
  { id: "pDiNBfKxXzk", title: "Brown Paper Bag", artist: "Ronny Size / Reprazent", era: "90s", genres: ["dnb"] },
  { id: "PEn1Z9hdGBo", title: "Tarantula", artist: "Pendulum", era: "00s", genres: ["dnb"] },
  { id: "dMMuhS00JlQ", title: "Afterglow", artist: "Wilkinson", era: "10s", genres: ["dnb"] },
  // Trance
  { id: "rtOqBOTxXVE", title: "Children", artist: "Robert Miles", era: "90s", genres: ["trance"] },
  { id: "yw9nGNr_PEo", title: "Adagio for Strings", artist: "Tiësto", era: "00s", genres: ["trance"] },
  // Merengue
  { id: "iJ2fPIGhG7o", title: "La Bilirrubina", artist: "Juan Luis Guerra", era: "90s", genres: ["merengue"] },
  { id: "H3FWfMBbwfQ", title: "El Costo de la Vida", artist: "Juan Luis Guerra", era: "90s", genres: ["merengue"] },
  { id: "KLyGGVR6f0Y", title: "Abusadora", artist: "Wilfrido Vargas", era: "80s", genres: ["merengue"] },
  // Bachata
  { id: "rxpDecmVdkw", title: "Obsesión", artist: "Aventura", era: "00s", genres: ["bachata"] },
  { id: "ldPxmaCkfZE", title: "Propuesta Indecente", artist: "Romeo Santos", era: "10s", genres: ["bachata"] },
  { id: "P7FIr0U4MYw", title: "Bachata Rosa", artist: "Juan Luis Guerra", era: "90s", genres: ["bachata"] },
  // Salsa
  { id: "gc0bZlIHVGQ", title: "Vivir Mi Vida", artist: "Marc Anthony", era: "10s", genres: ["salsa"] },
  { id: "j5C9WfOdGAI", title: "La Vida Es Un Carnaval", artist: "Celia Cruz", era: "90s", genres: ["salsa"] },
  { id: "X_rB7YLBTxo", title: "Pedro Navaja", artist: "Rubén Blades", era: "80s", genres: ["salsa"] },
  // Reggaeton
  { id: "CC_KocXcdIE", title: "Gasolina", artist: "Daddy Yankee", era: "00s", genres: ["reggaeton"] },
  { id: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", era: "current", genres: ["reggaeton", "pop"] },
  { id: "osP17bAB-PY", title: "Danza Kuduro", artist: "Don Omar ft. Lucenzo", era: "10s", genres: ["reggaeton"] },
  { id: "NGLxoKOvzu4", title: "Pepas", artist: "Farruko", era: "current", genres: ["reggaeton", "edm"] },
  // Cumbia
  { id: "X_xG-SkBijM", title: "La Pollera Colorá", artist: "Wilson Choperena", era: "evergreen", genres: ["cumbia"] },
  { id: "v1EYI8wFHbk", title: "Cumbia Sampuesana", artist: "Aniceto Molina", era: "evergreen", genres: ["cumbia"] },
  { id: "hH3bOlqBMho", title: "La Cumbia De Los Aburridos", artist: "Los Ángeles Azules", era: "90s", genres: ["cumbia"] },
  // Hip-hop
  { id: "r34_owTWBUQ", title: "Juicy", artist: "The Notorious B.I.G.", era: "90s", genres: ["hiphop"] },
  { id: "hT_nvWreIhg", title: "N.Y. State of Mind", artist: "Nas", era: "90s", genres: ["hiphop"] },
  { id: "C0DPdykrJOE", title: "Ms. Fat Booty", artist: "Mos Def", era: "90s", genres: ["hiphop"] },
  { id: "fRh_vgS2dFE", title: "HUMBLE.", artist: "Kendrick Lamar", era: "current", genres: ["hiphop"] },
  // Afrobeats
  { id: "fBkbl5JfXdg", title: "Essence", artist: "Wizkid ft. Tems", era: "current", genres: ["afrobeats"] },
  { id: "jGflUbPqfW8", title: "Ye", artist: "Burna Boy", era: "current", genres: ["afrobeats"] },
  // Amapiano
  { id: "k3Th2FVAlXA", title: "Mnike", artist: "Tyler ICU & Tumelo.za", era: "current", genres: ["amapiano", "afrobeats"] },
  { id: "aR1JcqbFDFg", title: "Adiwele", artist: "Kabza De Small & DJ Maphorisa", era: "current", genres: ["amapiano"] },
  // K-pop
  { id: "gdZLi9oWNZg", title: "Dynamite", artist: "BTS", era: "current", genres: ["kpop", "pop"] },
  { id: "32si5cfrCNc", title: "How You Like That", artist: "BLACKPINK", era: "current", genres: ["kpop"] },
  { id: "CO7ELNWj2E0", title: "Gangnam Style", artist: "PSY", era: "10s", genres: ["kpop", "pop"] },
  // Disco & Funk
  { id: "GCdwKhTtNNw", title: "Le Freak", artist: "Chic", era: "80s", genres: ["disco"] },
  { id: "s-cW1tFgmBk", title: "Superstition", artist: "Stevie Wonder", era: "80s", genres: ["disco", "pop"] },
  { id: "ZRYtwaknlgA", title: "Stayin' Alive", artist: "Bee Gees", era: "80s", genres: ["disco"] },
  // Pop & Rock
  { id: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody", artist: "Queen", era: "evergreen", genres: ["pop", "rock"] },
  { id: "OPf0YbXqDm0", title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", era: "current", genres: ["pop", "disco"] },
  { id: "hTWKbfoikeg", title: "Smells Like Teen Spirit", artist: "Nirvana", era: "90s", genres: ["rock", "pop"] },
  // Dancehall
  { id: "dPI-mRFEIH0", title: "Temperature", artist: "Sean Paul", era: "00s", genres: ["dancehall"] },
  { id: "Wmc8bQoL-J0", title: "No No No", artist: "Shabba Ranks", era: "90s", genres: ["dancehall"] },
  // UK Garage
  { id: "YR5Ap_YxkEA", title: "Flowers", artist: "Sweet Female Attitude", era: "00s", genres: ["ukgarage"] },
  { id: "qN4ooNx77u0", title: "Moving Too Fast", artist: "Artful Dodger & Romina Johnson", era: "00s", genres: ["ukgarage"] },
  // EDM
  { id: "IcrbM1l_BoI", title: "Animals", artist: "Martin Garrix", era: "10s", genres: ["edm"] },
  { id: "ScMzIvxBSi4", title: "Clarity", artist: "Zedd ft. Foxes", era: "10s", genres: ["edm", "pop"] },
  // Kompa
  { id: "R2d2LfCbjdI", title: "Sweet Micky", artist: "Michel Martelly", era: "evergreen", genres: ["kompa"] },
  // Samba
  { id: "bVLcKOaeFso", title: "Mas Que Nada", artist: "Sergio Mendes", era: "evergreen", genres: ["samba"] },
  { id: "4cFkRHPMiag", title: "Aquarela do Brasil", artist: "João Gilberto", era: "evergreen", genres: ["samba"] },
  // Kizomba
  { id: "Hx6tR6VTsbA", title: "Kizomba Mix", artist: "Anselmo Ralph", era: "10s", genres: ["kizomba"] },
  // Halay
  { id: "v4MfbFOfGJU", title: "Halay Düğün", artist: "Traditional", era: "evergreen", genres: ["halay"] },
  // Dangdut
  { id: "Z2sVuEfLjEk", title: "Koplo Hot", artist: "Via Vallen", era: "current", genres: ["dangdut"] },
  // Phonk
  { id: "b5h9kWpOaHM", title: "Metamorphosis", artist: "Interworld", era: "current", genres: ["phonk"] },
  // Electro Swing
  { id: "lYBUbBu4W08", title: "All Night", artist: "Parov Stelar", era: "10s", genres: ["electroswing"] },
  // Christian / Gospel / Worship
  { id: "WRbG67MfKjg", title: "Oceans (Where Feet May Fail)", artist: "Hillsong United", era: "10s", genres: ["christian", "worship"] },
  { id: "EiL_yBqPvJw", title: "What A Beautiful Name", artist: "Hillsong Worship", era: "current", genres: ["christian", "worship"] },
  { id: "dQVEjNnGcRQ", title: "Reckless Love", artist: "Cory Asbury", era: "current", genres: ["christian", "worship"] },
  { id: "Zbnr3oGBXUk", title: "Good Good Father", artist: "Chris Tomlin", era: "10s", genres: ["christian", "worship"] },
  { id: "4wrS9tr2Uas", title: "10,000 Reasons (Bless the Lord)", artist: "Matt Redman", era: "10s", genres: ["christian", "worship"] },
  { id: "DkMzOFAMnVg", title: "Amazing Grace (My Chains Are Gone)", artist: "Chris Tomlin", era: "00s", genres: ["christian", "worship"] },
  { id: "hFSPHkfCj5M", title: "How Great Is Our God", artist: "Chris Tomlin", era: "00s", genres: ["christian", "worship"] },
  { id: "Jx6y3VKjP2I", title: "Mighty to Save", artist: "Hillsong Worship", era: "00s", genres: ["christian", "worship"] },
  { id: "aX2OXDaJMpg", title: "This Is Amazing Grace", artist: "Phil Wickham", era: "10s", genres: ["christian", "worship"] },
  { id: "GQp6bEfYdIo", title: "Great Are You Lord", artist: "All Sons & Daughters", era: "10s", genres: ["christian", "worship"] },
  { id: "mNbAFj1IJUs", title: "King of Kings", artist: "Hillsong Worship", era: "current", genres: ["christian", "worship"] },
  { id: "K4hXzEFs-CA", title: "Way Maker", artist: "Sinach", era: "current", genres: ["christian", "gospel", "worship"] },
  { id: "PdkL9xsM7A0", title: "Yes I Will", artist: "Vertical Worship", era: "current", genres: ["christian", "worship"] },
  { id: "X5RpDfnyZuE", title: "Break Every Chain", artist: "Tasha Cobbs Leonard", era: "10s", genres: ["christian", "gospel"] },
  { id: "7V-eYMTfbnk", title: "Total Praise", artist: "Richard Smallwood", era: "evergreen", genres: ["christian", "gospel"] },
  { id: "kYtPU18Jq-o", title: "Alabaster Heart", artist: "David Crowder", era: "current", genres: ["christian", "worship"] },
];

export const ERAS: Era[] = ["80s", "90s", "00s", "10s", "current", "evergreen"];

export const ERA_LABELS: Record<string, Record<Era, string>> = {
  en: { "80s": "80s", "90s": "90s", "00s": "00s", "10s": "10s", current: "Now", evergreen: "Classics" },
  es: { "80s": "80s", "90s": "90s", "00s": "00s", "10s": "10s", current: "Ahora", evergreen: "Clásicos" },
  pt: { "80s": "80s", "90s": "90s", "00s": "00s", "10s": "10s", current: "Agora", evergreen: "Clássicos" },
  de: { "80s": "80er", "90s": "90er", "00s": "00er", "10s": "10er", current: "Aktuell", evergreen: "Klassiker" },
  fr: { "80s": "Années 80", "90s": "Années 90", "00s": "Années 00", "10s": "Années 10", current: "Maintenant", evergreen: "Classiques" },
  it: { "80s": "Anni 80", "90s": "Anni 90", "00s": "Anni 00", "10s": "Anni 10", current: "Ora", evergreen: "Classici" },
  ja: { "80s": "80年代", "90s": "90年代", "00s": "00年代", "10s": "10年代", current: "最新", evergreen: "定番" },
};