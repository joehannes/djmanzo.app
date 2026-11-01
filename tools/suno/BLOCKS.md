# Suno blocks: the deck's loops, ten to a song

Each block is one song in Suno's own song mode (Create → Custom). It has three boxes:

- **Style**: the block's first box. Under 200 characters, so it fits on every model.
- **Lyrics**: the block's second box. Only bracketed tags, so nothing in it is sung: each loop's time, genre, BPM and key, then what it is made of.
  If switching **Instrumental** on hides the Lyrics box, leave it off; the tags and the Exclude line keep it instrumental.
- **Exclude styles**, the same for every block: `vocals, singing, rap, spoken word, choir, humming, intro, fade-in, fade-out, outro, silence`

Leave **BPM** on Auto and **Key** on Any where the screen has them: each loop asks for its own.
Download the better of the two as WAV under the name given.

Every loop is 21 seconds: loop *k* runs from 21·(k−1) s, so ten make 3:30. Genres follow one another by tempo, so
a song rises a few BPM at a time. `./cut-blocks.sh <folder>` cuts each loop by arithmetic: the most whole bars
(4 below about 115 BPM, 8 from there) that leave a bar clear of the cut on either side. `SLOT` and `OFFSET` move
the grid if Suno's loops came out longer or later; the script says so when a song's length is off.

## medley01.wav · 10 loops × 21 s = 3:30 · 90 to 100 BPM

| Loop | Time | Genre | BPM | Key | Cut | Saved as |
|---|---|---|---|---|---|---|
| 1 | 0:00–0:21 | Boom-bap | 90 | E minor | 4 bars, 10.67 s | `hiphop.wav` |
| 2 | 0:21–0:42 | Island reggae | 90 | G major | 4 bars, 10.67 s | `islandreggae.wav` |
| 3 | 0:42–1:03 | Kizomba | 90 | A minor | 4 bars, 10.67 s | `kizomba.wav` |
| 4 | 1:03–1:24 | R&B | 90 | Bb minor | 4 bars, 10.67 s | `rnb.wav` |
| 5 | 1:24–1:45 | Reggaeton | 94 | G minor | 4 bars, 10.21 s | `reggaeton.wav` |
| 6 | 1:45–2:06 | Cumbia | 96 | A minor | 4 bars, 10.00 s | `cumbia.wav` |
| 7 | 2:06–2:27 | Dancehall | 96 | D minor | 4 bars, 10.00 s | `dancehall.wav` |
| 8 | 2:27–2:48 | Lounge | 96 | D major | 4 bars, 10.00 s | `lounge.wav` |
| 9 | 2:48–3:09 | Bhangra | 100 | G major | 4 bars, 9.60 s | `bhangra.wav` |
| 10 | 3:09–3:30 | Khaleeji | 100 | C minor | 4 bars, 9.60 s | `khaleeji.wav` |

**Style** (168 characters)

```
instrumental DJ loop medley, 90 to 100 BPM, ten loops of exactly 21 seconds, a new genre every 21 seconds as tagged, hard cuts, full groove at once, no vocals, club mix
```

**Lyrics** (1225 characters)

