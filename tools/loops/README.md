# The deck's music

The site's deck plays a loop for each of fifteen genres, each taken apart
into drums, bass and the rest, so a visitor can switch parts off and on as
djmanzo does with a record. The music was made for this site; nobody's
recording is in it. A genre without a loop plays the synthesiser's sketch
(`src/lib/audio/engine.ts`).

## How it was made

1. **Generated** with [ACE-Step 1.5](https://github.com/ace-step/ACE-Step-1.5)
   **XL** (MIT licence; its authors say its output may be used commercially
   and that it was trained on licensed, royalty-free and synthetic music).
   Each genre's caption, tempo, key, length and seed are in `jobs.json`;
   `generate.py` is the script that ran them, with the XL turbo diffusion
   model (`ACE-Step/acestep-v15-xl-turbo`, about 5 billion parameters, 8
   steps; its weights are published in 32-bit and were converted to
   bfloat16 as they downloaded, 10 GB) and the 0.6B planning model, on four
   CPU cores in bfloat16: four to seventeen minutes per 40-second track
   (more when the CPU is shared), at most about 8 GB of memory. ACE-Step
   stops a diffusion run at ten minutes; `ACESTEP_GENERATION_TIMEOUT=3600`
   gives a CPU the hour it may need. Instrumentals only. The first cut, on
   25 October, used the 2B turbo model; on 26 October the owner asked for
   the XL one. ACE-Step rates its XL turbo and XL SFT models alike for
   quality; SFT takes 50 steps with guidance (a dozen times the work) where
   turbo takes 8, which on a CPU decided it. A re-upload of the XL SFT
   model on Hugging Face (SynapseMusicV12-XL-SFT) carries ACE-Step's own
   model card; the official repository was used instead.
2. **Taken apart** with [Demucs](https://github.com/adefossez/demucs)
   v4.1.0, `htdemucs_ft` (MIT licence), into drums, bass, other and vocals;
   other and vocals are kept together as "the rest".
3. **Looped** by `make_loops.py`: the bar length, within 4 % of the tempo
   asked, at which the onsets line up best with themselves one to eight bars
   later (searched to a twentieth of a millisecond), the beat's phase, the
   loudest 8 or 16 whole bars
   clear of the track's first and last three seconds, the beat refined there
   by a straight line through the drum hits on the loop's own beats, and a
   30 ms equal-power crossfade at the loop's end into what led up to its
   start. Each stem
   is written as the loop with a quarter of a second of its own end before
   it and of its own start after it, so the file is periodic around the
   loop and a decoder's priming never reaches the seam; AAC at 192 kbit/s,
   44.1 kHz stereo. Beside the stems, `peaks.json` holds the loop's waveform
   (each stem, and each stem's low, mid and high bands, 100 points a
   second) so the site draws what it plays.

```
python -I generate.py jobs.json masters/ path/to/ACE-Step-1.5   # ACE_DIT=acestep-v15-xl-turbo USE_LM=1 ACESTEP_CPU_BF16=1 ACESTEP_GENERATION_TIMEOUT=3600
python -I make_loops.py jobs.json masters/ public/v4/loops/
cp public/v4/loops/index.json src/v4/loops/index.json
```

The site discloses the music's making beside the deck ("Music made for
djmanzo with ACE-Step 1.5; its parts separated with Demucs"), as ACE-Step
asks of its users.

**How well the loops join themselves.** A loop that is a whole number of
true bars joins itself wherever it starts, so what is measured is the bar:
the drums' onsets compared with themselves one bar later, inside the loop.
On 25 October all fifteen line up within 1.5 ms a bar (salsa within 2.2 ms,
measured with a window narrower than its half-beat percussion). The first
cut used a straight line through tracked beats instead, which was 1.2 % to
2 % out on techno, bachata and cumbia (whose seams were most of a beat
out) and on salsa and merengue; those five were cut again. ACE-Step does
not always keep the tempo asked: techno came out at 130 (132 asked),
house at 125 (124), cumbia at 97.5 (96), afrobeats at 113 (110).
`make_loops.py` keeps each master's separation beside it (`stems.npy`), so
cutting again needs no second hour of Demucs.

**31 October: the beat on the drum hits, the fade at the end.** Four
generated tracks (polynesian, electroswing, hardstyle, country) kept
missing at the join by 18 to 37 ms against under 11 ms inside. Their tempo
was steady (in 16 s windows across each master, within 0.03 %), so drift
was not it. A straight line through the drums' hits over each loop's own
beats showed hardstyle's and country's loops 7 and 14 ms short: the
self-likeness above is right to a few hundredths of a percent, and over 16
bars that shows at the join. The cut now refines the beat on the hits,
where most beats have one and the line stays within 0.2 % of the estimate.
And the seam's fade sat at the loop's start, mixing its first downbeat with
what followed the loop: where a new section began there, every repeat
started on a kick faded in from nothing. The fade is now at the loop's end,
into what led up to its start. Hardstyle's join went from 23.5 to 4.6 ms
(inside, 4 to 6 ms) and it was added; electroswing's join matches what the
beat tracker misses inside the loop on that swing (36 against 35 ms), its
length within 5 ms of its hits, and it was added. Polynesian (21 ms against
8) and country (16 ms against 11) still miss at the join although their
lengths now match their hits, and stay out. The loops already on the site
were not cut again.

Nothing here can say whether it *sounds* right: it was measured (tempo,
loudness, no clipping) and listened to by the owner, who chose to use it.
