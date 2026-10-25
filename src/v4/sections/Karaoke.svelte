<!--
  Karaoke, told the way a night runs: before the first singer, while somebody
  sings, between singers, and after their song — every feature from the
  facts (`shared/facts.ts`), each with what is not yet proven. Then the two
  ideas that make a karaoke night with djmanzo different: two decks with a
  playlist each (the singer's song with its voice in, guiding or out; a
  filler deck going round on its own), and the guest's song — from the
  guest book to a song made for them, sent to their WhatsApp.
-->
<script lang="ts">
  import { FACT_BY_ID } from "../../../shared/facts";
  import { tf } from "../i18n/facts.svelte";
  import { skin } from "../region.svelte";
  import { pick } from "../shots";
  import Shot from "./Shot.svelte";
  import { i18n } from "../i18n.svelte";
  import { SECTIONS } from "../i18n/sections";

  const w = $derived(SECTIONS[i18n.lang].karaoke);

  const shot = $derived(pick("karaoke", skin().themes));
  const drawer = $derived(pick("playlist", skin().themes));

  const NIGHT = [
    { id: "before", icon: "M4 6h16M4 12h10M4 18h7", ids: ["k-words", "k-presets", "launcher", "oldmac"] },
    { id: "singing", icon: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3", ids: ["k-rotation", "k-voice", "k-mics", "k-screen", "k-visuals"] },
    { id: "between", icon: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", ids: ["k-breaks", "deckqueue", "k-phones", "requests", "k-quiz"] },
    { id: "after", icon: "M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z", ids: ["k-score", "k-range", "k-record", "k-guests"] },
  ];

</script>

<section class="section karaoke" id="karaoke" aria-labelledby="karaoke-title" data-mic-on-arrival>
  <div class="wrap">
    <div class="intro">
      <div>
        <p class="eyebrow" data-reveal>{w.eyebrow}</p>
        <h2 class="h2" id="karaoke-title" data-split>{@html w.title}</h2>
      </div>
      <p class="lead" data-reveal>{w.lead}</p>
    </div>

    {#if shot}
      <div class="shot" data-reveal>{#key shot.src}<Shot {shot} label={w.eyebrow} />{/key}</div>
    {/if}

    <ol class="night">
      {#each NIGHT as part, i (part.id)}
        <li class="part card" data-reveal style:--i={i}>
          <header>
            <span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d={part.icon} fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
            <h3 class="h3">{w.night[part.id as keyof typeof w.night]}</h3>
          </header>
          <ul>
            {#each part.ids.map((id) => FACT_BY_ID[id]).filter(Boolean).map(tf) as f (f.id)}
              <li data-fact={f.id}>
                <b>{f.name}</b>
                <p>{f.about}</p>
                {#if f.caveat}<p class="caveat">{f.caveat}</p>{/if}
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ol>

    <div class="two">
      <div class="decks card" data-reveal>
        <p class="eyebrow">{w.decksEyebrow}</p>
        <h3 class="h3">{w.decksTitle}</h3>
        <svg class="diagram" viewBox="0 0 520 230" role="img" aria-label={w.diagramAria}>
          <defs>
            <linearGradient id="kg" x1="0" x2="1"><stop offset="0" stop-color="var(--accent)" /><stop offset="1" stop-color="var(--accent-2)" /></linearGradient>
          </defs>
          <g font-family="var(--mono)" font-size="11" fill="var(--dim)">
            <rect x="10" y="20" width="230" height="190" rx="14" fill="none" stroke="var(--line)" />
            <text x="26" y="44" fill="var(--text)" font-size="13" font-weight="700">{w.deck1}</text>
            <text x="26" y="64">{w.singerLine}</text>
            {#each ["As recorded", "Guide", "Out"] as label, i (label)}
              <rect x={26 + i * 70} y="80" width="64" height="26" rx="7" fill={i === 1 ? "url(#kg)" : "none"} stroke={i === 1 ? "none" : "var(--line)"} />
              <text x={58 + i * 70} y="97" text-anchor="middle" fill={i === 1 ? "var(--on-accent)" : "var(--dim)"}>{label}</text>
            {/each}
            {#each ["vocals", "drums", "bass", "other"] as stem, i (stem)}
              <rect x="26" y={122 + i * 20} width={i === 0 ? 40 : 150} height="12" rx="3" fill="var(--accent)" opacity={i === 0 ? 0.35 : 0.75} />
              <text x="230" y={132 + i * 20} text-anchor="end">{stem}</text>
            {/each}
            <rect x="280" y="20" width="230" height="190" rx="14" fill="none" stroke="var(--line)" />
            <text x="296" y="44" fill="var(--text)" font-size="13" font-weight="700">{w.deck2}</text>
            <text x="296" y="64">{w.playlist}</text>
            {#each w.fillers as item, i (item)}
              <text x="296" y={92 + i * 20} fill={i === 1 ? "var(--accent)" : "var(--dim)"}>{i === 1 ? "▶" : "·"} {item}</text>
            {/each}
            <rect x="296" y="174" width="96" height="22" rx="6" fill="none" stroke="var(--accent-2)" />
            <text x="344" y="189" text-anchor="middle" fill="var(--accent-2)">Next when ends</text>
            <rect x="400" y="174" width="60" height="22" rx="6" fill="none" stroke="var(--accent-2)" />
            <text x="430" y="189" text-anchor="middle" fill="var(--accent-2)">Repeat</text>
            <path d="M240 120 C 260 110, 260 110, 280 120" stroke="url(#kg)" stroke-width="2" fill="none" stroke-dasharray="4 4" />
          </g>
        </svg>
        <p class="dim">{@html w.decksText}</p>
      </div>

      <div class="guest card" data-reveal>
        <p class="eyebrow">{w.guestEyebrow}</p>
        <h3 class="h3">{w.guestTitle}</h3>
        <ol class="flow">
          {#each w.flow as s, n (n)}
            <li><span class="n mono">{n + 1}</span><div><b>{s.title}</b><p>{s.text}</p></div></li>
          {/each}
        </ol>
        <p class="caveat">{w.guestCaveat}</p>
      </div>
    </div>

    {#if drawer}
      <div class="drawer" data-reveal>
        <p class="eyebrow">{w.drawer}</p>
        {#key drawer.src}<Shot shot={drawer} label={w.drawerLabel} />{/key}
      </div>
    {/if}

    <p class="more" data-reveal>
      <a href="/features#karaoke">{w.more}</a>
      <a href="https://github.com/joehannes/djmanzo/blob/main/docs/KARAOKE-NIGHT.md" rel="noopener">{w.guide}</a>
    </p>
  </div>
</section>

<style>
  .karaoke {
    background:
      radial-gradient(70% 50% at 85% 10%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%),
      radial-gradient(50% 40% at 0% 60%, color-mix(in srgb, var(--accent-2) 8%, transparent), transparent 70%);
  }
  .intro {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    align-items: end;
  }
  @media (max-width: 900px) {
    .intro {
      grid-template-columns: 1fr;
    }
  }
  .shot {
    margin: 40px 0 56px;
  }
  .night {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    counter-reset: part;
  }
  @media (max-width: 1100px) {
    .night {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 640px) {
    .night {
      grid-template-columns: 1fr;
    }
  }
  .part {
    padding: 20px;
    position: relative;
    border-top: 3px solid color-mix(in srgb, var(--accent) calc(40% + var(--i) * 20%), var(--accent-2));
  }
  .part header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .icon {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    color: var(--accent);
  }
  .part ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 14px;
  }
  .part b {
    font-size: 15px;
  }
  .part p {
    margin: 4px 0 0;
    font-size: 14px;
    color: var(--dim);
  }
  .part .caveat {
    font-size: 12px;
  }
  .two {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 16px;
    margin-top: 16px;
  }
  @media (max-width: 960px) {
    .two {
      grid-template-columns: 1fr;
    }
  }
  .decks,
  .guest {
    padding: clamp(20px, 3vw, 30px);
  }
  .diagram {
    width: 100%;
    height: auto;
    margin: 18px 0 10px;
  }
  .decks .dim :global(b) {
    color: var(--text);
  }
  .flow {
    list-style: none;
    padding: 0;
    margin: 20px 0 14px;
    display: grid;
    gap: 14px;
    position: relative;
  }
  .flow::before {
    content: "";
    position: absolute;
    left: 15px;
    top: 10px;
    bottom: 10px;
    width: 2px;
    background: linear-gradient(var(--accent), var(--accent-2));
    opacity: 0.5;
  }
  .flow li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 14px;
    position: relative;
  }
  .n {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--surface);
    border: 2px solid var(--accent);
    color: var(--accent);
    font-weight: 700;
  }
  .flow p {
    margin: 2px 0 0;
    font-size: 14px;
    color: var(--dim);
  }
  .drawer {
    margin-top: 40px;
  }
  .more {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 32px;
    margin-top: 28px;
  }
  .more a {
    color: var(--accent);
    font-weight: 600;
    text-decoration: none;
  }
</style>