```
[Instrumental]
[Loop 1 · 0:00–0:21 · Boom-bap · 90 BPM · E minor]
[dusty swung kick and snare, vinyl crackle, jazzy chops, upright bass]
[Loop 2 · 0:21–0:42 · Island reggae · 90 BPM · G major]
[one-drop drums, offbeat guitar skank, organ bubble, deep round bass]
[Loop 3 · 0:42–1:03 · Kizomba · 90 BPM · A minor]
[slow sensual kick and rimshot pattern, rolling synth bass, soft warm pads]
[Loop 4 · 1:03–1:24 · R&B · 90 BPM · Bb minor]
[laid-back swung drums, finger snaps, warm Rhodes chords, sub bass]
[Loop 5 · 1:24–1:45 · Reggaeton · 94 BPM · G minor]
[dembow kick-snare pattern, 808 bass, plucked synth, clean percussion]
[Loop 6 · 1:45–2:06 · Cumbia · 96 BPM · A minor]
[güira scraper, tambora and congas, accordion riff, bass on one and three]
[Loop 7 · 2:06–2:27 · Dancehall · 96 BPM · D minor]
[digital riddim, syncopated kick, rimshots, deep sub bass, steel pan stab]
[Loop 8 · 2:27–2:48 · Lounge · 96 BPM · D major]
[brushed drums, soft bossa groove, Rhodes and vibraphone, upright bass]
[Loop 9 · 2:48–3:09 · Bhangra · 100 BPM · G major]
[dhol chaal rhythm, tumbi riff, punchy kick, deep bass]
[Loop 10 · 3:09–3:30 · Khaleeji · 100 BPM · C minor]
[Gulf hand-clap patterns, tabl and daf, oud riff, deep bass]
[End]
```

## medley02.wav · 10 loops × 21 s = 3:30 · 104 to 118 BPM

| Loop | Time | Genre | BPM | Key | Cut | Saved as |
|---|---|---|---|---|---|---|
| 1 | 0:00–0:21 | Samba batucada | 104 | D major | 4 bars, 9.23 s | `samba.wav` |
| 2 | 0:21–0:42 | Tamil kuthu | 105 | C minor | 4 bars, 9.14 s | `kuthu.wav` |
| 3 | 0:42–1:03 | Raï | 105 | D minor | 4 bars, 9.14 s | `rai.wav` |
| 4 | 1:03–1:24 | Afrobeats | 110 | F minor | 4 bars, 8.73 s | `afrobeats.wav` |
| 5 | 1:24–1:45 | Tropical house | 110 | C major | 4 bars, 8.73 s | `tropicalhouse.wav` |
| 6 | 1:45–2:06 | Amapiano | 112 | F minor | 4 bars, 8.57 s | `amapiano.wav` |
| 7 | 2:06–2:27 | City pop | 112 | D major | 4 bars, 8.57 s | `citypop.wav` |
| 8 | 2:27–2:48 | Country line dance | 118 | G major | 8 bars, 16.27 s | `country.wav` |
| 9 | 2:48–3:09 | Disco | 118 | A minor | 8 bars, 16.27 s | `disco.wav` |
| 10 | 3:09–3:30 | Gnawa | 118 | D minor | 8 bars, 16.27 s | `gnawa.wav` |

**Style** (169 characters)

```
instrumental DJ loop medley, 104 to 118 BPM, ten loops of exactly 21 seconds, a new genre every 21 seconds as tagged, hard cuts, full groove at once, no vocals, club mix
```

**Lyrics** (1212 characters)

```
[Instrumental]
[Loop 1 · 0:00–0:21 · Samba batucada · 104 BPM · D major]
[surdo bass drums, repinique calls, tamborim, caixa snare, apito whistle]
[Loop 2 · 0:21–0:42 · Tamil kuthu · 105 BPM · C minor]
[thappu drum pattern, nadaswaram-style synth lead, heavy kick]
[Loop 3 · 0:42–1:03 · Raï · 105 BPM · D minor]
[Algerian drum machine groove, darbuka, synth accordion lead, bass]
[Loop 4 · 1:03–1:24 · Afrobeats · 110 BPM · F minor]
[shakers, syncopated kick, highlife guitar licks, bouncy bass]
[Loop 5 · 1:24–1:45 · Tropical house · 110 BPM · C major]
[soft four-on-the-floor, marimba pluck, pan flute, warm bass]
[Loop 6 · 1:45–2:06 · Amapiano · 112 BPM · F minor]
[log drum bass hits, shakers, jazzy piano chords, wide pads]
[Loop 7 · 2:06–2:27 · City pop · 112 BPM · D major]
[funky live drums, slap bass, electric piano, brass stabs]
[Loop 8 · 2:27–2:48 · Country line dance · 118 BPM · G major]
[stomp and clap, twangy electric guitar, banjo, fiddle, bass]
[Loop 9 · 2:48–3:09 · Disco · 118 BPM · A minor]
[four-on-the-floor, open hi-hats, octave bass, funky guitar, string stabs]
[Loop 10 · 3:09–3:30 · Gnawa · 118 BPM · D minor]
[qraqeb metal castanets, guembri bass riff, hand claps, steady kick]
[End]
```

