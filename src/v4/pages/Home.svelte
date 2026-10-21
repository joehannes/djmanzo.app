<!--
  The home page, in the order DJ software sites have taught people to read
  one — the promise, proof, the features, the hardware, the community, what
  is new, questions, download — with the music playing through it.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { animate } from "../motion";
  import { art, shared } from "../region.svelte";
  import Hero from "../sections/Hero.svelte";
  import Stems from "../sections/Stems.svelte";
  import Tour from "../sections/Tour.svelte";
  import Feature from "../sections/Feature.svelte";
  import Hardware from "../sections/Hardware.svelte";
  import Live from "../sections/Live.svelte";
  import Faq from "../sections/Faq.svelte";
  import Closing from "../sections/Closing.svelte";
  import Highlights from "../sections/Highlights.svelte";
  import Keys from "../sections/Keys.svelte";
  import Karaoke from "../sections/Karaoke.svelte";

  let root: HTMLElement;
  onMount(() => animate(root));

  const PROOF = [
    { k: "macOS · Linux", v: "Native on both" },
    { k: "Windows", v: "Built, not yet run by a person" },
    { k: "Hobbyist", v: "Free, for ever" },
    { k: "Open", v: "OSC and JSON control, MIDI clock, CLAP" },
    { k: "Beta", v: "Not yet through a real gig" },
  ];
</script>

<div bind:this={root}>
  <Hero />

  <div class="proof" aria-label="At a glance">
    <ul class="wrap">
      {#each PROOF as p (p.k)}
        <li data-reveal><b class="mono">{p.k}</b><span>{p.v}</span></li>
      {/each}
    </ul>
  </div>

  <Highlights />
  <div class="divider wrap" aria-hidden="true"></div>
  <Stems />
  <Tour />
  <div class="divider wrap" aria-hidden="true"></div>
  <Keys />

  <Feature
    id="assistant"
    eyebrow="The assistant"
    title="Suggestions that say why. A mix that runs itself, until you touch it."
    lead="djmanzo ranks what could come next by key, tempo, loudness and phrase, and tells you its reasons. Hand it the night and it mixes; move a fader and it steps back."
    facts={["suggest", "asks", "automix", "autopilot-surface"]}
    image={shared("autopilot")}
    alt="An empty DJ booth at sunrise after a beach party, the decks still lit"
  />

  <div class="divider wrap" aria-hidden="true"></div>
  <Karaoke />
  <div class="divider wrap" aria-hidden="true"></div>

  <Feature
    id="visuals"
    eyebrow="Video and visuals"
    title="Pictures — and lights — that move with the music."
    lead="Video on a deck, crossfading as the sound does; layered looks and MilkDrop presets for the screen behind you; the room's lights on the beat and the phrase; what is playing, shown on your stream."
    facts={["visuals", "lights", "live", "record"]}
    image={shared("visuals")}
    alt="A DJ silhouetted in front of a huge LED wall of flowing liquid visuals"
  />

  <Feature
    id="learn"
    eyebrow="Learn"
    title="A teacher in the software."
    lead="A practice deck only your headphones hear, a coach that names what your hands just did, and a course from the first beatmatch to the first gig."
    facts={["teacher", "curriculum", "knowhow"]}
    image={shared("learn")}
    alt="A DJ teaching a student at a controller in a small studio"
    flip
  />

  <Hardware />

  <section class="crowd" aria-hidden="true">
    <div class="img" data-parallax="0.35" style:background-image={`url(${art("crowd")})`}></div>
  </section>

  <Live />
  <Faq />
  <Closing />
</div>

<style>
  .proof {
    border-block: 1px solid var(--line);
    background: color-mix(in srgb, var(--surface) 55%, var(--bg));
  }
  .proof ul {
    list-style: none;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
  }
  .proof li {
    padding: 22px 16px;
    display: grid;
    gap: 4px;
    border-left: 1px solid var(--line);
  }
  .proof li:first-child {
    border-left: 0;
    padding-left: 0;
  }
  .proof b {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .proof span {
    font-size: 14px;
    color: var(--dim);
  }
  @media (max-width: 900px) {
    .proof ul {
      grid-template-columns: 1fr 1fr;
    }
    .proof li {
      border-left: 0;
      padding-left: 0;
      border-top: 1px solid var(--line);
    }
  }
  .crowd {
    position: relative;
    height: clamp(260px, 42vw, 520px);
    overflow: hidden;
  }
  .crowd .img {
    position: absolute;
    inset: -20% 0;
    background-size: cover;
    background-position: center;
  }
  .crowd::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, var(--bg), transparent 30%, transparent 70%, var(--bg));
  }
</style>
