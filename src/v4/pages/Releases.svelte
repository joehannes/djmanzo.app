<!--
  Release notes: what changed in djmanzo, version by version, in the
  visitor's language. Every commit to djmanzo is a version with notes in the
  seven languages this site speaks (its `contracts/release-notes.json`,
  `/api/release-notes`): a feature is a minor version, built for every
  system, drawn like a record with a Download beside it; a fix or a step on
  the way is a patch, a smaller line the next build carries. Read like a
  tracklist, newest first.
-->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import { animate } from "../motion";
  import { shared } from "../region.svelte";
  import { LANG_INFO, i18n, t } from "../i18n.svelte";
  import { RELEASES } from "../download";

  type Lang = keyof typeof LANG_INFO;
  interface Note {
    version: string;
    date: string;
    built: boolean;
    title: Partial<Record<Lang, string>>;
    notes: Partial<Record<Lang, string[]>>;
  }

  let root: HTMLElement;
  let list = $state<Note[] | null>(null);
  let failed = $state(false);

  /** The visitor's language where the notes have it, English where they do not. */
  const title = (n: Note) => n.title[i18n.lang] ?? n.title.en ?? "";
  const lines = (n: Note) => n.notes[i18n.lang] ?? n.notes.en ?? [];
  const when = (d: string) => {
    try {
      return new Intl.DateTimeFormat(LANG_INFO[i18n.lang].tag, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`));
    } catch {
      return d;
    }
  };

  onMount(() => {
    const undo = animate(root);
    fetch("/api/release-notes")
      // A refusal's body is read too: one left unread holds the request open.
      .then(async (r) => (r.ok ? (r.json() as Promise<Note[]>) : Promise.reject(new Error(`${r.status} ${await r.text()}`))))
      .then(async (r) => {
        list = r;
        // A link to one version (`/releases#v0.50.0`) lands on it once it is drawn.
        await tick();
        if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
      })
      .catch(() => ((failed = true), (list = [])));
    return undo;
  });
</script>

<div class="releases" bind:this={root} data-releases>
  <header class="head">
    <div class="bg" aria-hidden="true" style:background-image={`url(${shared("download")})`}></div>
    <div class="wrap">
      <p class="eyebrow">{t("notes.eyebrow")}</p>
      <h1 class="h1">{t("notes.title")}</h1>
      <p class="lead">{t("notes.lead")}</p>
    </div>
  </header>

  <div class="wrap">
    {#if list === null}
      <p class="dim">{t("dl.fetching")}</p>
    {:else if failed}
      <p class="dim" data-notes-error>{t("notes.unfetched")}</p>
    {:else if !list.length}
      <p class="dim">{t("notes.none")}</p>
    {:else}
      <ol class="tracks">
        {#each list as n (n.version)}
          <li class="track" class:built={n.built} id={`v${n.version}`} data-version={n.version}>
            <div class="side">
              {#if n.built}
                <svg class="disc" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" /><circle cx="20" cy="20" r="13" class="groove" /><circle cx="20" cy="20" r="6" class="label" /><circle cx="20" cy="20" r="1.4" class="hole" /></svg>
              {/if}
              <a class="mono ver" href={`#v${n.version}`}>v{n.version}</a>
              <time class="mono dim" datetime={n.date}>{when(n.date)}</time>
            </div>
            <div class="body">
              <p class="kind" class:on={n.built}>{n.built ? t("notes.built") : t("notes.patch")}{#if n.built}{" · "}<a href={RELEASES}>{t("notes.download")}</a>{/if}</p>
              <h2 class="h3">{title(n)}</h2>
              <ul>
                {#each lines(n) as line, i (i)}
                  <li>{line}</li>
                {/each}
              </ul>
            </div>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
</div>

<style>
  .head {
    position: relative;
    padding: calc(var(--bar) + 64px) 0 36px;
    overflow: hidden;
    isolation: isolate;
  }
  .bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    background-size: cover;
    background-position: center;
    opacity: 0.18;
    mask-image: linear-gradient(to bottom, black, transparent);
  }
  .lead {
    max-width: 60ch;
  }
  .tracks {
    list-style: none;
    margin: 12px 0 96px;
    padding: 0;
    display: grid;
    gap: 14px;
  }
  .track {
    display: grid;
    grid-template-columns: 170px 1fr;
    gap: 24px;
    padding: 18px 20px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: color-mix(in srgb, var(--surface) 70%, transparent);
    scroll-margin-top: calc(var(--bar) + 16px);
  }
  .track.built {
    border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 12%, transparent);
  }
  .side {
    display: grid;
    align-content: start;
    gap: 4px;
  }
  .disc {
    width: 40px;
    height: 40px;
    margin-bottom: 6px;
    fill: #0b0b0d;
    stroke: color-mix(in srgb, var(--text) 18%, transparent);
  }
  .disc .groove {
    fill: none;
  }
  .disc .label {
    fill: var(--accent);
    stroke: none;
  }
  .disc .hole {
    fill: var(--bg);
    stroke: none;
  }
  .track.built:hover .disc {
    animation: spin 1.8s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .track.built:hover .disc {
      animation: none;
    }
  }
  .ver {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    text-decoration: none;
  }
  .track:not(.built) .ver {
    font-size: 15px;
    font-weight: 500;
  }
  time {
    font-size: 12px;
  }
  .kind {
    margin: 0 0 6px;
    font: 500 12px/1.4 var(--mono);
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .kind.on {
    color: var(--accent);
  }
  .body h2 {
    margin: 0 0 10px;
  }
  .body ul {
    margin: 0;
    padding-left: 1.1em;
    display: grid;
    gap: 6px;
    color: color-mix(in srgb, var(--text) 86%, transparent);
    line-height: 1.55;
  }
  @media (max-width: 720px) {
    .track {
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .side {
      grid-auto-flow: column;
      justify-content: start;
      align-items: center;
      gap: 12px;
    }
    .disc {
      margin: 0;
      width: 28px;
      height: 28px;
    }
  }
</style>
