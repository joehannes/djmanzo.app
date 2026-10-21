<!--
  The mnemonic keys, tried here: a sketch of the guide djmanzo opens on
  Space, from the tree and the sets it really has (`keys.ts`). Press keys or
  the chips; Backspace goes back a step, Escape closes. Wearing a keyboard
  set lays its keys over djmanzo's on letters they leave free — the sketch
  marks them — so a set adds keys and never takes one away.
-->
<script lang="ts">
  import { BUILTIN_SETS, TREE, wear, type KeyNode, type KeySet } from "../keys";
  import FactList from "./FactList.svelte";
  import Shot from "./Shot.svelte";
  import { skin } from "../region.svelte";
  import { pick } from "../shots";

  const panel = $derived(pick("mykeys", skin().themes));

  let { sets = BUILTIN_SETS }: { sets?: KeySet[] } = $props();

  let worn = $state<KeySet | null>(null);
  let path = $state<string[]>([]);
  let open = $state(true);
  let last = $state<string | null>(null);
  let pad: HTMLElement | undefined = $state();

  const tree = $derived(wear(TREE, worn));
  const level = $derived.by(() => {
    let nodes = tree;
    for (const k of path) nodes = nodes.find((n) => n.key === k)?.children ?? [];
    return nodes;
  });

  function press(node: KeyNode) {
    if (node.children) {
      path = [...path, node.key];
      last = null;
    } else {
      last = `Space ${[...path, node.key].join(" ")} — ${node.label}`;
      path = [];
      open = false;
    }
  }

  function key(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!open) {
      if (e.key === " ") {
        e.preventDefault();
        open = true;
        path = [];
        last = null;
      }
      return;
    }
    if (e.key === "Escape") {
      open = false;
      path = [];
    } else if (e.key === "Backspace") {
      path = path.slice(0, -1);
    } else {
      const k = e.key === " " ? "space" : e.key;
      const hit = level.find((n) => n.key === k);
      if (hit) press(hit);
    }
    e.preventDefault();
  }

  function start() {
    open = true;
    path = [];
    last = null;
    pad?.focus();
  }

  function choose(s: KeySet | null) {
    worn = worn?.id === s?.id ? null : s;
    path = [];
    open = true;
    pad?.focus();
  }
</script>