## medley03.wav · 10 loops × 21 s = 3:30 · 118 to 124 BPM

| Loop | Time | Genre | BPM | Key | Cut | Saved as |
|---|---|---|---|---|---|---|
| 1 | 0:00–0:21 | Highlife | 118 | G major | 8 bars, 16.27 s | `highlife.wav` |
| 2 | 0:21–0:42 | Oriental house | 118 | A minor | 8 bars, 16.27 s | `orientalhouse.wav` |
| 3 | 0:42–1:03 | Bollywood | 120 | A minor | 8 bars, 16.00 s | `bollywood.wav` |
| 4 | 1:03–1:24 | Turkish halay | 120 | A minor | 8 bars, 16.00 s | `halay.wav` |
| 5 | 1:24–1:45 | Italo disco | 120 | D minor | 8 bars, 16.00 s | `italodisco.wav` |
| 6 | 1:45–2:06 | Kompa | 120 | C major | 8 bars, 16.00 s | `kompa.wav` |
| 7 | 2:06–2:27 | Pop | 120 | G major | 8 bars, 16.00 s | `pop.wav` |
| 8 | 2:27–2:48 | Afro house | 122 | A minor | 8 bars, 15.74 s | `afrohouse.wav` |
| 9 | 2:48–3:09 | Electro swing | 124 | Bb major | 8 bars, 15.48 s | `electroswing.wav` |
| 10 | 3:09–3:30 | Deep house | 124 | A minor | 8 bars, 15.48 s | `house.wav` |

**Style** (169 characters)

```
instrumental DJ loop medley, 118 to 124 BPM, ten loops of exactly 21 seconds, a new genre every 21 seconds as tagged, hard cuts, full groove at once, no vocals, club mix
```

**Lyrics** (1210 characters)

```
[Instrumental]
[Loop 1 · 0:00–0:21 · Highlife · 118 BPM · G major]
[bright interlocking guitars, bell pattern, congas, walking bass]
[Loop 2 · 0:21–0:42 · Oriental house · 118 BPM · A minor]
[four-on-the-floor, darbuka, oud and qanun riff, Arabic-scale synth]
[Loop 3 · 0:42–1:03 · Bollywood · 120 BPM · A minor]
[dholak and tabla over a club kick, strings hook, synth bass]
[Loop 4 · 1:03–1:24 · Turkish halay · 120 BPM · A minor]
[davul drum, zurna lead in Hicaz, hand claps, stomping line-dance beat]
[Loop 5 · 1:24–1:45 · Italo disco · 120 BPM · D minor]
[drum machine, arpeggiated synth bass, glossy synth leads]
[Loop 6 · 1:45–2:06 · Kompa · 120 BPM · C major]
[kompa drum pattern with ride cymbal, guitar arpeggio, synth horns, round bass]
[Loop 7 · 2:06–2:27 · Pop · 120 BPM · G major]
[punchy drums, claps, bright synth chords, bass]
[Loop 8 · 2:27–2:48 · Afro house · 122 BPM · A minor]
[tribal percussion, congas, shakers, hypnotic bass, kalimba motif]
[Loop 9 · 2:48–3:09 · Electro swing · 124 BPM · Bb major]
[swing horns and clarinet, walking upright bass, house kick and hats]
[Loop 10 · 3:09–3:30 · Deep house · 124 BPM · A minor]
[four-on-the-floor, open hats, rolling bass, warm chords]
[End]
```

