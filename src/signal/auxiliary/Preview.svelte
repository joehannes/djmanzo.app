<!--
  A pack seen without opening it: a theme's own colours as a small window,
  a skin's tile drawn faintly over a panel as djmanzo draws it, a visuals
  pack's looks by name, a keyboard set's keys as the Space guide shows
  them (the full view says which open a group of the set's own and which add
  to one of djmanzo's). The tile was checked to only draw before it was
  stored, and an <img> runs nothing in an SVG anyway.
-->
<script lang="ts">
  let { kind, preview, big = false }: { kind: string; preview: Record<string, any>; big?: boolean } = $props();
  const dark = $derived((preview.dark ?? {}) as Record<string, string>);
  const tileSrc = $derived(preview.tile ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(preview.tile)}` : null);
  type Place = { chain: string; label: string; inside: string | null };
  const keys = $derived((preview.keys ?? []) as Place[]);
  const own = $derived(keys.filter((k) => k.inside === null));
  const added = $derived(keys.filter((k) => k.inside !== null));
  const leaders = $derived([...new Set(own.map((k) => k.chain.split(" ")[0]))]);
</script>

{#snippet row(k: Place)}
  <li>
    <span class="chain"><kbd>Space</kbd>{#each k.chain.split(" ") as key, i (i)}<kbd>{key}</kbd>{/each}</span>
    <span class="label">{k.label}</span>
    {#if big && k.inside}<span class="inside">in djmanzo's {k.inside}</span>{/if}
  </li>
{/snippet}

<div class="preview {kind}" class:big aria-hidden={kind === "keys" && big ? undefined : "true"}>
  {#if kind === "theme"}
    <div class="room" style:background={dark["--bg"]} style:color={dark["--text"]}>
      <div class="panel" style:background={dark["--panel"]} style:border-color={dark["--border-strong"]}>
        <span style:color={dark["--text"]}>Aa</span>
        <span style:color={dark["--text-dim"]}>dim</span>
        <b style:background={dark["--accent"]} style:color={dark["--on-accent"]}>PLAY</b>
        <i style:background={dark["--accent-2"]}></i>
        <i style:background={dark["--warn"]}></i>
        <i style:background={dark["--danger"]}></i>
      </div>
    </div>
  {:else if kind === "skin" && tileSrc}
    <div class="room skin" style:background-image={`url("${tileSrc}")`} style:background-size={preview.size ?? "120px"} style:opacity={1}></div>
  {:else if kind === "keys"}
    <div class="room keys">
      {#if big}
        <div class="lists">
          <section>
            <h4>Its own keys{leaders.length ? ` on Space ${leaders.join(", ")}` : ""}</h4>
            <ul>{#each own as k (k.chain)}{@render row(k)}{/each}</ul>
          </section>
          {#if added.length}
            <section>
              <h4>Added inside djmanzo's groups</h4>
              <ul>{#each added as k (k.chain)}{@render row(k)}{/each}</ul>
            </section>
          {/if}
        </div>
      {:else}
        <ul>{#each keys.slice(0, 5) as k (k.chain)}{@render row(k)}{/each}</ul>
        {#if keys.length > 5}<p class="more">and {keys.length - 5} more</p>{/if}
      {/if}
    </div>
  {:else}
    <div class="room visuals">
      {#each (preview.looks ?? []).slice(0, 4) as look, i (i)}<span>{look}</span>{/each}
    </div>
  {/if}
</div>

<style>
  .preview {
    border-radius: 6px;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    background: #111;
  }
  .room {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
  }
  .panel {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid;
    border-radius: 6px;
    font: 700 13px/1 system-ui, sans-serif;
  }
  .big .panel {
    font-size: 18px;
    padding: 18px 22px;
    gap: 14px;
  }
  .panel b {
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 11px;
  }
  .panel i {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
  }
  .skin {
    background-color: #eceae4;
    background-repeat: repeat;
  }
  .visuals {
    background: radial-gradient(circle at 30% 40%, #ff5d73 0, transparent 45%), radial-gradient(circle at 70% 60%, #5ef2d6 0, transparent 50%), #0b0b10;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-content: center;
    justify-content: center;
    padding: 10px;
  }
  .keys {
    background: linear-gradient(160deg, #15161c, #0b0b10);
    color: #e9e7e1;
    display: block;
    padding: 10px 12px;
    overflow: hidden;
    font: 500 12px/1.3 system-ui, sans-serif;
  }
  .big.keys {
    aspect-ratio: auto;
  }
  .big .keys {
    padding: 16px 18px;
  }
  .keys ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 5px;
  }
  .keys li {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .chain {
    display: inline-flex;
    gap: 2px;
    flex: none;
  }
  .keys kbd {
    font: 600 10px/1 ui-monospace, "JetBrains Mono", monospace;
    padding: 3px 5px;
    border-radius: 3px;
    background: #2a2c35;
    border-bottom: 1px solid #000;
    color: #fff;
  }
  .keys kbd:first-child {
    background: #e2445c;
  }
  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .inside {
    margin-left: auto;
    flex: none;
    font-size: 11px;
    color: #9a98a6;
  }
  .more {
    margin: 6px 0 0;
    color: #9a98a6;
  }
  .lists {
    display: grid;
    gap: 18px;
  }
  .lists h4 {
    margin: 0 0 8px;
    font: 600 11px/1 system-ui, sans-serif;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9a98a6;
  }
  .visuals span {
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    font: 600 12px/1 system-ui, sans-serif;
    padding: 5px 8px;
    border-radius: 999px;
  }
</style>
