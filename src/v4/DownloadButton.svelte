<!--
  The main Download button: one press downloads the chosen system's default
  file (Linux .deb, Windows installer, macOS for Apple silicon) from the
  newest release; the arrow opens every file for that system, and a switch
  to another system. The bar's system menu sets the system and calls this
  button to attention: it glows and pulses for a moment.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { DEFAULT_KIND, SYSTEMS, SYSTEM_NAME, filesFor, latest, sizeOf, type File, type Latest, type System } from "./download";
  import { choice, start } from "./dlchoice.svelte";
  import { gsap, reduced } from "./motion";
  import OsIcon from "./OsIcon.svelte";

  let { id = undefined }: { id?: string } = $props();

  let release = $state<(Latest & { error?: string }) | null>(null);
  let open = $state(false);
  let root: HTMLElement;
  let main: HTMLElement;

  const mine = $derived(release ? filesFor(release.files, choice.os) : []);
  const best = $derived(mine.find((f) => f.key === DEFAULT_KIND[choice.os]) ?? mine[0] ?? null);
  /** A file's kind in a few words, for the button: ".deb", "Apple silicon". */
  const short = (f: File) => f.label.replace(/^(macOS|Linux|Windows)(,\s*)?/, "").replace(/\s*\(.*\)$/, "") || f.name;

  /** A file: downloaded. None (the list not fetched, or nothing for this system): the menu, which says why. */
  function get(f: File | null) {
    open = !f;
    if (f) location.assign(f.href);
  }

  function setSystem(os: System) {
    choice.os = os;
  }

  // Called to attention by the bar's system menu. The click that chose the
  // system is still on its way up when the menu opens: it must not close it.
  let seen = 0;
  let openedAt = 0;
  $effect(() => {
    const n = choice.pulse;
    // Only a call made just now: a button shown later does not answer an old one.
    if (!n || n === seen || !main || performance.now() - n > 2500) return;
    seen = n;
    open = true;
    openedAt = performance.now();
    if (reduced()) return;
    gsap.fromTo(
      main,
      { boxShadow: "0 0 0 0 color-mix(in srgb, var(--accent) 70%, transparent)", scale: 1 },
      { boxShadow: "0 0 0 18px color-mix(in srgb, var(--accent) 0%, transparent)", scale: 1.06, duration: 0.7, ease: "power2.out", repeat: 3, yoyo: true },
    );
  });

  onMount(() => {
    start();
    void latest().then((r) => (release = r));
    const close = (e: MouseEvent) => {
      if (open && e.timeStamp > openedAt && !root.contains(e.target as Node)) open = false;
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && (open = false);
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    };
  });
</script>

<div class="split" {id} bind:this={root} data-download-button data-os={choice.os}>
  <div class="face" bind:this={main}>
    <button class="btn primary go" onclick={() => get(best)} data-download-default={best?.key ?? ""}>
      <OsIcon os={choice.os} size={18} />
      <span>Download for {SYSTEM_NAME[choice.os]}{#if best}<span class="kind">{short(best)}</span>{/if}</span>
    </button>
    <button class="btn primary caret" aria-haspopup="menu" aria-expanded={open} aria-label="Every file, and other systems" onclick={() => (open = !open)} data-download-more>
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
    </button>
  </div>
  {#if open}
    <div class="menu card" role="menu" aria-label="Downloads">
      <div class="systems" role="group" aria-label="System">
        {#each SYSTEMS as os (os)}
          <button role="menuitemradio" aria-checked={choice.os === os} class:on={choice.os === os} onclick={() => setSystem(os)} data-system={os} data-sound="scratch">
            <OsIcon {os} size={15} /> {SYSTEM_NAME[os]}
          </button>
        {/each}
      </div>
      {#if mine.length}
        <ul>
          {#each mine as f (f.key)}
            <li>
              <button role="menuitem" class="file" onclick={() => get(f)} data-download-kind={f.key} data-sound>
                <span>{short(f)}{#if f.key === DEFAULT_KIND[choice.os]}<span class="tag">default</span>{/if}</span>
                <span class="mono dim">{sizeOf(f.size)}</span>
              </button>
            </li>
          {/each}
        </ul>
        {#if release?.version}<p class="ver mono dim">v{release.version}, the newest release</p>{/if}
      {:else if release?.error}
        <p class="dim small">The download list could not be fetched just now. Try again in a minute.</p>
      {:else if release}
        <p class="dim small">The newest release has nothing for {SYSTEM_NAME[choice.os]} yet.</p>
      {:else}
        <p class="dim small">Fetching…</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .split {
    position: relative;
    display: inline-block;
  }
  .split:has(.menu) {
    z-index: 60;
  }
  .face {
    display: inline-flex;
    border-radius: 12px;
  }
  .go {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .kind {
    margin-left: 8px;
    padding: 1px 8px;
    border-radius: 99px;
    background: color-mix(in srgb, var(--bg) 22%, transparent);
    font-size: 0.8em;
    font-weight: 600;
  }
  .caret {
    padding-inline: 12px;
    border-left: 1px solid color-mix(in srgb, var(--bg) 35%, transparent);
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .menu {
    position: absolute;
    z-index: 60;
    /* The look's surface over the page's own colour: solid, whatever the look. */
    background: linear-gradient(var(--surface), var(--surface)), var(--bg);
    backdrop-filter: blur(18px) saturate(0.6);
    box-shadow: 0 24px 60px rgb(0 0 0 / 0.55);
    top: calc(100% + 8px);
    left: 0;
    width: min(340px, calc(100vw - 32px));
    padding: 10px;
    display: grid;
    gap: 8px;
  }
  .systems {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    padding: 3px;
    border: 1px solid var(--line);
    border-radius: 10px;
  }
  .systems button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 4px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--text);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  .systems button.on {
    background: var(--accent);
    color: var(--bg);
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2px;
  }
  .file {
    width: 100%;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding: 9px 10px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--text);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .file:hover,
  .file:focus-visible {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
  }
  .tag {
    margin-left: 8px;
    padding: 0 7px;
    border-radius: 99px;
    border: 1px solid var(--accent);
    color: var(--accent);
    font-size: 11px;
  }
  .ver {
    margin: 2px 4px 0;
    font-size: 12px;
  }
</style>