## medley04.wav · 10 loops × 21 s = 3:30 · 124 to 128 BPM

| Loop | Time | Genre | BPM | Key | Cut | Saved as |
|---|---|---|---|---|---|---|
| 1 | 0:00–0:21 | K-pop | 124 | C minor | 8 bars, 15.48 s | `kpop.wav` |
| 2 | 0:21–0:42 | Rock | 124 | E minor | 8 bars, 15.48 s | `rock.wav` |
| 3 | 0:42–1:03 | Dembow | 125 | C minor | 8 bars, 15.36 s | `dembow.wav` |
| 4 | 1:03–1:24 | Gqom | 126 | E minor | 8 bars, 15.24 s | `gqom.wav` |
| 5 | 1:24–1:45 | Tech house | 126 | G minor | 8 bars, 15.24 s | `techhouse.wav` |
| 6 | 1:45–2:06 | Dabke | 128 | G minor | 8 bars, 15.00 s | `dabke.wav` |
| 7 | 2:06–2:27 | Big-room EDM | 128 | F minor | 8 bars, 15.00 s | `edm.wav` |
| 8 | 2:27–2:48 | Garba | 128 | C major | 8 bars, 15.00 s | `garba.wav` |
| 9 | 2:48–3:09 | Melbourne bounce | 128 | F minor | 8 bars, 15.00 s | `melbournebounce.wav` |
| 10 | 3:09–3:30 | Polynesian fire dance | 128 | D minor | 8 bars, 15.00 s | `polynesian.wav` |

**Style** (169 characters)

```
instrumental DJ loop medley, 124 to 128 BPM, ten loops of exactly 21 seconds, a new genre every 21 seconds as tagged, hard cuts, full groove at once, no vocals, club mix
```

**Lyrics** (1180 characters)

```
[Instrumental]
[Loop 1 · 0:00–0:21 · K-pop · 124 BPM · C minor]
[tight punchy drums, synth bass, bright synth hooks]
[Loop 2 · 0:21–0:42 · Rock · 124 BPM · E minor]
[live drum kit, driving distorted guitars, bass guitar]
[Loop 3 · 0:42–1:03 · Dembow · 125 BPM · C minor]
[fast dembow drum loop, syncopated bass, percussion]
[Loop 4 · 1:03–1:24 · Gqom · 126 BPM · E minor]
[dark broken kick pattern, heavy toms, sparse percussion, booming sub]
[Loop 5 · 1:24–1:45 · Tech house · 126 BPM · G minor]
[tight four-on-the-floor kick, shuffled hi-hats, rolling groovy bassline, percussive stabs]
[Loop 6 · 1:45–2:06 · Dabke · 128 BPM · G minor]
[tabl and darbuka, mijwiz-style synth lead, stomping kick]
[Loop 7 · 2:06–2:27 · Big-room EDM · 128 BPM · F minor]
[pounding kick, claps, supersaw chords, plucky lead]
[Loop 8 · 2:27–2:48 · Garba · 128 BPM · C major]
[dhol and dandiya stick clicks over a kick, shehnai-style synth lead]
[Loop 9 · 2:48–3:09 · Melbourne bounce · 128 BPM · F minor]
[bouncy offbeat bass, four-on-the-floor, short lead stabs]
[Loop 10 · 3:09–3:30 · Polynesian fire dance · 128 BPM · D minor]
[fast pate and toere log drums, deep rumbling bass, modern kick]
[End]
```

## medley05.wav · 10 loops × 21 s = 3:30 · 130 to 138 BPM