<section class="section keys" id="keys" aria-labelledby="keys-title">
  <div class="wrap grid">
    <div class="copy">
      <p class="eyebrow" data-reveal>Your hands</p>
      <h2 class="h2" id="keys-title" data-reveal>Keys that read as words.</h2>
      <p class="lead" data-reveal>
        Press <kbd>Space</kbd> and djmanzo shows every key. <kbd>d</kbd> <kbd>1</kbd> <kbd>p</kbd> is <b>d</b>eck <b>1</b> <b>p</b>lay; <kbd>o</kbd> <kbd>i</kbd> opens the s<b>i</b>ngers. Nothing to memorise first: the guide is there until your fingers know the way.
      </p>
      <p class="dim" data-reveal>
        A <b>keyboard set</b> adds keys for one way of working — a karaoke host's rotation, a scratch DJ's crossfader — on letters djmanzo leaves free, under any keys you made yourself. It complements the keys you have; it never takes one away. Four come with djmanzo, more are in the <a href="/outboard">marketplace</a>, and your own can be saved as a set to share.
      </p>
      <div class="sets" role="group" aria-label="Wear a keyboard set">
        {#each sets as s (s.id)}
          <button class="chip" class:on={worn?.id === s.id} aria-pressed={worn?.id === s.id} onclick={() => choose(s)} data-set={s.id}>
            {s.name}{#if s.from === "marketplace"}<span class="from mono">pack</span>{/if}
          </button>
        {/each}
      </div>
      {#if worn}<p class="about small" data-reveal>{worn.about}</p>{/if}
      <FactList ids={["leader", "keysets", "launcher"]} compact />
    </div>

    <div class="demo">
      <!-- A keyboard surface: role="application" hands the keys to the sketch while it has focus. -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
      <div class="whichkey card" tabindex="0" role="application" aria-label="Try the keys: press Space, then the letters" bind:this={pad} onkeydown={key} data-whichkey>
        <div class="top mono">
          <span class="crumbs">
            <kbd class:hot={open}>Space</kbd>{#each path as k (k)}<span class="arrow">›</span><kbd>{k}</kbd>{/each}
          </span>
          <span class="dim small">{open ? "Backspace: back · Esc: close" : "a sketch of the guide"}</span>
        </div>
        {#if open}
          <ul class="level" aria-live="polite">
            {#each level as n (n.key + n.label)}
              <li>
                <button class="k" class:group={!!n.children} class:set={!!n.set} onclick={() => press(n)} disabled={n.key === "…"} data-key={n.key}>
                  <kbd>{n.key}</kbd>
                  <span>{n.children ? `${n.label} …` : n.label}</span>
                  {#if n.set}<em class="mono">{n.set}</em>{/if}
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="idle">
            {#if last}
              <p class="done" data-done>{last}</p>
            {/if}
            <button class="btn primary small" onclick={start}>Press Space</button>
            <p class="dim small">or click here and use your keyboard</p>
          </div>
        {/if}
      </div>
      <p class="dim small note">The real guide lists every panel, theme, workspace and preset on your machine; this sketch shows the shape of it.</p>
    </div>
  </div>
  {#if panel}
    <div class="wrap panel-shot" data-reveal>
      <p class="eyebrow">In djmanzo: the Keys panel</p>
      {#key panel.src}<Shot shot={panel} label="Keys" />{/key}
    </div>
  {/if}
</section>

<style>
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: clamp(32px, 5vw, 72px);
    align-items: start;
  }
  @media (max-width: 960px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  .copy a {
    color: var(--accent);
  }
  kbd {
    display: inline-grid;
    place-items: center;
    min-width: 1.7em;
    padding: 0.1em 0.45em;
    border-radius: 6px;
    border: 1px solid var(--line);
    border-bottom-width: 3px;
    background: var(--raised);
    color: var(--text);
    font: 600 0.82em/1.4 var(--mono);
  }
  kbd.hot {
    border-color: var(--accent);
    color: var(--accent);
  }
  .sets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 20px 0 6px;
  }
  .from {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--accent);
  }
  .about {
    color: var(--dim);
    margin: 10px 0 0;
  }
  .small {
    font-size: 13px;
  }
  .demo {
    position: sticky;
    top: calc(var(--bar) + 24px);
  }
  .whichkey {
    min-height: 420px;
    padding: 0;
    outline-offset: 4px;
    background:
      radial-gradient(120% 80% at 100% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%),
      var(--surface);
  }
  .whichkey:focus-visible {
    outline: 2px solid var(--accent);
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--line);
  }
  .crumbs {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .arrow {
    color: var(--dim);
  }
  .level {
    list-style: none;
    margin: 0;
    padding: 12px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 6px;
  }
  .k {
    width: 100%;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 9px;
    border: 1px solid transparent;
    background: none;
    color: var(--text);
    font: 400 14px/1.3 var(--body);
    text-align: left;
    cursor: pointer;
  }
  .k:hover:not(:disabled) {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    border-color: color-mix(in srgb, var(--accent) 30%, var(--line));
  }
  .k:disabled {
    cursor: default;
    color: var(--dim);
  }
  .k.group span {
    color: var(--accent);
  }
  .k.set {
    border-color: color-mix(in srgb, var(--accent-2) 45%, var(--line));
    background: color-mix(in srgb, var(--accent-2) 8%, transparent);
  }
  .k em {
    grid-column: 2;
    font-size: 10px;
    font-style: normal;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent-2);
  }
  .idle {
    display: grid;
    place-items: center;
    align-content: center;
    gap: 10px;
    min-height: 360px;
    text-align: center;
    padding: 20px;
  }
  .done {
    font: 500 15px/1.4 var(--mono);
    color: var(--accent-2);
    margin: 0 0 8px;
  }
  .note {
    margin-top: 10px;
  }
  .panel-shot {
    margin-top: clamp(48px, 7vw, 88px);
  }
</style>
