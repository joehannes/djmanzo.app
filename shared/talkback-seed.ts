/**
 * Talkback's first threads: the questions DJs and karaoke hosts ask on every
 * forum they share, each with the crew's answer, there on the day Talkback
 * opens (the owner, 21 October: "add default answers to default questions in
 * the forums").
 *
 * The shape is what the forums they already use have taught: a welcome and
 * the rules pinned to the top, a beginners' thread where nothing is a silly
 * question (r/DJs' weekly one), a question with its answer marked and shown
 * first (Discourse's "solved"), and threads people find before they ask
 * again. Everything said about djmanzo is said as `shared/facts.ts` says it,
 * caveats included; the rest is the craft, said plainly.
 *
 * `worker/seed.ts` writes these as the crew's posts, each with its answer as
 * the crew's reply, marked as the answer. Editing one here edits it on the
 * site the next time Talkback is read; a thread's id never changes, so its
 * votes and the replies people added stay with it.
 */

export interface SeedThread {
  /** Stable for ever: the post is `crew-<slug>`, its answer `crew-<slug>-a`. */
  slug: string;
  community: string;
  flair: "question" | "guide";
  pinned?: boolean;
  title: string;
  body: string;
  answer: string;
}

export const SEED_THREADS: SeedThread[] = [
  {
    slug: "welcome",
    community: "help",
    flair: "guide",
    pinned: true,
    title: "Welcome to Talkback: how it works",
    body: `Talkback is where people who play records talk: the craft, the music, the gear, the life around the gigs, and djmanzo itself.

**Before you ask, search.** The box at the top finds threads by their words; most questions here have been asked before, and the answer is marked with a tick.

**Flair your post** so people know what it is: *Question*, *Proposal*, *Show & tell* or *Guide*.

**Mark what answered you.** When you asked and a reply solved it, press *This answered it* under that reply. It moves to the top under your question, and the next person finds it at once.`,
    answer: `**How a new account grows in:** for its first days an account posts a few times a day and without links, and its first posts are read before they appear. That keeps spam out without making anyone wait for long. Write a few good replies and the limits lift.

**The rules,** in short: be kind; stay on the subject; no piracy; no promotion of excess; no spam. The full list is under *Rules* on every page.

**Something wrong?** Every post and reply has *Report*. The crew keeps it or removes it, and always says why, to the person who wrote it.

**A wish for djmanzo?** Post it in *Proposals*. The crew carries the best to the wishlist, where everyone votes.`,
  },
  {
    slug: "which-edition",
    community: "help",
    flair: "question",
    pinned: true,
    title: "Which edition of djmanzo do I need?",
    body: "There are seven editions. I mostly mix at home and sometimes play a party. What's the difference, and can I try before paying?",
    answer: `All seven are **one download**: you sign in, and djmanzo shows what your edition carries. What it does not carry appears as a quiet card naming the cheapest edition that has it, never as a pop-up and never while you mix.

- **Hobbyist, free for ever:** two decks, the mixer, the library, cues, loops and pads, the effects, the sampler, recording, the keyboard and a controller. Enough for home and most parties.
- **Karaoke:** the whole karaoke night: the rotation, the singers' screen with words in time, the voice as recorded, as a guide or out, a microphone per singer, break music, scores and the quiz.
- **Apprentice:** the teacher, the practice lab and the course, from beatmatching to the first gig.
- **Auto-Pilot:** a mix that runs itself from a set you assemble, and gives way the moment you touch a control.
- **Pro DJ:** four to six decks, live stems, the assistant, timecode vinyl, mapping any controller, video and lights.
- **Full:** everything. **Custom:** the Hobbyist edition plus the modules you pick, each priced on its own.

**Try any edition free for seven days**, Full included, once per account. When the trial ends without a purchase you are on Hobbyist again, and nothing you made is lost. Prices for your country are on the Pricing page, buy once, monthly or yearly.`,
  },
  {
    slug: "install-linux",
    community: "linux",
    flair: "question",
    title: "Installing djmanzo on Linux: which file, and how does audio work?",
    body: "I'm on Ubuntu with PipeWire. There's a .deb and an AppImage; which one? And do I need JACK?",
    answer: `Either works. The **.deb** installs like any package and updates with it; the **AppImage** runs from wherever you put it, with nothing installed. A numbered release also has an **.rpm** for Fedora and openSUSE.

**Audio:** djmanzo plays through ALSA's default device, which PipeWire serves on any current distribution, so there is nothing to set up. JACK cannot be chosen as the audio host yet.

**Video:** H.264 video on a deck needs your distribution's \`gstreamer1.0-libav\` (that is its name on Debian and Ubuntu).

If it does not start, run it from a terminal and post what it prints here.`,
  },
  {
    slug: "old-mac",
    community: "help",
    flair: "question",
    title: "Will djmanzo run on my old MacBook?",
    body: "I have a 2011 MacBook Pro on High Sierra that I'd love to use as a karaoke machine.",
    answer: `Yes: there is a build for exactly that. **djmanzo Karaoke** for Intel Macs runs back to **macOS 10.13 (High Sierra)** and opens on karaoke. It is the whole application, not a cut-down one.

Two things need **10.15 or later**: timing a song's words by listening to the record, and spoken commands. Words that arrive already timed (from the file, a .lrc beside it, or LRCLIB) follow the song on any machine.

To be honest about it: nobody has yet run it on a 2011 Mac. If you do, tell us here how it went. Newer Macs have their own builds, for Apple silicon and for Intel.`,
  },
  {
    slug: "space-keys",
    community: "help",
    flair: "guide",
    pinned: true,
    title: "What does Space do? The mnemonic keys, explained",
    body: "I pressed Space and a whole menu of letters came up. How is it meant to be used?",
    answer: `Everything you reach for, rather than play, is under **Space**, and a path after it reads as words: \`Space d p\` is **d**eck **p**lay, \`Space o l\` **o**pens the **l**ibrary, \`Space s v\` mutes the **v**ocal **s**tem. You do not need to learn it first: the guide shows every key until your fingers know the way.

- **Space and a sign or a digit** goes somewhere at once: \`Space Space\` finds anything, \`?\` every key, \`/\` searches the library, \`0\` the launcher, \`1\` to \`9\` the activities.
- **Space and a letter** is a group: deck, stems, mixer, record, open a panel, dashboard, view, theme, workspace, preset.
- **Inside a group,** digits say which deck and letters say what; Shift is the other half of a pair (\`o\` docks a panel, \`O\` opens it large).

The keys pressed *without* Space stay the performance keys: hot cues, kills, the crossfader.

**Keyboard sets** add keys for a way of working (karaoke host, scratch, open format, one hand, and one for each edition), on letters djmanzo leaves free. You wear one at a time from the Keys panel. More are in Outboard, and **your own keys** sit over everything and can be saved as a set to share.`,
  },
  {
    slug: "import-library",
    community: "help",
    flair: "question",
    title: "Can I bring my rekordbox / Serato / Traktor library?",
    body: "I have years of cues and beatgrids. Do I have to start again?",
    answer: `No. djmanzo imports **rekordbox, Traktor and iTunes** with their cues and grids, and **Serato** with its crates, hot cues and loops. Hot cue names and colours come across too.

After an import, djmanzo reads each record again for its own analysis (BPM, key on the Camelot wheel, loudness, phrases, where the music starts and stops) and finds duplicates. Your files stay where they are.`,
  },
  {
    slug: "controllers",
    community: "controllers",
    flair: "question",
    pinned: true,
    title: "Which controllers work with djmanzo?",
    body: "Thinking of buying a DDJ-FLX4. Is it supported, and what if mine isn't on the list?",
    answer: `djmanzo ships mappings written from each maker's own MIDI table, browse knob and load buttons included: **Pioneer's DDJ-400 and FLX4 family, DDJ-200, DDJ-SR, CDJ-3000 (in HID mode), Denon MC4000, Hercules Inpulse 300, Numark DJ2GO, Reloop Mixon 4, Roland DJ-707M's deck section**, the **Launchpad Mini MK3** as a pad grid, and a generic two-deck mapping.

To be honest: none has yet been played on the device itself. Each is tested against stand-ins, so if you have one, a report here helps everyone.

**Not on the list?** With the Pro DJ edition, *map any controller*: press a control, choose what it does, save. It handles HID devices and lights, and Lua for what a table cannot say. Mappings can be shared as packs in Outboard.

**No controller at all?** The keyboard is one: the same actions and file format as a MIDI mapping.`,
  },
  {
    slug: "streaming-sources",
    community: "help",
    flair: "question",
    title: "Can I mix from Spotify or YouTube?",
    body: "Most of my music is on Spotify. Can djmanzo play it?",
    answer: `djmanzo can **search** Spotify, YouTube, Jamendo and the Internet Archive and **match a result to a file you already own**. That makes it useful for finding and planning a set.

It cannot mix Spotify or YouTube Music audio, because they do not allow it, and no DJ application may. For playing, you need the files: buy them from a store or a record pool, or from the artists on Bandcamp.`,
  },
  {
    slug: "install-pack",
    community: "outboard",
    flair: "guide",
    pinned: true,
    title: "How do I install a pack from Outboard?",
    body: "Found a keyboard set I like. How does it get into djmanzo?",
    answer: `Two ways:

1. **In djmanzo:** open the Marketplace panel (\`Space o +\`), browse by kind, and press Install. djmanzo checks the pack's signature and every file again before it installs it, and shows you its maker's key.
2. **From this site:** download the \`.djpack\` and open it in Settings → From packs, or add Outboard's index (shown on the Outboard page) under *Browse packs…*.

A **keyboard set** is then among the sets in the Keys panel; wear it there. It sits under your own keys and beside djmanzo's, and takes none of them over. A **theme** or **skin** is worn like djmanzo's own, and **visuals** appear among the looks.

Everything in Outboard is free. A maker may link their Patreon, Ko-fi or similar to say thank you; that is never a lock on a pack.`,
  },
  {
    slug: "report-bug",
    community: "help",
    flair: "question",
    title: "Where do I report a bug or ask for a feature?",
    body: "Something doesn't work as I expected. Where does it go?",
    answer: `**In djmanzo:** the 💬 beside the cogwheel files a problem, a wish or anything else as the project's GitHub issue form, already filled in. The version, your system and your edition are added only while their box is ticked, and you see them first.

**Here:** post in *Help* if you are not sure it is a bug; someone may know the way. Post a wish in *Proposals*: the crew carries the best to the wishlist on this site, where everyone votes.`,
  },
  {
    slug: "privacy",
    community: "help",
    flair: "question",
    title: "Does djmanzo send my music or my room anywhere?",
    body: "It has a camera feature and an AI assistant. What leaves my laptop?",
    answer: `Nothing you did not send.

- **Reading the room** uses a camera and a microphone to say whether the floor is busier or stiller than earlier tonight. No image is recorded, saved or sent.
- **The guest book** keeps a singer's details only with their agreement, asked one question at a time. Nothing leaves the machine unless you send it.
- **The assistant's** suggestions for the next record and the mix are worked out on your machine. Writing words, such as a guest's song, uses an AI provider you set up yourself, and only when you ask.
- **Signing in** tells this site who you are, for your licence. Your library and your sets stay on your machine.`,
  },
  {
    slug: "first-karaoke-night",
    community: "karaoke",
    flair: "guide",
    pinned: true,
    title: "Your first karaoke night with djmanzo, start to finish",
    body: "I'm hosting my first karaoke night next week. What do I set up, and what do I press on the night?",
    answer: `**The hour before:** open the **Karaoke prep** board (\`Space b K\`). Put the singers' screen on the projector or TV: the words are wiped as they are sung, with the next line, a count-in and who is up next. Pick the visuals behind the words in the Singers panel: djmanzo's layers, MilkDrop presets, or the artist's photographs. Choose a **break music** playlist. Then press the **Open microphones** preset: the limiter goes on and the master comes down a little, so a microphone has room before it howls.

**As people arrive:** they scan the QR code and queue a song from *your* music. Nothing plays until you load it. You can also type a name and start typing their song.

**For each singer:** the top card is whoever is next. Load their song on either deck, in the key they asked for, and bring them in on the next phrase. Under the deck, choose **As recorded**, **Guide** (a little of the original voice left in to follow) or **Out**. A song new to the singer is offered with Guide already ticked. Mark them sung, or not here.

**Between singers:** the break music plays, chosen to lead into the next song, and fades out when you start it. Or keep a **filler deck**: a playlist under one deck with *Next when this ends* and *Repeat* ticked, going round with your jingles.

**The keys:** wear the *Karaoke host* keyboard set: \`Space k 1\` puts the next singer on deck 1, \`k b\` brings them in, \`k s\` marks them sung.`,
  },
  {
    slug: "guide-vocal",
    community: "karaoke",
    flair: "question",
    title: "A singer can't keep up without the original voice. What do I do?",
    body: "Some people freeze when the vocal is fully gone. Others want it out completely.",
    answer: `That is what **Guide** is for. Under each deck you choose **As recorded**, **Guide** or **Out**. Guide leaves a little of the original voice in, enough to follow and not enough to hide behind. djmanzo offers Guide already ticked for a song the singer has not sung before.

If the song sits too high or low for them, move the **key a semitone at a time** without changing the tempo. The Karaoke presets *Down a tone*, *Down a fourth*, *Up a tone* and *Original key* do it in one press.

Wearing the *Karaoke host: the whole night* set from Outboard puts all of it on keys: \`Space k g\` guide, \`k r\` as recorded, \`k x\` out.`,
  },
  {
    slug: "lyrics",
    community: "karaoke",
    flair: "question",
    title: "Where do the lyrics come from, and what if they aren't timed?",
    body: "Do I need special karaoke files (CDG), or does it work with normal MP3s?",
    answer: `Normal records work. djmanzo finds the words in three places: **the file itself**, a **.lrc beside it**, or **LRCLIB** for the whole collection, fetched in the background and kept for the night.

Words that come **without times** are timed **by listening to the record**, inside djmanzo, on any machine that can run the speech models. On a Mac that needs macOS 10.15 or later. Words that arrive already timed follow the song anywhere.

The vocal is taken out by separating the record into stems, so you do not need instrumental versions.`,
  },
  {
    slug: "guest-song",
    community: "karaoke",
    flair: "question",
    title: "How does the song for a guest work, and the WhatsApp part?",
    body: "I saw djmanzo can make a song for someone who sang tonight and send it to them. How does that actually work?",
    answer: `Every singer who sang is written into the night's **guest book**. With their agreement, asked one question at a time, you keep their details and **fifteen seconds of their voice**.

Then *A song for …*: your AI provider writes the words **about them, the song they sang, and the night (the event, the place, the date)**, in the song's language and in theirs. A style line blends their favourite genre with the night's music. Nothing is phrased as "in the style of" anyone: the song is theirs, not a copy.

*Fill in Suno's form* opens Suno in a window of djmanzo's own with the words and style filled in. You check them and press **Create** yourself: Suno has no public API and its terms forbid robots, so djmanzo never presses it. When you open the finished song, its link comes back to the card, and *WhatsApp* opens the chat with the guest, the message and link written. **You press send**, and only to a guest who agreed to be contacted.

Writing the words needs an AI provider set up in djmanzo. Their song as the room heard it can also be recorded and given to them as a file, with its own agreement.`,
  },
  {
    slug: "between-singers",
    community: "karaoke",
    flair: "question",
    title: "How do I keep music going between singers?",
    body: "The silence while the next person finds the stage kills the room.",
    answer: `Two ways, and many hosts use both.

**Break music:** choose a playlist in the Singers panel. While the next singer gets ready, it plays music chosen to lead into their song, and fades out when you start it.

**A filler deck:** every deck has its own playlist drawer. Put your jingles, loops and fillers in one and tick **Next when this ends** and **Repeat** (and **Shuffle**, if you like). That deck then goes round by itself while the other deck does the work.`,
  },
  {
    slug: "phones",
    community: "karaoke",
    flair: "question",
    title: "Can singers use their phones?",
    body: "Can people sign up from their phones, or even sing into them?",
    answer: `**Signing up, yes.** A QR code puts anyone on the Wi-Fi into the queue with a song from your music. Nothing plays until you load it. When you turn it on, their emoji float in the corner of the singers' screen. Phones are also how people answer the **quiz**: rounds made from your own records, four buttons each.

**Singing into them, not yet.** Phones as microphones are still to come. For now each singer gets a real microphone, with its own chain and karaoke presets: Singer, Stadium, Radio voice, Big echo and Duet.`,
  },
  {
    slug: "long-blend",
    community: "mixing",
    flair: "guide",
    pinned: true,
    title: "The long blend, step by step",
    body: "How do house and techno DJs get two records playing together for a minute without it turning to mud?",
    answer: `The rule: **two basslines never play at full together.**

1. **Match the tempo and land the new record on a phrase.** Count in 8- or 16-bar blocks; start the incoming record so its first downbeat falls on the outgoing record's next phrase. djmanzo marks phrases on the waveform, and loops and jumps can lock to them.
2. **Bring it in with its bass out.** Low EQ on the incoming record fully down, then raise the fader. Only its highs and mids join at first.
3. **Swap the bass on a phrase.** On the downbeat of the next phrase, the outgoing bass goes down as the incoming bass comes up, in one movement.
4. **Take the outgoing record away slowly:** mids, then highs, then the fader, over another phrase or two. A filter sweep can do the last part.
5. **Loop to buy time** if the outgoing record ends before you are ready. An eight- or sixteen-bar loop on its last clean section holds it there.

The *Underground: long blends* keyboard set in Outboard puts the current deck's bass, mids and highs on one letter each (\`Space u b\`, \`u m\`, \`u h\`; Shift brings them back), with long loops and jumps beside them.`,
  },
  {
    slug: "sync-or-ear",
    community: "phrasing",
    flair: "question",
    title: "Sync or beatmatch by ear?",
    body: "Is using SYNC cheating? Should I learn by ear first?",
    answer: `SYNC is a tool, not cheating: it frees your hands for EQ, effects and choosing the next record. But **learn by ear as well.** Grids are sometimes wrong, live-played records drift, and a booth may hand you equipment you did not choose.

To learn: put the incoming record in your headphones, match the tempo with the pitch fader until the kicks stop drifting apart, then nudge the platter or jog wheel to line them up. Listen for the "galloping" of two kicks slightly apart.

The Apprentice course has a lesson for this, and it checks **beatmatching by ear from the two tempos**: SYNC does not count. The practice deck only your headphones hear is there for exactly this.`,
  },
  {
    slug: "camelot",
    community: "harmonic",
    flair: "question",
    title: "What is the Camelot wheel, and does djmanzo show keys?",
    body: "People talk about 8A and 9B. What does it mean?",
    answer: `The Camelot wheel numbers the 24 keys around a clock, **1 to 12**, with **A for minor** and **B for major**. Records whose keys sit next to each other on the wheel mix without clashing:

- the **same** number and letter (8A to 8A);
- **one step** either way (8A to 7A or 9A);
- across to the **other letter** at the same number (8A to 8B).

djmanzo reads every record's key and shows it on the wheel with the compatible keys beside it, and the assistant's suggestions rank by key among other things. **Keylock** holds a record's key while you change its tempo. You can also move a deck's key a semitone at a time to make two records fit.

Break the rule whenever it sounds good: a drum-led intro has no key to clash.`,
  },
  {
    slug: "bachata-merengue",
    community: "latin",
    flair: "guide",
    pinned: true,
    title: "From bachata at 125 to merengue at 150 without the chipmunk",
    body: "Latin nights jump all over the tempo map. How do you get from one style to the next without wrecking the record?",
    answer: `**Do not try to pitch 25 BPM.** Even with keylock, a record pushed 20% sounds wrong. The Latin floor expects a change of style, so make the change a moment:

- **Cut on the phrase.** Let the bachata finish its phrase and drop the merengue on the one. A clean cut is a style on these floors, not a mistake.
- **Echo out.** Put an echo on the outgoing record's last beat, pull its fader, and the new record lands in the tail.
- **Use a bridge.** A salsa or a cumbia at a tempo between the two takes the floor up in two steps.
- **Double-time thinking.** Some dembow and reggaeton sit at half or double the felt tempo of what comes next; count the felt beat, not the number.

For the moves that *do* want the pitch: a wide pitch range with **keylock** on keeps a record in key while it climbs, and records played by people rather than machines drift, so **tap the grid** in when it slides.

The *Noche latina* keyboard set in Outboard puts these on \`Space n\`: \`n w\` wide range, \`n k\` keylock, \`n t\` taps the grid, \`n j\` jumps past a long intro.`,
  },
  {
    slug: "timecode",
    community: "scratch",
    flair: "question",
    title: "Can I scratch with real turntables (timecode vinyl)?",
    body: "I have two Technics and a mixer. Do I need Serato records?",
    answer: `djmanzo drives a deck from real turntables, **relative or absolute**, and it writes **its own control signal**, so no licensed record is needed: you cut the signal to vinyl or play it from a CD.

To be honest: it has not yet been run against a pressed record. If you try it, post what you find here.

For the cuts themselves: set the crossfader curve to **sharp**, put the decks on their sides, and use the censor, a backspin and a short roll. The *Cuts and scratch* keyboard set in Outboard has them all on \`Space c\`.`,
  },
  {
    slug: "beginners",
    community: "first-gigs",
    flair: "question",
    pinned: true,
    title: "Beginners: ask anything here",
    body: "No question is too small in this thread. How do I start? What do I practise first? What gear do I actually need?",
    answer: `A good order to learn in:

1. **Your music first.** Know thirty records you love well: where they start, where the vocal comes in, where they end.
2. **Gain and levels.** Keep every channel out of the red; match loudness with the trim, not the fader.
3. **Counting.** Most dance records move in 8-bar phrases. Learn to hear where one begins.
4. **Beatmatching** by ear, then with sync (see the thread *Sync or beatmatch by ear?*).
5. **One transition, done well.** A long blend or a clean cut on the phrase, again and again.
6. **Reading people.** Play for the room in front of you, not for your playlist.

**Gear:** headphones that close around your ears, and anything to mix on. A laptop keyboard is a controller in djmanzo; a two-deck controller comes later. The Hobbyist edition is free, and the Apprentice course walks you from the decks to the first gig.

Reply below with your question. Someone will answer it.`,
  },
  {
    slug: "gain-limiter",
    community: "sound",
    flair: "guide",
    title: "Gain staging, the limiter, and the SAFE button",
    body: "My mixes sound loud at home and distorted on the venue's PA. What am I doing wrong?",
    answer: `Almost always: **too much level, too early in the chain.**

- **Trim (gain) first.** Set each channel so its meter peaks just under the top, before the fader. Then the fader is for mixing, not for loudness.
- **Leave the master alone** at a sensible level, and let the venue's engineer set the room's volume on their desk.
- **The booth monitor** is for you: turn it down before you turn the master up.
- **The limiter** catches peaks; it is not a volume knob. With microphones open, put it on (the Karaoke preset *Open microphones* does, and brings the master down a little).

When everything goes wrong at once (a stuck effect, a filter you forgot), djmanzo's **SAFE** button in the top bar takes every control back, clears every effect and flattens the tone, in one press.`,
  },
  {
    slug: "earplugs",
    community: "hearing",
    flair: "guide",
    pinned: true,
    title: "Protect your ears: you only get one pair",
    body: "After a long night my ears ring. Is that normal?",
    answer: `Ringing after a night is your ears telling you they were damaged, and that damage adds up over years. Tinnitus is the most common injury in this job.

- **Wear earplugs that lower every frequency evenly** ("flat" or "musician's" plugs). The music sounds the same, only quieter, so you can still mix. Custom-moulded ones last for years.
- **Keep the booth monitor as low as you can work with.** Most DJs run it far louder than they need to.
- **Headphones on one ear, at the level of the room, not above it.**
- **Take breaks** in a quiet place during long sets, and give your ears a quiet day after a loud one.

If the ringing lasts more than a day, see a doctor.`,
  },
  {
    slug: "linux-latency",
    community: "linux",
    flair: "question",
    title: "Latency and dropouts on Linux",
    body: "Sometimes I hear crackles when I load a track. How do I tune it?",
    answer: `djmanzo plays through ALSA's default device, which PipeWire serves. Its own audio thread never allocates, locks, reads files or waits; loading, decoding and analysing all happen on other threads. Crackles usually come from the system around it:

- **Raise PipeWire's quantum** (its buffer) for the session, for example \`pw-metadata -n settings 0 clock.force-quantum 512\`, and lower it again until the crackles return.
- **Use the performance CPU governor** while you play.
- **Close what fights for the disk and the CPU:** sync clients, indexers, browsers with many tabs.
- **Use a USB audio interface** rather than the laptop's own output, if you have one.

JACK cannot be chosen as the audio host yet.`,
  },
  {
    slug: "lights",
    community: "lighting",
    flair: "question",
    title: "Can djmanzo drive my lights?",
    body: "I have a few DMX pars. Can the lights follow the music without a lighting desk?",
    answer: `Yes, over **Art-Net or sACN**. djmanzo sends **one universe** in one of **five channel layouts**, following the beat, the phrase and how hard the music is going: **pulse**, **chase**, **wash**, and an **auto** look that changes only at a phrase. There is **no strobe**.

You need an Art-Net or sACN node between the network and your lights. USB DMX interfaces, moving heads and more than one universe are planned. To be honest: it has not yet been tried on real lights.

The *Lights and screens* keyboard set in Outboard puts the lights, video, camera and the Live board on \`Space i\`.`,
  },
  {
    slug: "wedding-prep",
    community: "preparing",
    flair: "guide",
    pinned: true,
    title: "Preparing a wedding: the checklist",
    body: "First wedding booking. What should I prepare and what should I bring?",
    answer: `**Weeks before:** meet the couple. Get the **must-play** and **do-not-play** lists, the first dance, the entrances, the cake, the last song, and the timings. Ask who speaks and when, and whether they need your microphone.

**In djmanzo:** keep the booking as an **event**, with its steps and the night's **set plan** as an arc: dinner, the first dance, the floor, the last song. Requests can come from the room by **QR code**, most-wanted first, so you decide what fits.

**On the night:**
- the **limiter** on, a rented PA is never yours to blow;
- the **automix** for dinner, while you eat and talk to the venue;
- **record the set**, for the couple and for you;
- a **spare cable** for everything, and a second way to play music if the laptop dies.

The *Weddings and parties* keyboard set in Outboard puts the microphone, the automix, the requests, the plan and SAFE on \`Space q\`.`,
  },
];