| Loop | Time | Genre | BPM | Key | Cut | Saved as |
|---|---|---|---|---|---|---|
| 1 | 0:00–0:21 | Bachata | 130 | E minor | 8 bars, 14.77 s | `bachata.wav` |
| 2 | 0:21–0:42 | Baile funk | 130 | E minor | 8 bars, 14.77 s | `baile.wav` |
| 3 | 0:42–1:03 | Mahraganat | 130 | E minor | 8 bars, 14.77 s | `mahraganat.wav` |
| 4 | 1:03–1:24 | Drift phonk | 130 | D minor | 8 bars, 14.77 s | `phonk.wav` |
| 5 | 1:24–1:45 | Dangdut | 132 | A minor | 8 bars, 14.55 s | `dangdut.wav` |
| 6 | 1:45–2:06 | Techno | 132 | F minor | 8 bars, 14.55 s | `techno.wav` |
| 7 | 2:06–2:27 | UK garage | 132 | F minor | 8 bars, 14.55 s | `ukgarage.wav` |
| 8 | 2:27–2:48 | Kuduro | 135 | G minor | 8 bars, 14.22 s | `kuduro.wav` |
| 9 | 2:48–3:09 | Mor lam | 135 | A minor | 8 bars, 14.22 s | `molam.wav` |
| 10 | 3:09–3:30 | Trance | 138 | A minor | 8 bars, 13.91 s | `trance.wav` |

**Style** (169 characters)

```
instrumental DJ loop medley, 130 to 138 BPM, ten loops of exactly 21 seconds, a new genre every 21 seconds as tagged, hard cuts, full groove at once, no vocals, club mix
```

**Lyrics** (1215 characters)

```
[Instrumental]
[Loop 1 · 0:00–0:21 · Bachata · 130 BPM · E minor]
[bongos and güira, requinto guitar arpeggios, syncopated bass guitar]
[Loop 2 · 0:21–0:42 · Baile funk · 130 BPM · E minor]
[tamborzão drum pattern, 808 bass, percussive chops]
[Loop 3 · 0:42–1:03 · Mahraganat · 130 BPM · E minor]
[electro-shaabi drums, darbuka rolls, synth lead, heavy bass]
[Loop 4 · 1:03–1:24 · Drift phonk · 130 BPM · D minor]
[distorted cowbell melody, heavy distorted 808, punchy kick, Memphis-style hi-hats]
[Loop 5 · 1:24–1:45 · Dangdut · 132 BPM · A minor]
[koplo kendang groove, suling bamboo flute riff, deep bass, organ stabs]
[Loop 6 · 1:45–2:06 · Techno · 132 BPM · F minor]
[driving four-on-the-floor, rumbling kick, hypnotic synth stabs]
[Loop 7 · 2:06–2:27 · UK garage · 132 BPM · F minor]
[2-step shuffled drums, chopped organ stabs, warped sub bass]
[Loop 8 · 2:27–2:48 · Kuduro · 135 BPM · G minor]
[fast Angolan percussion, tight kick and snare rolls, synth stabs, bass]
[Loop 9 · 2:48–3:09 · Mor lam · 135 BPM · A minor]
[khaen mouth-organ riff, phin lute, fast folk drums over a dance kick]
[Loop 10 · 3:09–3:30 · Trance · 138 BPM · A minor]
[four-on-the-floor, rolling offbeat bass, supersaw arpeggios]
[End]
```

## medley06.wav · 10 loops × 21 s = 3:30 · 140 to 170 BPM

| Loop | Time | Genre | BPM | Key | Cut | Saved as |
|---|---|---|---|---|---|---|
| 1 | 0:00–0:21 | Chiptune | 140 | C major | 8 bars, 13.71 s | `chiptune.wav` |
| 2 | 0:21–0:42 | Jersey club | 140 | F minor | 8 bars, 13.71 s | `jerseyclub.wav` |
| 3 | 0:42–1:03 | Trap | 140 | C minor | 8 bars, 13.71 s | `trap.wav` |
| 4 | 1:03–1:24 | Goa trance | 142 | E minor | 8 bars, 13.52 s | `goa.wav` |
| 5 | 1:24–1:45 | Future bass | 150 | F major | 8 bars, 12.80 s | `futurebass.wav` |
| 6 | 1:45–2:06 | Hardstyle | 150 | A minor | 8 bars, 12.80 s | `hardstyle.wav` |
| 7 | 2:06–2:27 | Merengue | 150 | C major | 8 bars, 12.80 s | `merengue.wav` |
| 8 | 2:27–2:48 | Eurobeat | 155 | B minor | 8 bars, 12.39 s | `eurobeat.wav` |
| 9 | 2:48–3:09 | Soca | 156 | D major | 8 bars, 12.31 s | `soca.wav` |
| 10 | 3:09–3:30 | Asian underground | 170 | E minor | 8 bars, 11.29 s | `asianunderground.wav` |

**Style** (169 characters)

```
instrumental DJ loop medley, 140 to 170 BPM, ten loops of exactly 21 seconds, a new genre every 21 seconds as tagged, hard cuts, full groove at once, no vocals, club mix
```

**Lyrics** (1149 characters)

```
[Instrumental]
[Loop 1 · 0:00–0:21 · Chiptune · 140 BPM · C major]
[8-bit square-wave leads, arpeggios, noise-channel drums]
[Loop 2 · 0:21–0:42 · Jersey club · 140 BPM · F minor]
[kick triplet pattern, bed-squeak sound, chopped stabs]
[Loop 3 · 0:42–1:03 · Trap · 140 BPM · C minor]
[half-time booming kick and 808, rapid hi-hat rolls, dark bells]
[Loop 4 · 1:03–1:24 · Goa trance · 142 BPM · E minor]
[galloping offbeat bass, acid 303 lines, psychedelic leads]
[Loop 5 · 1:24–1:45 · Future bass · 150 BPM · F major]
[half-time drums, wobbly supersaw chords, chopped synths]
[Loop 6 · 1:45–2:06 · Hardstyle · 150 BPM · A minor]
[distorted reverse-bass kick, euphoric screeching lead]
[Loop 7 · 2:06–2:27 · Merengue · 150 BPM · C major]
[tambora and güira, fast piano montuno, saxophone riff, bass]
[Loop 8 · 2:27–2:48 · Eurobeat · 155 BPM · B minor]
[fast octave synth bass, driving kick, synth brass lead]
[Loop 9 · 2:48–3:09 · Soca · 156 BPM · D major]
[driving soca rhythm, iron brake-drum percussion, horn stabs, bass]
[Loop 10 · 3:09–3:30 · Asian underground · 170 BPM · E minor]
[tabla breaks over drum and bass, sitar drone, deep bass]
[End]
```

## medley07.wav · 3 loops × 21 s = 1:03 · 170 to 180 BPM

| Loop | Time | Genre | BPM | Key | Cut | Saved as |
|---|---|---|---|---|---|---|
| 1 | 0:00–0:21 | Funkot | 170 | A minor | 8 bars, 11.29 s | `funkot.wav` |
| 2 | 0:21–0:42 | Drum and bass | 174 | D minor | 8 bars, 11.03 s | `dnb.wav` |
| 3 | 0:42–1:03 | Salsa | 180 | A minor | 8 bars, 10.67 s | `salsa.wav` |

**Style** (171 characters)

```
instrumental DJ loop medley, 170 to 180 BPM, three loops of exactly 21 seconds, a new genre every 21 seconds as tagged, hard cuts, full groove at once, no vocals, club mix
```

**Lyrics** (334 characters)

```
[Instrumental]
[Loop 1 · 0:00–0:21 · Funkot · 170 BPM · A minor]
[rapid house kick, slap bass, funky synth stabs]
[Loop 2 · 0:21–0:42 · Drum and bass · 174 BPM · D minor]
[fast breakbeat, rolling reese bass]
[Loop 3 · 0:42–1:03 · Salsa · 180 BPM · A minor]
[clave, congas and timbales, piano montuno, brass section, tumbao bass]
[End]
```
